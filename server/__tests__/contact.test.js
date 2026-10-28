import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import * as storage from "../services/messageService.js";

vi.mock("../services/messageService.js", () => ({
  saveMessage: vi.fn(),
}));

const valid = { name: "Ada Lovelace", email: "ada@example.com", message: "Let's build something." };
const post = (app, body) => request(app).post("/api/contact").send(body);

let app;
beforeEach(() => {
  vi.mocked(storage.saveMessage).mockImplementation(async (contact) => ({ _id: "1", ...contact }));
  vi.spyOn(console, "error").mockImplementation(() => {});
  app = createApp();
});
afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("POST /api/contact: success paths", () => {
  it("validates the message, stores it when available, and returns 200", async () => {
    const response = await post(app, valid);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Contact validated.", stored: true });
    expect(storage.saveMessage).toHaveBeenCalledWith(valid);
  });

  it("collapses whitespace in the name before returning validated contact data", async () => {
    await post(app, { ...valid, name: "  Ada\r\nBcc: victim@example.com  " });

    expect(storage.saveMessage).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ada Bcc: victim@example.com" })
    );
  });

  it("still accepts a validated message when the optional MongoDB backup fails", async () => {
    vi.mocked(storage.saveMessage).mockRejectedValue(new Error("database down"));

    const response = await post(app, valid);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Contact validated.", stored: false });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("MongoDB failed"));
  });

  it("accepts a validated message when MongoDB isn't configured", async () => {
    vi.mocked(storage.saveMessage).mockResolvedValue(null);

    expect((await post(app, valid)).status).toBe(200);
  });
});

describe("POST /api/contact: validation", () => {
  it("returns 400 with per-field errors for an empty submission", async () => {
    const response = await post(app, {});

    expect(response.status).toBe(400);
    expect(Object.keys(response.body.fields)).toEqual(["name", "email", "message"]);
    expect(storage.saveMessage).not.toHaveBeenCalled();
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

  it("rejects honeypot submissions without storing them", async () => {
    const response = await post(app, { ...valid, website: "https://spam.example" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Unable to send this message." });
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

    expect(statuses).toEqual([200, 200, 200, 200, 200]);
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
    expect(response.body).toEqual({
      status: "ok",
      database: "not configured",
      mail: "handled by website",
    });
  });
});
