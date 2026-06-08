import type { VehicleType } from "@/generated/prisma/client";

export function defaultBaseDailyRateForVehicleType(vehicleType: VehicleType): number {
  switch (vehicleType) {
    case "Bicycle":
      return 20;
    case "ATV":
      return 110;
    case "Motorcycle":
      return 30;
    case "Scooter":
    default:
      return 25;
  }
}

/** @deprecated Use defaultBaseDailyRateForVehicleType instead. */
export function defaultPricingForVehicleType(vehicleType: VehicleType) {
  const day1 = defaultBaseDailyRateForVehicleType(vehicleType);
  return {
    day1,
    day2: null,
    day3To20: null,
    day21Plus: null,
    sundayOverride: null,
  };
}
