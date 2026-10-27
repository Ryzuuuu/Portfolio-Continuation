import { createApp } from "./app.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { env, reportEnv } from "./config/env.js";
import { closeMailer, verifyMailer } from "./config/mailer.js";

reportEnv();

const server = createApp().listen(env.port, () => {
  console.info(`[api] Portfolio API listening on http://localhost:${env.port}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`[api] Port ${env.port} is already in use. Set PORT to a free port.`);
  } else {
    console.error("[api] Server error:", error);
  }
  process.exit(1);
});

// Both run in the background and only log on failure; the API serves requests meanwhile.
connectDb();
verifyMailer();

process.on("unhandledRejection", (reason) => {
  console.error("[api] Unhandled promise rejection:", reason);
});

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.info(`[api] ${signal} received, shutting down.`);
  setTimeout(() => process.exit(1), 10_000).unref();
  server.close();
  closeMailer();
  await disconnectDb();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
