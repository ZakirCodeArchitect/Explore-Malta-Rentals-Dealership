"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Vehicle } from "@/features/vehicles/data/vehicles";
import { createReservationHoldWithRetry } from "@/features/booking-flow/lib/reservation-hold-api";
import { RESERVATION_HOLD_STORAGE_KEY } from "@/features/booking-flow/lib/reservation-hold-storage";

export const VEHICLE_TRIP_SEARCH_ANCHOR_ID = "vehicle-trip-search";

type BookNowButtonProps = {
  vehicle: Vehicle;
  bookingHref: string;
  /** When false, click scrolls to trip search instead of reserving or navigating with dates. */
  tripDatesCommitted: boolean;
  onTripDatesRequired?: () => void;
  pickupDate?: string | null;
  returnDate?: string | null;
  pickupTime?: string | null;
  returnTime?: string | null;
  className: string;
  busyClassName?: string;
};

export function buildBookingUrlWithVehicle(baseHref: string, vehicleSlug: string): string {
  const [path, query] = baseHref.split("?");
  const params = new URLSearchParams(query ?? "");
  params.set("vehicle", vehicleSlug);
  const qs = params.toString();
  return qs.length > 0 ? `${path}?${qs}` : path;
}

export function BookNowButton({
  vehicle,
  bookingHref,
  tripDatesCommitted,
  onTripDatesRequired,
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
  className,
  busyClassName,
}: BookNowButtonProps) {
  const router = useRouter();
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextUrl = useMemo(
    () => buildBookingUrlWithVehicle(bookingHref, vehicle.slug),
    [bookingHref, vehicle.slug],
  );
  const canCreateHold = Boolean(
    pickupDate?.trim() &&
      returnDate?.trim() &&
      pickupTime?.trim() &&
      returnTime?.trim(),
  );

  const handleClick = async () => {
    setError(null);
    if (!tripDatesCommitted) {
      document
        .getElementById(VEHICLE_TRIP_SEARCH_ANCHOR_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      onTripDatesRequired?.();
      return;
    }
    if (!canCreateHold) {
      router.push(nextUrl);
      return;
    }

    setIsReserving(true);
    const result = await createReservationHoldWithRetry({
      vehicleId: vehicle.id,
      vehicleType: vehicle.apiVehicleType,
      pickupDate: pickupDate!.trim(),
      pickupTime: pickupTime!.trim(),
      returnDate: returnDate!.trim(),
      returnTime: returnTime!.trim(),
    });
    setIsReserving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    window.sessionStorage.setItem(
      RESERVATION_HOLD_STORAGE_KEY,
      JSON.stringify({
        holdReference: result.data.holdReference,
        sessionKey: result.data.sessionKey,
        expiresAt: result.data.expiresAt,
        status: result.data.status,
        vehicleId: vehicle.id,
        vehicleType: vehicle.apiVehicleType,
        pickupDate: pickupDate!.trim(),
        pickupTime: pickupTime!.trim(),
        returnDate: returnDate!.trim(),
        returnTime: returnTime!.trim(),
      }),
    );
    router.push(nextUrl);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => {
          void handleClick();
        }}
        disabled={isReserving}
        className={isReserving && busyClassName ? busyClassName : className}
      >
        {isReserving ? "Reserving..." : "Book now"}
      </button>
      {error ? (
        <span className="max-w-56 text-right text-[11px] font-medium text-rose-700">{error}</span>
      ) : null}
    </div>
  );
}
