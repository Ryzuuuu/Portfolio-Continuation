import cors from "cors";
import express from "express";
import { isDbConfigured, isDbConnected } from "./config/db.js";
import { env } from "./config/env.js";
import { isMailConfigured } from "./services/mailService.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { createContactRouter } from "./routes/contactRoutes.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  if (env.trustProxy !== false) app.set("trust proxy", env.trustProxy);

  // Requests without an Origin header (curl, same-origin GETs, health checks) are allowed;
  // browsers on origins outside the allow-list get no CORS headers and are blocked.
  app.use(
    cors({
      origin: (origin, callback) => callback(null, !origin || env.clientOrigins.includes(origin)),
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type"],
    })
  );
  app.use(express.json({ limit: "10kb" }));

  app.get("/api/health", (_request, response) => {
    let database = "not configured";
    if (isDbConfigured()) database = isDbConnected() ? "connected" : "disconnected";
    response.json({
      status: "ok",
      database,
      mail: isMailConfigured() ? "configured" : "not configured",
    });
  });

  app.use("/api/contact", createContactRouter());
  app.use("/api", notFound);
  app.use(errorHandler);

  return app;
}
