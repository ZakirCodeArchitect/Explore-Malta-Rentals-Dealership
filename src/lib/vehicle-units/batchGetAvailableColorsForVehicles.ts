import type { Prisma } from "@/generated/prisma/index";

import {
  formatVehicleColorLabel,
  parseVehicleColorValue,
  vehicleColorToValue,
} from "@/features/vehicles/lib/vehicle-color";
import { findAvailableVehicleUnits } from "@/lib/vehicle-units/findAvailableVehicleUnits";
import { prisma } from "@/lib/prisma";
import type { AvailableColorDto } from "@/lib/vehicle-units/types";

type VehicleUnitDbClient = typeof prisma | Prisma.TransactionClient;

export type BatchGetAvailableColorsInput = {
  vehicleIds: string[];
  requestedStart: Date;
  requestedEnd: Date;
  excludeSessionKey?: string;
};

function groupUnitsByColorForVehicle(
  units: Array<{ color: string | null }>,
): AvailableColorDto[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const unit of units) {
    const canonical = parseVehicleColorValue(unit.color);
    if (!canonical) {
      continue;
    }
    const value = vehicleColorToValue(canonical);
    const existing = counts.get(value);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(value, { label: formatVehicleColorLabel(canonical), count: 1 });
    }
  }

  return [...counts.entries()]
    .map(([value, { label, count }]) => ({
      value,
      label,
      availableUnitCount: count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Batch-fetch available colors for multiple vehicles without N+1 availability queries.
 * Runs findAvailableVehicleUnits per vehicle (unavoidable due to per-vehicle blocking logic)
 * but groups results efficiently.
 */
export async function batchGetAvailableColorsForVehicles(
  input: BatchGetAvailableColorsInput,
  db: VehicleUnitDbClient = prisma as unknown as VehicleUnitDbClient,
): Promise<Map<string, AvailableColorDto[]>> {
  const out = new Map<string, AvailableColorDto[]>();

  if (input.vehicleIds.length === 0) {
    return out;
  }

  await Promise.all(
    input.vehicleIds.map(async (vehicleId) => {
      const availableUnits = await findAvailableVehicleUnits(
        {
          vehicleId,
          requestedStart: input.requestedStart,
          requestedEnd: input.requestedEnd,
          excludeSessionKey: input.excludeSessionKey,
        },
        db,
      );
      out.set(vehicleId, groupUnitsByColorForVehicle(availableUnits));
    }),
  );

  return out;
}
