"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { formatVehicleTypeLabel, type ApiVehicleType } from "@/features/vehicles/data/vehicles";
import { useVehicles } from "@/features/vehicles/lib/use-vehicles";

export function SelectVehicleStep() {
  const { state, updateSection, getFieldError } = useBookingFlow();
  const { vehicles, isLoading, error } = useVehicles();
  const vehicleError = getFieldError("rental.vehicleType");

  const availableTypes = useMemo(
    () => Array.from(new Set(vehicles.map((vehicle) => vehicle.apiVehicleType))),
    [vehicles],
  );

  const selectedVehicle = useMemo(() => {
    if (!state.rental.vehicleId) {
      return null;
    }
    return vehicles.find((vehicle) => vehicle.id === state.rental.vehicleId) ?? null;
  }, [state.rental.vehicleId, vehicles]);

  const selectedType = state.rental.vehicleType as ApiVehicleType | "";
  const selectedTypeVehicles = useMemo(
    () =>
      selectedType
        ? vehicles.filter((vehicle) => vehicle.apiVehicleType === selectedType)
        : vehicles,
    [selectedType, vehicles],
  );

  useEffect(() => {
    if (!state.rental.vehicleType && availableTypes.length > 0) {
      updateSection("rental", {
        vehicleType: availableTypes[0],
      });
    }
  }, [availableTypes, state.rental.vehicleType, updateSection]);

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

  const selectSpecificVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find((item) => item.id === vehicleId);
    if (!vehicle) {
      return;
    }
    updateSection("rental", {
      vehicleId: vehicle.id,
      vehicleSlug: vehicle.slug,
      vehicleName: vehicle.name,
      vehicleType: vehicle.apiVehicleType,
    });
  };

  const selectVehicleTypeOnly = (vehicleType: ApiVehicleType) => {
    updateSection("rental", {
      vehicleType,
      vehicleId: null,
      vehicleSlug: "",
      vehicleName: "",
    });
  };

  return (
    <StepShell
      title="Select Vehicle"
      description="Choose a vehicle category, then optionally lock a specific vehicle from live inventory."
    >
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`vehicle-loading-${index}`} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="h-24 animate-pulse rounded-md bg-slate-200/70" />
              <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-slate-200/70" />
              <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-200/60" />
            </div>
          ))}
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
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Vehicle category</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => selectVehicleTypeOnly(type)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                    selectedType === type
                      ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/15 text-slate-900"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  {formatVehicleTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <button
              type="button"
              onClick={() => {
                if (!selectedType) return;
                selectVehicleTypeOnly(selectedType);
              }}
              className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                state.rental.vehicleId === null
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              Book by category only (assign best available vehicle)
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {selectedTypeVehicles.map((vehicle) => {
              const isSelected = state.rental.vehicleId === vehicle.id;
              const imageSrc = vehicle.mainImageUrl ?? vehicle.images[0] ?? null;
              const brandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");

              return (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => selectSpecificVehicle(vehicle.id)}
                  className={`overflow-hidden rounded-lg border text-left transition-colors ${
                    isSelected
                      ? "border-emerald-300 bg-emerald-50/60"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="relative h-36 overflow-hidden bg-slate-100">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={vehicle.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
                        Image coming soon
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="text-sm font-semibold text-slate-900">{vehicle.name}</p>
                    {brandModel ? <p className="text-xs text-slate-600">{brandModel}</p> : null}
                    <p className="text-xs text-slate-600">
                      {vehicle.shortDescription ?? "No short description available yet."}
                    </p>
                    <div className="pt-1 text-xs text-slate-700">
                      {vehicle.helmetIncludedCount} helmet{vehicle.helmetIncludedCount === 1 ? "" : "s"} included
                      {" · "}
                      {vehicle.supportsStorageBox ? "Storage box supported" : "No storage box"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedVehicle ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Selected vehicle</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{selectedVehicle.name}</p>
              <p className="text-xs text-slate-700">{formatVehicleTypeLabel(selectedVehicle.apiVehicleType)}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
              <p className="text-sm font-semibold text-amber-900">
                No exact vehicle selected. Booking will use your chosen category.
              </p>
              {selectedType ? (
                <p className="mt-1 text-sm text-amber-800">Selected category: {formatVehicleTypeLabel(selectedType)}</p>
              ) : null}
            </div>
          )}
        </div>
      )}

      {vehicleError ? <p className="mt-3 text-sm text-red-600">{vehicleError}</p> : null}
    </StepShell>
  );
}
