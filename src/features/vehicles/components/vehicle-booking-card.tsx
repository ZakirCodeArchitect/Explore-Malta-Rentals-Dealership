"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, Globe, Lock, Mail, Package, ShieldCheck, User, Phone } from "lucide-react";
import type { Vehicle, VehicleType } from "@/features/vehicles/data/vehicles";
import { BookingDisabledCtaContent } from "@/components/booking/booking-disabled-cta-content";
import { BookingFormDisabledBanner } from "@/components/booking/booking-form-disabled-banner";
import { useBookingControl } from "@/components/booking/booking-control-provider";
import { warnBookingActionBlocked } from "@/lib/booking-control-constants";

type VehicleBookingCardProps = Readonly<{
  vehicle: Vehicle;
}>;

type FormErrors = Partial<
  Record<
    "fullName" | "nationality" | "email" | "mobile" | "pickupDate" | "returnDate" | "licenseConfirmed" | "submit",
    string
  >
>;

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getRentalDays(start: string, end: string) {
  if (!start || !end) return 0;
  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf()) || endDate <= startDate) return 0;
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function needsMotorLicense(type: VehicleType) {
  return type !== "Bicycle";
}

const inputWrap =
  "relative mt-2 rounded-xl border border-slate-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-[border-color,box-shadow] duration-200 focus-within:border-[var(--brand-blue)]/45 focus-within:ring-2 focus-within:ring-[var(--brand-blue)]/20";

const inputClass =
  "w-full rounded-xl bg-transparent py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-11";

const labelClass = "text-sm font-semibold text-slate-800";

export function VehicleBookingCard({ vehicle }: VehicleBookingCardProps) {
  const { enabled: bookingEnabled, disabledMessage } = useBookingControl();
  const formDisabled = !bookingEnabled;
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const storageDialogRef = useRef<HTMLDialogElement>(null);
  const storagePopupShownRef = useRef(false);

  const [fullName, setFullName] = useState("");
  const [nationality, setNationality] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [licenseConfirmed, setLicenseConfirmed] = useState(false);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const minDate = todayISODate();
  const rentalDays = getRentalDays(pickupDate, returnDate);
  const motorLicense = needsMotorLicense(vehicle.type);

  const storageAddOn = useMemo(
    () => vehicle.addOns.find((addOn) => addOn.id === "storage-box"),
    [vehicle.addOns],
  );
  const inlineAddOns = useMemo(
    () => vehicle.addOns.filter((addOn) => addOn.id !== "storage-box"),
    [vehicle.addOns],
  );

  const { addOnTotalPerDay, addOnTotalOnce } = useMemo(() => {
    const selected = vehicle.addOns.filter((addOn) => selectedAddOns.includes(addOn.id));
    return {
      addOnTotalPerDay: selected.reduce((sum, addOn) => sum + (addOn.pricePerDay ?? 0), 0),
      addOnTotalOnce: selected.reduce((sum, addOn) => sum + (addOn.priceOnce ?? 0), 0),
    };
  }, [selectedAddOns, vehicle.addOns]);

  useEffect(() => {
    if (!storageAddOn || rentalDays <= 0 || storagePopupShownRef.current) return;
    storagePopupShownRef.current = true;
    const id = window.setTimeout(() => storageDialogRef.current?.showModal(), 500);
    return () => window.clearTimeout(id);
  }, [rentalDays, storageAddOn]);

  const dailySubtotal = vehicle.pricePerDay + addOnTotalPerDay;
  const billableDays = rentalDays > 0 ? rentalDays : 0;
  const estimatedTotal =
    billableDays > 0 ? billableDays * dailySubtotal + addOnTotalOnce : 0;

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!fullName.trim()) next.fullName = "Enter your full name as on your ID.";
    if (!nationality.trim()) next.nationality = "Add your nationality.";
    if (!email.trim()) next.email = "We need your email to send the booking confirmation.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!mobile.trim()) next.mobile = "Add a mobile number we can reach you on.";
    else if (!isValidPhone(mobile)) next.mobile = "Use a valid number (include country code if outside Malta).";
    if (!pickupDate) next.pickupDate = "Choose a pickup date.";
    if (!returnDate) next.returnDate = "Choose a return date.";
    else if (rentalDays <= 0) next.returnDate = "Return must be after pickup.";
    if (!licenseConfirmed) {
      next.licenseConfirmed = motorLicense
        ? "Please confirm you hold the required licence for this vehicle."
        : "Please confirm you agree to safe, legal use of this bicycle.";
    }
    return next;
  }

  function blurField(field: keyof FormErrors) {
    setTouched((t) => ({ ...t, [field]: true }));
    const v = validate();
    if (v[field]) setErrors((e) => ({ ...e, [field]: v[field] }));
    else setErrors((e) => {
      const copy = { ...e };
      delete copy[field];
      return copy;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formDisabled) {
      warnBookingActionBlocked("VehicleBookingCard.handleSubmit");
      return;
    }
    const next = validate();
    setErrors(next);
    setTouched({
      fullName: true,
      nationality: true,
      email: true,
      mobile: true,
      pickupDate: true,
      returnDate: true,
      licenseConfirmed: true,
    });
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setErrors({});
    try {
      await new Promise((r) => setTimeout(r, 900));
      setSuccess(true);
    } catch {
      setErrors({
        submit: "Something went wrong. Please try again or reach us through the contact page.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <aside
        className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/90 to-white p-6 shadow-[0_24px_52px_-35px_rgba(15,23,42,0.35)] lg:sticky lg:top-[calc(env(safe-area-inset-top)+3.75rem)]"
        aria-live="polite"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <ShieldCheck className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-slate-950">Request received</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Thanks, <span className="font-medium text-slate-800">{fullName.trim()}</span>. We&apos;ll confirm availability
          for <span className="font-medium text-slate-800">{vehicle.name}</span> and reply by email shortly. No payment
          was taken.
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Reference total: <span className="font-semibold text-slate-900">EUR {estimatedTotal}</span> (
          {billableDays} day{billableDays !== 1 ? "s" : ""}).
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setFullName("");
            setNationality("");
            setEmail("");
            setMobile("");
            setLicenseConfirmed(false);
            setPickupDate("");
            setReturnDate("");
            setSelectedAddOns([]);
            storagePopupShownRef.current = false;
            setTouched({});
            setErrors({});
          }}
          className="mt-6 w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/40"
        >
          Book another date
        </button>
      </aside>
    );
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_52px_-35px_rgba(15,23,42,0.35)] motion-safe:transition-shadow motion-safe:duration-300 hover:shadow-[0_28px_56px_-32px_rgba(58,124,165,0.22)] lg:sticky lg:top-[calc(env(safe-area-inset-top)+3.75rem)]">
      {formDisabled ? (
        <div className="mb-4">
          <BookingFormDisabledBanner
            message={disabledMessage}
            variant="light"
            className="text-xs sm:text-sm"
          />
        </div>
      ) : null}
      {storageAddOn ? (
        <dialog
          ref={storageDialogRef}
          className="fixed left-1/2 top-1/2 z-[200] w-[min(100%,24rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl [&::backdrop]:bg-slate-950/55"
        >
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-orange)]">
              <Package className="h-4 w-4" aria-hidden />
              Optional extra
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-slate-950">{storageAddOn.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Add a secure top box for luggage or shopping — one-time add-on for this booking.
            </p>
          </div>
          <div className="px-5 py-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm">
              <input
                type="checkbox"
                disabled={formDisabled}
                checked={selectedAddOns.includes("storage-box")}
                onChange={(event) => {
                  setSelectedAddOns((previous) =>
                    event.target.checked
                      ? [...previous.filter((id) => id !== "storage-box"), "storage-box"]
                      : previous.filter((id) => id !== "storage-box"),
                  );
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[var(--brand-orange)] focus:ring-[var(--brand-orange)]"
              />
              <span>
                <span className="font-semibold text-slate-900">Include storage box</span>
                <span className="mt-0.5 block text-slate-600">
                  +EUR {storageAddOn.priceOnce} one-time (optional)
                </span>
              </span>
            </label>
          </div>
          <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
              onClick={() => storageDialogRef.current?.close()}
            >
              Skip for now
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--brand-orange)] px-5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-[var(--brand-orange-strong)] sm:w-auto"
              onClick={() => storageDialogRef.current?.close()}
            >
              Continue
            </button>
          </div>
        </dialog>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-600">From</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
            EUR {vehicle.pricePerDay}
            <span className="ml-1 text-base font-medium text-slate-500">/ day</span>
          </p>
          {vehicle.securityDepositEUR != null ? (
            <p className="mt-2 text-sm text-slate-600">
              Security deposit{" "}
              <span className="font-semibold text-slate-900">EUR {vehicle.securityDepositEUR}</span>
            </p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-semibold text-slate-800">
          Free cancellation request
        </span>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" aria-hidden />
        <p>Your details are sent securely and only used to confirm your rental — never sold to third parties.</p>
      </div>

      <form className="mt-6 space-y-8" onSubmit={handleSubmit} noValidate>
        {/* Personal */}
        <fieldset className="space-y-4">
          <legend className={joinClasses(labelClass, "text-base tracking-[-0.02em]")}>Your details</legend>
          <p className="text-xs text-slate-500">We&apos;ll match this to your pickup and licence where required.</p>

          <div>
            <label htmlFor="booking-full-name" className={labelClass}>
              Full name
            </label>
            <div className={inputWrap}>
              <User
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="booking-full-name"
                name="fullName"
                type="text"
                autoComplete="name"
                disabled={formDisabled}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => blurField("fullName")}
                aria-invalid={touched.fullName && !!errors.fullName}
                aria-describedby={errors.fullName ? "booking-full-name-error" : undefined}
                placeholder="As on your ID or passport"
                className={inputClass}
              />
            </div>
            {touched.fullName && errors.fullName ? (
              <p id="booking-full-name-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                {errors.fullName}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="booking-nationality" className={labelClass}>
              Nationality
            </label>
            <div className={inputWrap}>
              <Globe
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="booking-nationality"
                name="nationality"
                type="text"
                autoComplete="country-name"
                disabled={formDisabled}
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                onBlur={() => blurField("nationality")}
                aria-invalid={touched.nationality && !!errors.nationality}
                aria-describedby={errors.nationality ? "booking-nationality-error" : undefined}
                placeholder="e.g. Maltese, Italian, UK"
                className={inputClass}
              />
            </div>
            {touched.nationality && errors.nationality ? (
              <p id="booking-nationality-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                {errors.nationality}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label htmlFor="booking-email" className={labelClass}>
                Email
              </label>
              <div className={inputWrap}>
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id="booking-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  disabled={formDisabled}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => blurField("email")}
                  aria-invalid={touched.email && !!errors.email}
                  aria-describedby={errors.email ? "booking-email-error" : undefined}
                  suppressHydrationWarning
                  placeholder="you@example.com"
                  className={inputClass}
                />
              </div>
              {touched.email && errors.email ? (
                <p id="booking-email-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                  {errors.email}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="booking-mobile" className={labelClass}>
                Mobile number
              </label>
              <div className={inputWrap}>
                <Phone
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id="booking-mobile"
                  name="mobile"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  disabled={formDisabled}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  onBlur={() => blurField("mobile")}
                  aria-invalid={touched.mobile && !!errors.mobile}
                  aria-describedby={errors.mobile ? "booking-mobile-error" : undefined}
                  placeholder="+356 … or your full number"
                  className={inputClass}
                />
              </div>
              {touched.mobile && errors.mobile ? (
                <p id="booking-mobile-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                  {errors.mobile}
                </p>
              ) : null}
            </div>
          </div>
        </fieldset>

        {/* Trip */}
        <fieldset className="space-y-4">
          <legend className={joinClasses(labelClass, "flex items-center gap-2 text-base tracking-[-0.02em]")}>
            <CalendarRange className="h-4 w-4 text-slate-600" aria-hidden />
            Trip dates
          </legend>
          <p className="text-xs text-slate-500">Rental length is calculated automatically from pickup and return.</p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label htmlFor="booking-pickup" className={labelClass}>
                Pickup date
              </label>
              <input
                id="booking-pickup"
                name="pickupDate"
                type="date"
                min={minDate}
                disabled={formDisabled}
                value={pickupDate}
                onChange={(e) => {
                  setPickupDate(e.target.value);
                  if (returnDate && e.target.value && returnDate <= e.target.value) setReturnDate("");
                }}
                onBlur={() => blurField("pickupDate")}
                aria-invalid={touched.pickupDate && !!errors.pickupDate}
                aria-describedby={errors.pickupDate ? "booking-pickup-error" : undefined}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-[border-color,box-shadow] duration-200 focus:border-[var(--brand-blue)]/45 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20"
              />
              {touched.pickupDate && errors.pickupDate ? (
                <p id="booking-pickup-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                  {errors.pickupDate}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="booking-return" className={labelClass}>
                Return date
              </label>
              <input
                id="booking-return"
                name="returnDate"
                type="date"
                min={pickupDate || minDate}
                disabled={formDisabled}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                onBlur={() => blurField("returnDate")}
                aria-invalid={touched.returnDate && !!errors.returnDate}
                aria-describedby={errors.returnDate ? "booking-return-error" : undefined}
                className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-[border-color,box-shadow] duration-200 focus:border-[var(--brand-blue)]/45 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20"
              />
              {touched.returnDate && errors.returnDate ? (
                <p id="booking-return-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                  {errors.returnDate}
                </p>
              ) : null}
            </div>
          </div>

          <div role="group" aria-labelledby="booking-addons-label">
            <p id="booking-addons-label" className="text-sm font-semibold text-slate-900">
              Optional add-ons
            </p>
            {storageAddOn ? (
              <p className="mt-1 text-xs text-slate-500">
                <button
                  type="button"
                  disabled={formDisabled}
                  onClick={() => storageDialogRef.current?.showModal()}
                  className="font-semibold text-[var(--brand-blue)] underline decoration-[var(--brand-orange)]/40 underline-offset-2 transition hover:text-[var(--brand-orange-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Storage box
                </button>{" "}
                — opens in a quick prompt (EUR {storageAddOn.priceOnce} one-time, optional).
              </p>
            ) : null}
            <div className="mt-2 space-y-2">
              {inlineAddOns.map((addOn) => {
                const checked = selectedAddOns.includes(addOn.id);
                return (
                  <label
                    key={addOn.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 py-2.5 text-sm transition-colors hover:border-slate-300"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        disabled={formDisabled}
                        checked={checked}
                        onChange={(event) => {
                          setSelectedAddOns((previous) =>
                            event.target.checked
                              ? [...previous, addOn.id]
                              : previous.filter((value) => value !== addOn.id),
                          );
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-[var(--brand-orange)] focus:ring-[var(--brand-orange)]"
                      />
                      {addOn.name}
                    </span>
                    <span className="font-semibold text-slate-700">
                      +
                      {addOn.pricePerDay != null ? (
                        <>EUR {addOn.pricePerDay}/day</>
                      ) : (
                        <>EUR {addOn.priceOnce} one-time</>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </fieldset>

        {/* Summary + licence */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/90 to-white p-4">
          <h3 className="text-sm font-semibold text-slate-900">Booking summary</h3>
          <dl className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between gap-4">
              <dt>Rental days</dt>
              <dd className="font-semibold text-slate-900">{billableDays > 0 ? billableDays : "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Daily rate (vehicle + add-ons)</dt>
              <dd className="font-semibold text-slate-900">EUR {dailySubtotal}</dd>
            </div>
            <div className="border-t border-slate-200 pt-2">
              <div className="flex justify-between gap-4 text-base">
                <dt className="font-semibold text-slate-900">Estimated total</dt>
                <dd className="font-bold tracking-tight text-slate-950" aria-live="polite">
                  EUR {estimatedTotal > 0 ? estimatedTotal : "—"}
                </dd>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Total updates automatically. Final price is confirmed before you pay.
              </p>
            </div>
          </dl>
        </div>

        {motorLicense ? (
          <div>
            <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-700 transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                disabled={formDisabled}
                checked={licenseConfirmed}
                onChange={(e) => {
                  setLicenseConfirmed(e.target.checked);
                  if (e.target.checked) setErrors((er) => ({ ...er, licenseConfirmed: undefined }));
                }}
                onBlur={() => blurField("licenseConfirmed")}
                aria-invalid={touched.licenseConfirmed && !!errors.licenseConfirmed}
                aria-describedby={errors.licenseConfirmed ? "booking-license-error" : undefined}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[var(--brand-orange)] focus:ring-[var(--brand-orange)]"
              />
              <span>
                <span className="font-semibold text-slate-900">Licence confirmation</span>
                <span className="mt-1 block text-slate-600">
                  I confirm I hold a valid driving licence (or permit) required to operate this vehicle in Malta.
                </span>
              </span>
            </label>
            {touched.licenseConfirmed && errors.licenseConfirmed ? (
              <p id="booking-license-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                {errors.licenseConfirmed}
              </p>
            ) : null}
          </div>
        ) : (
          <div>
            <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm text-slate-700 transition-colors hover:bg-slate-50">
              <input
                type="checkbox"
                disabled={formDisabled}
                checked={licenseConfirmed}
                onChange={(e) => {
                  setLicenseConfirmed(e.target.checked);
                  if (e.target.checked) setErrors((er) => ({ ...er, licenseConfirmed: undefined }));
                }}
                onBlur={() => blurField("licenseConfirmed")}
                aria-invalid={touched.licenseConfirmed && !!errors.licenseConfirmed}
                aria-describedby={errors.licenseConfirmed ? "booking-bike-error" : undefined}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[var(--brand-orange)] focus:ring-[var(--brand-orange)]"
              />
              <span>
                <span className="font-semibold text-slate-900">Rider confirmation</span>
                <span className="mt-1 block text-slate-600">
                  I confirm I will use this bicycle responsibly and follow local road and safety rules.
                </span>
              </span>
            </label>
            {touched.licenseConfirmed && errors.licenseConfirmed ? (
              <p id="booking-bike-error" className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                {errors.licenseConfirmed}
              </p>
            ) : null}
          </div>
        )}

        {errors.submit ? (
          <p className="text-center text-sm font-medium text-red-600" role="alert">
            {errors.submit}
          </p>
        ) : null}

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={formDisabled || submitting}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--brand-orange)] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_36px_-16px_rgba(255,147,15,0.85)] transition-[transform,box-shadow,opacity] duration-300 hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 motion-safe:hover:scale-[1.01] motion-reduce:hover:scale-100"
          >
            {formDisabled
              ? <BookingDisabledCtaContent message={disabledMessage} />
              : submitting
                ? "Sending request…"
                : "Confirm booking request"}
          </button>
        </div>
        <p className="text-center text-xs text-slate-500">No payment is taken online — we&apos;ll confirm first.</p>
      </form>
    </aside>
  );
}
