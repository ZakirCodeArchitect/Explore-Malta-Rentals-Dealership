import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { formatVehicleTypeLabel, type Vehicle } from "@/features/vehicles/data/vehicles";
import { BookNowButton } from "@/features/vehicles/components/book-now-button";
import { buildBookingUrlWithVehicle } from "@/features/vehicles/lib/build-booking-url-with-vehicle";

type VehicleCardServerProps = Readonly<{
  vehicle: Vehicle;
  bookingHref?: string;
  detailsHref?: string;
  tripDatesCommitted?: boolean;
  pickupDate?: string | null;
  returnDate?: string | null;
  pickupTime?: string | null;
  returnTime?: string | null;
  priorityImage?: boolean;
}>;

/* Keep these class strings in sync with the client `VehicleCard` — both render the same card. */
const photoPlateClass =
  "relative aspect-[4/3] overflow-hidden bg-[linear-gradient(155deg,var(--ink-50)_0%,var(--surface-sunken)_58%,var(--ink-100)_100%)]";

const floatingChipClass =
  "type-spec absolute left-3 top-3 inline-flex items-center rounded-full border border-white/60 bg-white/85 px-2.5 py-1.5 text-[var(--ink-800)] shadow-sm backdrop-blur-md";

const statusChipClass =
  "type-spec absolute right-3 top-3 inline-flex items-center rounded-full px-2.5 py-1.5 shadow-sm";

const specRibbonClass =
  "mt-4 grid grid-cols-2 divide-x divide-[var(--line-subtle)] border-y border-[var(--line-subtle)]";

const specCellClass = "type-spec flex items-center py-2.5 text-[var(--text-muted)]";

const ghostActionClass =
  "inline-flex min-h-10 flex-1 items-center justify-center rounded-[var(--r-field)] border border-[var(--line)] bg-[var(--surface-card)] px-3 text-[0.8125rem] font-semibold text-[var(--ink-800)] transition-[background-color,border-color,color,transform] duration-[var(--dur-fast)] ease-[var(--ease-standard)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink-950)] active:scale-[0.985]";

const primaryActionClass =
  "inline-flex min-h-10 w-full items-center justify-center rounded-[var(--r-field)] bg-[var(--orange-400)] px-3 text-[0.8125rem] font-semibold text-[var(--ink-950)] shadow-[var(--elev-orange)] transition-[background-color,box-shadow,transform] duration-[var(--dur-fast)] ease-[var(--ease-standard)] hover:bg-[var(--orange-500)] hover:shadow-[var(--elev-orange-lift)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none";

const primaryActionBusyClass =
  "inline-flex min-h-10 w-full cursor-not-allowed items-center justify-center rounded-[var(--r-field)] bg-[var(--orange-300)] px-3 text-[0.8125rem] font-semibold text-[var(--ink-950)] opacity-90 transition-colors duration-[var(--dur-fast)]";

const disabledActionClass =
  "inline-flex min-h-10 flex-1 cursor-not-allowed items-center justify-center rounded-[var(--r-field)] border border-[var(--line-subtle)] bg-[var(--surface-sunken)] px-3 text-[0.8125rem] font-semibold text-[var(--text-faint)]";

export async function VehicleCardServer({
  vehicle,
  bookingHref = "/booking",
  detailsHref,
  tripDatesCommitted = true,
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
  priorityImage = false,
}: VehicleCardServerProps) {
  const t = await getTranslations("VehicleCard");
  const mainImage = vehicle.mainImageUrl ?? vehicle.images[0] ?? null;
  const brandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");
  const status = vehicle.rentalWindowStatus;
  const completeBookingHref = buildBookingUrlWithVehicle(bookingHref, vehicle.slug);

  return (
    <article className="surface-card lift group flex h-full flex-col overflow-hidden">
      <div className={photoPlateClass}>
        {mainImage ? (
          <Image
            src={mainImage}
            alt={vehicle.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-[var(--dur-slower)] ease-[var(--ease-out-expo)] will-change-transform motion-safe:group-hover:scale-[1.06]"
            priority={priorityImage}
            loading={priorityImage ? undefined : "lazy"}
          />
        ) : (
          <div className="type-spec flex h-full items-center justify-center px-6 text-center text-[var(--text-faint)]">
            {t("imageSoon")}
          </div>
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgb(10_20_32/0.28),transparent)]"
        />
        <span className={floatingChipClass}>
          {formatVehicleTypeLabel(vehicle.apiVehicleType)}
        </span>
        {status === "reserved_other" ? (
          <span
            className={`${statusChipClass} bg-[var(--orange-400)] text-[var(--ink-950)]`}
          >
            {t("reserved")}
          </span>
        ) : null}
        {status === "reserved_you" ? (
          <span className={`${statusChipClass} bg-emerald-600 text-white`}>
            {t("yourHold")}
          </span>
        ) : null}
        {status === "unavailable" ? (
          <span
            className={`${statusChipClass} bg-[var(--surface-inverse)] text-white`}
          >
            {t("unavailable")}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div>
          <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.025em] text-[var(--ink-950)]">
            {vehicle.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[0.8125rem] leading-relaxed text-[var(--text-secondary)]">
            {vehicle.shortDescription ?? vehicle.tagline}
          </p>
          {brandModel ? (
            <p className="mt-2 text-xs font-medium text-[var(--text-faint)]">{brandModel}</p>
          ) : null}
          {status === "reserved_you" ? (
            <p className="mt-3 rounded-[var(--r-field)] bg-emerald-50 px-3 py-2 text-xs font-medium leading-relaxed text-emerald-900">
              {t("holdNotice")}
            </p>
          ) : null}
          {status === "reserved_other" ? (
            <p className="mt-3 rounded-[var(--r-field)] bg-[var(--orange-50)] px-3 py-2 text-xs font-medium leading-relaxed text-[var(--orange-900)]">
              {t("reservedOtherNotice")}
            </p>
          ) : null}
          {status === "unavailable" ? (
            <p className="mt-3 rounded-[var(--r-field)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-medium leading-relaxed text-[var(--text-secondary)]">
              {t("unavailableWindow")}
            </p>
          ) : null}
        </div>

        <ul className={specRibbonClass}>
          <li className={`${specCellClass} pr-3`}>
            {t("helmetsInline", { count: vehicle.helmetIncludedCount })}
          </li>
          <li className={`${specCellClass} pl-3`}>
            {vehicle.supportsStorageBox ? t("storageYes") : t("storageNo")}
          </li>
        </ul>

        <div className="mt-auto pt-4">
          {vehicle.pricePerDay > 0 ? (
            <p
              data-numeric
              className="text-[1.3125rem] font-bold leading-none tracking-[-0.035em] text-[var(--ink-950)]"
            >
              {t("fromPerDay", { price: vehicle.pricePerDay })}
            </p>
          ) : (
            <p className="text-sm font-semibold text-[var(--text-muted)]">
              {t("priceOnRequest")}
            </p>
          )}

          <div className="mt-4 flex items-stretch gap-2">
            <Link
              href={detailsHref ?? `/vehicles/${vehicle.slug}`}
              className={ghostActionClass}
            >
              {t("viewDetails")}
            </Link>
            {status === "reserved_you" ? (
              <Link
                href={completeBookingHref}
                className={`${primaryActionClass} flex-1`}
              >
                {t("completeBooking")}
              </Link>
            ) : status === "reserved_other" || status === "unavailable" ? (
              <span aria-disabled className={disabledActionClass}>
                {status === "reserved_other" ? t("onHold") : t("unavailableShort")}
              </span>
            ) : (
              <BookNowButton
                vehicle={vehicle}
                bookingHref={bookingHref}
                tripDatesCommitted={tripDatesCommitted}
                pickupDate={pickupDate}
                returnDate={returnDate}
                pickupTime={pickupTime}
                returnTime={returnTime}
                className={primaryActionClass}
                busyClassName={primaryActionBusyClass}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
