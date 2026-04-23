import type { VehicleType } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import { findConflictingBlocks } from "./findConflictingBlocks";
import { findConflictingBookings } from "./findConflictingBookings";
import {
  assertValidAvailabilityWindow,
  type AvailabilityDbClient,
  type VehicleAvailabilityResult,
} from "./types";

export type CheckVehicleAvailabilityInput = {
  vehicleId: string;
  requestedStart: Date;
  requestedEnd: Date;
  vehicleType?: VehicleType;
};

async function resolveVehicleType(
  vehicleId: string,
  db: AvailabilityDbClient,
): Promise<{ vehicleType: VehicleType; isActive: boolean } | null> {
  const vehicle = await db.vehicle.findUnique({
    where: { id: vehicleId },
    select: { vehicleType: true, isActive: true },
  });

  if (!vehicle) {
    return null;
  }

  return {
    vehicleType: vehicle.vehicleType,
    isActive: vehicle.isActive,
  };
}

export async function checkVehicleAvailability(
  input: CheckVehicleAvailabilityInput,
  db: AvailabilityDbClient = prisma as unknown as AvailabilityDbClient,
): Promise<VehicleAvailabilityResult> {
  assertValidAvailabilityWindow(input);

  const resolvedVehicle = input.vehicleType
    ? { vehicleType: input.vehicleType, isActive: true }
    : await resolveVehicleType(input.vehicleId, db);

  if (!resolvedVehicle) {
    return {
      isAvailable: false,
      conflictingBookings: [],
      conflictingBlocks: [],
      reason: "Selected vehicle does not exist",
    };
  }

  if (!resolvedVehicle.isActive) {
    return {
      isAvailable: false,
      conflictingBookings: [],
      conflictingBlocks: [],
      reason: "Selected vehicle is not active",
    };
  }

  const [conflictingBookings, conflictingBlocks] = await Promise.all([
    findConflictingBookings(
      {
        requestedStart: input.requestedStart,
        requestedEnd: input.requestedEnd,
        vehicleId: input.vehicleId,
      },
      db,
    ),
    findConflictingBlocks(
      {
        requestedStart: input.requestedStart,
        requestedEnd: input.requestedEnd,
        vehicleId: input.vehicleId,
        vehicleType: resolvedVehicle.vehicleType,
      },
      db,
    ),
  ]);

  const isAvailable = conflictingBookings.length === 0 && conflictingBlocks.length === 0;

  return {
    isAvailable,
    conflictingBookings,
    conflictingBlocks,
    reason: isAvailable
      ? "Available"
      : "Selected vehicle is not available for the chosen dates",
  };
}
