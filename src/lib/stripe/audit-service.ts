import { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import type { AuditAction } from "./types";

export async function writePaymentAuditLog({
  bookingId,
  stripePaymentId,
  action,
  actor,
  oldValue,
  newValue,
  ipAddress,
}: {
  bookingId?: string;
  stripePaymentId?: string;
  action: AuditAction;
  actor: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await prisma.paymentAuditLog.create({
      data: {
        bookingId: bookingId ?? null,
        stripePaymentId: stripePaymentId ?? null,
        action,
        actor,
        oldValue: oldValue ? (oldValue as Prisma.InputJsonValue) : Prisma.JsonNull,
        newValue: newValue ? (newValue as Prisma.InputJsonValue) : Prisma.JsonNull,
        ipAddress: ipAddress ?? null,
      },
    });
  } catch (error) {
    // Audit log failure must never break the main payment flow
    console.error("[payment-audit] Failed to write audit log", { action, bookingId, error });
  }
}
