"use client";

import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import {
  calculateBookingPrice,
  formatEur,
} from "@/lib/pricing/calculate-booking-price";

export function PricingStep() {
  const { state, updateSection } = useBookingFlow();
  const pricing = calculateBookingPrice({
    rental: {
      vehicle: {
        id: state.rental.vehicleId,
        slug: state.rental.vehicleSlug,
        name: state.rental.vehicleName,
        type: state.rental.vehicleType,
      },
      pickupDate: state.rental.pickupDate,
      returnDate: state.rental.returnDate,
      pickupTime: state.rental.pickupTime,
      returnTime: state.rental.returnTime,
    },
    delivery: {
      pickupOption: "office",
      dropoffOption: "office",
    },
    addons: {
      additionalDriver: false,
      storageBox: false,
      cdwOption: "no_cdw",
    },
    additionalDriver: {
      enabled: false,
    },
    deposit: {
      method: "",
    },
  });

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
              <li>Duration: {pricing.rentalDays} day(s) billed</li>
              <li>Actual duration: {pricing.actualDurationHours.toFixed(1)} hours</li>
              <li>
                Sunday override days (bicycle/ATV): {pricing.sundayDaysCharged}
              </li>
              <li>Estimated rental total: {formatEur(pricing.rentalCost)}</li>
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
