import type { Prisma } from "@/generated/prisma/index";

import { findAvailableVehicleUnits } from "@/lib/vehicle-units/findAvailableVehicleUnits";
import type { AssignVehicleUnitInput, AssignVehicleUnitResult } from "@/lib/vehicle-units/types";

export class NoAvailableVehicleUnitError extends Error {
  constructor(message = "No physical vehicle unit is available for the selected dates") {
    super(message);
    this.name = "NoAvailableVehicleUnitError";
  }
}

export async function assignAvailableVehicleUnit(
  input: AssignVehicleUnitInput,
  db: Prisma.TransactionClient,
): Promise<AssignVehicleUnitResult> {
  const availableUnits = await findAvailableVehicleUnits(input, db);

  const selected = availableUnits[0];
  if (!selected) {
    throw new NoAvailableVehicleUnitError();
  }

  return {
    vehicleUnitId: selected.id,
    licensePlate: selected.licensePlate,
  };
}
