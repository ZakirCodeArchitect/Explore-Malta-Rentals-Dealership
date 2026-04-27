import { prisma } from "@/lib/prisma";
import type { VehicleListItemDto } from "@/lib/vehicles/types";

import { findConflictingBlocks } from "@/lib/availability/findConflictingBlocks";
import { findConflictingBookings } from "@/lib/availability/findConflictingBookings";
import { findConflictingReservationHolds } from "@/lib/availability/findConflictingReservationHolds";
import type { AvailabilityDbClient, VehicleAvailabilityResult } from "@/lib/availability/types";

function inactiveResult(reason: string): VehicleAvailabilityResult {
  return {
    isAvailable: false,
    conflictingBookings: [],
    conflictingBlocks: [],
    conflictingReservationHolds: [],
    reason,
  };
}

function buildAvailabilityResult(
  bookings: VehicleAvailabilityResult["conflictingBookings"],
  blocks: VehicleAvailabilityResult["conflictingBlocks"],
  holds: VehicleAvailabilityResult["conflictingReservationHolds"],
): VehicleAvailabilityResult {
  const isAvailable =
    bookings.length === 0 && blocks.length === 0 && holds.length === 0;

  const isReservedByActiveHold =
    holds.length > 0 && bookings.length === 0 && blocks.length === 0;

  return {
    isAvailable,
    conflictingBookings: bookings,
    conflictingBlocks: blocks,
    conflictingReservationHolds: holds,
    reason: isAvailable
      ? "Available"
      : isReservedByActiveHold
        ? "Selected vehicle is temporarily reserved by another customer"
        : "Selected vehicle is not available for the chosen dates",
  };
}

/**
 * Runs availability checks for many vehicles using a constant number of DB round-trips
 * (3 queries) instead of 3×N.
 */
export async function batchCheckVehicleAvailabilityForList(
  vehicles: readonly VehicleListItemDto[],
  requestedStart: Date,
  requestedEnd: Date,
  db: AvailabilityDbClient = prisma as unknown as AvailabilityDbClient,
): Promise<Map<string, VehicleAvailabilityResult>> {
  const out = new Map<string, VehicleAvailabilityResult>();

  const active = vehicles.filter((v) => v.isActive);
  for (const v of vehicles) {
    if (!v.isActive) {
      out.set(v.id, inactiveResult("Selected vehicle is not active"));
    }
  }

  if (active.length === 0) {
    return out;
  }

  const ids = active.map((v) => v.id);
  const uniqueTypes = [...new Set(active.map((v) => v.vehicleType))];

  const [allBookings, allBlocks, allHolds] = await Promise.all([
    findConflictingBookings(
      {
        requestedStart,
        requestedEnd,
        vehicleIds: ids,
      },
      db,
    ),
    findConflictingBlocks(
      {
        requestedStart,
        requestedEnd,
        vehicleIds: ids,
        vehicleTypes: uniqueTypes,
      },
      db,
    ),
    findConflictingReservationHolds(
      {
        requestedStart,
        requestedEnd,
        vehicleIds: ids,
      },
      db,
    ),
  ]);

  for (const vehicle of active) {
    const bookings = allBookings.filter((b) => b.vehicleId === vehicle.id);
    const holds = allHolds.filter((h) => h.vehicleId === vehicle.id);
    const blocks = allBlocks.filter(
      (b) => b.vehicleId === vehicle.id || b.vehicleType === vehicle.vehicleType,
    );
    out.set(vehicle.id, buildAvailabilityResult(bookings, blocks, holds));
  }

  return out;
}
