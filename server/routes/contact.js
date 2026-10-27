import { Router } from "express";
import Message from "../models/Message.js";

const router = Router();

router.post("/", async (request, response, next) => {
  const { name, email, message, website } = request.body ?? {};

  if (website) {
    return response.status(400).json({ error: "Unable to send this message." });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    !name.trim() ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    !message.trim() ||
    name.trim().length > 80 ||
    email.trim().length > 254 ||
    message.trim().length > 3000
  ) {
    return response.status(400).json({ error: "Please provide a valid name, email, and message." });
  }

  if (mongooseReady() === false) {
    return response.status(503).json({ error: "The contact service is temporarily unavailable." });
  }

  try {
    await Message.create({ name, email, message });
    return response.status(201).json({ message: "Message received. Thanks for reaching out!" });
  } catch (error) {
    return next(error);
  }
});

function mongooseReady() {
  return Message.db.readyState === 1;
}

export default router;
