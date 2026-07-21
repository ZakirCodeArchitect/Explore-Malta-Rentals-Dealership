import type { VehicleColor } from "@/features/vehicles/data/vehicles";

const VEHICLE_COLORS: readonly VehicleColor[] = [
  "Black",
  "White",
  "Gray",
  "Red",
  "Blue",
  "Silver",
  "Orange",
];

export const VEHICLE_COLOR_OPTIONS = VEHICLE_COLORS;

export function parseVehicleColorValue(
  raw: string | null | undefined,
): VehicleColor | null {
  if (!raw?.trim()) return null;
  const normalized = raw.trim();
  const match = VEHICLE_COLORS.find(
    (color) => color.toLowerCase() === normalized.toLowerCase(),
  );
  return match ?? null;
}

export function isVehicleColor(value: string): value is VehicleColor {
  return (VEHICLE_COLORS as readonly string[]).includes(value);
}
