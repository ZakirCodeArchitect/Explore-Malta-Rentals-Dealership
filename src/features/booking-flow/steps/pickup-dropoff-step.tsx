"use client";

import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { pricingService } from "@/lib/pricing/service";

export function PickupDropoffStep() {
  const { state, updateSection } = useBookingFlow();
  const pickupDeliverySelected = state.pickupDropoff.pickupType === "delivery";
  const dropoffDeliverySelected = state.pickupDropoff.dropoffType === "delivery";
  const pickupAddress = state.pickupDropoff.pickupAddress ?? "";
  const dropoffAddress = state.pickupDropoff.dropoffAddress ?? "";
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
              value="office"
              checked={state.pickupDropoff.pickupType === "office"}
              onChange={() => updateSection("pickupDropoff", { pickupType: "office" })}
            />
            Collect from office in Pieta
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="pickupType"
              value="delivery"
              checked={state.pickupDropoff.pickupType === "delivery"}
              onChange={() => updateSection("pickupDropoff", { pickupType: "delivery" })}
            />
            Request delivery
          </label>

          {pickupDeliverySelected ? (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50/60 p-3">
              <label className="text-sm font-medium text-slate-700">
                Pickup address (delivery)
                <textarea
                  className="mt-1 min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20"
                  value={pickupAddress}
                  onChange={(event) =>
                    updateSection("pickupDropoff", { pickupAddress: event.target.value })
                  }
                  placeholder="Street, building, area, postcode"
                />
              </label>
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
              value="office"
              checked={state.pickupDropoff.dropoffType === "office"}
              onChange={() => updateSection("pickupDropoff", { dropoffType: "office" })}
            />
            Return to office in Pieta
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <input
              type="radio"
              name="dropoffType"
              value="delivery"
              checked={state.pickupDropoff.dropoffType === "delivery"}
              onChange={() => updateSection("pickupDropoff", { dropoffType: "delivery" })}
            />
            Request drop-off
          </label>

          {dropoffDeliverySelected ? (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50/60 p-3">
              <label className="text-sm font-medium text-slate-700">
                Drop-off address
                <textarea
                  className="mt-1 min-h-20 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20"
                  value={dropoffAddress}
                  onChange={(event) =>
                    updateSection("pickupDropoff", { dropoffAddress: event.target.value })
                  }
                  placeholder="Street, building, area, postcode"
                />
              </label>
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
