"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BookingSearchForm } from "./booking-search-form";
import { VEHICLE_TYPES } from "@/features/vehicles/data/vehicles";

/**
 * Thin wrapper around BookingSearchForm that reads current URL search params and
 * pre-fills the form fields.  Used on the /vehicles listing page so the search
 * card always reflects what is already in the URL (e.g. after navigating from the
 * homepage, or after a previous search).
 *
 * Must be rendered inside a <Suspense> boundary because it calls useSearchParams().
 */
export function BookingSearchFormFromUrl() {
  const searchParams = useSearchParams();

  const initialValues = useMemo(() => {
    const pickupDate =
      searchParams.get("pickupDate") ?? searchParams.get("date") ?? undefined;
    const dropoffDate =
      searchParams.get("returnDate") ??
      searchParams.get("dropoffDate") ??
      undefined;
    const pickupTime = searchParams.get("pickupTime") ?? undefined;
    const dropoffTime =
      searchParams.get("dropoffTime") ?? searchParams.get("returnTime") ?? undefined;

    const rawType = searchParams.get("type") ?? "";
    const vehicleType =
      (VEHICLE_TYPES as readonly string[]).includes(rawType) ? rawType : "all";

    return { pickupDate, dropoffDate, pickupTime, dropoffTime, vehicleType };
  }, [searchParams]);

  return <BookingSearchForm initialValues={initialValues} />;
}
