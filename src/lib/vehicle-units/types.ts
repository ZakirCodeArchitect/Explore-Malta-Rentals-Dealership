import type { VehicleUnitStatus } from "@/generated/prisma/client";

export const ASSIGNABLE_VEHICLE_UNIT_STATUSES: readonly VehicleUnitStatus[] = ["AVAILABLE"];

export const NON_BOOKABLE_VEHICLE_UNIT_STATUSES: readonly VehicleUnitStatus[] = [
  "RESERVED",
  "OUT_WITH_CUSTOMER",
  "MAINTENANCE",
  "NOT_AVAILABLE",
];

export type VehicleUnitRecord = {
  id: string;
  vehicleId: string;
  licensePlate: string;
  status: VehicleUnitStatus;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type FindAvailableVehicleUnitsInput = {
  vehicleId: string;
  requestedStart: Date;
  requestedEnd: Date;
  excludeHoldReference?: string;
  excludeSessionKey?: string;
  excludeVehicleUnitId?: string;
};

export type AssignVehicleUnitInput = FindAvailableVehicleUnitsInput;

export type AssignVehicleUnitResult = {
  vehicleUnitId: string;
  licensePlate: string;
};
