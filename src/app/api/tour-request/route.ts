import { NextResponse } from "next/server";
import { Resend } from "resend";

import { getEnvValue } from "@/components/footer/footer-utils";

const MAX_MESSAGE = 8000;
const MAX_NAME = 200;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false as const, code: "EMAIL_NOT_CONFIGURED" as const },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false as const, code: "INVALID_JSON" as const }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false as const, code: "INVALID_BODY" as const }, { status: 400 });
  }

  const { name, email, phone, message } = body as Record<string, unknown>;

  if (!isNonEmptyString(name) || name.trim().length > MAX_NAME) {
    return NextResponse.json({ ok: false as const, code: "INVALID_NAME" as const }, { status: 400 });
  }

  if (!isNonEmptyString(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ ok: false as const, code: "INVALID_EMAIL" as const }, { status: 400 });
  }

  if (!isNonEmptyString(message) || message.trim().length > MAX_MESSAGE) {
    return NextResponse.json({ ok: false as const, code: "INVALID_MESSAGE" as const }, { status: 400 });
  }

  const phoneStr =
    typeof phone === "string" && phone.trim().length > 0 ? phone.trim().slice(0, 40) : undefined;

  const to =
    process.env.TOUR_INQUIRY_TO_EMAIL?.trim() ||
    getEnvValue("email") ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

  if (!to) {
    return NextResponse.json(
      { ok: false as const, code: "MISSING_RECIPIENT" as const },
      { status: 500 },
    );
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "Explore Malta Rentals <onboarding@resend.dev>";

  const safeName = name.trim();
  const safeEmail = email.trim();
  const safeMessage = message.trim();

  const text = [
    `Tour inquiry from ${safeName}`,
    "",
    `Email: ${safeEmail}`,
    phoneStr ? `Phone: ${phoneStr}` : "Phone: (not provided)",
    "",
    "Message:",
    safeMessage,
  ].join("\n");

  const html = `
    <h2>Tour inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(safeName)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(safeEmail)}">${escapeHtml(safeEmail)}</a></p>
    <p><strong>Phone:</strong> ${phoneStr ? escapeHtml(phoneStr) : "(not provided)"}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(safeMessage)}</pre>
  `;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: safeEmail,
    subject: `Tour inquiry — ${safeName}`,
    text,
    html,
  });

  if (error) {
    console.error("[tour-request]", error);
    return NextResponse.json({ ok: false as const, code: "SEND_FAILED" as const }, { status: 502 });
  }

  return NextResponse.json({ ok: true as const });
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
