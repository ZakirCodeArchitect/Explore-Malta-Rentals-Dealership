import { NextResponse } from "next/server";
import { verifyCheckoutSession } from "@/lib/stripe/payment-service";

/**
 * GET /api/stripe/verify-session?session_id=cs_xxx
 * Lightweight polling endpoint for the success page PaymentVerifyingPoller.
 * Returns { paymentStatus: "paid" | "pending" | "unpaid" }.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  const result = await verifyCheckoutSession(sessionId);

  if (!result.ok) {
    return NextResponse.json({ paymentStatus: "unknown" }, { status: 200 });
  }

  return NextResponse.json({ paymentStatus: result.data.paymentStatus }, { status: 200 });
}
