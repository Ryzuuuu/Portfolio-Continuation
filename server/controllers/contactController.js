import { env } from "../config/env.js";
import { describeSmtpError } from "../config/mailer.js";
import {
  isMailConfigured,
  sendAutoReply,
  sendContactNotification,
} from "../services/mailService.js";
import { isStorageAvailable, saveMessage } from "../services/messageService.js";

/**
 * Email is the primary channel and MongoDB the backup. The request only fails when
 * neither one took the message; every individual failure is logged either way.
 */
export async function submitContact(request, response, next) {
  const contact = request.contact;

  try {
    if (!isMailConfigured() && !isStorageAvailable()) {
      console.error(
        `[contact] Neither email nor MongoDB is available; message from ${contact.email} was not delivered.`
      );
      return response.status(503).json({
        error: "The contact service is temporarily unavailable. Please email me directly.",
      });
    }

    const [notification, stored, autoReply] = await Promise.allSettled([
      sendContactNotification(contact),
      saveMessage(contact),
      env.mail.sendAutoReply ? sendAutoReply(contact) : Promise.resolve(null),
    ]);

    if (notification.status === "rejected") {
      console.error(
        `[contact] Notification email failed for message from ${contact.email}: ${describeSmtpError(notification.reason)}`
      );
    }
    if (stored.status === "rejected") {
      console.error(
        `[contact] Saving message from ${contact.email} to MongoDB failed: ${stored.reason?.message ?? stored.reason}`
      );
    }
    if (autoReply.status === "rejected") {
      console.warn(
        `[contact] Auto-reply to ${contact.email} failed: ${describeSmtpError(autoReply.reason)}`
      );
    }

    const emailed = notification.status === "fulfilled" && notification.value !== null;
    const saved = stored.status === "fulfilled" && stored.value !== null;

    if (!emailed && !saved) {
      return response.status(502).json({
        error: "Your message couldn't be delivered right now. Please try again in a moment.",
      });
    }

    if (!emailed) console.warn(`[contact] Message from ${contact.email} is stored in MongoDB only.`);
    return response.status(201).json({ message: "Message received. Thanks for reaching out!" });
  } catch (error) {
    return next(error);
  }
}
