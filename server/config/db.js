import mongoose from "mongoose";
import { env } from "./env.js";

const RETRY_DELAY_MS = 30_000;

// Fail fast instead of queueing writes while disconnected; the contact flow
// treats MongoDB as optional and must never hang on it.
mongoose.set("bufferCommands", false);

let listenersAttached = false;
let retryTimer;

export function isDbConfigured() {
  return Boolean(env.mongodbUri);
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Connects in the background. Resolves to whether the first attempt succeeded and
 * never rejects; a failed attempt is retried every 30 seconds.
 */
export async function connectDb() {
  if (!isDbConfigured()) return false;
  attachListeners();

  try {
    await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 5_000 });
    return true;
  } catch (error) {
    console.warn(
      `[db] Could not connect to MongoDB (${error.message}). ` +
        `Messages will still be emailed. Retrying in ${RETRY_DELAY_MS / 1000}s.`
    );
    retryTimer = setTimeout(connectDb, RETRY_DELAY_MS);
    retryTimer.unref();
    return false;
  }
}

export async function disconnectDb() {
  clearTimeout(retryTimer);
  await mongoose.disconnect().catch(() => {});
}

function attachListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  // Initial-connect failures are reported by connectDb(); these cover a live connection.
  let hasConnected = false;
  const { connection } = mongoose;
  connection.on("connected", () => {
    hasConnected = true;
    console.info("[db] Connected to MongoDB.");
  });
  connection.on("disconnected", () => {
    if (hasConnected) console.warn("[db] Lost the MongoDB connection; the driver will reconnect.");
  });
  connection.on("error", (error) => {
    if (hasConnected) console.error("[db] MongoDB error:", error.message);
  });
}
