import type { Prisma } from "@/generated/prisma/index";

import { prisma } from "@/lib/prisma";

import {
  assertValidAvailabilityWindow,
  type AvailabilityDbClient,
  type ConflictingReservationHold,
} from "./types";

export type FindConflictingReservationHoldsInput = {
  requestedStart: Date;
  requestedEnd: Date;
  vehicleId?: string;
  vehicleIds?: string[];
  excludeHoldReference?: string;
  excludeSessionKey?: string;
};

function buildIdentityFilters(
  input: FindConflictingReservationHoldsInput,
): Prisma.ReservationHoldWhereInput[] {
  const filters: Prisma.ReservationHoldWhereInput[] = [];

  if (input.vehicleId) {
    filters.push({ vehicleId: input.vehicleId });
  }

  if (input.vehicleIds && input.vehicleIds.length > 0) {
    filters.push({ vehicleId: { in: input.vehicleIds } });
  }

  return filters;
}

export async function findConflictingReservationHolds(
  input: FindConflictingReservationHoldsInput,
  db: AvailabilityDbClient = prisma as unknown as AvailabilityDbClient,
): Promise<ConflictingReservationHold[]> {
  assertValidAvailabilityWindow(input);

  const identityFilters = buildIdentityFilters(input);
  if (identityFilters.length === 0) {
    return [];
  }

  const excludedOwners: Prisma.ReservationHoldWhereInput[] = [];
  if (input.excludeHoldReference) {
    excludedOwners.push({ holdReference: input.excludeHoldReference });
  }
  if (input.excludeSessionKey) {
    excludedOwners.push({ sessionKey: input.excludeSessionKey });
  }

  return db.reservationHold.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
      // Overlap rule: requestedStart < existingEnd AND requestedEnd > existingStart.
      pickupDateTime: { lt: input.requestedEnd },
      returnDateTime: { gt: input.requestedStart },
      OR: identityFilters,
      ...(excludedOwners.length > 0 ? { NOT: { OR: excludedOwners } } : {}),
    },
    orderBy: [{ pickupDateTime: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      holdReference: true,
      vehicleId: true,
      vehicleType: true,
      sessionKey: true,
      status: true,
      pickupDateTime: true,
      returnDateTime: true,
      expiresAt: true,
    },
  });
}
