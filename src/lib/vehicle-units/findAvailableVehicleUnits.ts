import type { Prisma } from "@/generated/prisma/index";

import { BLOCKING_BOOKING_STATUSES, buildOverlappingRangeWhere } from "@/lib/availability/types";
import { prisma } from "@/lib/prisma";
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

export async function findAvailableVehicleUnits(
  input: FindAvailableVehicleUnitsInput,
  db: VehicleUnitDbClient = prisma as unknown as VehicleUnitDbClient,
): Promise<VehicleUnitRecord[]> {
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

  const [bookedUnitRows, heldUnitRows, legacyBookingCount, legacyHoldCount] = await Promise.all([
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
      select: { vehicleUnitId: true, sessionKey: true },
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

  const blockedUnitIds = new Set<string>();
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
