import { NextResponse } from "next/server";

import { validateHotelCode } from "@/lib/hotel-codes";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false as const, message: "Invalid request body" }, { status: 400 });
  }

  const code =
    body && typeof body === "object" && "code" in body && typeof body.code === "string" ? body.code : "";

  const result = await validateHotelCode(code);

  if (!result.valid) {
    return NextResponse.json({
      success: false as const,
      valid: false as const,
      message: result.reason,
    });
  }

  return NextResponse.json({
    success: true as const,
    valid: true as const,
    code: result.data.code,
    discountPercent: result.data.discountPercent,
    partnerName: result.data.partnerName,
  });
}
