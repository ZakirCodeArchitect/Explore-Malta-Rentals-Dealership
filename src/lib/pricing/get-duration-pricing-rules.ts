import type { VehicleType } from "@/generated/prisma/client";

import {
  mapDbDurationPricingRule,
  type DurationPricingRuleDto,
} from "@/lib/pricing/duration-pricing";
import { prisma } from "@/lib/prisma";

export async function getDurationPricingRules(): Promise<DurationPricingRuleDto[]> {
  const rules = await prisma.durationPricingRule.findMany({
    where: { isActive: true },
    orderBy: [{ vehicleType: "asc" }, { displayOrder: "asc" }, { minDays: "asc" }],
    select: {
      id: true,
      vehicleType: true,
      minDays: true,
      maxDays: true,
      discountPercent: true,
      displayOrder: true,
    },
  });

  return rules.map(mapDbDurationPricingRule);
}

export async function getDurationPricingRulesForType(
  vehicleType: VehicleType,
): Promise<DurationPricingRuleDto[]> {
  const rules = await prisma.durationPricingRule.findMany({
    where: { isActive: true, vehicleType },
    orderBy: [{ displayOrder: "asc" }, { minDays: "asc" }],
    select: {
      id: true,
      vehicleType: true,
      minDays: true,
      maxDays: true,
      discountPercent: true,
      displayOrder: true,
    },
  });

  return rules.map(mapDbDurationPricingRule);
}
