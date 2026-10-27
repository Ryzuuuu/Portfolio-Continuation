import { describe, expect, it } from "vitest";
import { loadEnv } from "../config/env.js";

describe("loadEnv", () => {
  it("never throws on an empty environment and explains what's missing", () => {
    const { env, warnings } = loadEnv({});

    expect(env.port).toBe(5000);
    expect(env.mongodbUri).toBeUndefined();
    expect(env.mail.configured).toBe(false);
    expect(env.mail.sendAutoReply).toBe(true);
    expect(env.trustProxy).toBe(false);
    expect(env.clientOrigins).toContain("http://localhost:5173");
    expect(warnings.join("\n")).toMatch(
      /CLIENT_ORIGIN.*MONGODB_URI.*EMAIL_USER and EMAIL_APP_PASSWORD/s
    );
  });

  it("strips the display spaces from a Gmail App Password", () => {
    const { env, warnings } = loadEnv({
      EMAIL_USER: "me@gmail.com",
      EMAIL_APP_PASSWORD: "abcd efgh ijkl mnop",
    });

    expect(env.mail.appPassword).toBe("abcdefghijklmnop");
    expect(env.mail.configured).toBe(true);
    expect(warnings.some((warning) => warning.includes("App Password"))).toBe(false);
  });

  it("warns when the password isn't App Password length", () => {
    const { warnings } = loadEnv({ EMAIL_USER: "me@gmail.com", EMAIL_APP_PASSWORD: "hunter2" });

    expect(warnings.join("\n")).toMatch(/7 characters/);
  });

  it("defaults the receiver to EMAIL_USER and honours an override", () => {
    expect(loadEnv({ EMAIL_USER: "me@gmail.com" }).env.mail.receiver).toBe("me@gmail.com");
    expect(
      loadEnv({ EMAIL_USER: "me@gmail.com", CONTACT_RECEIVER_EMAIL: "inbox@example.com" }).env.mail
        .receiver
    ).toBe("inbox@example.com");
  });

  it.each([
    ["false", false],
    ["0", false],
    ["off", false],
    ["TRUE", true],
    ["yes", true],
  ])("parses SEND_AUTO_REPLY=%s", (value, expected) => {
    expect(loadEnv({ SEND_AUTO_REPLY: value }).env.mail.sendAutoReply).toBe(expected);
  });

  it("normalises the CORS allow-list and drops invalid entries", () => {
    const { env, warnings } = loadEnv({
      CLIENT_ORIGIN: "https://example.com/, https://www.example.com ,localhost:3000",
    });

    expect(env.clientOrigins).toEqual(["https://example.com", "https://www.example.com"]);
    expect(warnings.join("\n")).toMatch(/localhost:3000/);
  });

  it("falls back on an invalid port and parses TRUST_PROXY hop counts", () => {
    const { env, warnings } = loadEnv({ PORT: "abc", TRUST_PROXY: "1" });

    expect(env.port).toBe(5000);
    expect(env.trustProxy).toBe(1);
    expect(warnings.join("\n")).toMatch(/PORT="abc"/);
  });
});
