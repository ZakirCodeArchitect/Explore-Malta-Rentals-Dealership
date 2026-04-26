import type { Prisma, VehicleType } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import {
  assertValidAvailabilityWindow,
  type AvailabilityDbClient,
  type ConflictingAvailabilityBlock,
} from "./types";

export type FindConflictingBlocksInput = {
  requestedStart: Date;
  requestedEnd: Date;
  vehicleId?: string;
  vehicleIds?: string[];
  vehicleType?: VehicleType;
};

function buildIdentityFilters(input: FindConflictingBlocksInput): Prisma.AvailabilityBlockWhereInput[] {
  const filters: Prisma.AvailabilityBlockWhereInput[] = [];

  if (input.vehicleId) {
    filters.push({ vehicleId: input.vehicleId });
  }

  if (input.vehicleIds && input.vehicleIds.length > 0) {
    filters.push({ vehicleId: { in: input.vehicleIds } });
  }

  if (input.vehicleType) {
    filters.push({ vehicleType: input.vehicleType });
  }

  return filters;
}

export async function findConflictingBlocks(
  input: FindConflictingBlocksInput,
  db: AvailabilityDbClient = prisma as unknown as AvailabilityDbClient,
): Promise<ConflictingAvailabilityBlock[]> {
  assertValidAvailabilityWindow(input);

  const identityFilters = buildIdentityFilters(input);
  if (identityFilters.length === 0) {
    return [];
  }

  return db.availabilityBlock.findMany({
    where: {
      // Overlap rule: requestedStart < existingEnd AND requestedEnd > existingStart.
      startDateTime: { lt: input.requestedEnd },
      endDateTime: { gt: input.requestedStart },
      OR: identityFilters,
    },
    orderBy: [{ startDateTime: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      vehicleId: true,
      vehicleType: true,
      blockType: true,
      startDateTime: true,
      endDateTime: true,
      reason: true,
    },
  });
}
