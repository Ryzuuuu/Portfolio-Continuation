import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import * as mail from "../services/mailService.js";
import * as storage from "../services/messageService.js";

vi.mock("../services/mailService.js", () => ({
  isMailConfigured: vi.fn(),
  sendContactNotification: vi.fn(),
}));
vi.mock("../services/messageService.js", () => ({
  isStorageAvailable: vi.fn(),
  saveMessage: vi.fn(),
}));

const valid = { name: "Ada Lovelace", email: "ada@example.com", message: "Let's build something." };
const post = (app, body) => request(app).post("/api/contact").send(body);

let app;
beforeEach(() => {
  vi.mocked(mail.isMailConfigured).mockReturnValue(true);
  vi.mocked(mail.sendContactNotification).mockResolvedValue({ messageId: "notification" });
  vi.mocked(storage.isStorageAvailable).mockReturnValue(true);
  vi.mocked(storage.saveMessage).mockImplementation(async (contact) => ({ _id: "1", ...contact }));
  vi.spyOn(console, "error").mockImplementation(() => {});
  app = createApp();
});
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("POST /api/contact: success paths", () => {
  it("emails and stores in parallel, then returns 201", async () => {
    const response = await post(app, valid);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: "Message received. Thanks for reaching out!" });
    expect(mail.sendContactNotification).toHaveBeenCalledWith(valid);
    expect(storage.saveMessage).toHaveBeenCalledWith(valid);
  });

  it("collapses whitespace in the name so it can't inject mail headers", async () => {
    await post(app, { ...valid, name: "  Ada\r\nBcc: victim@example.com  " });

    expect(mail.sendContactNotification).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ada Bcc: victim@example.com" })
    );
  });

  it("succeeds when the notification fails but MongoDB stored the message", async () => {
    vi.mocked(mail.sendContactNotification).mockRejectedValue(
      new Error("Web3Forms rejected the submission.")
    );

    const response = await post(app, valid);

    expect(response.status).toBe(201);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Notification email failed")
    );
  });

  it("succeeds email-only when MongoDB isn't connected", async () => {
    vi.mocked(storage.saveMessage).mockResolvedValue(null);

    expect((await post(app, valid)).status).toBe(201);
  });

  it("succeeds when the MongoDB write throws but the email went out", async () => {
    vi.mocked(storage.saveMessage).mockRejectedValue(new Error("write concern timeout"));

    const response = await post(app, valid);

    expect(response.status).toBe(201);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("MongoDB failed"));
  });
});

describe("POST /api/contact: failure paths", () => {
  it("returns 502 when both the notification and the MongoDB save fail", async () => {
    vi.mocked(mail.sendContactNotification).mockRejectedValue(new Error("Web3Forms unavailable"));
    vi.mocked(storage.saveMessage).mockRejectedValue(new Error("db down"));

    const response = await post(app, valid);

    expect(response.status).toBe(502);
    expect(response.body.error).toMatch(/couldn't be delivered/);
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it("returns 502 when the email fails and MongoDB isn't connected", async () => {
    vi.mocked(mail.sendContactNotification).mockRejectedValue(new Error("Web3Forms unavailable"));
    vi.mocked(storage.saveMessage).mockResolvedValue(null);

    expect((await post(app, valid)).status).toBe(502);
  });

  it("returns 503 without trying when neither mail nor MongoDB is available", async () => {
    vi.mocked(mail.isMailConfigured).mockReturnValue(false);
    vi.mocked(storage.isStorageAvailable).mockReturnValue(false);

    const response = await post(app, valid);

    expect(response.status).toBe(503);
    expect(mail.sendContactNotification).not.toHaveBeenCalled();
    expect(storage.saveMessage).not.toHaveBeenCalled();
  });
});

describe("POST /api/contact: validation", () => {
  it("returns 400 with per-field errors for an empty submission", async () => {
    const response = await post(app, {});

    expect(response.status).toBe(400);
    expect(Object.keys(response.body.fields)).toEqual(["name", "email", "message"]);
    expect(mail.sendContactNotification).not.toHaveBeenCalled();
  });

  it.each([
    "nope",
    "ada@localhost",
    "ada@@example.com",
    '"ada"@example.com',
    "<ada@example.com>",
    "ada@example.com, eve@example.com",
  ])("rejects the email %j", async (email) => {
    const response = await post(app, { ...valid, email });

    expect(response.status).toBe(400);
    expect(response.body.fields).toHaveProperty("email");
  });

  it("enforces the schema's length limits", async () => {
    const response = await post(app, { ...valid, name: "x".repeat(81), message: "y".repeat(3001) });

    expect(response.status).toBe(400);
    expect(response.body.fields).toHaveProperty("name");
    expect(response.body.fields).toHaveProperty("message");
  });

  it("rejects non-string fields", async () => {
    const response = await post(app, { name: ["Ada"], email: { $ne: "" }, message: 42 });

    expect(response.status).toBe(400);
  });

  it("rejects honeypot submissions without touching mail or storage", async () => {
    const response = await post(app, { ...valid, website: "https://spam.example" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Unable to send this message." });
    expect(mail.sendContactNotification).not.toHaveBeenCalled();
    expect(storage.saveMessage).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON and 413 for oversized bodies", async () => {
    const malformed = await request(app)
      .post("/api/contact")
      .set("Content-Type", "application/json")
      .send("{not json");
    const oversized = await post(app, { ...valid, message: "z".repeat(20_000) });

    expect(malformed.status).toBe(400);
    expect(oversized.status).toBe(413);
  });
});

describe("rate limiting", () => {
  it("allows 5 requests per window, then returns 429 with a JSON error", async () => {
    const statuses = [];
    for (let attempt = 0; attempt < 5; attempt += 1) {
      statuses.push((await post(app, valid)).status);
    }
    const limited = await post(app, valid);

    expect(statuses).toEqual([201, 201, 201, 201, 201]);
    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatch(/Too many messages/);
    expect(limited.headers).toHaveProperty("ratelimit");
  });

  it("counts invalid and honeypot requests too", async () => {
    for (let attempt = 0; attempt < 5; attempt += 1) await post(app, { website: "x" });

    expect((await post(app, valid)).status).toBe(429);
  });
});

describe("CORS and routing", () => {
  it("allows the configured origins and withholds headers from others", async () => {
    const allowed = await request(app)
      .options("/api/contact")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST");
    const blocked = await request(app)
      .options("/api/contact")
      .set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "POST");

    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("returns JSON 404s for unknown API routes", async () => {
    const response = await request(app).get("/api/nope");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: "Not found." });
  });

  it("reports health without exposing configuration details", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", database: "not configured", mail: "configured" });
  });
});
