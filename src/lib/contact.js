// Keep in sync with server/middleware/validateContact.js, which has the final say.
export const CONTACT_LIMITS = { name: 80, email: 254, message: 3000 };
export const CONTACT_FIELDS = ["name", "email", "message"];

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Returns an error message for one field, or "" when it's valid. */
export function validateContactField(field, rawValue = "") {
  const value = String(rawValue).trim();

  if (field === "name") {
    if (!value) return "Please tell me your name.";
    if (value.length > CONTACT_LIMITS.name) {
      return `Please keep your name under ${CONTACT_LIMITS.name} characters.`;
    }
  }
  if (field === "email") {
    if (!value) return "Please add your email so I can reply.";
    if (value.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(value)) {
      return "That email address doesn't look right.";
    }
  }
  if (field === "message") {
    if (!value) return "Please write a message.";
    if (value.length > CONTACT_LIMITS.message) {
      return `Please keep your message under ${CONTACT_LIMITS.message} characters.`;
    }
  }
  return "";
}

export function validateContact(values) {
  return Object.fromEntries(
    CONTACT_FIELDS.map((field) => [field, validateContactField(field, values[field])]).filter(
      ([, error]) => error
    )
  );
}
