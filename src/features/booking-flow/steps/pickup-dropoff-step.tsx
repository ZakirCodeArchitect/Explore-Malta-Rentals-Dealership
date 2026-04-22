"use client";

import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { pricingService } from "@/lib/pricing/service";

export function PickupDropoffStep() {
  const { state, updateSection, getFieldError, isFieldInvalid } = useBookingFlow();
  const pickupDeliverySelected = state.delivery.pickupOption === "delivery";
  const dropoffDeliverySelected = state.delivery.dropoffOption === "dropoff";
  const pickupAddress = state.delivery.pickupAddress ?? "";
  const dropoffAddress = state.delivery.dropoffAddress ?? "";
  const offSiteQuote = pricingService.quoteOffSiteService({
    pickupOffSite: pickupDeliverySelected,
    dropoffOffSite: dropoffDeliverySelected,
  });
  const deliveryOnlyQuote = pricingService.quoteOffSiteService({
    pickupOffSite: true,
    dropoffOffSite: false,
  });
  const dropoffOnlyQuote = pricingService.quoteOffSiteService({
    pickupOffSite: false,
    dropoffOffSite: true,
  });
  const bothQuote = pricingService.quoteOffSiteService({
    pickupOffSite: true,
    dropoffOffSite: true,
  });

  return (
    <StepShell
      title="Pickup & Drop-off"
      description="Step 2 delivery configuration. Address fields are text-only in this phase."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Pickup
          </legend>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="pickupType"
              data-field="delivery.pickupOption"
              value="office"
              checked={state.delivery.pickupOption === "office"}
              onChange={() => updateSection("delivery", { pickupOption: "office" })}
            />
            Collect from office in Pieta
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="pickupType"
              data-field="delivery.pickupOption"
              value="delivery"
              checked={state.delivery.pickupOption === "delivery"}
              onChange={() => updateSection("delivery", { pickupOption: "delivery" })}
            />
            Request delivery
          </label>

          {pickupDeliverySelected ? (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50/60 p-3">
              <label className="text-sm font-medium text-slate-700">
                Pickup address (delivery)
                <textarea
                  name="delivery.pickupAddress"
                  data-field="delivery.pickupAddress"
                  className={`mt-1 min-h-20 w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 ${
                    isFieldInvalid("delivery.pickupAddress")
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-200 focus:border-[var(--brand-blue)] focus:ring-[var(--brand-blue)]/20"
                  }`}
                  value={pickupAddress}
                  onChange={(event) =>
                    updateSection("delivery", { pickupAddress: event.target.value })
                  }
                  placeholder="Street, building, area, postcode"
                />
              </label>
              {getFieldError("delivery.pickupAddress") ? (
                <p className="mt-2 text-xs text-red-600">{getFieldError("delivery.pickupAddress")}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">
                Text address field only (no map in current doc version).
              </p>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Drop-off
          </legend>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="dropoffType"
              data-field="delivery.dropoffOption"
              value="office"
              checked={state.delivery.dropoffOption === "office"}
              onChange={() => updateSection("delivery", { dropoffOption: "office" })}
            />
            Return to office in Pieta
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="dropoffType"
              data-field="delivery.dropoffOption"
              value="dropoff"
              checked={state.delivery.dropoffOption === "dropoff"}
              onChange={() => updateSection("delivery", { dropoffOption: "dropoff" })}
            />
            Request drop-off
          </label>

          {dropoffDeliverySelected ? (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50/60 p-3">
              <label className="text-sm font-medium text-slate-700">
                Drop-off address
                <textarea
                  name="delivery.dropoffAddress"
                  data-field="delivery.dropoffAddress"
                  className={`mt-1 min-h-20 w-full rounded-md border px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 ${
                    isFieldInvalid("delivery.dropoffAddress")
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : "border-slate-200 focus:border-[var(--brand-blue)] focus:ring-[var(--brand-blue)]/20"
                  }`}
                  value={dropoffAddress}
                  onChange={(event) =>
                    updateSection("delivery", { dropoffAddress: event.target.value })
                  }
                  placeholder="Street, building, area, postcode"
                />
              </label>
              {getFieldError("delivery.dropoffAddress") ? (
                <p className="mt-2 text-xs text-red-600">{getFieldError("delivery.dropoffAddress")}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">
                Text address field only (no map in current doc version).
              </p>
            </div>
          ) : null}
        </fieldset>
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p>Delivery only: EUR {deliveryOnlyQuote.totalEur}</p>
        <p>Drop-off only: EUR {dropoffOnlyQuote.totalEur}</p>
        <p className="font-semibold">
          Both: EUR {bothQuote.totalEur}
          {bothQuote.hasBundleDiscount ? ` (You get EUR ${bothQuote.discountEur} off)` : ""}
        </p>
        {offSiteQuote.selectedLegs > 0 ? (
          <p className="text-xs">
            Current chosen setup total: EUR {offSiteQuote.totalEur} ({offSiteQuote.selectedLegs} x
            EUR {offSiteQuote.perLegFeeEur}
            {offSiteQuote.hasBundleDiscount ? ` - EUR ${offSiteQuote.discountEur} bundle discount` : ""}
            )
          </p>
        ) : null}
      </div>
    </StepShell>
  );
}
