import nodemailer from "nodemailer";
import { env } from "./env.js";

// undefined = not built yet; null = credentials missing.
let transporter;

/** Returns the cached Gmail SMTP transporter, or null when credentials are missing. */
export function getTransporter() {
  if (transporter !== undefined) return transporter;
  if (!env.mail.configured) {
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: env.mail.user, pass: env.mail.appPassword },
    // Keep a stalled SMTP connection from holding a visitor's request open.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

/** Checks the SMTP login at startup. Logs the outcome and never throws. */
export async function verifyMailer() {
  const mailer = getTransporter();
  if (!mailer) return false;

  try {
    await mailer.verify();
    console.info(`[mail] Gmail SMTP login OK for ${env.mail.user}.`);
    return true;
  } catch (error) {
    console.warn(`[mail] Gmail SMTP check failed: ${describeSmtpError(error)}`);
    return false;
  }
}

export function closeMailer() {
  transporter?.close();
}

export function describeSmtpError(error) {
  if (error?.code === "EAUTH") {
    return (
      "Gmail rejected the login. EMAIL_APP_PASSWORD must be a 16-character App Password " +
      "(requires 2-Step Verification), not your normal Google password."
    );
  }
  if (["ETIMEDOUT", "ECONNECTION", "ESOCKET", "EDNS", "ENOTFOUND"].includes(error?.code)) {
    return `Could not reach smtp.gmail.com (${error.code}: ${error.message}).`;
  }
  return error?.message ?? String(error);
}
