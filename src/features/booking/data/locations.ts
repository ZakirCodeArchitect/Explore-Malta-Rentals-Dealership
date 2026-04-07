import {
  locationOptions,
  type BookingOption,
} from "@/features/home/data/hero-booking-options";

export type LocationEntry = Readonly<{
  id: string;
  label: string;
  group: string;
}>;

export const CUSTOM_LOCATION_ID = "custom" as const;

/** Same id as in `aboutBusiness` / services — requires details in the custom field */
export const HOTEL_DELIVERY_ID = "hotel-delivery" as const;

function pickupGroupForHeroOption(opt: BookingOption): string {
  if (opt.value === "luqa-airport") return "Airport & port";
  if (opt.value.endsWith("-gozo")) return "Gozo";
  return "Malta";
}

const fromHeroQuickSearch: readonly LocationEntry[] = locationOptions.map((o) => ({
  id: o.value,
  label: o.label,
  group: pickupGroupForHeroOption(o),
}));

/**
 * Pickup/drop-off presets: same curated list as the home hero quick search
 * (`locationOptions`), plus hotel delivery and custom address.
 */
export const LOCATION_ENTRIES: readonly LocationEntry[] = [
  ...fromHeroQuickSearch,
  {
    id: HOTEL_DELIVERY_ID,
    label: "Hotel delivery (specify below)",
    group: "Hotels & delivery",
  },
  {
    id: CUSTOM_LOCATION_ID,
    label: "Other address (custom)",
    group: "Other",
  },
];

export function locationLabelById(id: string): string | undefined {
  return LOCATION_ENTRIES.find((e) => e.id === id)?.label;
}

export function groupedLocationOptions(): ReadonlyMap<string, readonly LocationEntry[]> {
  const map = new Map<string, LocationEntry[]>();
  for (const entry of LOCATION_ENTRIES) {
    const list = map.get(entry.group) ?? [];
    list.push(entry);
    map.set(entry.group, list);
  }
  return map;
}

export function needsLocationDetailField(locationId: string): boolean {
  return locationId === CUSTOM_LOCATION_ID || locationId === HOTEL_DELIVERY_ID;
}
