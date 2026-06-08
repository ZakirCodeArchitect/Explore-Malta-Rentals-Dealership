import type { VehicleType } from "@/features/vehicles/data/vehicles";
import {
  calculateVehicleRentalPricing,
  type DurationPricingRuleDto,
} from "@/lib/pricing/duration-pricing";
import { getBillableRentalDays } from "@/lib/pricing/rental-duration";

export type BookingPricingBreakdown = Readonly<{
  billableDays: number;
  baseDailyRateEur: number;
  durationDiscountPercent: number;
  appliedDailyRateEur: number;
  totalEur: number;
}>;

export { getBillableRentalDays };

export function getBookingPricingBreakdown(
  baseDailyRate: number,
  vehicleType: VehicleType,
  durationRules: readonly DurationPricingRuleDto[],
  pickupDate: string,
  pickupTime: string,
  returnDate: string,
  returnTime: string,
): BookingPricingBreakdown | null {
  const billableDays = getBillableRentalDays(pickupDate, pickupTime, returnDate, returnTime);
  if (billableDays <= 0) {
    return null;
  }

  const pricing = calculateVehicleRentalPricing(
    baseDailyRate,
    vehicleType,
    billableDays,
    durationRules,
  );
  if (!pricing) {
    return null;
  }

  return {
    billableDays,
    baseDailyRateEur: pricing.baseDailyRate,
    durationDiscountPercent: pricing.durationDiscountPercent,
    appliedDailyRateEur: pricing.appliedDailyRate,
    totalEur: pricing.rentalSubtotal,
  };
}
