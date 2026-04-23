import type { Prisma, VehicleType } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
  assertValidAvailabilityWindow,
  BLOCKING_BOOKING_STATUSES,
  buildOverlappingRangeWhere,
  type AvailabilityDbClient,
  type ConflictingBooking,
} from "./types";

export type FindConflictingBookingsInput = {
  requestedStart: Date;
  requestedEnd: Date;
  vehicleId?: string;
  vehicleIds?: string[];
  vehicleType?: VehicleType;
  includeTypeOnlyBookings?: boolean;
};

function buildIdentityFilters(input: FindConflictingBookingsInput): Prisma.BookingWhereInput[] {
  const filters: Prisma.BookingWhereInput[] = [];

  if (input.vehicleId) {
    filters.push({ vehicleId: input.vehicleId });
  }

  if (input.vehicleIds && input.vehicleIds.length > 0) {
    filters.push({ vehicleId: { in: input.vehicleIds } });
  }

  if (input.includeTypeOnlyBookings && input.vehicleType) {
    filters.push({
      vehicleId: null,
      OR: [{ vehicleType: input.vehicleType }, { vehicleTypeSnapshot: input.vehicleType }],
    });
  }

  return filters;
}

export async function findConflictingBookings(
  input: FindConflictingBookingsInput,
  db: AvailabilityDbClient = prisma as unknown as AvailabilityDbClient,
): Promise<ConflictingBooking[]> {
  assertValidAvailabilityWindow(input);

  const identityFilters = buildIdentityFilters(input);
  if (identityFilters.length === 0) {
    return [];
  }

  return db.booking.findMany({
    where: {
      status: { in: [...BLOCKING_BOOKING_STATUSES] },
      ...buildOverlappingRangeWhere(input.requestedStart, input.requestedEnd),
      OR: identityFilters,
    },
    orderBy: [{ pickupDateTime: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      bookingReference: true,
      status: true,
      vehicleId: true,
      vehicleType: true,
      vehicleTypeSnapshot: true,
      pickupDateTime: true,
      returnDateTime: true,
    },
  });
}
