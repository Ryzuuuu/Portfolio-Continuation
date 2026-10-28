import { afterEach, describe, expect, it, vi } from "vitest";

const config = vi.hoisted(() => ({ configured: true, accessKey: "test-access-key" }));

vi.mock("../config/env.js", () => ({
  env: { mail: config },
}));

import { isMailConfigured, sendContactNotification } from "../services/mailService.js";

const contact = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Let's build something.",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  config.configured = true;
  config.accessKey = "test-access-key";
});

describe("Web3Forms delivery", () => {
  it("reports whether the access key is configured", () => {
    expect(isMailConfigured()).toBe(true);
    config.configured = false;
    expect(isMailConfigured()).toBe(false);
  });

  it("submits validated contact fields over HTTPS and preserves reply-to", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: "Email sent successfully." }),
    });
    vi.stubGlobal("fetch", fetch);

    await expect(sendContactNotification(contact)).resolves.toEqual({
      success: true,
      message: "Email sent successfully.",
    });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.web3forms.com/submit",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: "test-access-key",
          ...contact,
          subject: "New portfolio message from Ada Lovelace",
          from_name: "Portfolio contact form",
          replyto: "ada@example.com",
        }),
      })
    );
  });

  it("does not call the provider when no access key is configured", async () => {
    config.configured = false;
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    await expect(sendContactNotification(contact)).resolves.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects provider errors instead of reporting a false success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ success: false, message: "Invalid access key." }),
      })
    );

    await expect(sendContactNotification(contact)).rejects.toThrow("Invalid access key.");
  });

  it("reports non-JSON provider responses explicitly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      })
    );

    await expect(sendContactNotification(contact)).rejects.toThrow(
      "Web3Forms returned an invalid response (HTTP 502)."
    );
  });
});
