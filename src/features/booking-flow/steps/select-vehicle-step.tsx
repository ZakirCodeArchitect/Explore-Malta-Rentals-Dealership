"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { formatVehicleTypeLabel } from "@/features/vehicles/data/vehicles";
import { useVehicles } from "@/features/vehicles/lib/use-vehicles";

export function SelectVehicleStep() {
  const { state, reservationHold, updateSection, getFieldError } = useBookingFlow();
  const { vehicles, isLoading, error } = useVehicles();
  const vehicleError = getFieldError("rental.vehicleType");

  const selectedVehicle = useMemo(() => {
    if (!state.rental.vehicleId) {
      return null;
    }
    return vehicles.find((vehicle) => vehicle.id === state.rental.vehicleId) ?? null;
  }, [state.rental.vehicleId, vehicles]);

  const selectedVehicleImageSrc = selectedVehicle
    ? (selectedVehicle.mainImageUrl ?? selectedVehicle.images[0] ?? null)
    : null;
  const selectedVehicleBrandModel = selectedVehicle
    ? [selectedVehicle.brand, selectedVehicle.model].filter(Boolean).join(" ")
    : "";

  const holdIsOnSelectedVehicle =
    reservationHold.status === "ACTIVE" &&
    reservationHold.holdReference !== null &&
    reservationHold.vehicleId !== null &&
    reservationHold.vehicleId === state.rental.vehicleId;

  const incomingSlug = state.rental.vehicleSlug?.trim() ?? "";

  useEffect(() => {
    if (!state.rental.vehicleSlug || state.rental.vehicleId || vehicles.length === 0) {
      return;
    }
    const preselectedBySlug = vehicles.find((vehicle) => vehicle.slug === state.rental.vehicleSlug);
    if (!preselectedBySlug) {
      return;
    }
    updateSection("rental", {
      vehicleId: preselectedBySlug.id,
      vehicleSlug: preselectedBySlug.slug,
      vehicleName: preselectedBySlug.name,
      vehicleType: preselectedBySlug.apiVehicleType,
    });
  }, [state.rental.vehicleSlug, state.rental.vehicleId, updateSection, vehicles]);

  const slugNotFound =
    !isLoading &&
    !error &&
    vehicles.length > 0 &&
    Boolean(incomingSlug) &&
    !state.rental.vehicleId &&
    !vehicles.some((v) => v.slug === state.rental.vehicleSlug);

  const staleVehicleId =
    !isLoading &&
    !error &&
    vehicles.length > 0 &&
    Boolean(state.rental.vehicleId) &&
    !selectedVehicle;

  const needsVehicleFromFleet =
    !isLoading && !error && vehicles.length > 0 && !incomingSlug && !state.rental.vehicleId;

  return (
    <StepShell
      title="Your vehicle"
      description="This is the model you chose from the fleet. To change it, go back and pick another vehicle."
    >
      {isLoading ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="h-48 animate-pulse bg-slate-200/70 sm:h-56" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200/70" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200/60" />
            <div className="h-3 w-11/12 animate-pulse rounded bg-slate-200/60" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-4">
          <p className="text-sm font-semibold text-rose-900">Could not load vehicles</p>
          <p className="mt-1 text-sm text-rose-800">{error}</p>
          <Link
            href="/vehicles"
            className="mt-3 inline-flex rounded-full border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-900 hover:bg-rose-100"
          >
            Browse vehicles
          </Link>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">No vehicles available right now</p>
          <p className="mt-1 text-sm text-slate-700">Please try again shortly or contact support for assistance.</p>
        </div>
      ) : needsVehicleFromFleet ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm font-semibold text-slate-900">No vehicle chosen yet</p>
          <p className="mt-1 text-sm text-slate-700">
            Start from the fleet page and use Book now on a vehicle to continue this booking with that model.
          </p>
          <Link
            href="/vehicles"
            className="mt-4 inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
          >
            Browse vehicles
          </Link>
        </div>
      ) : slugNotFound || staleVehicleId ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm font-semibold text-amber-900">
            {slugNotFound ? "That vehicle is not available in the current list." : "We could not match your booking to a live vehicle."}
          </p>
          <p className="mt-1 text-sm text-amber-800">Choose another model from the fleet to continue.</p>
          <Link
            href="/vehicles"
            className="mt-4 inline-flex rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-950 hover:bg-amber-100"
          >
            Browse vehicles
          </Link>
        </div>
      ) : selectedVehicle ? (
        <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="relative h-48 bg-slate-100 sm:h-56">
            {selectedVehicleImageSrc ? (
              <Image
                src={selectedVehicleImageSrc}
                alt={selectedVehicle.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 42rem"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
                Image coming soon
              </div>
            )}
          </div>
          <div className="space-y-2 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Your selection</p>
            <h3 className="text-lg font-semibold text-slate-900">{selectedVehicle.name}</h3>
            {selectedVehicleBrandModel ? (
              <p className="text-sm text-slate-600">{selectedVehicleBrandModel}</p>
            ) : null}
            <p className="text-sm text-slate-600">
              {selectedVehicle.shortDescription ?? "No short description available yet."}
            </p>
            <p className="text-xs text-slate-700">
              {formatVehicleTypeLabel(selectedVehicle.apiVehicleType)}
              {" · "}
              {selectedVehicle.helmetIncludedCount} helmet{selectedVehicle.helmetIncludedCount === 1 ? "" : "s"}{" "}
              included
              {" · "}
              {selectedVehicle.supportsStorageBox ? "Storage box supported" : "No storage box"}
            </p>
            {holdIsOnSelectedVehicle ? (
              <p className="pt-1 text-xs font-semibold text-emerald-800">Reserved for you temporarily.</p>
            ) : null}
          </div>
        </article>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="h-48 animate-pulse bg-slate-200/70 sm:h-56" />
          <div className="space-y-2 p-4">
            <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200/70" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-200/60" />
          </div>
        </div>
      )}

      {vehicleError ? <p className="mt-3 text-sm text-red-600">{vehicleError}</p> : null}
    </StepShell>
  );
}
