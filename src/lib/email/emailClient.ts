import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

import type { EmailPayload, SendEmailResult } from "./types";

const MOCK_CONFIG_WARNING = "Email config missing — using mock email sender";

function isGmailEmailConfigured(): boolean {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  return Boolean(user && pass);
}

/**
 * Centralized Nodemailer transport.
 *
 * Temporary: Gmail + app password via `EMAIL_USER` / `EMAIL_PASS`.
 * Future: swap this function to host/port/custom SMTP; keep `sendEmail` and callers unchanged.
 */
export function createEmailTransport(): Transporter {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS?.trim();
  if (!user || !pass) {
    throw new Error("createEmailTransport() requires EMAIL_USER and EMAIL_PASS");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

function resolveFromHeader(): string {
  const user = process.env.EMAIL_USER!.trim();
  return `"Explore Malta Rentals" <${user}>`;
}

function logMockEmail(payload: EmailPayload): void {
  console.warn(MOCK_CONFIG_WARNING);
  console.log("EMAIL MOCK:");
  console.log("to:", payload.to);
  console.log("subject:", payload.subject);
  console.log("text:\n", payload.text);
  console.log("html:\n", payload.html);
}

/**
 * Sends mail through the transport from {@link createEmailTransport}, or logs and returns mock success when Gmail credentials are missing.
 */
export async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  if (!isGmailEmailConfigured()) {
    logMockEmail(payload);
    return { ok: true, deliveryMode: "development_console" };
  }

  let transporter: Transporter;
  try {
    transporter = createEmailTransport();
  } catch (error) {
    console.error("[email] Failed to create Nodemailer transport", error);
    return { ok: false, reason: "transport_create_failed", cause: error };
  }

  try {
    await transporter.sendMail({
      from: resolveFromHeader(),
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
    return { ok: true, deliveryMode: "gmail" };
  } catch (error) {
    console.error("[email] Nodemailer sendMail failed", error);
    return { ok: false, reason: "send_failed", cause: error };
  }
}

/**
 * Verifies connectivity when Gmail credentials are set. Does not block booking; optional dev/script use.
 */
export async function verifyEmailTransporter(): Promise<boolean> {
  if (!isGmailEmailConfigured()) {
    return false;
  }

  try {
    const transporter = createEmailTransport();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("[email] Transporter verify failed", error);
    return false;
  }
}
