import { stripe } from "./stripe-client";
import { prisma } from "@/lib/prisma";
import { writePaymentAuditLog } from "./audit-service";
import type { CreateRefundInput, CreateRefundResult } from "./types";

/**
 * Initiates a Stripe refund (full or partial) for a booking.
 * Called by admin only — never from client-side code.
 */
export async function createRefund(input: CreateRefundInput): Promise<CreateRefundResult> {
  const { bookingId, amountEur, reason, initiatedBy, notes } = input;

  const stripePayment = await prisma.stripePayment.findUnique({
    where: { bookingId },
    select: {
      id: true,
      stripePaymentIntentId: true,
      stripeStatus: true,
      amountCents: true,
      refundedAmountCents: true,
      refundStatus: true,
    },
  });

  if (!stripePayment) {
    return { ok: false, error: "No payment record found for this booking" };
  }

  if (stripePayment.stripeStatus !== "SUCCEEDED") {
    return { ok: false, error: `Cannot refund a payment with status: ${stripePayment.stripeStatus}` };
  }

  if (!stripePayment.stripePaymentIntentId) {
    return { ok: false, error: "Payment intent ID not found — cannot process refund" };
  }

  const maxRefundableEur = (stripePayment.amountCents - stripePayment.refundedAmountCents) / 100;

  if (maxRefundableEur <= 0) {
    return { ok: false, error: "This payment has already been fully refunded" };
  }

  const refundAmountEur = amountEur ?? maxRefundableEur;
  if (refundAmountEur > maxRefundableEur) {
    return {
      ok: false,
      error: `Refund amount €${refundAmountEur.toFixed(2)} exceeds refundable balance of €${maxRefundableEur.toFixed(2)}`,
    };
  }

  const refundAmountCents = Math.round(refundAmountEur * 100);
  const isFullRefund = refundAmountCents === stripePayment.amountCents - stripePayment.refundedAmountCents;

  await writePaymentAuditLog({
    bookingId,
    stripePaymentId: stripePayment.id,
    action: "refund_initiated",
    actor: initiatedBy,
    newValue: {
      amountEur: refundAmountEur,
      reason,
      isFullRefund,
      notes: notes ?? null,
    },
  });

  try {
    const stripeRefund = await stripe.refunds.create(
      {
        payment_intent: stripePayment.stripePaymentIntentId,
        amount: refundAmountCents,
        reason: reason as "duplicate" | "fraudulent" | "requested_by_customer",
        metadata: {
          bookingId,
          initiatedBy,
          notes: notes ?? "",
        },
      },
      { idempotencyKey: `refund-${bookingId}-${refundAmountCents}-${Date.now()}` },
    );

    const newRefundedCents = stripePayment.refundedAmountCents + refundAmountCents;
    const newRefundStatus = newRefundedCents >= stripePayment.amountCents ? "FULL" : "PARTIAL";
    const newStripeStatus = newRefundedCents >= stripePayment.amountCents ? "REFUNDED" : "PARTIALLY_REFUNDED";

    await prisma.$transaction(async (tx) => {
      await tx.stripePayment.update({
        where: { id: stripePayment.id },
        data: {
          refundedAmountCents: newRefundedCents,
          refundStatus: newRefundStatus,
          stripeStatus: newStripeStatus,
        },
      });

      await tx.stripeRefund.create({
        data: {
          stripePaymentId: stripePayment.id,
          stripeRefundId: stripeRefund.id,
          amountCents: refundAmountCents,
          reason: mapRefundReason(reason),
          status: stripeRefund.status ?? "pending",
          initiatedBy,
          notes: notes ?? null,
        },
      });

      if (isFullRefund) {
        await tx.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: "REFUNDED" },
        });
      }
    });

    await writePaymentAuditLog({
      bookingId,
      stripePaymentId: stripePayment.id,
      action: "refund_succeeded",
      actor: initiatedBy,
      newValue: {
        stripeRefundId: stripeRefund.id,
        amountEur: refundAmountEur,
        isFullRefund,
      },
    });

    return { ok: true, refundId: stripeRefund.id, amountEur: refundAmountEur };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[refund-service] Refund failed", { bookingId, error });

    await writePaymentAuditLog({
      bookingId,
      stripePaymentId: stripePayment.id,
      action: "refund_failed",
      actor: initiatedBy,
      newValue: { error: message, amountEur: refundAmountEur },
    });

    return { ok: false, error: `Refund failed: ${message}` };
  }
}

function mapRefundReason(reason: CreateRefundInput["reason"]): import("@/generated/prisma").RefundReason {
  switch (reason) {
    case "duplicate":
      return "DUPLICATE";
    case "fraudulent":
      return "FRAUDULENT";
    default:
      return "REQUESTED_BY_CUSTOMER";
  }
}
