import { z } from "zod";
import { differenceInCalendarDays, isAfter, parse, startOfDay } from "date-fns";
import { needsLocationDetailField } from "@/features/booking/data/locations";

/** Calendar-day span between pickup and drop-off dates (`differenceInCalendarDays`). */
export const TRIP_MIN_SPAN_DAYS = 1;
export const TRIP_MAX_SPAN_DAYS = 30;

export const bookingFormSchema = z
  .object({
    pickupLocationId: z.string().min(1, "Select a pickup location"),
    pickupCustom: z.string().optional(),
    differentDropoff: z.boolean(),
    dropoffLocationId: z.string().optional(),
    dropoffCustom: z.string().optional(),
    pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "Invalid pickup date"),
    dropoffDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, "Invalid drop-off date"),
    pickupTime: z.string().min(1, "Select pickup time"),
    dropoffTime: z.string().min(1, "Select drop-off time"),
  })
  .superRefine((data, ctx) => {
    if (needsLocationDetailField(data.pickupLocationId)) {
      const t = data.pickupCustom?.trim() ?? "";
      if (t.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter your hotel, address, or delivery details",
          path: ["pickupCustom"],
        });
      }
    }
    if (data.differentDropoff) {
      if (!data.dropoffLocationId || data.dropoffLocationId.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a drop-off location",
          path: ["dropoffLocationId"],
        });
      }
      if (data.dropoffLocationId && needsLocationDetailField(data.dropoffLocationId)) {
        const t = data.dropoffCustom?.trim() ?? "";
        if (t.length < 3) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Enter your drop-off hotel, address, or delivery details",
            path: ["dropoffCustom"],
          });
        }
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
