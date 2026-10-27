// Mirrors the Message schema's maxlength values.
const CONTACT_LIMITS = { name: 80, email: 254, message: 3000 };

// The WHATWG <input type="email"> pattern, with a dot required in the domain. It rejects
// the quotes, angle brackets and commas that could make a mail header mean something else.
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// eslint-disable-next-line no-control-regex
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const asText = (value) => (typeof value === "string" ? value : "");

/** Validates the contact payload and puts the cleaned fields on `request.contact`. */
export function validateContact(request, response, next) {
  const body = request.body && typeof request.body === "object" ? request.body : {};

  // Honeypot: the "website" field is hidden from people, so only bots fill it in.
  if (body.website) {
    console.warn(`[contact] Honeypot triggered from ${request.ip}; message discarded.`);
    return response.status(400).json({ error: "Unable to send this message." });
  }

  // Names and emails end up in mail headers, so all whitespace collapses to single spaces.
  const name = asText(body.name).replace(CONTROL_CHARACTERS, "").replace(/\s+/g, " ").trim();
  const email = asText(body.email).trim();
  const message = asText(body.message)
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHARACTERS, "")
    .trim();

  const fields = {};
  if (!name) fields.name = "Please tell me your name.";
  else if (name.length > CONTACT_LIMITS.name) {
    fields.name = `Please keep your name under ${CONTACT_LIMITS.name} characters.`;
  }

  if (!email) fields.email = "Please add your email so I can reply.";
  else if (email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    fields.email = "That email address doesn't look right.";
  }

  if (!message) fields.message = "Please write a message.";
  else if (message.length > CONTACT_LIMITS.message) {
    fields.message = `Please keep your message under ${CONTACT_LIMITS.message} characters.`;
  }

  if (Object.keys(fields).length > 0) {
    return response
      .status(400)
      .json({ error: "Please provide a valid name, email, and message.", fields });
  }

  request.contact = { name, email, message };
  return next();
}
