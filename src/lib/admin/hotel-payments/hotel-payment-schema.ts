import { z } from "zod";

import { adminOptionalDateTimeSchema } from "@/lib/admin/hotel-codes/hotel-code-schema";

const settlementStatusSchema = z.enum(["DUE", "PAID", "PARTIALLY_PAID"]);

const currentYear = new Date().getFullYear();

export const adminHotelPaymentWriteSchema = z
  .object({
    hotelPartnerId: z.string().cuid("Select a hotel"),
    month: z
      .number({ required_error: "Month is required" })
      .int("Month must be a whole number")
      .min(1, "Month must be between 1 and 12")
      .max(12, "Month must be between 1 and 12"),
    year: z
      .number({ required_error: "Year is required" })
      .int("Year must be a whole number")
      .min(2000, "Year must be 2000 or later")
      .max(currentYear + 1, "Year is too far in the future"),
    settlementAmountDue: z
      .number({ required_error: "Settlement amount due is required" })
      .min(0, "Settlement amount due must be 0 or greater"),
    amountPaid: z
      .number({ required_error: "Amount paid is required" })
      .min(0, "Amount paid must be 0 or greater"),
    status: settlementStatusSchema,
    paidAt: adminOptionalDateTimeSchema,
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.status === "PAID") {
      if (value.amountPaid <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountPaid"],
          message: "Paid status requires an amount paid greater than 0",
        });
      }
      if (value.amountPaid < value.settlementAmountDue) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountPaid"],
          message: "Paid status requires amount paid to be at least the settlement amount due",
        });
      }
      if (!value.paidAt) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["paidAt"],
          message: "Paid status requires a payment date",
        });
      }
    }

    if (value.status === "PARTIALLY_PAID") {
      if (value.amountPaid <= 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountPaid"],
          message: "Partially paid status requires an amount paid greater than 0",
        });
      }
      if (value.amountPaid >= value.settlementAmountDue) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amountPaid"],
          message: "Partially paid status requires amount paid to be less than the settlement amount due",
        });
      }
    }

    if (value.status === "DUE" && value.amountPaid > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amountPaid"],
        message: "Due status requires amount paid to be 0",
      });
    }
  });

export type AdminHotelPaymentWriteInput = z.infer<typeof adminHotelPaymentWriteSchema>;

export const adminHotelPaymentListQuerySchema = z.object({
  hotelPartnerId: z.string().cuid().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(currentYear + 1).optional(),
  status: settlementStatusSchema.optional(),
});

export const adminHotelPaymentPreviewQuerySchema = z.object({
  hotelPartnerId: z.string().cuid("Select a hotel"),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(currentYear + 1),
});

/** Quick status updates from the table (Mark paid / Mark due) — partial is edit-form only. */
export const adminHotelPaymentQuickStatusSchema = z.object({
  status: z.enum(["DUE", "PAID"]),
});

export const adminHotelPaymentStatusSchema = z.object({
  status: settlementStatusSchema,
});

export type AdminHotelPaymentStatusInput = z.infer<typeof adminHotelPaymentStatusSchema>;
