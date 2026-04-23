import type { Booking } from "@/generated/prisma/client";

import { buildBookingConfirmationEmail } from "./buildBookingConfirmationEmail";
import { sendEmail } from "./emailClient";
import type { SendBookingConfirmationResult } from "./types";

/**
 * Sends the customer booking confirmation email. Does not update the database.
 * Booking rows should be updated by the caller based on the returned result.
 */
export async function sendBookingConfirmation(booking: Booking): Promise<SendBookingConfirmationResult> {
  let subject: string;
  let html: string;
  let text: string;

  try {
    const built = buildBookingConfirmationEmail(booking);
    subject = built.subject;
    html = built.html;
    text = built.text;
  } catch (error) {
    console.error("[email] Failed to build booking confirmation email", error);
    return { success: false, reason: "template_build_failed", cause: error };
  }

  const result = await sendEmail({
    to: booking.customerEmail,
    subject,
    html,
    text,
  });

  if (result.ok) {
    return { success: true, deliveryMode: result.deliveryMode };
  }

  return { success: false, reason: result.reason, cause: result.cause };
}
