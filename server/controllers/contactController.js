import { saveMessage } from "../services/messageService.js";

/**
 * The browser sends email through Web3Forms after this endpoint validates and rate
 * limits the request. MongoDB remains an optional message backup.
 */
export async function submitContact(request, response, next) {
  const contact = request.contact;

  try {
    let stored = null;
    try {
      stored = await saveMessage(contact);
    } catch (error) {
      console.error(
        `[contact] Saving message from ${contact.email} to MongoDB failed: ${error?.message ?? error}`
      );
    }

    return response.status(200).json({ message: "Contact validated.", stored: stored !== null });
  } catch (error) {
    return next(error);
  }
}
