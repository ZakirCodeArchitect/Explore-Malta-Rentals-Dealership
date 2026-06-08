import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .optional();

export const adminHotelPartnerWriteSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(160),
  contactPerson: optionalText,
  email: z.preprocess(
    (value) => {
      if (value === undefined || value === null) {
        return null;
      }
      if (typeof value !== "string") {
        return value;
      }
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    },
    z.string().email("Enter a valid email").max(160).nullable().optional(),
  ),
  phone: optionalText,
  address: optionalText,
  isActive: z.boolean(),
});

export type AdminHotelPartnerWriteInput = z.infer<typeof adminHotelPartnerWriteSchema>;

export const adminHotelPartnerListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
});
