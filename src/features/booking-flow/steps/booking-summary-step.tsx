"use client";

import { useMemo } from "react";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import {
  calculateBookingPrice,
  formatEur,
  getCdwLabel,
} from "@/lib/pricing/calculate-booking-price";

export function BookingSummaryStep() {
  const { state, updateSection } = useBookingFlow();
  const pricing = useMemo(
    () =>
      calculateBookingPrice({
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
          pickupOption: state.delivery.pickupOption,
          pickupAddress: state.delivery.pickupAddress,
          dropoffOption: state.delivery.dropoffOption,
          dropoffAddress: state.delivery.dropoffAddress,
        },
        addons: {
          cdwOption: state.addons.cdwPlan,
          additionalDriver: state.addons.additionalDriver,
          storageBox: state.addons.storageBox,
          helmetSize1: state.addons.helmetSize1,
          helmetSize2: state.addons.helmetSize2,
        },
        additionalDriver: {
          enabled: state.addons.additionalDriver,
        },
        deposit: {
          method: state.deposit.depositMethod,
        },
      }),
    [state],
  );

  const addOnList = [
    pricing ? `CDW selected: ${getCdwLabel(pricing.cdwOptionApplied)}` : "CDW selected: -",
    `Additional driver: ${state.addons.additionalDriver ? "yes" : "no"}`,
    `Helmet size 1: ${state.addons.helmetSize1 || "-"}`,
    `Helmet size 2: ${state.addons.helmetSize2 || "-"}`,
    `Storage box: ${state.addons.storageBox ? "yes" : "no"}`,
  ];

  return (
    <StepShell
      title="Review & Confirm"
      description="Final review of booking details, financial summary, and deposit method before confirmation."
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">Section 1 - Booking Summary</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Vehicle selected:{" "}
              {state.rental.vehicleName || state.rental.vehicleId || "-"}
            </li>
            <li>
              Rental dates: {state.rental.pickupDate || "-"} {state.rental.pickupTime || ""} to{" "}
              {state.rental.returnDate || "-"} {state.rental.returnTime || ""}
            </li>
            <li>
              Billable duration: {pricing ? `${pricing.rentalDays} day(s)` : "-"}
              {pricing ? ` (actual ${pricing.actualDurationHours.toFixed(1)}h)` : ""}
            </li>
            <li>Pickup method: {state.delivery.pickupOption}</li>
            <li>Pickup address: {state.delivery.pickupAddress || "-"}</li>
            <li>Drop-off method: {state.delivery.dropoffOption}</li>
            <li>Drop-off address: {state.delivery.dropoffAddress || "-"}</li>
            {addOnList.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">Section 2 - Pricing Summary</p>
          {pricing ? (
            <>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Rental Cost: {formatEur(pricing.rentalCost)}</li>
                <li>
                  Delivery / Drop-off: {formatEur(pricing.deliveryTotal)} (pickup{" "}
                  {formatEur(pricing.deliveryFee)} + drop-off {formatEur(pricing.dropoffFee)}
                  {pricing.deliveryDiscount > 0
                    ? ` - ${formatEur(pricing.deliveryDiscount)} bundle discount`
                    : ""}
                  )
                </li>
                <li>CDW: {formatEur(pricing.cdwCost)}</li>
                <li>Additional Driver: {formatEur(pricing.additionalDriverCost)}</li>
                <li>Storage Box: {formatEur(pricing.storageBoxCost)}</li>
              </ul>
              <p className="mt-3 font-semibold text-slate-900">
                Subtotal: {formatEur(pricing.subtotal)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Pricing preview will appear once vehicle and rental dates/times are valid.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">Section 3 - Deposit & Totals</p>
          <p className="mt-2 font-semibold">
            Security deposit: {formatEur(pricing?.depositAmount ?? 250)}
          </p>

          <div className="mt-3">
            <p className="font-semibold text-slate-900">Deposit method</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <input
                  type="radio"
                  name="summaryDepositMethod"
                  value="online"
                  checked={state.deposit.depositMethod === "online"}
                  onChange={() => updateSection("deposit", { depositMethod: "online" })}
                />
                Pay online now
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <input
                  type="radio"
                  name="summaryDepositMethod"
                  value="in_person"
                  checked={state.deposit.depositMethod === "in_person"}
                  onChange={() => updateSection("deposit", { depositMethod: "in_person" })}
                />
                Pay in person at pickup
              </label>
            </div>
            {pricing ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                <p className="font-semibold text-slate-900">
                  Total Due Online: {formatEur(pricing.totalDueOnline)}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Due at Pickup / Later: {formatEur(pricing.totalDueLater)}
                </p>
              </div>
            ) : null}
            {state.deposit.depositMethod === "in_person" ? (
              <p className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                Deposit will be paid at pickup and is not included in the online total.
              </p>
            ) : null}
            {state.deposit.depositMethod === "online" ? (
              <p className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                Deposit is included in the online payable amount.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={state.consent.summaryReviewed}
          onChange={(event) => updateSection("consent", { summaryReviewed: event.target.checked })}
          className="mt-0.5 h-4 w-4"
        />
        <span>I reviewed the summary above.</span>
      </label>
    </StepShell>
  );
}
