import { NextResponse } from "next/server";

import { getBookingControl } from "@/lib/booking-control";

export async function GET() {
  const { enabled, disabledMessage } = getBookingControl();
  return NextResponse.json({ enabled, disabledMessage });
}
