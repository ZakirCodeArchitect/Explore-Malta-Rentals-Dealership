"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import type { Vehicle } from "@/features/vehicles/data/vehicles";
import { createReservationHoldWithRetry } from "@/features/booking-flow/lib/reservation-hold-api";
import { RESERVATION_HOLD_STORAGE_KEY } from "@/features/booking-flow/lib/reservation-hold-storage";
import { BookingDisabledCtaContent } from "@/components/booking/booking-disabled-cta-content";
import { useBookingControl } from "@/components/booking/booking-control-provider";
import { warnBookingActionBlocked } from "@/lib/booking-control-constants";

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
  /**
   * When set, holding dates is permitted.
   * If false with tripDatesCommitted=true, the button navigates instead of holding.
   */
  allowHold?: boolean;
  /** When set (and allowHold is false), button shows this message instead of the error. */
  holdBlockedMessage?: string | null;
  /**
   * Use next to other actions (e.g. “View details”) so the wrapper does not stretch full width.
   * Default keeps a full-width column for sidebar-style CTAs.
   */
  inlineWithSiblingActions?: boolean;
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
  allowHold,
  holdBlockedMessage,
  inlineWithSiblingActions = false,
}: BookNowButtonProps) {
  const { enabled: bookingEnabled, disabledMessage } = useBookingControl();
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
    if (!bookingEnabled) {
      warnBookingActionBlocked("BookNowButton.handleClick");
      return;
    }

    setError(null);
    if (!tripDatesCommitted) {
      document
        .getElementById(VEHICLE_TRIP_SEARCH_ANCHOR_ID)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      onTripDatesRequired?.();
      return;
    }
    // If availability was checked and vehicle is not available, block the hold.
    if (allowHold === false && holdBlockedMessage) {
      setError(holdBlockedMessage);
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

  const disabledClasses = "cursor-not-allowed opacity-75";

  const shellClassName = inlineWithSiblingActions
    ? "inline-flex flex-col items-end gap-2"
    : "flex w-full max-w-xs flex-col items-stretch gap-2 sm:max-w-none sm:items-end";

  if (!bookingEnabled) {
    return (
      <div className={shellClassName}>
        <button
          type="button"
          disabled
          aria-disabled
          className={[className, disabledClasses].filter(Boolean).join(" ")}
        >
          <BookingDisabledCtaContent message={disabledMessage} />
        </button>
        {error ? (
          <span className="max-w-56 text-right text-[11px] font-medium text-rose-700">{error}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={shellClassName}>
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
