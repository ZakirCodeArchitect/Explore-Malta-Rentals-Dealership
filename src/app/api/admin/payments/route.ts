import { NextResponse } from "next/server";
import { requireAdminApi, AdminUnauthorizedError } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/payments
 * Returns paginated list of Stripe payments with booking info.
 * Query: ?page=1&limit=20&status=SUCCEEDED&search=EMR-xxx
 */
export async function GET(request: Request) {
  try {
    await requireAdminApi();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();

    const where = {
      ...(status ? { stripeStatus: status as import("@/generated/prisma").StripePaymentStatus } : {}),
      ...(search
        ? {
            OR: [
              { booking: { bookingReference: { contains: search, mode: "insensitive" as const } } },
              { booking: { customerEmail: { contains: search, mode: "insensitive" as const } } },
              { booking: { customerFullName: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [payments, total] = await Promise.all([
      prisma.stripePayment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          booking: {
            select: {
              bookingReference: true,
              customerFullName: true,
              customerEmail: true,
              pickupDateTime: true,
              returnDateTime: true,
              vehicleNameSnapshot: true,
              status: true,
              paymentStatus: true,
            },
          },
          refunds: {
            select: { amountCents: true, status: true, createdAt: true },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.stripePayment.count({ where }),
    ]);

    return NextResponse.json({
      success: true as const,
      payments: payments.map((p) => ({
        id: p.id,
        bookingId: p.bookingId,
        bookingReference: p.booking.bookingReference,
        customerName: p.booking.customerFullName,
        customerEmail: p.booking.customerEmail,
        vehicleName: p.booking.vehicleNameSnapshot,
        pickupDate: p.booking.pickupDateTime,
        returnDate: p.booking.returnDateTime,
        amountEur: p.amountCents / 100,
        currency: p.currency,
        stripeStatus: p.stripeStatus,
        refundStatus: p.refundStatus,
        refundedAmountEur: p.refundedAmountCents / 100,
        bookingStatus: p.booking.status,
        bookingPaymentStatus: p.booking.paymentStatus,
        stripeCheckoutSessionId: p.stripeCheckoutSessionId,
        stripePaymentIntentId: p.stripePaymentIntentId,
        refunds: p.refunds.map((r) => ({
          amountEur: r.amountCents / 100,
          status: r.status,
          createdAt: r.createdAt,
        })),
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof AdminUnauthorizedError) {
      return NextResponse.json({ success: false as const, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[api/admin/payments] GET error", error);
    return NextResponse.json({ success: false as const, message: "Internal server error" }, { status: 500 });
  }
}
