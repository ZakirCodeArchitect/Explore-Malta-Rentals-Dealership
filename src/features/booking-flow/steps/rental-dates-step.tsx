"use client";

import { addDays, differenceInHours, format, parse } from "date-fns";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20";

export function RentalDatesStep() {
  const { state, updateSection } = useBookingFlow();
  const { pickupDate, pickupTime, returnDate, returnTime } = state.rentalDates;
  const today = new Date();
  const pickupMinDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate(),
  ).padStart(2, "0")}`;
  const parsedPickupDate = pickupDate ? parse(pickupDate, "yyyy-MM-dd", new Date()) : null;
  const pickupBaseDate =
    parsedPickupDate && !Number.isNaN(parsedPickupDate.getTime()) ? parsedPickupDate : today;
  const returnMinDate = format(addDays(pickupBaseDate, 1), "yyyy-MM-dd");
  const returnMaxDate = format(addDays(pickupBaseDate, 28), "yyyy-MM-dd");
  const pickup = pickupDate && pickupTime
    ? parse(`${pickupDate} ${pickupTime}`, "yyyy-MM-dd HH:mm", new Date())
    : null;
  const dropoff = returnDate && returnTime
    ? parse(`${returnDate} ${returnTime}`, "yyyy-MM-dd HH:mm", new Date())
    : null;
  const rentalHours =
    pickup && dropoff && !Number.isNaN(pickup.getTime()) && !Number.isNaN(dropoff.getTime())
      ? Math.max(0, differenceInHours(dropoff, pickup))
      : 0;
  const rentalDays = Math.max(0, Math.ceil(rentalHours / 24));
  const hasDateTimeRange = Boolean(pickup && dropoff);

  return (
    <StepShell
      title="Rental Dates"
      description="Set pickup/return date and time with an auto-calculated duration preview."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <p className="sm:col-span-2 text-sm font-semibold text-slate-900">Section: Rental Dates</p>
        <label className="text-sm font-medium text-slate-700">
          Pickup date
          <input
            type="date"
            value={pickupDate}
            min={pickupMinDate}
            onChange={(event) => updateSection("rentalDates", { pickupDate: event.target.value })}
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Return date
          <input
            type="date"
            value={returnDate}
            min={returnMinDate}
            max={returnMaxDate}
            onChange={(event) => updateSection("rentalDates", { returnDate: event.target.value })}
            className={inputClass}
          />
        </label>

        <p className="sm:col-span-2 text-sm font-semibold text-slate-900">Section: Rental Time</p>
        <label className="text-sm font-medium text-slate-700">
          Pickup time
          <input
            type="time"
            value={pickupTime}
            onChange={(event) => updateSection("rentalDates", { pickupTime: event.target.value })}
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700">
          Return time
          <input
            type="time"
            value={returnTime}
            onChange={(event) => updateSection("rentalDates", { returnTime: event.target.value })}
            className={inputClass}
          />
        </label>

        <p className="sm:col-span-2 text-sm font-semibold text-slate-900">
          Section: Rental Duration (Display)
        </p>
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700">
        Auto-calculated duration:{" "}
        <span className="font-semibold text-slate-900">
          {rentalHours > 0
            ? `${rentalDays} day(s) (${rentalHours}h)`
            : hasDateTimeRange
              ? "Return date/time must be after pickup"
              : "Waiting for valid dates"}
        </span>
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Notes: </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Minimum rental is 24 hours.</li>
          <li>If less than 24 hours, a full day is charged.</li>
          <li>Maximum rental is 4 weeks.</li>
          <li>Renewable option is available.</li>
        </ul>
      </div>
    </StepShell>
  );
}
