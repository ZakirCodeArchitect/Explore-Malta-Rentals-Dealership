/**
 * Helmet size UI and submit validation apply for these rental categories.
 * `vehicleType` accepts any of the VehicleType values: Scooter, Motorcycle, Bicycle, ATV.
 */
export function vehicleTypeNeedsHelmetFlow(vehicleType: string | null | undefined): boolean {
  const t = (vehicleType ?? "").trim().toLowerCase();
  return (
    t.includes("motorbike") ||
    t.includes("atv") ||
    t.includes("scooter") ||
    t.includes("motorcycle")
  );
}
