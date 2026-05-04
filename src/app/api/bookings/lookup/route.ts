import { NextResponse } from "next/server";
import { z } from "zod";
import { lookupPublicBookingByReferenceAndEmail } from "@/lib/booking/lookupPublicBooking";
import { assertBookingEnabledOr423 } from "@/lib/booking-control";

const lookupBodySchema = z.object({
  reference: z.string().trim().min(3).max(80),
  email: z.string().trim().email().max(320),
});

const NOT_FOUND_MESSAGE = "No booking matches that reference and email. Check the details and try again.";

export async function POST(request: Request) {
  const locked = assertBookingEnabledOr423();
  if (locked) {
    return locked;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false as const, message: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const parsed = lookupBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false as const, message: "Enter a valid booking reference and email address." },
      { status: 400 },
    );
  }

  try {
    const summary = await lookupPublicBookingByReferenceAndEmail(parsed.data.reference, parsed.data.email);
    if (!summary) {
      return NextResponse.json({ success: false as const, message: NOT_FOUND_MESSAGE }, { status: 404 });
    }

    return NextResponse.json({ success: true as const, booking: summary });
  } catch (error) {
    console.error("[bookings/lookup] Failed", error);
    return NextResponse.json(
      { success: false as const, message: "Unable to look up that booking right now. Please try again shortly." },
      { status: 500 },
    );
  }
}
