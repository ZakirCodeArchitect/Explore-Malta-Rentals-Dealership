import type { Booking } from "@/generated/prisma/client";
import { SITE_CONTACT } from "@/lib/site-brand-copy";

import { buildAdminBookingNotificationEmail } from "./buildAdminBookingNotificationEmail";
import { sendEmail } from "./emailClient";

/**
 * Resolves the admin recipient.
 * Priority: BOOKING_ADMIN_EMAIL env var → business contact email from brand copy.
 */
function resolveAdminEmail(): string {
  return process.env.BOOKING_ADMIN_EMAIL?.trim() || SITE_CONTACT.email;
}

/**
 * Sends an internal booking-received notification to the business owner.
 * Sets reply-to as the customer's email so the admin can reply directly.
 * Never throws — failures are logged and silently swallowed so they don't
 * block the customer-facing booking response.
 */
export async function sendAdminBookingNotification(booking: Booking): Promise<void> {
  let subject: string;
  let html: string;
  let text: string;

  try {
    const built = buildAdminBookingNotificationEmail(booking);
    subject = built.subject;
    html = built.html;
    text = built.text;
  } catch (error) {
    console.error("[email] Failed to build admin booking notification", error);
    return;
  }

  const result = await sendEmail({
    to: resolveAdminEmail(),
    subject,
    html,
    text,
    replyTo: booking.customerEmail,
  });

  if (!result.ok) {
    console.error("[email] Admin booking notification failed to send", {
      bookingReference: booking.bookingReference,
      reason: result.reason,
    });
  } else {
    console.log("[email] Admin booking notification sent", {
      bookingReference: booking.bookingReference,
      deliveryMode: result.deliveryMode,
    });
  }
}
