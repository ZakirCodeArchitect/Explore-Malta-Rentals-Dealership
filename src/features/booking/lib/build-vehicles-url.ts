import type { BookingFormValues } from "@/features/booking/lib/booking-schema";
import { BOOKING_SHOP_LABEL } from "@/features/booking/lib/booking-schema";

function buildPickupLabel(values: BookingFormValues): string {
  if (values.alternatePickupRequested && values.alternatePickupAddress?.trim()) {
    return `${BOOKING_SHOP_LABEL} · Off-site pickup: ${values.alternatePickupAddress.trim()}`;
  }
  return BOOKING_SHOP_LABEL;
}

function buildDropoffLabel(values: BookingFormValues): string {
  if (!values.differentDropoff) {
    return buildPickupLabel(values);
  }
  return values.dropoffAddress?.trim() ?? BOOKING_SHOP_LABEL;
}

export function buildVehiclesSearchUrl(values: BookingFormValues): string {
  const pickupLabel = buildPickupLabel(values);
  const dropLabel = buildDropoffLabel(values);

  const params = new URLSearchParams({
    pickupLocation: pickupLabel,
    dropoffLocation: dropLabel,
    pickupDate: values.pickupDate,
    returnDate: values.dropoffDate,
    pickupTime: values.pickupTime,
    dropoffTime: values.dropoffTime,
    differentDropoff: values.differentDropoff ? "1" : "0",
    alternatePickup: values.alternatePickupRequested ? "1" : "0",
  });

  const type = values.vehicleType?.trim();
  if (type && type !== "all") {
    params.set("type", type);
  }

  return `/vehicles?${params.toString()}`;
}
