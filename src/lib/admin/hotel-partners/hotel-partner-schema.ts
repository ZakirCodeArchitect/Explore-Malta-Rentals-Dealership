import { z } from "zod";

import { adminOptionalDateTimeSchema } from "@/lib/admin/hotel-codes/hotel-code-schema";
import { normalizeHotelCode } from "@/lib/hotel-codes/normalize-hotel-code";

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

const adminInitialHotelCodeFieldsSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Code must be at least 2 characters")
    .max(40, "Code must be at most 40 characters")
    .transform(normalizeHotelCode),
  discountPercent: z
    .number({ required_error: "Discount percentage is required" })
    .min(0, "Discount must be at least 0%")
    .max(100, "Discount must be at most 100%"),
  isActive: z.boolean(),
  validFrom: adminOptionalDateTimeSchema,
  validUntil: adminOptionalDateTimeSchema,
});

export type AdminInitialHotelCodeInput = z.infer<typeof adminInitialHotelCodeFieldsSchema>;

export const adminHotelPartnerCreateSchema = adminHotelPartnerWriteSchema
  .extend({
    initialCode: z
      .object({
        code: z.string().trim(),
        discountPercent: z.preprocess(
          (value) => {
            if (value === "" || value === null || value === undefined) {
              return undefined;
            }
            return value;
          },
          z.coerce.number({
            required_error: "Discount percentage is required",
            invalid_type_error: "Discount percentage is required",
          }),
        ),
        isActive: z.boolean().optional().default(true),
        validFrom: adminOptionalDateTimeSchema,
        validUntil: adminOptionalDateTimeSchema,
      })
      .optional(),
  })
  .superRefine((value, context) => {
    const rawCode = value.initialCode?.code?.trim();
    if (!rawCode) {
      return;
    }

    const parsedCode = adminInitialHotelCodeFieldsSchema.safeParse({
      code: rawCode,
      discountPercent: value.initialCode?.discountPercent,
      isActive: value.initialCode?.isActive ?? true,
      validFrom: value.initialCode?.validFrom,
      validUntil: value.initialCode?.validUntil,
    });

    if (!parsedCode.success) {
      for (const issue of parsedCode.error.issues) {
        context.addIssue({
          ...issue,
          path: ["initialCode", ...issue.path],
        });
      }
      return;
    }

    if (parsedCode.data.validFrom && parsedCode.data.validUntil) {
      const from = new Date(parsedCode.data.validFrom);
      const until = new Date(parsedCode.data.validUntil);
      if (from > until) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["initialCode", "validUntil"],
          message: "Valid until must be on or after valid from",
        });
      }
    }

    if (parsedCode.data.isActive && !value.isActive) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["initialCode", "isActive"],
        message: "Cannot activate a code while the hotel is inactive.",
      });
    }
  })
  .transform((value) => {
    const rawCode = value.initialCode?.code?.trim();
    if (!rawCode) {
      const { initialCode: _ignored, ...partner } = value;
      return { ...partner, initialCode: undefined };
    }

    const parsedCode = adminInitialHotelCodeFieldsSchema.parse({
      code: rawCode,
      discountPercent: value.initialCode?.discountPercent,
      isActive: value.initialCode?.isActive ?? true,
      validFrom: value.initialCode?.validFrom,
      validUntil: value.initialCode?.validUntil,
    });

    return {
      ...value,
      initialCode: parsedCode,
    };
  });

export type AdminHotelPartnerCreateInput = z.infer<typeof adminHotelPartnerCreateSchema>;

export const adminHotelPartnerListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
});
