"use client";

import Image from "next/image";
import Link from "next/link";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { getVehicleBySlug } from "@/features/vehicles/data/vehicles";

export function SelectVehicleStep() {
  const { state } = useBookingFlow();
  const hasSelectedVehicle = Boolean(state.vehicle.selectedVehicleId);
  const selectedVehicle = state.vehicle.selectedVehicleSlug
    ? getVehicleBySlug(state.vehicle.selectedVehicleSlug)
    : null;

  return (
    <StepShell
      title="Select Vehicle"
      description="Vehicle should come from the Book now action on a specific vehicle."
    >
      {hasSelectedVehicle ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
            Vehicle preselected
          </p>
          <div className="mt-3 flex flex-col gap-3 rounded-md border border-emerald-200/70 bg-white/80 p-3 sm:flex-row">
            {selectedVehicle ? (
              <div className="relative h-28 w-full overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-36 sm:shrink-0">
                <Image
                  src={selectedVehicle.images[0]}
                  alt={selectedVehicle.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 144px"
                />
              </div>
            ) : null}
            <div className="min-w-0">
              <p className="text-base font-semibold text-slate-900">
                {state.vehicle.selectedVehicleName}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Category: {state.vehicle.selectedVehicleType}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-700">
                {selectedVehicle ? (
                  <>
                    <span className="rounded-md bg-slate-100 px-2 py-1">
                      {selectedVehicle.transmission}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1">
                      EUR {selectedVehicle.pricePerDay}/day
                    </span>
                    {selectedVehicle.securityDepositEUR ? (
                      <span className="rounded-md bg-slate-100 px-2 py-1">
                        Deposit EUR {selectedVehicle.securityDepositEUR}
                      </span>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 p-4">
          <p className="text-sm font-semibold text-amber-900">
            No vehicle selected yet.
          </p>
          <p className="mt-1 text-sm text-amber-800">
            Please choose a specific vehicle first, then click Book now.
          </p>
          <Link
            href="/vehicles"
            className="mt-3 inline-flex rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100"
          >
            Browse vehicles
          </Link>
        </div>
      )}
    </StepShell>
  );
}
