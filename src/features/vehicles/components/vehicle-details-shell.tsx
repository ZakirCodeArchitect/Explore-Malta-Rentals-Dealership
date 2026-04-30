"use client";

import { useState, useMemo } from "react";
import {
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Lock,
  MapPin,
  Shield,
  ShieldCheck,
  Star,
  Zap,
  Fuel,
  Users,
  Cpu,
  Settings2,
  BadgeCheck,
  PhoneCall,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { VehicleDetailGallery } from "@/features/vehicles/components/vehicle-detail-gallery";
import { VehicleRelatedSlider } from "@/features/vehicles/components/vehicle-related-slider";
import { formatVehicleTypeLabel, type Vehicle } from "@/features/vehicles/data/vehicles";
import { useVehicle, useVehicles } from "@/features/vehicles/lib/use-vehicles";
import { BOOKING_TIME_SLOTS } from "@/features/booking/lib/time-slots";
import {
  useVehicleAvailabilityCheck,
  vehicleIsBookableForTrip,
  holdBlockedMessageForTrip,
} from "@/features/vehicles/lib/use-vehicle-availability-check";
import { BookNowButton } from "@/features/vehicles/components/book-now-button";

/* ─────────────────────────── helpers ─────────────────────────── */

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isTripCommitted(pd: string, rd: string): boolean {
  return Boolean(pd && rd && rd > pd);
}

function rentalDays(pickupDate: string, returnDate: string): number {
  if (!pickupDate || !returnDate) return 0;
  const a = new Date(`${pickupDate}T12:00:00`);
  const b = new Date(`${returnDate}T12:00:00`);
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

/* ─────────────────────────── sub-components ──────────────────── */

function KeyInfoBar({ vehicle }: { vehicle: Vehicle }) {
  const specs = [
    {
      icon: <Cpu className="h-5 w-5" aria-hidden />,
      label: "Engine",
      value: vehicle.engine || "—",
    },
    {
      icon: <Settings2 className="h-5 w-5" aria-hidden />,
      label: "Transmission",
      value: vehicle.transmission,
    },
    {
      icon: <Fuel className="h-5 w-5" aria-hidden />,
      label: "Fuel",
      value: vehicle.fuel,
    },
    {
      icon: <Users className="h-5 w-5" aria-hidden />,
      label: "Seats",
      value: String(vehicle.seats),
    },
    {
      icon: <Shield className="h-5 w-5" aria-hidden />,
      label: "Helmets",
      value: vehicle.helmetIncludedCount > 0 ? `${vehicle.helmetIncludedCount} included` : "On request",
    },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max divide-x divide-slate-100">
        {specs.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1.5 px-5 py-4 text-center"
          >
            <span className="text-slate-500">{s.icon}</span>
            <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap">
              {s.label}
            </span>
            <span className="text-sm font-semibold text-slate-900 whitespace-nowrap">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const short = text.length > 320;

  return (
    <div>
      <p
        className={[
          "text-base leading-relaxed text-slate-600",
          !expanded && short ? "line-clamp-4" : "",
        ].join(" ")}
      >
        {text}
      </p>
      {short ? (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-3 flex items-center gap-1 text-sm font-semibold text-[var(--brand-blue)] hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown
            className={["h-4 w-4 transition-transform duration-200", expanded ? "rotate-180" : ""].join(" ")}
            aria-hidden
          />
        </button>
      ) : null}
    </div>
  );
}

function FeaturesList({ vehicle }: { vehicle: Vehicle }) {
  const items = [
    vehicle.helmetIncludedCount > 0 && `${vehicle.helmetIncludedCount} helmet(s) included`,
    vehicle.supportsStorageBox && "Storage box available",
    vehicle.transmission === "Automatic" && "Automatic transmission",
    vehicle.fuel !== "Human powered" && "Petrol engine",
    vehicle.fuel === "Human powered" && "Eco-friendly — no fuel cost",
    "Safety briefing at pickup",
    "Phone holder accessory",
    "Email & phone support during rental",
    vehicle.engine && `${vehicle.engine} engine`,
  ].filter(Boolean) as string[];

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}

function LocationSection({ location }: { location: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2.5 text-sm text-slate-700">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-orange)]" aria-hidden />
        <span>
          Pickup & return at{" "}
          <span className="font-semibold text-slate-900">{location}</span> — Explore Malta Rentals, Pietà
        </span>
      </div>
      <p className="text-xs text-slate-500">
        Hotel delivery and custom drop-off available on request — ask us on WhatsApp.
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 aspect-[16/6]">
        <iframe
          title={`Map showing ${location}`}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12971.66892988892!2d14.487860399999999!3d35.896389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130e4541df9b1f5b%3A0x88e68b52e93fdc6b!2sPiet%C3%A0%2C%20Malta!5e0!3m2!1sen!2smt!4v1700000000000"
          className="h-full w-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}

function PoliciesSection({ vehicle }: { vehicle: Vehicle }) {
  const isBike = vehicle.type !== "Bicycle";
  return (
    <dl className="grid gap-5 sm:grid-cols-2">
      <div>
        <dt className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
          Cancellation
        </dt>
        <dd className="mt-1.5 text-sm leading-relaxed text-slate-600">
          No payment charged online during initial reservation. Availability confirmed after review.
          Contact support early for changes.
        </dd>
      </div>
      <div>
        <dt className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <BadgeCheck className="h-4 w-4 text-[var(--brand-blue)]" aria-hidden />
          Licence requirement
        </dt>
        <dd className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {isBike
            ? vehicle.engine === "50cc"
              ? "Category B (standard car licence) typically accepted for 50cc — confirm at booking."
              : "Motorcycle licence required (A, A1 or A2 depending on your country)."
            : "No licence required for bicycle rental — must follow local road rules."}
        </dd>
      </div>
      <div>
        <dt className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Lock className="h-4 w-4 text-slate-500" aria-hidden />
          Security deposit
        </dt>
        <dd className="mt-1.5 text-sm leading-relaxed text-slate-600">
          {vehicle.securityDepositEUR != null
            ? `EUR ${vehicle.securityDepositEUR} refundable deposit required at handover.`
            : "Deposit amount confirmed when booking is reviewed."}
        </dd>
      </div>
      <div>
        <dt className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Shield className="h-4 w-4 text-slate-500" aria-hidden />
          Documents at pickup
        </dt>
        <dd className="mt-1.5 text-sm leading-relaxed text-slate-600">
          Valid driving licence + government-issued ID or passport required at handover.
        </dd>
      </div>
    </dl>
  );
}

/* ─────────────────────────── Booking sidebar ─────────────────── */

function formatDateDisplay(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

type BookingSidebarProps = {
  vehicle: Vehicle;
  initialPickupDate?: string;
  initialReturnDate?: string;
  initialPickupTime?: string;
  initialReturnTime?: string;
};

function BookingSidebar({
  vehicle,
  initialPickupDate = "",
  initialReturnDate = "",
  initialPickupTime,
  initialReturnTime,
}: BookingSidebarProps) {
  const minDate = todayISO();
  const defaultTime = BOOKING_TIME_SLOTS[0] ?? "09:30";
  const [pickupDate, setPickupDate] = useState(initialPickupDate);
  const [returnDate, setReturnDate] = useState(initialReturnDate);
  const [pickupTime, setPickupTime] = useState(initialPickupTime || defaultTime);
  const [returnTime, setReturnTime] = useState(initialReturnTime || defaultTime);
  const [showDateWarning, setShowDateWarning] = useState(false);

  /* When dates arrive from the URL they're already committed — skip the picker */
  const datesFromUrl = isTripCommitted(initialPickupDate, initialReturnDate);
  const [showDatePicker, setShowDatePicker] = useState(!datesFromUrl);

  const days = rentalDays(pickupDate, returnDate);

  const tripCommitted = isTripCommitted(pickupDate, returnDate);

  const availability = useVehicleAvailabilityCheck(
    vehicle.id,
    vehicle.apiVehicleType,
    tripCommitted,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
  );

  const allowHold = tripCommitted && vehicleIsBookableForTrip(availability);
  const holdBlocked = holdBlockedMessageForTrip(tripCommitted, availability);

  const bookingHref = useMemo(() => {
    const p = new URLSearchParams();
    if (pickupDate) p.set("pickupDate", pickupDate);
    if (returnDate) p.set("returnDate", returnDate);
    if (pickupTime) p.set("pickupTime", pickupTime);
    if (returnTime) p.set("returnTime", returnTime);
    const qs = p.toString();
    return qs ? `/booking?${qs}` : "/booking";
  }, [pickupDate, returnDate, pickupTime, returnTime]);

  const estimatedTotal = vehicle.pricePerDay > 0 && days > 0
    ? vehicle.pricePerDay * days
    : null;

  const dateInputClass = (hasWarning: boolean) =>
    [
      "mt-1.5 block w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2",
      hasWarning
        ? "border-rose-400 focus:border-rose-400/50 focus:ring-rose-400/20"
        : "border-slate-200 focus:border-[var(--brand-blue)]/50 focus:ring-[var(--brand-blue)]/20",
    ].join(" ");
  const timeSelectClass =
    "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition focus:border-[var(--brand-blue)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-blue)]/20";
  const labelClass = "text-xs font-semibold uppercase tracking-wide text-slate-500";

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.38)] sm:p-5 md:sticky md:top-[calc(env(safe-area-inset-top)+4rem)]">
      {/* price */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          {vehicle.pricePerDay > 0 ? (
            <p className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              EUR {vehicle.pricePerDay}
              <span className="ml-1 text-base font-medium text-slate-500">/ day</span>
            </p>
          ) : (
            <p className="text-lg font-semibold text-slate-700">Price on request</p>
          )}
          {vehicle.securityDepositEUR != null ? (
            <p className="mt-0.5 text-xs text-slate-500">
              + EUR {vehicle.securityDepositEUR} deposit (refundable)
            </p>
          ) : null}
        </div>
        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          Free cancellation
        </span>
      </div>

      <hr className="my-4 border-slate-100" />

      {/* trip fields */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <CalendarRange className="h-4 w-4 text-slate-500" aria-hidden />
            {showDatePicker ? "Select your trip" : "Your trip"}
          </p>
          {!showDatePicker && (
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="text-xs font-semibold text-[var(--brand-blue)] hover:underline"
            >
              Change dates
            </button>
          )}
        </div>

        {showDatePicker ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="sb-pickup-date" className={labelClass}>Pickup date</label>
                <input
                  id="sb-pickup-date"
                  type="date"
                  min={minDate}
                  value={pickupDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPickupDate(v);
                    if (returnDate && v && returnDate <= v) setReturnDate("");
                    if (v) setShowDateWarning(false);
                  }}
                  className={dateInputClass(showDateWarning && !pickupDate)}
                />
              </div>
              <div>
                <label htmlFor="sb-return-date" className={labelClass}>Return date</label>
                <input
                  id="sb-return-date"
                  type="date"
                  min={pickupDate || minDate}
                  value={returnDate}
                  onChange={(e) => {
                    setReturnDate(e.target.value);
                    if (e.target.value) setShowDateWarning(false);
                  }}
                  className={dateInputClass(showDateWarning && !returnDate)}
                />
              </div>
            </div>
            {showDateWarning && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Please select your trip dates to continue.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="sb-pickup-time" className={labelClass}>Pickup time</label>
                <select
                  id="sb-pickup-time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className={timeSelectClass}
                >
                  {BOOKING_TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sb-return-time" className={labelClass}>Return time</label>
                <select
                  id="sb-return-time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className={timeSelectClass}
                >
                  {BOOKING_TIME_SLOTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">Pickup</p>
                <p className="mt-0.5 font-semibold text-slate-900">{formatDateDisplay(pickupDate)}</p>
                <p className="text-xs text-slate-500">{pickupTime}</p>
              </div>
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">Return</p>
                <p className="mt-0.5 font-semibold text-slate-900">{formatDateDisplay(returnDate)}</p>
                <p className="text-xs text-slate-500">{returnTime}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* availability status */}
      {tripCommitted ? (
        <div
          className={[
            "mt-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all",
            availability.kind === "loading"
              ? "bg-slate-50 text-slate-500"
              : availability.kind === "ready" && availability.isAvailable
                ? "bg-emerald-50 text-emerald-800"
                : availability.kind === "ready" && !availability.isAvailable
                  ? "bg-rose-50 text-rose-800"
                  : availability.kind === "error"
                    ? "bg-amber-50 text-amber-800"
                    : "bg-slate-50 text-slate-500",
          ].join(" ")}
          aria-live="polite"
        >
          {availability.kind === "loading" && "Checking availability…"}
          {availability.kind === "error" && availability.message}
          {availability.kind === "ready" &&
            (availability.availabilityStatus === "available"
              ? "✓ Available for this trip"
              : availability.availabilityStatus === "reserved_temporarily"
                ? "⚠ Temporarily on hold — try different dates"
                : "✗ Not available — choose different dates")}
        </div>
      ) : null}

      {/* price breakdown */}
      {estimatedTotal !== null ? (
        <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex justify-between text-sm text-slate-600">
            <span>EUR {vehicle.pricePerDay} × {days} day{days !== 1 ? "s" : ""}</span>
            <span className="font-semibold text-slate-900">EUR {estimatedTotal}</span>
          </div>
          <p className="mt-1 text-[0.65rem] text-slate-400">
            Final price confirmed before you pay — no card taken online.
          </p>
        </div>
      ) : null}

      {/* CTA */}
      <div className="mt-4">
        <BookNowButton
          vehicle={vehicle}
          bookingHref={bookingHref}
          tripDatesCommitted={tripCommitted}
          onTripDatesRequired={() => setShowDateWarning(true)}
          allowHold={allowHold}
          holdBlockedMessage={holdBlocked}
          pickupDate={tripCommitted ? pickupDate : null}
          returnDate={tripCommitted ? returnDate : null}
          pickupTime={tripCommitted ? pickupTime : null}
          returnTime={tripCommitted ? returnTime : null}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--brand-orange)] px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_12px_32px_-14px_rgba(255,147,15,0.8)] transition hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2"
          busyClassName="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--brand-orange)]/80 px-5 py-3 text-sm font-bold text-slate-950 transition disabled:cursor-wait"
        />
      </div>

      {/* secondary CTA */}
      <a
        href="https://wa.me/35699999999"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
      >
        <PhoneCall className="h-4 w-4" aria-hidden />
        Contact us on WhatsApp
      </a>

      {/* trust row */}
      <ul className="mt-5 space-y-2">
        {[
          { icon: <ShieldCheck className="h-4 w-4 text-emerald-600" />, text: "Secure booking — no card stored" },
          { icon: <Zap className="h-4 w-4 text-[var(--brand-orange)]" />, text: "Instant hold on dates" },
          { icon: <Lock className="h-4 w-4 text-slate-500" />, text: "Your details used only for this rental" },
        ].map(({ icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-xs text-slate-600">
            {icon}
            {text}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ─────────────────────────── skeleton ───────────────────────── */

function Skeleton() {
  return (
    <div className="pt-24">
      <div className="h-72 animate-pulse bg-slate-100 sm:rounded-2xl" />
      <Container className="pb-20 pt-8">
        <div className="h-8 max-w-sm animate-pulse rounded-xl bg-slate-200/70" />
        <div className="mt-3 h-5 max-w-xs animate-pulse rounded-xl bg-slate-200/50" />
        <div className="mt-6 h-24 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-7">
            {[
              { h: 80, id: "a" },
              { h: 120, id: "b" },
              { h: 80, id: "c" },
            ].map(({ h, id }) => (
              <div
                key={id}
                style={{ height: h }}
                className="animate-pulse rounded-2xl bg-slate-100/80"
              />
            ))}
          </div>
          <div className="lg:col-span-5">
            <div className="h-72 animate-pulse rounded-2xl bg-slate-100/80" />
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ─────────────────────────── main shell ─────────────────────── */

type VehicleDetailsShellProps = Readonly<{
  slug: string;
  initialPickupDate?: string;
  initialReturnDate?: string;
  initialPickupTime?: string;
  initialReturnTime?: string;
}>;

export function VehicleDetailsShell({
  slug,
  initialPickupDate = "",
  initialReturnDate = "",
  initialPickupTime = "",
  initialReturnTime = "",
}: VehicleDetailsShellProps) {
  const t = useTranslations("VehicleDetail");
  const { vehicle, isLoading, error } = useVehicle(slug);
  const { vehicles: allVehicles } = useVehicles({ enabled: Boolean(vehicle) });

  if (isLoading) return <Skeleton />;

  if (error) {
    return (
      <Container className="pb-16 pt-28 sm:pt-32">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8">
          <h1 className="text-xl font-semibold text-rose-900">{t("unableLoadTitle")}</h1>
          <p className="mt-2 text-sm text-rose-800">{error}</p>
          <Link href="/vehicles" className="mt-5 inline-flex text-sm font-semibold text-rose-900 underline">
            {t("backToVehicles")}
          </Link>
        </div>
      </Container>
    );
  }

  if (!vehicle) {
    return (
      <Container className="pb-16 pt-28 sm:pt-32">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8">
          <h1 className="text-xl font-semibold text-slate-900">{t("notFoundTitle")}</h1>
          <p className="mt-2 text-sm text-slate-600">{t("notFoundBody")}</p>
          <Link href="/vehicles" className="mt-5 inline-flex text-sm font-semibold text-slate-900 underline">
            {t("browseVehicles")}
          </Link>
        </div>
      </Container>
    );
  }

  const typeLabel = formatVehicleTypeLabel(vehicle.apiVehicleType);
  const brandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || null;

  return (
    <>
      {/* ─── HERO IMAGE (full-width, above container) ────────── */}
      <div>
        <Container className="pb-24 pt-28 sm:pt-32 md:pb-16">
          {/* breadcrumb */}
          <nav aria-label={t("breadcrumb")} className="mb-4 text-xs text-slate-500">
            <Link href="/vehicles" className="hover:text-slate-900">
              {t("vehiclesCrumb")}
            </Link>
            {" / "}
            <span className="font-medium text-slate-900">{vehicle.name}</span>
          </nav>

          {/* title block */}
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange)]">
                {typeLabel}
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl md:text-4xl">
                {vehicle.name}
              </h1>
              {brandModel ? (
                <p className="mt-1.5 text-base font-medium text-slate-600">{brandModel}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-[var(--brand-orange)]" aria-hidden />
                  {vehicle.location}, Malta
                </div>
                {vehicle.rating > 0 ? (
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Star className="h-3.5 w-3.5 fill-[var(--brand-orange)] text-[var(--brand-orange)]" aria-hidden />
                    <span className="font-semibold text-slate-900">{vehicle.rating.toFixed(1)}</span>
                    <span>({vehicle.reviewCount} reviews)</span>
                  </div>
                ) : null}
                {/* badges */}
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand-orange)]/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-[var(--brand-orange-strong)]">
                  <Zap className="h-3 w-3" aria-hidden />
                  Popular
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.65rem] font-semibold text-emerald-800">
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  Verified vehicle
                </span>
              </div>
            </div>
          </div>

          {/* gallery */}
          <VehicleDetailGallery name={vehicle.name} images={vehicle.images} />

          {/* key info bar */}
          <div className="mt-6">
            <KeyInfoBar vehicle={vehicle} />
          </div>

          {/* main 2-col grid */}
          <div className="mt-8 grid gap-8 md:grid-cols-12 md:gap-10">
            {/* ── LEFT column — content sections ──────────── */}
            <div className="order-2 space-y-10 md:order-none md:col-span-7">

              {/* About */}
              <section aria-labelledby="v-about-h">
                <h2 id="v-about-h" className="text-xl font-bold tracking-[-0.02em] text-slate-950">
                  About this vehicle
                </h2>
                <div className="mt-3">
                  <ExpandableDescription text={vehicle.description} />
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* What's included */}
              <section aria-labelledby="v-features-h">
                <h2 id="v-features-h" className="text-xl font-bold tracking-[-0.02em] text-slate-950">
                  What&apos;s included
                </h2>
                <div className="mt-4">
                  <FeaturesList vehicle={vehicle} />
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Specifications */}
              <section aria-labelledby="v-specs-h">
                <h2 id="v-specs-h" className="text-xl font-bold tracking-[-0.02em] text-slate-950">
                  Specifications
                </h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Vehicle type", value: typeLabel },
                    { label: "Brand / Model", value: brandModel ?? "Not specified" },
                    { label: "Engine", value: vehicle.engine || "—" },
                    { label: "Transmission", value: vehicle.transmission },
                    { label: "Fuel", value: vehicle.fuel },
                    { label: "Seats", value: String(vehicle.seats) },
                    { label: "Color", value: vehicle.color },
                    { label: "Storage box", value: vehicle.supportsStorageBox ? "Supported (optional add-on)" : "Not supported" },
                    { label: "Helmets included", value: String(vehicle.helmetIncludedCount) },
                    { label: "Pickup location", value: vehicle.location },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl bg-slate-50/80 px-4 py-3">
                      <dt className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
                        {label}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <hr className="border-slate-100" />

              {/* Location */}
              <section aria-labelledby="v-location-h">
                <h2 id="v-location-h" className="text-xl font-bold tracking-[-0.02em] text-slate-950">
                  Location &amp; pickup
                </h2>
                <div className="mt-4">
                  <LocationSection location={vehicle.location} />
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Policies */}
              <section aria-labelledby="v-policies-h">
                <h2 id="v-policies-h" className="text-xl font-bold tracking-[-0.02em] text-slate-950">
                  Policies &amp; requirements
                </h2>
                <div className="mt-4">
                  <PoliciesSection vehicle={vehicle} />
                </div>
              </section>
            </div>

            {/* ── RIGHT column: booking sidebar ───────────── */}
            <div className="order-1 md:order-none md:col-span-5">
              <BookingSidebar
                vehicle={vehicle}
                initialPickupDate={initialPickupDate}
                initialReturnDate={initialReturnDate}
                initialPickupTime={initialPickupTime}
                initialReturnTime={initialReturnTime}
              />
            </div>
          </div>

          {/* Related vehicles slider */}
          <VehicleRelatedSlider vehicles={allVehicles} currentSlug={vehicle.slug} />
        </Container>
      </div>


      {/* ─── MOBILE bottom sticky bar (hidden once 2-col sidebar is visible) ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div>
            {vehicle.pricePerDay > 0 ? (
              <p className="text-lg font-bold text-slate-950">
                EUR {vehicle.pricePerDay}
                <span className="ml-1 text-xs font-medium text-slate-500">/day</span>
              </p>
            ) : (
              <p className="text-sm font-semibold text-slate-700">Price on request</p>
            )}
            <p className="text-xs text-slate-500">Free cancellation</p>
          </div>
          <Link
            href={(() => {
              const p = new URLSearchParams();
              p.set("vehicle", vehicle.slug);
              if (initialPickupDate) p.set("pickupDate", initialPickupDate);
              if (initialReturnDate) p.set("returnDate", initialReturnDate);
              if (initialPickupTime) p.set("pickupTime", initialPickupTime);
              if (initialReturnTime) p.set("returnTime", initialReturnTime);
              return `/booking?${p.toString()}`;
            })()}
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--brand-orange)] px-6 text-sm font-bold text-slate-950 shadow-[0_8px_24px_-10px_rgba(255,147,15,0.7)] transition hover:bg-[var(--brand-orange-strong)]"
          >
            Reserve now
          </Link>
        </div>
      </div>
    </>
  );
}
