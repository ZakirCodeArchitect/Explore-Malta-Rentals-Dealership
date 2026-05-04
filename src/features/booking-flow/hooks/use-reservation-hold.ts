"use client";

import { useCallback } from "react";
import type { BookingFlowState, ReservationHoldState } from "@/features/booking-flow/lib/types";
import { createReservationHoldWithRetry, releaseReservationHold } from "@/features/booking-flow/lib/reservation-hold-api";
import {
  BOOKING_DISABLED_USER_HINT,
  ONLINE_BOOKING_DISABLED,
  warnBookingActionBlocked,
} from "@/lib/booking-availability";

type UseReservationHoldInput = {
  bookingState: BookingFlowState;
  reservationHold: ReservationHoldState;
  setHold: (next: Partial<ReservationHoldState>) => void;
  clearHold: () => void;
  setError: (message: string | null) => void;
};

type HoldActionResult = {
  ok: boolean;
  message?: string;
};

function holdMatchesRental(hold: ReservationHoldState, booking: BookingFlowState["rental"]): boolean {
  return (
    hold.holdReference !== null &&
    hold.vehicleId === booking.vehicleId &&
    hold.vehicleType === booking.vehicleType &&
    hold.pickupDate === booking.pickupDate &&
    hold.pickupTime === booking.pickupTime &&
    hold.returnDate === booking.returnDate &&
    hold.returnTime === booking.returnTime
  );
}

export function useReservationHold({
  bookingState,
  reservationHold,
  setHold,
  clearHold,
  setError,
}: UseReservationHoldInput) {
  const createOrRefreshHold = useCallback(async (): Promise<HoldActionResult> => {
    if (ONLINE_BOOKING_DISABLED) {
      warnBookingActionBlocked("useReservationHold.createOrRefreshHold");
      return { ok: false, message: BOOKING_DISABLED_USER_HINT };
    }

    const { rental, customer } = bookingState;
    if (!rental.vehicleId) {
      return {
        ok: false,
        message: "Please select a specific vehicle before continuing.",
      };
    }

    const existingActive =
      reservationHold.holdReference &&
      reservationHold.status === "ACTIVE" &&
      reservationHold.expiresAt &&
      new Date(reservationHold.expiresAt).getTime() > Date.now();
    if (existingActive && holdMatchesRental(reservationHold, rental)) {
      setError(null);
      return { ok: true };
    }

    if (reservationHold.holdReference && reservationHold.status === "ACTIVE") {
      await releaseReservationHold(reservationHold.holdReference);
      clearHold();
    }

    const result = await createReservationHoldWithRetry({
      vehicleId: rental.vehicleId,
      vehicleType: rental.vehicleType,
      pickupDate: rental.pickupDate,
      pickupTime: rental.pickupTime,
      returnDate: rental.returnDate,
      returnTime: rental.returnTime,
      sessionKey: reservationHold.sessionKey ?? undefined,
      customerEmail: customer.email.trim() || undefined,
      customerName: customer.fullName.trim() || undefined,
    });

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
      };
    }

    setHold({
      holdReference: result.data.holdReference,
      sessionKey: result.data.sessionKey,
      expiresAt: result.data.expiresAt,
      status: result.data.status,
      vehicleId: rental.vehicleId,
      vehicleType: rental.vehicleType,
      pickupDate: rental.pickupDate,
      pickupTime: rental.pickupTime,
      returnDate: rental.returnDate,
      returnTime: rental.returnTime,
    });
    setError(null);
    return { ok: true };
  }, [bookingState, clearHold, reservationHold, setError, setHold]);

  const releaseActiveHold = useCallback(async (): Promise<void> => {
    if (!reservationHold.holdReference) {
      clearHold();
      return;
    }
    if (ONLINE_BOOKING_DISABLED) {
      warnBookingActionBlocked("useReservationHold.releaseActiveHold");
      clearHold();
      return;
    }
    await releaseReservationHold(reservationHold.holdReference);
    clearHold();
  }, [clearHold, reservationHold.holdReference]);

  return {
    createOrRefreshHold,
    releaseActiveHold,
    holdMatchesCurrentRental: holdMatchesRental(reservationHold, bookingState.rental),
  };
}
