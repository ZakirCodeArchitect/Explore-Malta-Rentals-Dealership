import type { Booking } from "@/generated/prisma/client";

import { buildBookingConfirmationEmail } from "./buildBookingConfirmationEmail";
import { sendEmail } from "./emailClient";
import { sendAdminBookingNotification } from "./sendAdminBookingNotification";
import type { SendBookingConfirmationResult } from "./types";

/**
 * Sends the customer booking confirmation email and (in parallel) an internal
 * admin notification to the business owner.
 * Does not update the database — the caller is responsible for that.
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

  // Send customer confirmation and admin notification concurrently.
  // Admin notification failure never blocks the customer-facing result.
  const [customerResult] = await Promise.all([
    sendEmail({
      to: booking.customerEmail,
      subject,
      html,
      text,
    }),
    sendAdminBookingNotification(booking),
  ]);

  if (customerResult.ok) {
    return { success: true, deliveryMode: customerResult.deliveryMode };
  }

  return {
    success: false,
    reason: customerResult.reason,
    cause: customerResult.cause,
  };
}
