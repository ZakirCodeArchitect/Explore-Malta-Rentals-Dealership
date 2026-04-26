/**
 * Helmet size UI and submit validation apply for these rental categories.
 * `vehicleType` may be an API code (e.g. MOTORBIKE_125CC) or a display label (Scooter).
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
