import { z } from "zod";
import { differenceInCalendarDays, isAfter, parse, startOfDay } from "date-fns";
import { BOOKING_TIME_SLOTS } from "@/features/booking/lib/time-slots";

/** Calendar-day span between pickup and drop-off dates (`differenceInCalendarDays`). */
export const TRIP_MIN_SPAN_DAYS = 1;
export const TRIP_MAX_SPAN_DAYS = 30;

export const BOOKING_SHOP_LABEL = "Pietà — Explore Malta Rentals (shop)" as const;
export const SECURITY_DEPOSIT_EUR = 250;

function isBookingTime(value: string) {
  return (BOOKING_TIME_SLOTS as readonly string[]).includes(value);
}

export const bookingFormSchema = z
  .object({
    /** Shop pickup is always Pietà; optional off-site pickup is requested separately. */
    alternatePickupRequested: z.boolean(),
    alternatePickupAddress: z.string().optional(),
    differentDropoff: z.boolean(),
    dropoffAddress: z.string().optional(),
    depositPreference: z.enum(["pay_online", "pay_at_meeting"]),
    pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "Invalid pickup date"),
    dropoffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "Invalid drop-off date"),
    pickupTime: z
      .string()
      .min(1, "Select pickup time")
      .refine(isBookingTime, "Pickup time must be between 09:30 and 19:00"),
    dropoffTime: z
      .string()
      .min(1, "Select drop-off time")
      .refine(isBookingTime, "Drop-off time must be between 09:30 and 19:00"),
  })
  .superRefine((data, ctx) => {
    if (data.alternatePickupRequested) {
      const t = data.alternatePickupAddress?.trim() ?? "";
      if (t.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the full address where you want pickup (we’ll confirm on WhatsApp).",
          path: ["alternatePickupAddress"],
        });
      }
    }
    if (data.differentDropoff) {
      const t = data.dropoffAddress?.trim() ?? "";
      if (t.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter the full drop-off address (we’ll confirm on WhatsApp).",
          path: ["dropoffAddress"],
        });
      }
    }

    const pickupDay = startOfDay(parse(data.pickupDate, "yyyy-MM-dd", new Date()));
    const dropoffDay = startOfDay(parse(data.dropoffDate, "yyyy-MM-dd", new Date()));
    const spanDays = differenceInCalendarDays(dropoffDay, pickupDay);
    if (spanDays < TRIP_MIN_SPAN_DAYS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Trip must be at least ${TRIP_MIN_SPAN_DAYS} day`,
        path: ["dropoffDate"],
      });
    } else if (spanDays > TRIP_MAX_SPAN_DAYS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Trip cannot exceed ${TRIP_MAX_SPAN_DAYS} days`,
        path: ["dropoffDate"],
      });
    }

    const pickup = parse(`${data.pickupDate} ${data.pickupTime}`, "yyyy-MM-dd HH:mm", new Date());
    const dropoff = parse(`${data.dropoffDate} ${data.dropoffTime}`, "yyyy-MM-dd HH:mm", new Date());
    if (!isAfter(dropoff, pickup)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Drop-off must be after pickup",
        path: ["dropoffDate"],
      });
    }
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
