/**
 * Ballpark per-calendar-day tiers for motorcycles / scooters (before extras).
 * Used by booking UI and the indicative rates card — keep in sync.
 */
export type IndicativeMotorcycleScooterTier = Readonly<{
  minCalendarDays: number;
  maxCalendarDays: number;
  dailyRateEur: number;
  /** Row label on the indicative rates card */
  cardLabel: string;
}>;

export const INDICATIVE_MOTORCYCLE_SCOOTER_TIERS = [
  {
    minCalendarDays: 1,
    maxCalendarDays: 1,
    dailyRateEur: 25,
    cardLabel: "1 day",
  },
  {
    minCalendarDays: 2,
    maxCalendarDays: 2,
    dailyRateEur: 18,
    cardLabel: "2 days",
  },
  {
    minCalendarDays: 3,
    maxCalendarDays: 21,
    dailyRateEur: 15,
    cardLabel: "3 days – 3 weeks",
  },
  {
    minCalendarDays: 22,
    maxCalendarDays: Number.POSITIVE_INFINITY,
    dailyRateEur: 10,
    cardLabel: "3 weeks or more",
  },
] as const satisfies readonly IndicativeMotorcycleScooterTier[];

export function getIndicativeMotorcycleScooterTier(
  calendarDays: number,
): IndicativeMotorcycleScooterTier | null {
  if (!Number.isFinite(calendarDays)) return null;
  const d = Math.max(0, Math.floor(calendarDays));
  if (d <= 0) return null;
  return (
    INDICATIVE_MOTORCYCLE_SCOOTER_TIERS.find(
      (t) => d >= t.minCalendarDays && d <= t.maxCalendarDays,
    ) ?? null
  );
}

/** Per-day EUR rate for the tier that applies to this trip length (whole calendar days). */
export function getIndicativeMotorcycleScooterDailyRateEur(
  calendarDays: number,
): number {
  return getIndicativeMotorcycleScooterTier(calendarDays)?.dailyRateEur ?? 0;
}

/** Total indicative EUR = calendar days × tier daily rate. */
export function getIndicativeMotorcycleScooterTripTotalEur(
  calendarDays: number,
): number {
  const d = Math.max(0, Math.floor(calendarDays));
  if (d <= 0) return 0;
  const rate = getIndicativeMotorcycleScooterDailyRateEur(d);
  return d * rate;
}
