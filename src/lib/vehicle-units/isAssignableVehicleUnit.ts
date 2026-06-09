import type { VehicleUnitStatus } from "@/generated/prisma/client";

import { ASSIGNABLE_VEHICLE_UNIT_STATUSES } from "@/lib/vehicle-units/types";

export function isAssignableVehicleUnit(unit: {
  isActive: boolean;
  status: VehicleUnitStatus;
}): boolean {
  return unit.isActive && (ASSIGNABLE_VEHICLE_UNIT_STATUSES as readonly string[]).includes(unit.status);
}
