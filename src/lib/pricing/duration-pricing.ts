import type { VehicleType } from "@/generated/prisma/client";

export type DurationPricingRuleDto = Readonly<{
  id?: string;
  vehicleType: VehicleType;
  minDays: number;
  maxDays: number | null;
  discountPercent: number;
  displayOrder: number;
}>;

export type DurationPricingPreviewRow = Readonly<{
  minDays: number;
  maxDays: number | null;
  discountPercent: number;
  appliedDailyRate: number;
  label: string;
}>;

export type VehicleRentalPricingResult = Readonly<{
  baseDailyRate: number;
  billableDays: number;
  durationDiscountPercent: number;
  appliedDailyRate: number;
  rentalSubtotal: number;
}>;

function decimalToNumber(value: { toNumber(): number } | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

export function roundPricingAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatDurationRuleLabel(minDays: number, maxDays: number | null): string {
  if (maxDays == null) {
    return `${minDays}+ days`;
  }
  if (minDays === maxDays) {
    return minDays === 1 ? "1 day" : `${minDays} days`;
  }
  return `${minDays}–${maxDays} days`;
}

export function resolveDurationPricingRule(
  rules: readonly DurationPricingRuleDto[],
  vehicleType: VehicleType,
  billableDays: number,
): DurationPricingRuleDto | null {
  if (billableDays <= 0) {
    return null;
  }

  const matches = rules
    .filter(
      (rule) =>
        rule.vehicleType === vehicleType &&
        billableDays >= rule.minDays &&
        (rule.maxDays == null || billableDays <= rule.maxDays),
    )
    .sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return b.minDays - a.minDays;
    });

  return matches[0] ?? null;
}

export function calculateDiscountedDailyRate(
  baseDailyRate: number,
  discountPercent: number,
): number {
  return roundPricingAmount(baseDailyRate * (1 - discountPercent / 100));
}

export function calculateVehicleRentalPricing(
  baseDailyRate: number,
  vehicleType: VehicleType,
  billableDays: number,
  durationRules: readonly DurationPricingRuleDto[],
): VehicleRentalPricingResult | null {
  if (baseDailyRate <= 0 || billableDays <= 0) {
    return null;
  }

  const matchedRule = resolveDurationPricingRule(durationRules, vehicleType, billableDays);
  if (!matchedRule) {
    return null;
  }

  const durationDiscountPercent = matchedRule.discountPercent;
  const appliedDailyRate = calculateDiscountedDailyRate(baseDailyRate, durationDiscountPercent);
  const rentalSubtotal = roundPricingAmount(appliedDailyRate * billableDays);

  return {
    baseDailyRate: roundPricingAmount(baseDailyRate),
    billableDays,
    durationDiscountPercent: roundPricingAmount(durationDiscountPercent),
    appliedDailyRate,
    rentalSubtotal,
  };
}

export function buildDurationPricingPreview(
  baseDailyRate: number,
  vehicleType: VehicleType,
  durationRules: readonly DurationPricingRuleDto[],
): DurationPricingPreviewRow[] {
  if (baseDailyRate <= 0) {
    return [];
  }

  return durationRules
    .filter((rule) => rule.vehicleType === vehicleType)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((rule) => ({
      minDays: rule.minDays,
      maxDays: rule.maxDays,
      discountPercent: rule.discountPercent,
      appliedDailyRate: calculateDiscountedDailyRate(baseDailyRate, rule.discountPercent),
      label: formatDurationRuleLabel(rule.minDays, rule.maxDays),
    }));
}

export function mapDbDurationPricingRule(rule: {
  id: string;
  vehicleType: VehicleType;
  minDays: number;
  maxDays: number | null;
  discountPercent: { toNumber(): number } | number;
  displayOrder: number;
}): DurationPricingRuleDto {
  return {
    id: rule.id,
    vehicleType: rule.vehicleType,
    minDays: rule.minDays,
    maxDays: rule.maxDays,
    discountPercent: decimalToNumber(rule.discountPercent),
    displayOrder: rule.displayOrder,
  };
}
