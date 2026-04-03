import {
  type BookingOption,
  locationOptions,
} from "@/features/home/data/hero-booking-options";

export function filterMaltaPresetLocations(search: string): BookingOption[] {
  const q = search.trim().toLowerCase();
  if (!q) {
    return [...locationOptions];
  }
  return locationOptions.filter(
    (o) =>
      o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
  );
}

export async function loadMaltaLocationOptions(
  inputValue: string,
): Promise<BookingOption[]> {
  const query = inputValue.trim();
  const presetMatches = filterMaltaPresetLocations(inputValue);

  if (query.length < 2) {
    return presetMatches;
  }

  try {
    const params = new URLSearchParams({
      name: query,
      count: "12",
      language: "en",
      format: "json",
      countryCode: "MT",
    });

    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
    );

    if (!response.ok) {
      return presetMatches;
    }

    const payload = (await response.json()) as {
      results?: Array<{
        id: number;
        name: string;
        admin1?: string;
        country?: string;
        country_code?: string;
        latitude: number;
        longitude: number;
      }>;
    };

    const fromApi = (payload.results ?? [])
      .filter((item) => (item.country_code ?? "MT") === "MT")
      .slice(0, 12)
      .map((item) => ({
        value: String(item.id),
        label: [item.name, item.admin1, item.country].filter(Boolean).join(", "),
      }));

    const seen = new Set(presetMatches.map((o) => o.label.toLowerCase()));
    const merged: BookingOption[] = [...presetMatches];
    for (const item of fromApi) {
      const key = item.label.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(item);
      }
    }
    return merged.slice(0, 24);
  } catch {
    return presetMatches;
  }
}
