import { PRICING_TIERS } from "@/lib/pricing/pricing-tiers";

export type DurationPricingRuleDto = Readonly<{
  key: string;
  minDays: number;
  maxDays: number | null;
  discountPercent: number;
  displayOrder: number;
}>;

function mapPricingTierToDto(
  tier: (typeof PRICING_TIERS)[number],
  displayOrder: number,
): DurationPricingRuleDto {
  return {
    key: tier.key,
    minDays: tier.minDays,
    maxDays: tier.maxDays,
    discountPercent: tier.discountPercent,
    displayOrder,
  };
}

export async function getDurationPricingRules(): Promise<DurationPricingRuleDto[]> {
  return PRICING_TIERS.map((tier, index) => mapPricingTierToDto(tier, (index + 1) * 10));
}

export async function getDurationPricingRulesForType(): Promise<DurationPricingRuleDto[]> {
  return getDurationPricingRules();
}
