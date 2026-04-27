import Image from "next/image";
import Link from "next/link";
import { formatVehicleTypeLabel, type Vehicle } from "@/features/vehicles/data/vehicles";
import {
  BookNowButton,
  buildBookingUrlWithVehicle,
} from "@/features/vehicles/components/book-now-button";

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
            Vehicle image coming soon
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-slate-900">
          {formatVehicleTypeLabel(vehicle.apiVehicleType)}
        </span>
        {status === "reserved_other" ? (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-semibold text-slate-950 shadow-sm">
            Reserved
          </span>
        ) : null}
        {status === "reserved_you" ? (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-600/95 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Your hold
          </span>
        ) : null}
        {status === "unavailable" ? (
          <span className="absolute right-3 top-3 rounded-full bg-slate-800/92 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Unavailable
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">{vehicle.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{vehicle.shortDescription ?? vehicle.tagline}</p>
          {brandModel ? <p className="mt-1 text-xs text-slate-500">{brandModel}</p> : null}
          {status === "reserved_you" ? (
            <p className="mt-2 text-xs font-medium text-emerald-800">
              You have an active reservation for this vehicle for the selected dates. Continue to complete
              your booking.
            </p>
          ) : null}
          {status === "reserved_other" ? (
            <p className="mt-2 text-xs font-medium text-amber-900">
              Temporarily on hold for these dates — another customer may be completing checkout.
            </p>
          ) : null}
          {status === "unavailable" ? (
            <p className="mt-2 text-xs font-medium text-slate-700">
              Not available for the selected pickup and return window.
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-slate-800">
            {vehicle.helmetIncludedCount} helmet{vehicle.helmetIncludedCount === 1 ? "" : "s"}
          </span>
          <p className="text-xs text-slate-600">
            {vehicle.supportsStorageBox ? "Storage box supported" : "No storage box"}
          </p>
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-200 pt-3">
          <div className="flex items-center gap-2">
            <Link
              href={detailsHref ?? `/vehicles/${vehicle.slug}`}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors duration-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
            >
              View details
            </Link>
            {status === "reserved_you" ? (
              <Link
                href={completeBookingHref}
                className="inline-flex items-center rounded-md bg-[var(--brand-orange)] px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors duration-300 hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2"
              >
                Complete booking
              </Link>
            ) : status === "reserved_other" || status === "unavailable" ? (
              <span
                aria-disabled
                className="inline-flex cursor-not-allowed items-center rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500"
              >
                {status === "reserved_other" ? "On hold" : "Unavailable"}
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
