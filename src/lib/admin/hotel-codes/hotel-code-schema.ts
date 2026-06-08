import { z } from "zod";

import { normalizeHotelCode } from "@/lib/hotel-codes/normalize-hotel-code";

export const adminOptionalDateTimeSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toISOString();
}, z.string().datetime().nullable().optional());

export const adminHotelCodeWriteSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(2, "Code must be at least 2 characters")
      .max(40, "Code must be at most 40 characters")
      .transform(normalizeHotelCode),
    hotelPartnerId: z.string().cuid("Select a hotel"),
    discountPercent: z
      .number({ required_error: "Discount percentage is required" })
      .min(0, "Discount must be at least 0%")
      .max(100, "Discount must be at most 100%"),
    isActive: z.boolean(),
    validFrom: adminOptionalDateTimeSchema,
    validUntil: adminOptionalDateTimeSchema,
  })
  .superRefine((value, context) => {
    if (value.validFrom && value.validUntil) {
      const from = new Date(value.validFrom);
      const until = new Date(value.validUntil);
      if (from > until) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["validUntil"],
          message: "Valid until must be on or after valid from",
        });
      }
    }
  });

export type AdminHotelCodeWriteInput = z.infer<typeof adminHotelCodeWriteSchema>;

export const adminHotelCodeListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  code: z.string().trim().max(40).optional(),
  hotelPartnerId: z.string().cuid().optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
});
