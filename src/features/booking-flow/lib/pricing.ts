import { addDays, differenceInHours, isSunday, parse, startOfDay } from "date-fns";
import type { VehicleType } from "@/features/vehicles/data/vehicles";

type PricingCategory = "motorbike" | "bicycle" | "atv";

export type BookingPricingBreakdown = Readonly<{
  category: PricingCategory;
  categoryLabel: string;
  billableDays: number;
  standardDailyRateEur: number;
  baseDailyRateEur: number;
  discountPerDayEur: number;
  estimatedDurationSavingsEur: number;
  sundayRateEur: number | null;
  sundayDays: number;
  nonSundayDays: number;
  subtotalNonSundayEur: number;
  subtotalSundayEur: number;
  totalEur: number;
}>;

function toPricingCategory(vehicleType: VehicleType): PricingCategory {
  if (vehicleType === "Bicycle") return "bicycle";
  if (vehicleType === "ATV") return "atv";
  return "motorbike";
}

function categoryLabel(category: PricingCategory) {
  if (category === "bicycle") return "Bicycle";
  if (category === "atv") return "ATV";
  return "Motorbike";
}

function getStandardDailyRateEur(category: PricingCategory): number {
  if (category === "bicycle") return 20;
  if (category === "atv") return 110;
  return 25;
}

function getBaseDailyRateEur(category: PricingCategory, billableDays: number): number {
  if (category === "atv") {
    if (billableDays <= 1) return 110;
    if (billableDays === 2) return 90;
    if (billableDays <= 21) return 70;
    return 60;
  }

  if (category === "bicycle") {
    if (billableDays <= 1) return 20;
    if (billableDays === 2) return 18;
    if (billableDays <= 21) return 15;
    return 10;
  }

  if (billableDays <= 1) return 25;
  if (billableDays === 2) return 18;
  if (billableDays <= 21) return 15;
  return 10;
}

function getSundayRateEur(category: PricingCategory): number | null {
  if (category === "bicycle") return 20;
  if (category === "atv") return 110;
  return null;
}

function getSundayDaysWithinRental(pickupDate: Date, billableDays: number): number {
  let sundays = 0;
  const cursor = startOfDay(pickupDate);

  for (let offset = 0; offset < billableDays; offset += 1) {
    const day = addDays(cursor, offset);
    if (isSunday(day)) {
      sundays += 1;
    }
  }

  return sundays;
}

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
  vehicleType: VehicleType,
  pickupDate: string,
  pickupTime: string,
  returnDate: string,
  returnTime: string,
): BookingPricingBreakdown | null {
  const billableDays = getBillableRentalDays(pickupDate, pickupTime, returnDate, returnTime);
  if (billableDays <= 0) {
    return null;
  }

  const pickup = parse(`${pickupDate} ${pickupTime}`, "yyyy-MM-dd HH:mm", new Date());
  if (Number.isNaN(pickup.getTime())) {
    return null;
  }

  const category = toPricingCategory(vehicleType);
  const standardDailyRateEur = getStandardDailyRateEur(category);
  const baseDailyRateEur = getBaseDailyRateEur(category, billableDays);
  const discountPerDayEur = Math.max(0, standardDailyRateEur - baseDailyRateEur);
  const sundayRateEur = getSundayRateEur(category);
  const sundayDays = sundayRateEur ? getSundayDaysWithinRental(pickup, billableDays) : 0;
  const nonSundayDays = billableDays - sundayDays;
  const estimatedDurationSavingsEur = discountPerDayEur * nonSundayDays;

  const subtotalSundayEur = sundayRateEur ? sundayDays * sundayRateEur : 0;
  const subtotalNonSundayEur = nonSundayDays * baseDailyRateEur;

  return {
    category,
    categoryLabel: categoryLabel(category),
    billableDays,
    standardDailyRateEur,
    baseDailyRateEur,
    discountPerDayEur,
    estimatedDurationSavingsEur,
    sundayRateEur,
    sundayDays,
    nonSundayDays,
    subtotalNonSundayEur,
    subtotalSundayEur,
    totalEur: subtotalNonSundayEur + subtotalSundayEur,
  };
}
