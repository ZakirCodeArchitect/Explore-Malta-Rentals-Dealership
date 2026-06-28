export function buildBookingUrlWithVehicle(baseHref: string, vehicleSlug: string): string {
  const [path, query] = baseHref.split("?");
  const params = new URLSearchParams(query ?? "");
  params.set("vehicle", vehicleSlug);
  const qs = params.toString();
  return qs.length > 0 ? `${path}?${qs}` : path;
}
