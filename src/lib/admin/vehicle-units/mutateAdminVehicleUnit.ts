import { Prisma } from "@/generated/prisma/client";

import type { AdminVehicleUnitDto } from "@/lib/admin/vehicle-units/types";
import type { AdminVehicleUnitWriteInput } from "@/lib/admin/vehicle-units/vehicle-unit-schema";
import { prisma } from "@/lib/prisma";

export class DuplicateVehicleUnitLicensePlateError extends Error {
  constructor() {
    super("A vehicle unit with this license plate already exists.");
    this.name = "DuplicateVehicleUnitLicensePlateError";
  }
}

function isLicensePlateUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes("licensePlate");
  }

  if (typeof target === "string") {
    return target.includes("licensePlate");
  }

  return false;
}

const unitSelect = {
  id: true,
  vehicleId: true,
  licensePlate: true,
  status: true,
  isActive: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function ensureVehicleExists(vehicleId: string): Promise<boolean> {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { id: true },
  });
  return Boolean(vehicle);
}

export async function createAdminVehicleUnit(
  vehicleId: string,
  input: AdminVehicleUnitWriteInput,
): Promise<AdminVehicleUnitDto | null> {
  if (!(await ensureVehicleExists(vehicleId))) {
    return null;
  }

  try {
    const unit = await prisma.vehicleUnit.create({
      data: {
        vehicleId,
        licensePlate: input.licensePlate,
        status: input.status,
        isActive: input.isActive,
        notes: input.notes ?? null,
      },
      select: unitSelect,
    });

    return {
      ...unit,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
    };
  } catch (error) {
    if (isLicensePlateUniqueConstraintError(error)) {
      throw new DuplicateVehicleUnitLicensePlateError();
    }
    throw error;
  }
}

export async function updateAdminVehicleUnit(
  vehicleId: string,
  unitId: string,
  input: AdminVehicleUnitWriteInput,
): Promise<AdminVehicleUnitDto | null> {
  const existing = await prisma.vehicleUnit.findFirst({
    where: { id: unitId, vehicleId },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  try {
    const unit = await prisma.vehicleUnit.update({
      where: { id: unitId },
      data: {
        licensePlate: input.licensePlate,
        status: input.status,
        isActive: input.isActive,
        notes: input.notes ?? null,
      },
      select: unitSelect,
    });

    return {
      ...unit,
      createdAt: unit.createdAt.toISOString(),
      updatedAt: unit.updatedAt.toISOString(),
    };
  } catch (error) {
    if (isLicensePlateUniqueConstraintError(error)) {
      throw new DuplicateVehicleUnitLicensePlateError();
    }
    throw error;
  }
}

export type DeleteAdminVehicleUnitResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "has_related_records" };

export async function deleteAdminVehicleUnit(
  vehicleId: string,
  unitId: string,
): Promise<DeleteAdminVehicleUnitResult> {
  const existing = await prisma.vehicleUnit.findFirst({
    where: { id: unitId, vehicleId },
    select: {
      id: true,
      _count: {
        select: {
          bookings: true,
          reservationHolds: true,
        },
      },
    },
  });

  if (!existing) {
    return { ok: false, reason: "not_found" };
  }

  if (existing._count.bookings > 0 || existing._count.reservationHolds > 0) {
    return { ok: false, reason: "has_related_records" };
  }

  await prisma.vehicleUnit.delete({ where: { id: unitId } });

  return { ok: true };
}
