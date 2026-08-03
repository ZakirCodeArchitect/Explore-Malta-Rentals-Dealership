"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { useVehicle, useVehicles } from "@/features/vehicles/lib/use-vehicles";
import {
  calculateBookingPrice,
  formatEur,
  getCdwLabel,
} from "@/lib/pricing/calculate-booking-price";
import { buildBookingPaymentSummary } from "@/lib/booking/build-booking-payment-summary";

export function BookingSummaryStep() {
  const t = useTranslations("BookingWizard.bookingSummary");
  const tCommon = useTranslations("Common");
  const { state, reservationHold, updateSection } = useBookingFlow();

  const rentalWindow = useMemo(() => {
    const { pickupDate, pickupTime, returnDate, returnTime } = state.rental;
    if (!pickupDate.trim() || !pickupTime.trim() || !returnDate.trim() || !returnTime.trim()) {
      return null;
    }
    return {
      pickupDate: pickupDate.trim(),
      pickupTime: pickupTime.trim(),
      returnDate: returnDate.trim(),
      returnTime: returnTime.trim(),
      sessionKey: reservationHold.sessionKey?.trim() || undefined,
    };
  }, [
    reservationHold.sessionKey,
    state.rental.pickupDate,
    state.rental.pickupTime,
    state.rental.returnDate,
    state.rental.returnTime,
  ]);

  const { vehicles } = useVehicles({ rentalWindow });
  const incomingSlug = state.rental.vehicleSlug?.trim() ?? "";
  const { vehicle: slugVehicle } = useVehicle(incomingSlug);

  const selectedVehicle = useMemo(() => {
    if (state.rental.vehicleId) {
      const byId = vehicles.find((vehicle) => vehicle.id === state.rental.vehicleId);
      if (byId) {
        return byId;
      }
    }
    if (incomingSlug) {
      const bySlug = vehicles.find((vehicle) => vehicle.slug === incomingSlug);
      if (bySlug) {
        return bySlug;
      }
    }
    return slugVehicle;
  }, [incomingSlug, slugVehicle, state.rental.vehicleId, vehicles]);

  const pricing = useMemo(
    () => {
      if (!selectedVehicle || selectedVehicle.baseDailyRate <= 0) {
        return null;
      }

      const vehicleType = state.rental.vehicleType || selectedVehicle.apiVehicleType;
      if (!vehicleType) {
        return null;
      }

      return calculateBookingPrice({
        rental: {
          vehicle: {
            id: state.rental.vehicleId || selectedVehicle.id,
            slug: state.rental.vehicleSlug || selectedVehicle.slug,
            name: state.rental.vehicleName || selectedVehicle.name,
            type: vehicleType,
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
        vehiclePricing: {
          baseDailyRate: selectedVehicle.baseDailyRate,
          vehicleType: selectedVehicle.apiVehicleType,
          supportsStorageBox: selectedVehicle.supportsStorageBox,
        },
        hotelDiscount:
          state.hotelCode.appliedCode && state.hotelCode.discountPercent != null
            ? { discountPercent: state.hotelCode.discountPercent }
            : undefined,
      });
    },
    [selectedVehicle, state],
  );

  const paymentSummary = useMemo(() => {
    if (!pricing) {
      return null;
    }

    return buildBookingPaymentSummary({
      subtotal: pricing.subtotal,
      depositAmount: pricing.depositAmount,
      depositMethod: state.deposit.depositMethod || "in_person",
      totalDueOnline: pricing.totalDueOnline,
      totalDueLater: pricing.totalDueLater,
    });
  }, [pricing, state.deposit.depositMethod]);

  const cdwLabel =
    state.addons.cdwPlan === null
      ? t("insuranceNotSelected")
      : pricing
        ? getCdwLabel(pricing.cdwOptionApplied)
        : "-";
  const addOnList = [
    t("cdwLine", { label: cdwLabel }),
    t("addDriverLine", {
      value: state.addons.additionalDriver ? tCommon("yes") : tCommon("no"),
    }),
    `${t("helmet1")} ${state.addons.helmetSize1 || "-"}`,
    `${t("helmet2")} ${state.addons.helmetSize2 || "-"}`,
    `${t("storageBox")} ${
      selectedVehicle?.supportsStorageBox && state.addons.storageBox
        ? tCommon("yes")
        : tCommon("no")
    }`,
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
                  {t("baseDailyRate")} {formatEur(pricing.baseDailyRate)}/day
                </li>
                <li>
                  {t("rentalDuration")} {t("dayCount", { count: pricing.rentalDays })} ({pricing.tierRange})
                </li>
                {pricing.durationDiscountPercent > 0 ? (
                  <li>
                    {t("durationDiscount", {
                      percent: pricing.durationDiscountPercent,
                      rate: formatEur(pricing.appliedDailyRate),
                    })}
                  </li>
                ) : null}
                <li>
                  {t("rentalCost")} {formatEur(pricing.rentalCost)}
                </li>
                {pricing.hotelDiscountAmount > 0 ? (
                  <li>
                    {t("hotelDiscount", {
                      percent: pricing.hotelDiscountPercent,
                      amount: formatEur(pricing.hotelDiscountAmount),
                      hotel: state.hotelCode.partnerName ?? "",
                    })}
                  </li>
                ) : null}
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
                {t("bookingChargesTotal")} {formatEur(pricing.subtotal)}
              </p>
              <p className="mt-1 text-xs text-slate-500">{t("bookingChargesExcludesDepositNote")}</p>
            </>
          ) : (
            <p className="mt-2 text-xs text-slate-500">{t("pricingPending")}</p>
          )}
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-sm text-slate-700">
          <p className="text-sm font-semibold text-slate-900">{t("section3")}</p>

          <div className="mt-3">
            <p className="font-semibold text-slate-900">{t("securityDepositMethod")}</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => updateSection("deposit", { depositMethod: "in_person" })}
                className={
                  state.deposit.depositMethod !== "online"
                    ? "flex flex-col gap-1 rounded-xl border-2 border-blue-500 bg-blue-50 p-3 text-left transition-colors"
                    : "flex flex-col gap-1 rounded-xl border-2 border-slate-200 bg-white p-3 text-left transition-colors hover:border-slate-300"
                }
              >
                <span className="text-sm font-semibold text-slate-900">Pay at pickup</span>
                <span className="text-xs text-slate-500">
                  Hand over the security deposit in person when collecting the vehicle.
                </span>
              </button>
              <button
                type="button"
                onClick={() => updateSection("deposit", { depositMethod: "online" })}
                className={
                  state.deposit.depositMethod === "online"
                    ? "flex flex-col gap-1 rounded-xl border-2 border-blue-500 bg-blue-50 p-3 text-left transition-colors"
                    : "flex flex-col gap-1 rounded-xl border-2 border-slate-200 bg-white p-3 text-left transition-colors hover:border-slate-300"
                }
              >
                <span className="text-sm font-semibold text-slate-900">Pay online now</span>
                <span className="text-xs text-slate-500">
                  Include the security deposit in your Stripe payment — fully refundable after the rental.
                </span>
              </button>
            </div>
          </div>

          {paymentSummary ? (
            <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-3">
              <p className="font-semibold text-slate-900">{t("paymentSummaryTitle")}</p>
              {/* Rental charges */}
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                <span>{t("bookingChargesTotal")}</span>
                <span className="font-medium tabular-nums text-slate-900">
                  {formatEur(paymentSummary.bookingChargesTotal)}
                </span>
              </div>
              {/* Security deposit */}
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                <span>
                  {paymentSummary.securityDepositDueAtPickup
                    ? t("securityDepositDueAtPickup")
                    : t("securityDeposit")}
                </span>
                <span className="font-medium tabular-nums text-slate-900">
                  {formatEur(paymentSummary.securityDeposit)}
                </span>
              </div>
              <div className="border-t border-slate-100" />
              {/* Pay now online */}
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 font-medium text-emerald-700">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Pay now online (Stripe)
                </span>
                <span className="tabular-nums">
                  {formatEur(paymentSummary.amountPayableOnline ?? 0)}
                </span>
              </div>
              {/* Pay at pickup */}
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                <span>{t("amountDueAtPickupLater")}</span>
                <span className="font-medium tabular-nums text-slate-900">
                  {formatEur(paymentSummary.amountDueAtPickupLater)}
                </span>
              </div>
              {/* Total */}
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-slate-200 pt-2 font-semibold text-slate-900">
                <span>{t("totalCustomerLiability")}</span>
                <span className="tabular-nums">{formatEur(paymentSummary.totalCustomerLiability)}</span>
              </div>
            </div>
          ) : null}

          <p className="mt-3 text-xs text-slate-600">{t("securityDepositHelperText")}</p>
          {state.deposit.depositMethod !== "online" ? (
            <p className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              {t("depositAtPickupNote")}
            </p>
          ) : (
            <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              Your security deposit will be charged with your booking and refunded after the vehicle is returned in good condition.
            </p>
          )}
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
