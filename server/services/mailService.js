import { env } from "../config/env.js";
import { getTransporter } from "../config/mailer.js";
import { autoReplyEmail } from "../templates/autoReplyEmail.js";
import { contactNotificationEmail } from "../templates/contactNotificationEmail.js";

export function isMailConfigured() {
  return getTransporter() !== null;
}

/**
 * Emails the owner. Reply-To is the visitor, so hitting Reply in Gmail answers them.
 * Resolves to null when mail isn't configured; rejects if SMTP fails.
 */
export async function sendContactNotification(contact) {
  const transporter = getTransporter();
  if (!transporter) return null;

  const { subject, text, html } = contactNotificationEmail(contact);
  return transporter.sendMail({
    from: { name: "Portfolio contact form", address: env.mail.user },
    to: env.mail.receiver,
    replyTo: { name: contact.name, address: contact.email },
    subject,
    text,
    html,
  });
}

/** Sends the visitor a short confirmation. Resolves to null when mail isn't configured. */
export async function sendAutoReply(contact) {
  const transporter = getTransporter();
  if (!transporter) return null;

  const { subject, text, html } = autoReplyEmail({ name: contact.name, ownerName: env.ownerName });
  return transporter.sendMail({
    from: { name: env.ownerName, address: env.mail.user },
    to: { name: contact.name, address: contact.email },
    subject,
    text,
    html,
    // RFC 3834: marks this as automatic so other autoresponders don't reply to it.
    headers: { "Auto-Submitted": "auto-replied", "X-Auto-Response-Suppress": "All" },
  });
}
