"use client";

import { differenceInCalendarDays, parse } from "date-fns";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import {
  getIndicativeMotorcycleScooterTripTotalEur,
} from "@/features/booking/lib/indicative-motorcycle-scooter-rates";
import { SECURITY_DEPOSIT_EUR } from "@/features/booking/lib/booking-schema";
import { pricingService } from "@/lib/pricing/service";

export function BookingSummaryStep() {
  const { state, updateSection } = useBookingFlow();
  const rentalDays = Math.max(
    0,
    differenceInCalendarDays(
      parse(state.rentalDates.returnDate || "1970-01-01", "yyyy-MM-dd", new Date()),
      parse(state.rentalDates.pickupDate || "1970-01-01", "yyyy-MM-dd", new Date()),
    ),
  );
  const rentalSubtotal = getIndicativeMotorcycleScooterTripTotalEur(rentalDays);
  const offSiteQuote = pricingService.quoteOffSiteService({
    pickupOffSite: state.pickupDropoff.pickupType === "delivery",
    dropoffOffSite: state.pickupDropoff.dropoffType === "delivery",
  });
  const deliveryTotal = offSiteQuote.totalEur;
  const cdwCost =
    state.addons.cdwPlan === "scooter_50" || state.addons.cdwPlan === "scooter_125"
      ? 3
      : state.addons.cdwPlan === "scooter_full"
        ? 8
        : state.addons.cdwPlan === "atv_full"
          ? 15
          : 0;
  const additionalDriverCost = state.addons.additionalDriver ? 5 : 0;
  const equipmentCost = state.addons.storageBox ? 10 : 0;
  const addOnsTotal = cdwCost + additionalDriverCost + equipmentCost;
  const subtotal = rentalSubtotal + deliveryTotal + addOnsTotal;
  const addOnList = [
    state.addons.cdw ? `CDW plan: ${state.addons.cdwPlan}` : "CDW: none",
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
              {state.vehicle.selectedVehicleName || state.vehicle.selectedVehicleId || "-"}
            </li>
            <li>
              Rental dates: {state.rentalDates.pickupDate || "-"} {state.rentalDates.pickupTime || ""} to{" "}
              {state.rentalDates.returnDate || "-"} {state.rentalDates.returnTime || ""}
            </li>
            <li>Rental duration: {rentalDays} day(s)</li>
            <li>Pickup method: {state.pickupDropoff.pickupType}</li>
            <li>Pickup address: {state.pickupDropoff.pickupAddress || "-"}</li>
            <li>Drop-off method: {state.pickupDropoff.dropoffType}</li>
            <li>Drop-off address: {state.pickupDropoff.dropoffAddress || "-"}</li>
            {addOnList.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">Section 2 - Pricing Summary</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Rental cost: EUR {rentalSubtotal}</li>
            <li>
              Delivery / drop-off charges: EUR {deliveryTotal}
              {offSiteQuote.hasBundleDiscount ? ` (includes EUR ${offSiteQuote.discountEur} bundle discount)` : ""}
            </li>
            <li>CDW cost: EUR {cdwCost}</li>
            <li>Additional driver cost: EUR {additionalDriverCost}</li>
            <li>Equipment cost: EUR {equipmentCost}</li>
          </ul>
          <p className="mt-3 font-semibold text-slate-900">Subtotal (rental + add-ons): EUR {subtotal}</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">
            Section 3 - Security Deposit (separate block)
          </p>
          <p className="mt-2 font-semibold">Security deposit: EUR {SECURITY_DEPOSIT_EUR}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>A refundable security deposit of EUR {SECURITY_DEPOSIT_EUR} is required.</li>
            <li>Deposit is held for 7-10 days after return.</li>
          </ul>

          <div className="mt-3">
            <p className="font-semibold text-slate-900">Deposit method selection</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <input
                  type="radio"
                  name="summaryDepositMethod"
                  value="online"
                  checked={state.securityDeposit.method === "online"}
                  onChange={() => updateSection("securityDeposit", { method: "online" })}
                />
                Pay online now
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <input
                  type="radio"
                  name="summaryDepositMethod"
                  value="in_person"
                  checked={state.securityDeposit.method === "in_person"}
                  onChange={() => updateSection("securityDeposit", { method: "in_person" })}
                />
                Pay in person at pickup
              </label>
            </div>
            {state.securityDeposit.method === "in_person" ? (
              <p className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                Your deposit must be paid in full upon collection of the vehicle before your rental begins.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={state.summary.reviewed}
          onChange={(event) => updateSection("summary", { reviewed: event.target.checked })}
          className="mt-0.5 h-4 w-4"
        />
        <span>I reviewed the summary above.</span>
      </label>
    </StepShell>
  );
}
