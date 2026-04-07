import type { BookingFormValues } from "@/features/booking/lib/booking-schema";
import {
  CUSTOM_LOCATION_ID,
  HOTEL_DELIVERY_ID,
  locationLabelById,
} from "@/features/booking/data/locations";

function resolvePlace(id: string, custom: string | undefined): string {
  if (id === CUSTOM_LOCATION_ID) return (custom ?? "").trim();
  if (id === HOTEL_DELIVERY_ID) {
    const t = (custom ?? "").trim();
    return t || (locationLabelById(id) ?? id);
  }
  return locationLabelById(id) ?? id;
}

export function buildVehiclesSearchUrl(values: BookingFormValues): string {
  const pickupLabel = resolvePlace(values.pickupLocationId, values.pickupCustom);
  const sameDrop =
    !values.differentDropoff || !values.dropoffLocationId
      ? pickupLabel
      : resolvePlace(values.dropoffLocationId, values.dropoffCustom);

  const params = new URLSearchParams({
    pickupLocation: pickupLabel,
    dropoffLocation: sameDrop,
    pickupDate: values.pickupDate,
    dropoffDate: values.dropoffDate,
    pickupTime: values.pickupTime,
    dropoffTime: values.dropoffTime,
    differentDropoff: values.differentDropoff ? "1" : "0",
  });

  return `/vehicles?${params.toString()}`;
}
