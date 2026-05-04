"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { BookingControlState } from "@/lib/booking-control-constants";

const BookingControlContext = createContext<BookingControlState | null>(null);

type BookingControlProviderProps = Readonly<{
  children: ReactNode;
  /** From `getBookingControl()` on the server for first paint; must match the public API. */
  initialValue: BookingControlState;
}>;

export function BookingControlProvider({ children, initialValue }: BookingControlProviderProps) {
  const value = useMemo<BookingControlState>(
    () => ({ enabled: initialValue.enabled, disabledMessage: initialValue.disabledMessage }),
    [initialValue.enabled, initialValue.disabledMessage],
  );
  return <BookingControlContext.Provider value={value}>{children}</BookingControlContext.Provider>;
}

export function useBookingControl(): BookingControlState {
  const ctx = useContext(BookingControlContext);
  if (!ctx) {
    throw new Error("useBookingControl must be used within BookingControlProvider");
  }
  return ctx;
}
