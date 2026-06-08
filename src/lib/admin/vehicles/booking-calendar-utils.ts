import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";

import type { AdminVehicleBookingCalendarItem } from "@/lib/admin/vehicles/getAdminVehicleBookingsForCalendar";

export function expandBookingToDateKeys(
  pickupDateTime: Date | string,
  returnDateTime: Date | string,
): string[] {
  const start = startOfDay(new Date(pickupDateTime));
  const end = startOfDay(new Date(returnDateTime));

  if (start > end) {
    return [];
  }

  return eachDayOfInterval({ start, end }).map((day) => format(day, "yyyy-MM-dd"));
}

export function buildBookedDateKeySet(bookings: readonly AdminVehicleBookingCalendarItem[]): Set<string> {
  const keys = new Set<string>();
  for (const booking of bookings) {
    for (const key of expandBookingToDateKeys(booking.pickupDateTime, booking.returnDateTime)) {
      keys.add(key);
    }
  }
  return keys;
}

export function getBookingsOnDate(
  bookings: readonly AdminVehicleBookingCalendarItem[],
  date: Date,
): AdminVehicleBookingCalendarItem[] {
  const dayStart = startOfDay(date);

  return bookings.filter((booking) => {
    const pickup = startOfDay(new Date(booking.pickupDateTime));
    const returnDay = startOfDay(new Date(booking.returnDateTime));
    return dayStart >= pickup && dayStart <= returnDay;
  });
}

export function isDateBooked(date: Date, bookedDateKeys: ReadonlySet<string>): boolean {
  return bookedDateKeys.has(format(date, "yyyy-MM-dd"));
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}
