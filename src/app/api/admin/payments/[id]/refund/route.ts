import { NextResponse } from "next/server";
import { requireAdminApi, AdminUnauthorizedError } from "@/lib/admin-auth";
import { createRefund } from "@/lib/stripe/refund-service";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const refundSchema = z.object({
  amountEur: z.number().positive().optional(),
  reason: z.enum(["duplicate", "fraudulent", "requested_by_customer"]).default("requested_by_customer"),
  notes: z.string().max(500).optional(),
});

/**
 * POST /api/admin/payments/[id]/refund
 * Initiates a full or partial refund. [id] is the StripePayment.id.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdminApi();
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false as const, message: "Invalid request body" }, { status: 400 });
    }

    const parsed = refundSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false as const, message: "Invalid refund parameters", details: parsed.error.errors },
        { status: 400 },
      );
    }

    const stripePayment = await prisma.stripePayment.findUnique({
      where: { id },
      select: { bookingId: true },
    });

    if (!stripePayment) {
      return NextResponse.json({ success: false as const, message: "Payment record not found" }, { status: 404 });
    }

    const result = await createRefund({
      bookingId: stripePayment.bookingId,
      amountEur: parsed.data.amountEur,
      reason: parsed.data.reason,
      initiatedBy: `admin:${session.id}`,
      notes: parsed.data.notes,
    });

    if (!result.ok) {
      return NextResponse.json({ success: false as const, message: result.error }, { status: 422 });
    }

    return NextResponse.json({
      success: true as const,
      refundId: result.refundId,
      amountEur: result.amountEur,
      message: `Refund of €${result.amountEur.toFixed(2)} initiated successfully`,
    });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/admin/payments/refund] POST error", error);
    return NextResponse.json({ success: false as const, message: "Internal server error" }, { status: 500 });
  }
}
