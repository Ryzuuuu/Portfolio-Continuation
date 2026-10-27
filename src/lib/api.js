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
