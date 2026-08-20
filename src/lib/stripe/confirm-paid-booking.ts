import { prisma } from "@/lib/prisma";
import { deliverBookingConfirmationIfNeeded } from "@/lib/email/deliverBookingConfirmation";

/**
 * Marks the booking and Stripe payment as paid, then sends the confirmation
 * email if it has not already been delivered.
 * Safe to call from webhooks, the success-page verifier, and reconciliation.
 */
export async function syncPaidBookingAndSendConfirmation(input: {
  bookingId: string;
  paymentIntentId?: string | null;
  checkoutSessionId?: string | null;
}): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.stripePayment.updateMany({
      where: { bookingId: input.bookingId, stripeStatus: { not: "SUCCEEDED" } },
      data: {
        stripeStatus: "SUCCEEDED",
        updatedAt: new Date(),
        ...(input.paymentIntentId ? { stripePaymentIntentId: input.paymentIntentId } : {}),
        ...(input.checkoutSessionId ? { stripeCheckoutSessionId: input.checkoutSessionId } : {}),
      },
    });

    await tx.booking.updateMany({
      where: { id: input.bookingId, paymentStatus: { not: "PAID" } },
      data: { paymentStatus: "PAID" },
    });
  });

  await deliverBookingConfirmationIfNeeded(input.bookingId);
}
