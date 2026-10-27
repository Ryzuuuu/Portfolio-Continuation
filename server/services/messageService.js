import { isDbConnected } from "../config/db.js";
import Message from "../models/Message.js";

export function isStorageAvailable() {
  return isDbConnected();
}

/** Stores a copy of the message. Resolves to null when MongoDB isn't connected. */
export async function saveMessage({ name, email, message }) {
  if (!isDbConnected()) return null;
  return Message.create({ name, email, message });
}
