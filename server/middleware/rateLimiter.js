import { rateLimit } from "express-rate-limit";

export const CONTACT_RATE_LIMIT = { windowMs: 15 * 60 * 1000, limit: 5 };

/** A fresh limiter per call, so every app instance (and test) gets its own counter. */
export function createContactRateLimiter() {
  return rateLimit({
    ...CONTACT_RATE_LIMIT,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (request, response, _next, options) => {
      console.warn(`[contact] Rate limit hit for ${request.ip}.`);
      response.status(options.statusCode).json({
        error: "Too many messages from your connection. Please try again in 15 minutes.",
      });
    },
  });
}
