import {
  addDays,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import type { CSSProperties } from "react";

import type { AdminVehicleBookingCalendarItem } from "@/lib/admin/vehicles/getAdminVehicleBookingsForCalendar";

export type BookingCalendarColor = {
  bg: string;
  hover: string;
  accent: string;
};

/** Soft pastel fills with readable accent tones — no saturated purples. */
export const BOOKING_CALENDAR_COLORS: readonly BookingCalendarColor[] = [
  { bg: "#bfdbfe", hover: "#93c5fd", accent: "#1d4ed8" },
  { bg: "#a7f3d0", hover: "#6ee7b7", accent: "#047857" },
  { bg: "#fde68a", hover: "#fcd34d", accent: "#b45309" },
  { bg: "#fecdd3", hover: "#fda4af", accent: "#be123c" },
  { bg: "#bae6fd", hover: "#7dd3fc", accent: "#0369a1" },
  { bg: "#fed7aa", hover: "#fdba74", accent: "#c2410c" },
  { bg: "#99f6e4", hover: "#5eead4", accent: "#0f766e" },
  { bg: "#cffafe", hover: "#a5f3fc", accent: "#0e7490" },
] as const;

export function getBookingCalendarColor(colorIndex: number): BookingCalendarColor {
  return BOOKING_CALENDAR_COLORS[colorIndex % BOOKING_CALENDAR_COLORS.length]!;
}

export function buildBookingColorIndexById(
  bookings: readonly AdminVehicleBookingCalendarItem[],
): Map<string, number> {
  const map = new Map<string, number>();
  bookings.forEach((booking, index) => {
    map.set(booking.id, index % BOOKING_CALENDAR_COLORS.length);
  });
  return map;
}

export function getDayCellBackgroundStyle(
  dayBookings: readonly AdminVehicleBookingCalendarItem[],
  bookingColorIndexById: ReadonlyMap<string, number>,
): CSSProperties | undefined {
  if (dayBookings.length === 0) {
    return undefined;
  }

  if (dayBookings.length === 1) {
    const color = getBookingCalendarColor(bookingColorIndexById.get(dayBookings[0]!.id) ?? 0);
    return { backgroundColor: color.bg };
  }

  const step = 100 / dayBookings.length;
  const gradient = dayBookings
    .map((booking, index) => {
      const color = getBookingCalendarColor(bookingColorIndexById.get(booking.id) ?? 0);
      const start = index * step;
      const end = (index + 1) * step;
      return `${color.bg} ${start}% ${end}%`;
    })
    .join(", ");

  return { background: `conic-gradient(${gradient})` };
}

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
