import { NextResponse } from "next/server";

import { getDurationPricingRules } from "@/lib/pricing/get-duration-pricing-rules";

export async function GET() {
  try {
    const rules = await getDurationPricingRules();
    return NextResponse.json({
      success: true as const,
      rules,
    });
  } catch (error) {
    console.error("[pricing/duration-rules] Failed to fetch duration pricing rules", error);
    return NextResponse.json(
      {
        success: false as const,
        message: "Unable to load duration pricing rules right now.",
      },
      { status: 500 },
    );
  }
}
