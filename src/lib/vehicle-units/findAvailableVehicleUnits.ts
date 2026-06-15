import type { Prisma } from "@/generated/prisma/index";

import { BLOCKING_BOOKING_STATUSES, buildOverlappingRangeWhere } from "@/lib/availability/types";
import { prisma } from "@/lib/prisma";
import { cleanupExpiredHolds } from "@/lib/reservation-holds/cleanupExpiredHolds";
import { releaseStaleHoldOccupancy } from "@/lib/reservation-holds/releaseStaleHoldOccupancy";
import { isAssignableVehicleUnit } from "@/lib/vehicle-units/isAssignableVehicleUnit";
import type { FindAvailableVehicleUnitsInput, VehicleUnitRecord } from "@/lib/vehicle-units/types";

type VehicleUnitDbClient = typeof prisma | Prisma.TransactionClient;

const unitSelect = {
  id: true,
  vehicleId: true,
  licensePlate: true,
  status: true,
  isActive: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VehicleUnitSelect;

function isTopLevelPrismaClient(db: VehicleUnitDbClient): db is typeof prisma {
  return db === prisma;
}

/**
 * Availability cleanup strategy:
 * - Always release stale hold occupancy (fast DELETE, safe in transactions).
 * - On top-level reads (not inside a booking/hold transaction), also run the full
 *   expired-hold sweeper so hold status and occupancy stay aligned for public checks.
 * - Overlapping VehicleUnitOccupancy rows are the date-based lock; physical unit status
 *   only gates MAINTENANCE / NOT_AVAILABLE / OUT_WITH_CUSTOMER / inactive units.
 */
async function prepareAvailabilityData(db: VehicleUnitDbClient): Promise<void> {
  const now = new Date();
  await releaseStaleHoldOccupancy(db, now);

  if (isTopLevelPrismaClient(db)) {
    await cleanupExpiredHolds({ db, now });
  }
}

async function findUnitsBlockedByOccupancy(
  db: VehicleUnitDbClient,
  unitIds: string[],
  requestedStart: Date,
  requestedEnd: Date,
  excludeHoldReference?: string,
  excludeSessionKey?: string,
): Promise<Set<string>> {
  if (unitIds.length === 0) {
    return new Set();
  }

  const rows = await db.vehicleUnitOccupancy.findMany({
    where: {
      vehicleUnitId: { in: unitIds },
      pickupAt: { lt: requestedEnd },
      returnAt: { gt: requestedStart },
    },
    select: {
      vehicleUnitId: true,
      bookingId: true,
      reservationHoldId: true,
      booking: { select: { status: true } },
      reservationHold: {
        select: {
          status: true,
          expiresAt: true,
          holdReference: true,
          sessionKey: true,
        },
      },
    },
  });

  const blockedUnitIds = new Set<string>();
  const now = new Date();

  for (const row of rows) {
    if (row.bookingId) {
      if (!row.booking || (BLOCKING_BOOKING_STATUSES as readonly string[]).includes(row.booking.status)) {
        blockedUnitIds.add(row.vehicleUnitId);
      }
      continue;
    }

    if (!row.reservationHoldId || !row.reservationHold) {
      continue;
    }

    const hold = row.reservationHold;
    if (hold.status !== "ACTIVE" || hold.expiresAt <= now) {
      continue;
    }

    if (excludeHoldReference && hold.holdReference === excludeHoldReference) {
      continue;
    }
    if (excludeSessionKey && hold.sessionKey === excludeSessionKey) {
      continue;
    }

    blockedUnitIds.add(row.vehicleUnitId);
  }

  return blockedUnitIds;
}

export async function findAvailableVehicleUnits(
  input: FindAvailableVehicleUnitsInput,
  db: VehicleUnitDbClient = prisma as unknown as VehicleUnitDbClient,
): Promise<VehicleUnitRecord[]> {
  await prepareAvailabilityData(db);

  const units = await db.vehicleUnit.findMany({
    where: { vehicleId: input.vehicleId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: unitSelect,
  });

  const assignableUnits = units.filter(isAssignableVehicleUnit);
  if (assignableUnits.length === 0) {
    return [];
  }

  const unitIds = assignableUnits.map((unit) => unit.id);
  const overlapWhere = buildOverlappingRangeWhere(input.requestedStart, input.requestedEnd);

  const excludedHoldOwners: Prisma.ReservationHoldWhereInput[] = [];
  if (input.excludeHoldReference) {
    excludedHoldOwners.push({ holdReference: input.excludeHoldReference });
  }
  if (input.excludeSessionKey) {
    excludedHoldOwners.push({ sessionKey: input.excludeSessionKey });
  }

  const [occupancyBlockedUnitIds, bookedUnitRows, heldUnitRows, legacyBookingCount, legacyHoldCount] =
    await Promise.all([
      findUnitsBlockedByOccupancy(
        db,
        unitIds,
        input.requestedStart,
        input.requestedEnd,
        input.excludeHoldReference,
        input.excludeSessionKey,
      ),
      db.booking.findMany({
        where: {
          status: { in: [...BLOCKING_BOOKING_STATUSES] },
          vehicleUnitId: { in: unitIds },
          ...overlapWhere,
        },
        select: { vehicleUnitId: true },
      }),
      db.reservationHold.findMany({
        where: {
          status: "ACTIVE",
          expiresAt: { gt: new Date() },
          vehicleUnitId: { in: unitIds },
          pickupDateTime: { lt: input.requestedEnd },
          returnDateTime: { gt: input.requestedStart },
          ...(excludedHoldOwners.length > 0 ? { NOT: { OR: excludedHoldOwners } } : {}),
        },
        select: { vehicleUnitId: true },
      }),
      db.booking.findMany({
        where: {
          status: { in: [...BLOCKING_BOOKING_STATUSES] },
          vehicleId: input.vehicleId,
          vehicleUnitId: null,
          ...overlapWhere,
        },
        select: { vehicleUnitId: true },
      }),
      db.reservationHold.findMany({
        where: {
          status: "ACTIVE",
          expiresAt: { gt: new Date() },
          vehicleId: input.vehicleId,
          vehicleUnitId: null,
          pickupDateTime: { lt: input.requestedEnd },
          returnDateTime: { gt: input.requestedStart },
          ...(excludedHoldOwners.length > 0 ? { NOT: { OR: excludedHoldOwners } } : {}),
        },
        select: { id: true },
      }),
    ]);

  const blockedUnitIds = new Set(occupancyBlockedUnitIds);
  for (const row of bookedUnitRows) {
    if (row.vehicleUnitId) {
      blockedUnitIds.add(row.vehicleUnitId);
    }
  }
  for (const row of heldUnitRows) {
    if (row.vehicleUnitId) {
      blockedUnitIds.add(row.vehicleUnitId);
    }
  }

  const freeUnits = assignableUnits.filter((unit) => {
    if (input.excludeVehicleUnitId && unit.id === input.excludeVehicleUnitId) {
      return false;
    }
    return !blockedUnitIds.has(unit.id);
  });

  const legacySlotsToReserve = legacyBookingCount.length + legacyHoldCount.length;
  if (legacySlotsToReserve <= 0) {
    return freeUnits;
  }

  return freeUnits.slice(legacySlotsToReserve);
}
