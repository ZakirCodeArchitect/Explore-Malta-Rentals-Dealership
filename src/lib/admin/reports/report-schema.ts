import { z } from "zod";

const bookingStatusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED", "FAILED"]);

const currentYear = new Date().getFullYear();

export const adminReportQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(currentYear + 1).optional(),
  status: bookingStatusSchema.optional(),
  hotelPartnerId: z.string().cuid().optional(),
});

export type AdminReportQueryInput = z.infer<typeof adminReportQuerySchema>;
