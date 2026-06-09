import { z } from "zod";

import { normalizeLicensePlate } from "@/lib/admin/vehicles/vehicle-schema";

export const VEHICLE_UNIT_STATUSES = [
  "AVAILABLE",
  "BOOKED",
  "MAINTENANCE",
  "SOLD",
  "INACTIVE",
] as const;

export const adminVehicleUnitWriteSchema = z.object({
  licensePlate: z
    .string()
    .trim()
    .min(1, "License plate is required")
    .max(20, "License plate must be at most 20 characters")
    .transform(normalizeLicensePlate),
  status: z.enum(VEHICLE_UNIT_STATUSES).default("AVAILABLE"),
  isActive: z.boolean().default(true),
  notes: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()
    .optional(),
});

export type AdminVehicleUnitWriteInput = z.infer<typeof adminVehicleUnitWriteSchema>;
