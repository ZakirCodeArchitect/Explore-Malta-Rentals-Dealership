"use client";

import { useEffect, useState } from "react";
import type { Vehicle } from "@/features/vehicles/data/vehicles";
import { readReservationHoldSessionKeyFromStorage } from "@/features/booking-flow/lib/reservation-hold-storage";
import {
  fetchVehicleBySlug,
  fetchVehicles,
  type FetchVehiclesRentalWindow,
} from "@/features/vehicles/lib/vehicles-api";

// ---------------------------------------------------------------------------
// Retry helper — transparent back-off for Neon serverless cold-starts.
// Neon can take 2–8 s to wake from sleep; the first request often fails while
// subsequent ones succeed immediately. We retry up to MAX_RETRIES times with
// an exponential delay so the user never sees a flash of the error banner.
// ---------------------------------------------------------------------------
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 1_500; // 1.5 s → 3 s

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
  fn: () => Promise<T>,
  signal: AbortSignal,
  retries = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      return await fn();
    } catch (err) {
      if (signal.aborted) throw err; // propagate abort immediately
      lastError = err;
      if (attempt < retries) {
        await sleep(RETRY_BASE_MS * Math.pow(2, attempt));
      }
    }
  }
  throw lastError;
}

type UseVehiclesResult = {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
};

type UseVehicleResult = {
  vehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
};

type UseVehiclesOptions = {
  enabled?: boolean;
  /** When all four strings are set, listing includes hold-aware `rentalWindowStatus`. */
  rentalWindow?: FetchVehiclesRentalWindow | null;
};

export function useVehicles(options: UseVehiclesOptions = {}): UseVehiclesResult {
  const { enabled = true, rentalWindow = null } = options;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const controller = new AbortController();
    const loadVehicles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const windowPayload =
          rentalWindow &&
          rentalWindow.pickupDate.trim() &&
          rentalWindow.pickupTime.trim() &&
          rentalWindow.returnDate.trim() &&
          rentalWindow.returnTime.trim()
            ? ({
                pickupDate: rentalWindow.pickupDate.trim(),
                pickupTime: rentalWindow.pickupTime.trim(),
                returnDate: rentalWindow.returnDate.trim(),
                returnTime: rentalWindow.returnTime.trim(),
                sessionKey:
                  rentalWindow.sessionKey?.trim() || readReservationHoldSessionKeyFromStorage(),
              } satisfies FetchVehiclesRentalWindow)
            : null;

        const data = await withRetry(
          () => fetchVehicles(controller.signal, windowPayload),
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setVehicles(data);
        }
      } catch (caught) {
        if (controller.signal.aborted) return;
        if (process.env.NODE_ENV !== "production") {
          console.error("[useVehicles] Failed to fetch vehicles", caught);
        }
        setError("Unable to load vehicles right now. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    // Attach a no-op rejection handler so that the AbortError emitted when the
    // effect cleanup fires does not surface as an unhandled promise rejection in
    // React StrictMode / during fast navigation.
    // Guard covers both DOMException("AbortError") and the plain Error("signal is
    // aborted without reason") thrown by newer fetch/Node implementations.
    loadVehicles().catch((e: unknown) => {
      const isAbort =
        (e instanceof DOMException && e.name === "AbortError") ||
        (e instanceof Error && e.name === "AbortError");
      if (isAbort) return;
      if (process.env.NODE_ENV !== "production") {
        console.error("[useVehicles] Unhandled error outside async body", e);
      }
    });

    return () => controller.abort();
  }, [enabled, rentalWindow]);

  if (!enabled) {
    return { vehicles: [], isLoading: false, error: null };
  }

  return { vehicles, isLoading, error };
}

export function useVehicle(slug: string): UseVehicleResult {
  const normalizedSlug = slug.trim();
  const shouldFetch = normalizedSlug.length > 0;
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldFetch) {
      return;
    }

    const controller = new AbortController();
    const loadVehicle = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await withRetry(
          () => fetchVehicleBySlug(normalizedSlug, controller.signal),
          controller.signal,
        );
        if (!controller.signal.aborted) {
          setVehicle(data);
        }
      } catch (caught) {
        if (controller.signal.aborted) return;
        if (process.env.NODE_ENV !== "production") {
          console.error("[useVehicle] Failed to fetch vehicle", { slug: normalizedSlug, error: caught });
        }
        setError("Unable to load this vehicle right now. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    loadVehicle().catch((e: unknown) => {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (process.env.NODE_ENV !== "production") {
        console.error("[useVehicle] Unhandled error outside async body", e);
      }
    });

    return () => controller.abort();
  }, [normalizedSlug, shouldFetch]);

  if (!shouldFetch) {
    return { vehicle: null, isLoading: false, error: "Vehicle not found." };
  }

  return { vehicle, isLoading, error };
}
