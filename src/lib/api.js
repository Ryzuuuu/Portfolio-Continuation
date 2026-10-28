// Empty by default: the site calls its own /api (proxied by Vite in development).
// Set VITE_API_BASE_URL at build time when the API lives on another origin.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

class ContactRequestError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = "ContactRequestError";
    this.fields = fields;
  }
}

/** Posts the contact form. Resolves to the success message; rejects with ContactRequestError. */
export async function submitContact(payload) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new ContactRequestError(
      "Couldn't reach the server. Check your connection and try again."
    );
  }

  // Proxies and rate limiters don't always answer with JSON.
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ContactRequestError(
      result.error || "The contact service is unavailable. Please try again later.",
      result.fields
    );
  }
  return result.message || "Message received. Thanks for reaching out!";
}

/** Sends the validated contact message through Web3Forms from the browser. */
export async function sendContactEmail(payload) {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY?.trim();
  if (!accessKey) {
    throw new ContactRequestError("Email delivery isn't configured yet. Please try again later.");
  }

  let response;
  try {
    response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        access_key: accessKey,
        name: payload.name,
        email: payload.email,
        message: payload.message,
        subject: `New portfolio message from ${payload.name}`,
        from_name: "Portfolio contact form",
        replyto: payload.email,
      }),
    });
  } catch {
    throw new ContactRequestError(
      "Couldn't connect to the email service. Please try again in a moment."
    );
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new ContactRequestError(
      `The email service returned an invalid response (HTTP ${response.status}).`
    );
  }

  if (!response.ok || !result || result.success !== true) {
    const message =
      typeof result?.message === "string"
        ? result.message
        : "The email service couldn't send your message. Please try again later.";
    throw new ContactRequestError(`${message} (HTTP ${response.status}).`);
  }
}
