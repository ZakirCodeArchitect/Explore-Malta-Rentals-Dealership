import { differenceInMinutes, parse } from "date-fns";

export type RentalDurationBreakdown = Readonly<{
  actualDurationMinutes: number;
  actualDurationHours: number;
  billableDays: number;
}>;

function parseDateTime(date: string, time: string): Date | null {
  if (!date || !time) {
    return null;
  }

  const parsed = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function calculateRentalDuration(
  pickupDate: string,
  pickupTime: string,
  returnDate: string,
  returnTime: string,
): RentalDurationBreakdown | null {
  const pickup = parseDateTime(pickupDate, pickupTime);
  const dropoff = parseDateTime(returnDate, returnTime);
  if (!pickup || !dropoff) {
    return null;
  }

  const actualDurationMinutes = differenceInMinutes(dropoff, pickup);
  if (actualDurationMinutes <= 0) {
    return null;
  }

  const minutesPerDay = 60 * 24;
  return {
    actualDurationMinutes,
    actualDurationHours: Number((actualDurationMinutes / 60).toFixed(2)),
    billableDays: Math.max(1, Math.ceil(actualDurationMinutes / minutesPerDay)),
  };
}

export function getBillableRentalDays(
  pickupDate: string,
  pickupTime: string,
  returnDate: string,
  returnTime: string,
): number {
  return calculateRentalDuration(pickupDate, pickupTime, returnDate, returnTime)?.billableDays ?? 0;
}
