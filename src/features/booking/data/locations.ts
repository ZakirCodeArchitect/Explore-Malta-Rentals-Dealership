export type LocationEntry = Readonly<{
  id: string;
  label: string;
  group: string;
}>;

/** Curated Malta pickup/drop-off points — extend or wire to autocomplete later */
export const LOCATION_ENTRIES: readonly LocationEntry[] = [
  { id: "mla", label: "Malta International Airport (MLA)", group: "Airport & port" },
  { id: "cirkewwa", label: "Ċirkewwa Ferry Terminal", group: "Airport & port" },
  { id: "valletta", label: "Valletta (city centre)", group: "City centres" },
  { id: "sliema", label: "Sliema", group: "City centres" },
  { id: "st-julians", label: "St Julian’s", group: "City centres" },
  { id: "st-pauls", label: "St Paul’s Bay / Buġibba", group: "City centres" },
  { id: "mdina", label: "Mdina / Rabat", group: "City centres" },
  { id: "marsaxlokk", label: "Marsaxlokk", group: "City centres" },
  { id: "hotel-delivery", label: "Hotel delivery (specify below)", group: "Hotels & delivery" },
  { id: "custom", label: "Other address (custom)", group: "Other" },
] as const;

export const CUSTOM_LOCATION_ID = "custom" as const;

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
