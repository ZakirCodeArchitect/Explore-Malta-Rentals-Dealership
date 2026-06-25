import { NextResponse } from "next/server";
import { constructWebhookEvent, processWebhookEvent } from "@/lib/stripe/webhook-service";

/**
 * POST /api/stripe/webhook
 *
 * Receives and processes Stripe webhook events.
 * Must consume the raw body bytes for signature verification — do NOT parse as JSON first.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.warn("[webhook] Request received without stripe-signature header");
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch (error) {
    console.error("[webhook] Failed to read request body", error);
    return NextResponse.json({ error: "Failed to read request body" }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(rawBody, signature);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signature verification failed";
    console.warn("[webhook] Invalid signature", { message });
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const result = await processWebhookEvent(event);

  if (!result.ok) {
    console.error("[webhook] Event processing failed", { eventId: event.id, eventType: event.type, error: result.error });
    // Return 200 to prevent Stripe from retrying unrecoverable errors.
    // For transient errors (DB down) we return 500 so Stripe retries.
    const isTransientError =
      result.error.includes("database") ||
      result.error.includes("ECONNREFUSED") ||
      result.error.includes("timeout");

    if (isTransientError) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // Log the error but acknowledge receipt to stop retries
    return NextResponse.json({ received: true, error: result.error }, { status: 200 });
  }

  return NextResponse.json({ received: true, action: result.action }, { status: 200 });
}
