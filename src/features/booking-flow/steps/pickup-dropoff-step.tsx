"use client";

import { useTranslations } from "next-intl";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { calculateDeliveryFees, formatEur } from "@/lib/pricing/calculate-booking-price";

export function PickupDropoffStep() {
  const t = useTranslations("BookingWizard.pickupDropoff");
  const { state, updateSection, getFieldError, isFieldInvalid } = useBookingFlow();
  const pickupDeliverySelected = state.delivery.pickupOption === "delivery";
  const dropoffDeliverySelected = state.delivery.dropoffOption === "dropoff";
  const pickupAddress = state.delivery.pickupAddress ?? "";
  const dropoffAddress = state.delivery.dropoffAddress ?? "";
  const offSiteQuote = calculateDeliveryFees(
    state.delivery.pickupOption,
    state.delivery.dropoffOption,
  );
  const deliveryOnlyQuote = calculateDeliveryFees("delivery", "office");
  const dropoffOnlyQuote = calculateDeliveryFees("office", "dropoff");
  const bothQuote = calculateDeliveryFees("delivery", "dropoff");

  return (
    <StepShell title={t("shellTitle")} description={t("shellDescription")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            {t("pickupLegend")}
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
            {t("officePickup")}
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
            {t("requestDelivery")}
          </label>

          {pickupDeliverySelected ? (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50/60 p-3">
              <label className="text-sm font-medium text-slate-700">
                {t("pickupAddressLabel")}
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
                  placeholder={t("addressPlaceholder")}
                />
              </label>
              {getFieldError("delivery.pickupAddress") ? (
                <p className="mt-2 text-xs text-red-600">{getFieldError("delivery.pickupAddress")}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">{t("textOnlyNote")}</p>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            {t("dropoffLegend")}
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
            {t("officeReturn")}
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
            {t("requestDropoff")}
          </label>

          {dropoffDeliverySelected ? (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50/60 p-3">
              <label className="text-sm font-medium text-slate-700">
                {t("dropoffAddressLabel")}
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
                  placeholder={t("addressPlaceholder")}
                />
              </label>
              {getFieldError("delivery.dropoffAddress") ? (
                <p className="mt-2 text-xs text-red-600">{getFieldError("delivery.dropoffAddress")}</p>
              ) : null}
              <p className="mt-2 text-xs text-slate-500">{t("textOnlyNote")}</p>
            </div>
          ) : null}
        </fieldset>
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p>{t("deliveryOnly", { amount: formatEur(deliveryOnlyQuote.deliveryTotal) })}</p>
        <p>{t("dropoffOnly", { amount: formatEur(dropoffOnlyQuote.deliveryTotal) })}</p>
        <p className="font-semibold">
          {t("bothLabel", { amount: formatEur(bothQuote.deliveryTotal) })}
          {bothQuote.discount > 0 ? t("youGetOff", { amount: formatEur(bothQuote.discount) }) : ""}
        </p>
        {offSiteQuote.deliveryFee + offSiteQuote.dropoffFee > 0 ? (
          <p className="text-xs">
            {t("currentTotal", {
              total: formatEur(offSiteQuote.deliveryTotal),
              pickup: formatEur(offSiteQuote.deliveryFee),
              dropoff: formatEur(offSiteQuote.dropoffFee),
              discount:
                offSiteQuote.discount > 0
                  ? t("bundleDiscountShort", { amount: formatEur(offSiteQuote.discount) })
                  : "",
            })}
          </p>
        ) : null}
      </div>
    </StepShell>
  );
}
