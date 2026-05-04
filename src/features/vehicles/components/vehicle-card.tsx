import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatVehicleTypeLabel, type Vehicle } from "@/features/vehicles/data/vehicles";
import {
  BookNowButton,
  buildBookingUrlWithVehicle,
} from "@/features/vehicles/components/book-now-button";
import { BookingDisabledCtaContent } from "@/components/booking/booking-disabled-cta-content";
import { ONLINE_BOOKING_DISABLED } from "@/lib/booking-availability";

type VehicleCardProps = Readonly<{
  vehicle: Vehicle;
  bookingHref?: string;
  detailsHref?: string;
  tripDatesCommitted?: boolean;
  onTripDatesRequired?: () => void;
  pickupDate?: string | null;
  returnDate?: string | null;
  pickupTime?: string | null;
  returnTime?: string | null;
}>;

export function VehicleCard({
  vehicle,
  bookingHref = "/booking",
  detailsHref,
  tripDatesCommitted = true,
  onTripDatesRequired,
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
}: VehicleCardProps) {
  const t = useTranslations("VehicleCard");
  const mainImage = vehicle.mainImageUrl ?? vehicle.images[0] ?? null;
  const brandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");
  const status = vehicle.rentalWindowStatus;
  const completeBookingHref = buildBookingUrlWithVehicle(bookingHref, vehicle.slug);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/85 bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-safe:hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={vehicle.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
            {t("imageSoon")}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-slate-900">
          {formatVehicleTypeLabel(vehicle.apiVehicleType)}
        </span>
        {status === "reserved_other" ? (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-semibold text-slate-950 shadow-sm">
            {t("reserved")}
          </span>
        ) : null}
        {status === "reserved_you" ? (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-600/95 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {t("yourHold")}
          </span>
        ) : null}
        {status === "unavailable" ? (
          <span className="absolute right-3 top-3 rounded-full bg-slate-800/92 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {t("unavailable")}
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">{vehicle.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{vehicle.shortDescription ?? vehicle.tagline}</p>
          {brandModel ? <p className="mt-1 text-xs text-slate-500">{brandModel}</p> : null}
          {status === "reserved_you" ? (
            <p className="mt-2 text-xs font-medium text-emerald-800">{t("holdNotice")}</p>
          ) : null}
          {status === "reserved_other" ? (
            <p className="mt-2 text-xs font-medium text-amber-900">{t("reservedOtherNotice")}</p>
          ) : null}
          {status === "unavailable" ? (
            <p className="mt-2 text-xs font-medium text-slate-700">{t("unavailableWindow")}</p>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-slate-800">
            {t("helmetsInline", { count: vehicle.helmetIncludedCount })}
          </span>
          <p className="text-xs text-slate-600">
            {vehicle.supportsStorageBox ? t("storageYes") : t("storageNo")}
          </p>
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-200 pt-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href={detailsHref ?? `/vehicles/${vehicle.slug}`}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors duration-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
            >
              {t("viewDetails")}
            </Link>
            {status === "reserved_you" ? (
              ONLINE_BOOKING_DISABLED ? (
                <span
                  aria-disabled
                  className="inline-flex cursor-not-allowed items-center rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500"
                >
                  <BookingDisabledCtaContent iconClassName="h-3.5 w-3.5 shrink-0 opacity-90" />
                </span>
              ) : (
                <Link
                  href={completeBookingHref}
                  className="inline-flex items-center rounded-md bg-[var(--brand-orange)] px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors duration-300 hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2"
                >
                  {t("completeBooking")}
                </Link>
              )
            ) : status === "reserved_other" || status === "unavailable" ? (
              <span
                aria-disabled
                className="inline-flex cursor-not-allowed items-center rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500"
              >
                {status === "reserved_other" ? t("onHold") : t("unavailableShort")}
              </span>
            ) : (
              <BookNowButton
                vehicle={vehicle}
                bookingHref={bookingHref}
                tripDatesCommitted={tripDatesCommitted}
                onTripDatesRequired={onTripDatesRequired}
                pickupDate={pickupDate}
                returnDate={returnDate}
                pickupTime={pickupTime}
                returnTime={returnTime}
                inlineWithSiblingActions
                className="inline-flex items-center rounded-md bg-[var(--brand-orange)] px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors duration-300 hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                busyClassName="inline-flex items-center rounded-md bg-[var(--brand-orange)]/80 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-90"
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
