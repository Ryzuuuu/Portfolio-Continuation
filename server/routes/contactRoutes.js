import { Router } from "express";
import { submitContact } from "../controllers/contactController.js";
import { createContactRateLimiter } from "../middleware/rateLimiter.js";
import { validateContact } from "../middleware/validateContact.js";

export function createContactRouter() {
  const router = Router();
  router.post("/", createContactRateLimiter(), validateContact, submitContact);
  return router;
}
