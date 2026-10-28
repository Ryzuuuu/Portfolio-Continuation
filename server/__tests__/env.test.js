import { describe, expect, it } from "vitest";
import { loadEnv } from "../config/env.js";

describe("loadEnv", () => {
  it("never throws on an empty environment and explains what's missing", () => {
    const { env, warnings } = loadEnv({});

    expect(env.port).toBe(5000);
    expect(env.mongodbUri).toBeUndefined();
    expect(env.mail.configured).toBe(false);
    expect(env.trustProxy).toBe(false);
    expect(env.clientOrigins).toContain("http://localhost:5173");
    expect(warnings.join("\n")).toMatch(/CLIENT_ORIGIN.*MONGODB_URI.*WEB3FORMS_ACCESS_KEY/s);
  });

  it("configures Web3Forms from its access key", () => {
    const { env, warnings } = loadEnv({ WEB3FORMS_ACCESS_KEY: "test-access-key" });

    expect(env.mail.accessKey).toBe("test-access-key");
    expect(env.mail.configured).toBe(true);
    expect(warnings).not.toContain(
      "WEB3FORMS_ACCESS_KEY not set; contact-form emails are disabled."
    );
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
