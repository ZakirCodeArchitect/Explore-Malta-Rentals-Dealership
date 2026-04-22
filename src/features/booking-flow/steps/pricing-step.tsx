"use client";

import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { getBookingPricingBreakdown } from "@/features/booking-flow/lib/pricing";
import { getVehicleBySlug } from "@/features/vehicles/data/vehicles";

export function PricingStep() {
  const { state, updateSection } = useBookingFlow();
  const selectedVehicle = state.rental.vehicleSlug
    ? getVehicleBySlug(state.rental.vehicleSlug)
    : null;
  const pricing = selectedVehicle
    ? getBookingPricingBreakdown(
        selectedVehicle.type,
        state.rental.pickupDate,
        state.rental.pickupTime,
        state.rental.returnDate,
        state.rental.returnTime,
      )
    : null;

  return (
    <StepShell
      title="Pricing"
      description="Section: Pricing Preview"
    >
      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700">
        <p>
          Vehicle: {state.rental.vehicleName || "Not selected yet"}
          {state.rental.vehicleType ? ` (${state.rental.vehicleType})` : ""}
        </p>
        {pricing ? (
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Pricing Summary</p>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>Category: {pricing.categoryLabel}</li>
              <li>Duration: {pricing.billableDays} day(s) billed</li>
              <li>Base rate: EUR {pricing.baseDailyRateEur}/day</li>
              <li>
                Duration discount: EUR {pricing.discountPerDayEur}/day off (from EUR{" "}
                {pricing.standardDailyRateEur}/day), estimated savings EUR{" "}
                {pricing.estimatedDurationSavingsEur}
              </li>
              {pricing.sundayRateEur ? (
                <li>
                  Sunday override: {pricing.sundayDays} Sunday day(s) at EUR {pricing.sundayRateEur}/day
                </li>
              ) : null}
              <li>Estimated rental total: EUR {pricing.totalEur}</li>
            </ul>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Select a vehicle and valid pickup/return date-time to see the pricing summary.
          </p>
        )}
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            name="rental.pricingAcknowledged"
            data-field="rental.pricingAcknowledged"
            checked={state.rental.pricingAcknowledged}
            onChange={(event) =>
              updateSection("rental", { pricingAcknowledged: event.target.checked })
            }
            className="mt-0.5 h-4 w-4"
          />
          <span>
            I reviewed this estimated pricing summary and final cost will be decided at the end
            based on others options selected.
          </span>
        </label>
      </div>
    </StepShell>
  );
}
