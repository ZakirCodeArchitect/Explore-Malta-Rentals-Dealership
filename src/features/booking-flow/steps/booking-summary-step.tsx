"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import {
  calculateBookingPrice,
  formatEur,
  getCdwLabel,
} from "@/lib/pricing/calculate-booking-price";

export function BookingSummaryStep() {
  const t = useTranslations("BookingWizard.bookingSummary");
  const tCommon = useTranslations("Common");
  const { state, updateSection } = useBookingFlow();
  const pricing = useMemo(
    () =>
      calculateBookingPrice({
        rental: {
          vehicle: {
            id: state.rental.vehicleId ?? undefined,
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

  const cdwLabel = pricing ? getCdwLabel(pricing.cdwOptionApplied) : "-";
  const addOnList = [
    t("cdwLine", { label: cdwLabel }),
    t("addDriverLine", {
      value: state.addons.additionalDriver ? tCommon("yes") : tCommon("no"),
    }),
    `${t("helmet1")} ${state.addons.helmetSize1 || "-"}`,
    `${t("helmet2")} ${state.addons.helmetSize2 || "-"}`,
    `${t("storageBox")} ${state.addons.storageBox ? tCommon("yes") : tCommon("no")}`,
  ];

  return (
    <StepShell title={t("shellTitle")} description={t("shellDescription")}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">{t("section1")}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              {t("vehicleSelected")}{" "}
              {state.rental.vehicleName || state.rental.vehicleId || t("categoryOnly")}
            </li>
            <li>
              {t("rentalDates")} {state.rental.pickupDate || "-"} {state.rental.pickupTime || ""} {t("to")}{" "}
              {state.rental.returnDate || "-"} {state.rental.returnTime || ""}
            </li>
            <li>
              {t("billableDuration")}{" "}
              {pricing ? t("dayCount", { count: pricing.rentalDays }) : "-"}
              {pricing ? t("actualHours", { hours: pricing.actualDurationHours.toFixed(1) }) : ""}
            </li>
            <li>
              {t("pickupMethod")} {state.delivery.pickupOption}
            </li>
            <li>
              {t("pickupAddress")} {state.delivery.pickupAddress || "-"}
            </li>
            <li>
              {t("dropoffMethod")} {state.delivery.dropoffOption}
            </li>
            <li>
              {t("dropoffAddress")} {state.delivery.dropoffAddress || "-"}
            </li>
            {addOnList.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">{t("section2")}</p>
          {pricing ? (
            <>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  {t("rentalCost")} {formatEur(pricing.rentalCost)}
                </li>
                <li>
                  {t("deliveryLine", {
                    total: formatEur(pricing.deliveryTotal),
                    pickup: formatEur(pricing.deliveryFee),
                    dropoff: formatEur(pricing.dropoffFee),
                    discount:
                      pricing.deliveryDiscount > 0
                        ? t("bundleDiscount", { amount: formatEur(pricing.deliveryDiscount) })
                        : "",
                  })}
                </li>
                <li>
                  {t("cdwCost")} {formatEur(pricing.cdwCost)}
                </li>
                <li>
                  {t("addDriverCost")} {formatEur(pricing.additionalDriverCost)}
                </li>
                <li>
                  {t("storageCost")} {formatEur(pricing.storageBoxCost)}
                </li>
              </ul>
              <p className="mt-3 font-semibold text-slate-900">
                {t("subtotal")} {formatEur(pricing.subtotal)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs text-slate-500">{t("pricingPending")}</p>
          )}
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">{t("section3")}</p>
          <p className="mt-2 font-semibold">
            {t("securityDeposit")} {formatEur(pricing?.depositAmount ?? 250)}
          </p>

          <div className="mt-3">
            <p className="font-semibold text-slate-900">{t("depositMethod")}</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <input
                  type="radio"
                  name="summaryDepositMethod"
                  value="online"
                  checked={state.deposit.depositMethod === "online"}
                  onChange={() => updateSection("deposit", { depositMethod: "online" })}
                />
                {t("payOnlineNow")}
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <input
                  type="radio"
                  name="summaryDepositMethod"
                  value="in_person"
                  checked={state.deposit.depositMethod === "in_person"}
                  onChange={() => updateSection("deposit", { depositMethod: "in_person" })}
                />
                {t("payInPersonPickup")}
              </label>
            </div>
            {pricing ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
                <p className="font-semibold text-slate-900">
                  {t("totalDueOnline")} {formatEur(pricing.totalDueOnline)}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {t("dueLater")} {formatEur(pricing.totalDueLater)}
                </p>
              </div>
            ) : null}
            {state.deposit.depositMethod === "in_person" ? (
              <p className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                {t("depositAtPickupNote")}
              </p>
            ) : null}
            {state.deposit.depositMethod === "online" ? (
              <p className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
                {t("depositOnlineNote")}
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
        <span>{t("reviewCheckbox")}</span>
      </label>
    </StepShell>
  );
}
