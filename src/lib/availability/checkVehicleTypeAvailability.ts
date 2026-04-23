import type { VehicleType } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import { findConflictingBlocks } from "./findConflictingBlocks";
import { findConflictingBookings } from "./findConflictingBookings";
import {
  assertValidAvailabilityWindow,
  type AvailabilityDbClient,
  type VehicleTypeAvailabilityResult,
} from "./types";

export type CheckVehicleTypeAvailabilityInput = {
  vehicleType: VehicleType;
  requestedStart: Date;
  requestedEnd: Date;
};

export async function checkVehicleTypeAvailability(
  input: CheckVehicleTypeAvailabilityInput,
  db: AvailabilityDbClient = prisma as unknown as AvailabilityDbClient,
): Promise<VehicleTypeAvailabilityResult> {
  assertValidAvailabilityWindow(input);

  const activeVehicles = await db.vehicle.findMany({
    where: {
      vehicleType: input.vehicleType,
      isActive: true,
    },
    select: { id: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  const totalMatchingVehicles = activeVehicles.length;
  const activeVehicleIds = activeVehicles.map((vehicle) => vehicle.id);

  if (totalMatchingVehicles === 0) {
    return {
      isAvailable: false,
      availableVehicleIds: [],
      totalMatchingVehicles,
      availableCount: 0,
      conflictingBookings: [],
      conflictingBlocks: [],
      reason: "No active vehicles of this type are available",
    };
  }

  const [conflictingBookings, conflictingBlocks] = await Promise.all([
    findConflictingBookings(
      {
        requestedStart: input.requestedStart,
        requestedEnd: input.requestedEnd,
        vehicleIds: activeVehicleIds,
        vehicleType: input.vehicleType,
        includeTypeOnlyBookings: true,
      },
      db,
    ),
    findConflictingBlocks(
      {
        requestedStart: input.requestedStart,
        requestedEnd: input.requestedEnd,
        vehicleIds: activeVehicleIds,
        vehicleType: input.vehicleType,
      },
      db,
    ),
  ]);

  const hasTypeWideBlock = conflictingBlocks.some((block) => block.vehicleType === input.vehicleType);
  if (hasTypeWideBlock) {
    return {
      isAvailable: false,
      availableVehicleIds: [],
      totalMatchingVehicles,
      availableCount: 0,
      conflictingBookings,
      conflictingBlocks,
      reason: "No vehicles of this type are available for the chosen dates",
    };
  }

  const directlyBlockedVehicleIds = new Set<string>();
  for (const booking of conflictingBookings) {
    if (booking.vehicleId) {
      directlyBlockedVehicleIds.add(booking.vehicleId);
    }
  }
  for (const block of conflictingBlocks) {
    if (block.vehicleId) {
      directlyBlockedVehicleIds.add(block.vehicleId);
    }
  }

  const candidateAvailableVehicleIds = activeVehicleIds.filter((vehicleId) => !directlyBlockedVehicleIds.has(vehicleId));

  const typeOnlyOverlappingBookingCount = conflictingBookings.filter((booking) => booking.vehicleId === null).length;
  const availableCount = Math.max(0, candidateAvailableVehicleIds.length - typeOnlyOverlappingBookingCount);
  const availableVehicleIds = candidateAvailableVehicleIds.slice(0, availableCount);
  const isAvailable = availableCount > 0;

  return {
    isAvailable,
    availableVehicleIds,
    totalMatchingVehicles,
    availableCount,
    conflictingBookings,
    conflictingBlocks,
    reason: isAvailable
      ? "Available"
      : "No vehicles of this type are available for the chosen dates",
  };
}
