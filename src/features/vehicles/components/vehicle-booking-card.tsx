"use client";

import { useMemo, useState } from "react";
import type { Vehicle } from "@/features/vehicles/data/vehicles";

type VehicleBookingCardProps = Readonly<{
  vehicle: Vehicle;
}>;

function getDays(start: string, end: string) {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf()) || endDate <= startDate) return 0;
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

export function VehicleBookingCard({ vehicle }: VehicleBookingCardProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const rentalDays = getDays(startDate, endDate);

  const addOnTotalPerDay = useMemo(
    () =>
      vehicle.addOns
        .filter((addOn) => selectedAddOns.includes(addOn.id))
        .reduce((sum, addOn) => sum + addOn.pricePerDay, 0),
    [selectedAddOns, vehicle.addOns],
  );

  const estimatedTotal =
    rentalDays > 0 ? rentalDays * vehicle.pricePerDay + rentalDays * addOnTotalPerDay : vehicle.pricePerDay;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_52px_-35px_rgba(15,23,42,0.35)] lg:sticky lg:top-24">
      <p className="text-sm text-slate-600">Price</p>
      <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
        EUR {vehicle.pricePerDay}
        <span className="ml-1 text-base font-medium text-slate-500">/ day</span>
      </p>

      <form className="mt-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <label className="text-sm font-medium text-slate-700">
            Pickup date
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/40"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Return date
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/40"
            />
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-semibold text-slate-900">Optional add-ons</legend>
          <div className="mt-2 space-y-2">
            {vehicle.addOns.map((addOn) => {
              const checked = selectedAddOns.includes(addOn.id);
              return (
                <label
                  key={addOn.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        setSelectedAddOns((previous) =>
                          event.target.checked
                            ? [...previous, addOn.id]
                            : previous.filter((value) => value !== addOn.id),
                        );
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-[var(--brand-blue)] focus:ring-[var(--brand-blue)]"
                    />
                    {addOn.name}
                  </span>
                  <span className="font-semibold text-slate-700">+EUR {addOn.pricePerDay}/day</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="rounded-xl bg-slate-50 p-3 text-sm">
          <p className="flex items-center justify-between text-slate-600">
            <span>Estimated days</span>
            <span className="font-semibold text-slate-900">{rentalDays || 1}</span>
          </p>
          <p className="mt-1 flex items-center justify-between text-slate-600">
            <span>Estimated total</span>
            <span className="text-base font-semibold text-slate-900">EUR {estimatedTotal}</span>
          </p>
        </div>

        <button
          type="button"
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--brand-orange)] px-5 py-3 text-sm font-semibold text-slate-950 transition-colors duration-300 hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2"
        >
          Reserve now
        </button>
        <p className="text-center text-xs text-slate-500">No payment needed to request availability.</p>
      </form>
    </aside>
  );
}
