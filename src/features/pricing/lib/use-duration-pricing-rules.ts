"use client";

import { PRICING_TIERS } from "@/lib/pricing/pricing-tiers";
import type { DurationPricingRuleDto } from "@/lib/pricing/get-duration-pricing-rules";

type UseDurationPricingRulesResult = {
  rules: DurationPricingRuleDto[];
  isLoading: boolean;
  error: string | null;
};

const STATIC_RULES: DurationPricingRuleDto[] = PRICING_TIERS.map((tier, index) => ({
  key: tier.key,
  minDays: tier.minDays,
  maxDays: tier.maxDays,
  discountPercent: tier.discountPercent,
  displayOrder: (index + 1) * 10,
}));

export function useDurationPricingRules(_enabled = true): UseDurationPricingRulesResult {
  return {
    rules: STATIC_RULES,
    isLoading: false,
    error: null,
  };
}
