"use client";

import { addDays, differenceInHours, format, parse } from "date-fns";
import { useTranslations } from "next-intl";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20";

export function RentalDatesStep() {
  const t = useTranslations("BookingWizard.rentalDates");
  const { state, updateSection, getFieldError, isFieldInvalid } = useBookingFlow();
  const { pickupDate, pickupTime, returnDate, returnTime } = state.rental;
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
    <StepShell title={t("shellTitle")} description={t("shellDescription")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <p className="sm:col-span-2 text-sm font-semibold text-slate-900">{t("sectionDates")}</p>
        <label className="text-sm font-medium text-slate-700">
          {t("pickupDate")}
          <input
            type="date"
            value={pickupDate}
            min={pickupMinDate}
            name="rental.pickupDate"
            data-field="rental.pickupDate"
            onChange={(event) => updateSection("rental", { pickupDate: event.target.value })}
            className={`${inputClass} ${isFieldInvalid("rental.pickupDate") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
          />
          {getFieldError("rental.pickupDate") ? (
            <span className="mt-1 block text-xs text-red-600">{getFieldError("rental.pickupDate")}</span>
          ) : null}
        </label>

        <label className="text-sm font-medium text-slate-700">
          {t("returnDate")}
          <input
            type="date"
            value={returnDate}
            min={returnMinDate}
            max={returnMaxDate}
            name="rental.returnDate"
            data-field="rental.returnDate"
            onChange={(event) => updateSection("rental", { returnDate: event.target.value })}
            className={`${inputClass} ${isFieldInvalid("rental.returnDate") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
          />
          {getFieldError("rental.returnDate") ? (
            <span className="mt-1 block text-xs text-red-600">{getFieldError("rental.returnDate")}</span>
          ) : null}
        </label>

        <p className="sm:col-span-2 text-sm font-semibold text-slate-900">{t("sectionTime")}</p>
        <label className="text-sm font-medium text-slate-700">
          {t("pickupTime")}
          <input
            type="time"
            value={pickupTime}
            name="rental.pickupTime"
            data-field="rental.pickupTime"
            onChange={(event) => updateSection("rental", { pickupTime: event.target.value })}
            className={`${inputClass} ${isFieldInvalid("rental.pickupTime") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
          />
          {getFieldError("rental.pickupTime") ? (
            <span className="mt-1 block text-xs text-red-600">{getFieldError("rental.pickupTime")}</span>
          ) : null}
        </label>

        <label className="text-sm font-medium text-slate-700">
          {t("returnTime")}
          <input
            type="time"
            value={returnTime}
            name="rental.returnTime"
            data-field="rental.returnTime"
            onChange={(event) => updateSection("rental", { returnTime: event.target.value })}
            className={`${inputClass} ${isFieldInvalid("rental.returnTime") ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""}`}
          />
          {getFieldError("rental.returnTime") ? (
            <span className="mt-1 block text-xs text-red-600">{getFieldError("rental.returnTime")}</span>
          ) : null}
        </label>

        <p className="sm:col-span-2 text-sm font-semibold text-slate-900">{t("sectionDuration")}</p>
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700">
        {t("autoDuration")}{" "}
        <span className="font-semibold text-slate-900">
          {rentalHours > 0
            ? t("durationLine", { days: rentalDays, hours: rentalHours })
            : hasDateTimeRange
              ? t("durationInvalid")
              : t("durationWaiting")}
        </span>
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">{t("notesTitle")}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>{t("noteMin")}</li>
          <li>{t("noteDayCharge")}</li>
          <li>{t("noteMax")}</li>
          <li>{t("noteRenew")}</li>
        </ul>
      </div>
    </StepShell>
  );
}
