import { env } from "../config/env.js";

export function isMailConfigured() {
  return env.mail.configured;
}

/**
 * Submits the contact message to Web3Forms. The visitor is the reply-to address.
 * Resolves to null when delivery isn't configured; rejects if the provider fails.
 */
export async function sendContactNotification(contact) {
  if (!env.mail.configured) return null;

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify({
      access_key: env.mail.accessKey,
      name: contact.name,
      email: contact.email,
      message: contact.message,
      subject: `New portfolio message from ${contact.name}`,
      from_name: "Portfolio contact form",
      replyto: contact.email,
    }),
  });

  let result;
  try {
    result = await response.json();
  } catch (error) {
    throw new Error(`Web3Forms returned an invalid response (HTTP ${response.status}).`, {
      cause: error,
    });
  }

  if (!response.ok || !result || result.success !== true) {
    const message =
      typeof result?.message === "string" ? result.message : "Web3Forms rejected the submission.";
    throw new Error(`${message} (HTTP ${response.status}).`);
  }

  return result;
}
