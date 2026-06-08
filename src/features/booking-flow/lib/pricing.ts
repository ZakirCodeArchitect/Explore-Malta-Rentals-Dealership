import { differenceInHours, parse } from "date-fns";
import type { VehicleType } from "@/features/vehicles/data/vehicles";
import {
  calculateVehicleRentalPricing,
  type DurationPricingRuleDto,
} from "@/lib/pricing/duration-pricing";

export type BookingPricingBreakdown = Readonly<{
  billableDays: number;
  baseDailyRateEur: number;
  durationDiscountPercent: number;
  appliedDailyRateEur: number;
  totalEur: number;
}>;

export function getBillableRentalDays(
  pickupDate: string,
  pickupTime: string,
  returnDate: string,
  returnTime: string,
): number {
  if (!pickupDate || !pickupTime || !returnDate || !returnTime) {
    return 0;
  }

  const pickup = parse(`${pickupDate} ${pickupTime}`, "yyyy-MM-dd HH:mm", new Date());
  const dropoff = parse(`${returnDate} ${returnTime}`, "yyyy-MM-dd HH:mm", new Date());
  if (Number.isNaN(pickup.getTime()) || Number.isNaN(dropoff.getTime())) {
    return 0;
  }

  const hours = differenceInHours(dropoff, pickup);
  if (hours <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(hours / 24));
}

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
