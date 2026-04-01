import type { VehicleType } from "@/features/vehicles/data/vehicles";

/** Map hero booking `vehicleTypeOptions` values to listing filter. */
export function parseVehicleTypeSearchParam(
  raw: string | null,
): VehicleType | "All" {
  if (!raw) return "All";
  const key = raw.trim().toLowerCase();
  const map: Record<string, VehicleType | "All"> = {
    all: "All",
    scooter: "Scooter",
    scooters: "Scooter",
    motorcycle: "Motorcycle",
    motorcycles: "Motorcycle",
    atv: "ATV",
    atvs: "ATV",
    bicycle: "Bicycle",
    bicycles: "Bicycle",
  };
  if (key in map) return map[key]!;
  const titled: VehicleType[] = ["Scooter", "Motorcycle", "ATV", "Bicycle"];
  if (titled.includes(raw as VehicleType)) return raw as VehicleType;
  if (raw === "All") return "All";
  return "All";
}

export function formatPickupDateParam(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatPickupDateLabel(isoDate: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const [y, mo, da] = isoDate.split("-").map(Number);
  const dt = new Date(y!, mo! - 1, da!);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
