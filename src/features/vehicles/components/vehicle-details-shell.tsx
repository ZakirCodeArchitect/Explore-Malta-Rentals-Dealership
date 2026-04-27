"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import { BookNowButton } from "@/features/vehicles/components/book-now-button";
import { VehicleGallery } from "@/features/vehicles/components/vehicle-gallery";
import { formatVehicleTypeLabel } from "@/features/vehicles/data/vehicles";
import { useVehicle, useVehicles } from "@/features/vehicles/lib/use-vehicles";

type VehicleDetailsShellProps = Readonly<{
  slug: string;
}>;

function VehicleTitleBlock({
  name,
  typeLabel,
  subtitle,
  brandModel,
}: Readonly<{
  name: string;
  typeLabel: string;
  subtitle: string;
  brandModel: string | null;
}>) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange)]">{typeLabel}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">{name}</h1>
      {brandModel ? <p className="mt-3 text-base font-medium text-slate-700">{brandModel}</p> : null}
      <p className="mt-3 text-base text-slate-600 sm:text-lg">{subtitle}</p>
    </>
  );
}

export function VehicleDetailsShell({ slug }: VehicleDetailsShellProps) {
  const searchParams = useSearchParams();
  const { vehicle, isLoading, error } = useVehicle(slug);
  const { vehicles: relatedVehicles } = useVehicles({ enabled: Boolean(vehicle) });

  if (isLoading) {
    return (
      <Container className="pb-16 pt-28 sm:pt-32">
        <div className="h-10 max-w-md animate-pulse rounded-md bg-slate-200/70" aria-hidden />
        <div className="mt-4 h-20 max-w-2xl animate-pulse rounded-md bg-slate-200/60" aria-hidden />
        <div className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-100/80" aria-hidden />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="pb-16 pt-28 sm:pt-32">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-8">
          <h1 className="text-xl font-semibold text-rose-900">Unable to load vehicle</h1>
          <p className="mt-2 text-sm text-rose-800">{error}</p>
          <Link href="/vehicles" className="mt-5 inline-flex text-sm font-semibold text-rose-900 underline">
            Back to vehicles
          </Link>
        </div>
      </Container>
    );
  }

  if (!vehicle) {
    return (
      <Container className="pb-16 pt-28 sm:pt-32">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8">
          <h1 className="text-xl font-semibold text-slate-900">Vehicle not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            This vehicle may be unavailable right now or has been removed.
          </p>
          <Link href="/vehicles" className="mt-5 inline-flex text-sm font-semibold text-slate-900 underline">
            Browse available vehicles
          </Link>
        </div>
      </Container>
    );
  }

  const typeLabel = formatVehicleTypeLabel(vehicle.apiVehicleType);
  const subtitle = vehicle.shortDescription ?? vehicle.tagline;
  const brandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || null;
  const galleryImages = vehicle.images;
  const mainImage = vehicle.mainImageUrl ?? vehicle.images[0] ?? null;
  const hasGallery = galleryImages.length > 1;
  const pickupDate = searchParams.get("pickupDate")?.trim() || "";
  const returnDate = searchParams.get("returnDate")?.trim() || "";
  const pickupTime = searchParams.get("pickupTime")?.trim() || "09:00";
  const returnTime = searchParams.get("returnTime")?.trim() || "09:00";
  const tripDatesCommitted = pickupDate.length > 0 && returnDate.length > 0;
  const bookingHref = (() => {
    const params = new URLSearchParams();
    if (pickupDate) {
      params.set("pickupDate", pickupDate);
    }
    if (returnDate) {
      params.set("returnDate", returnDate);
    }
    if (pickupTime) params.set("pickupTime", pickupTime);
    if (returnTime) params.set("returnTime", returnTime);
    const qs = params.toString();
    return qs.length > 0 ? `/booking?${qs}` : "/booking";
  })();
  const typeRelated = relatedVehicles
    .filter((item) => item.slug !== slug && item.apiVehicleType === vehicle.apiVehicleType)
    .slice(0, 4);

  return (
    <>
      <Container className="pb-28 pt-28 sm:pb-20 sm:pt-32">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <Link href="/vehicles" className="hover:text-slate-900">
          Vehicles
        </Link>{" "}
        / <span className="font-medium text-slate-900">{vehicle.name}</span>
      </nav>

      <header className="mt-5">
        <VehicleTitleBlock
          name={vehicle.name}
          typeLabel={typeLabel}
          subtitle={subtitle}
          brandModel={brandModel}
        />
        <div className="mt-5">
          <BookNowButton
            vehicle={vehicle}
            bookingHref={bookingHref}
            tripDatesCommitted={tripDatesCommitted}
            pickupDate={tripDatesCommitted ? pickupDate : null}
            returnDate={tripDatesCommitted ? returnDate : null}
            pickupTime={tripDatesCommitted ? pickupTime : null}
            returnTime={tripDatesCommitted ? returnTime : null}
            className="inline-flex items-center rounded-full bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2"
          />
        </div>
      </header>

      {hasGallery ? (
        <div className="mt-8">
          <VehicleGallery name={vehicle.name} images={galleryImages} />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {mainImage ? (
            <div className="relative min-h-[18rem]">
              <Image
                src={mainImage}
                alt={`${vehicle.name} main image`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          ) : (
            <div className="flex min-h-[18rem] items-center justify-center bg-slate-100 text-sm text-slate-500">
              Vehicle image coming soon
            </div>
          )}
        </div>
      )}

      <section className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">About this vehicle</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">{vehicle.description}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">Specifications</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Vehicle type</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{typeLabel}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Brand / model</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{brandModel ?? "Not specified"}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Included helmets</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{vehicle.helmetIncludedCount}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">Storage box</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {vehicle.supportsStorageBox ? "Supported" : "Not supported"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">What&apos;s included</h2>
            <ul className="mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <li>• {vehicle.helmetIncludedCount} helmet(s) included</li>
              <li>• Safety briefing at pickup</li>
              <li>• Basic insurance baseline</li>
              <li>• Email/phone support during rental</li>
              <li>• {vehicle.supportsStorageBox ? "Storage box available (optional)" : "No storage box support"}</li>
              <li>• Extras selectable during booking</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">Requirements</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>• Valid driving license matching selected vehicle category</li>
              <li>• Government-issued ID / passport at pickup</li>
              <li>• Security deposit may be required based on vehicle and add-ons</li>
              <li>• Rider/driver must comply with local road regulations</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">Pickup & return policy</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>• Pickup location: {vehicle.location}</li>
              <li>• Standard shop pickup and return supported</li>
              <li>• Off-site delivery/return options available during booking (if selected)</li>
              <li>• Bring original documents at handover</li>
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">Cancellation policy</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>• No payment is charged online during initial reservation</li>
              <li>• Availability is confirmed after hold and booking review</li>
              <li>• Contact support early for changes to avoid conflicts</li>
            </ul>
          </article>
        </div>

        <div className="lg:col-span-5">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_52px_-35px_rgba(15,23,42,0.35)] lg:sticky lg:top-[calc(env(safe-area-inset-top)+3.75rem)]">
            <p className="text-sm text-slate-500">From</p>
            <p className="mt-1 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
              EUR {vehicle.pricePerDay}
              <span className="ml-1 text-base font-medium text-slate-500">/ day</span>
            </p>
            <p className="mt-3 text-sm text-slate-600">
              {tripDatesCommitted
                ? `Trip: ${pickupDate} ${pickupTime} → ${returnDate} ${returnTime}`
                : "Select trip dates on the vehicles page first to lock availability."}
            </p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              {tripDatesCommitted ? "Available for selected window (pending final confirmation)." : "Choose trip dates first for exact availability."}
            </p>
            <div className="mt-4">
              <BookNowButton
                vehicle={vehicle}
                bookingHref={bookingHref}
                tripDatesCommitted={tripDatesCommitted}
                pickupDate={tripDatesCommitted ? pickupDate : null}
                returnDate={tripDatesCommitted ? returnDate : null}
                pickupTime={tripDatesCommitted ? pickupTime : null}
                returnTime={tripDatesCommitted ? returnTime : null}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2"
              />
            </div>
            <div className="mt-2">
              <Link
                href="/vehicles"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
              >
                Back to vehicles
              </Link>
            </div>
            {!tripDatesCommitted ? (
              <p className="mt-2 text-xs text-slate-500">
                You can still continue, but selecting dates first gives accurate availability and hold protection.
              </p>
            ) : null}
          </aside>
        </div>
      </section>

      {typeRelated.length > 0 ? (
        <section className="mt-12 border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">Related vehicles</h2>
          <p className="mt-2 text-sm text-slate-600">Similar options you may also like.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {typeRelated.map((item) => {
              const relatedParams = new URLSearchParams();
              if (pickupDate) relatedParams.set("pickupDate", pickupDate);
              if (returnDate) relatedParams.set("returnDate", returnDate);
              if (pickupTime) relatedParams.set("pickupTime", pickupTime);
              if (returnTime) relatedParams.set("returnTime", returnTime);
              const relatedHref = `/vehicles/${item.slug}${relatedParams.toString() ? `?${relatedParams.toString()}` : ""}`;
              const cardImage = item.mainImageUrl ?? item.images[0] ?? null;
              return (
                <Link
                  key={item.id}
                  href={relatedHref}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.35)] transition-colors hover:border-slate-300"
                >
                  <div className="relative h-36 overflow-hidden rounded-xl bg-slate-100">
                    {cardImage ? (
                      <Image
                        src={cardImage}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-500">
                        Vehicle image coming soon
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-orange)]">
                    {formatVehicleTypeLabel(item.apiVehicleType)}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{item.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.shortDescription ?? item.tagline}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">From EUR {item.pricePerDay}/day</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
      </Container>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-[min(100%,32rem)] items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">
            EUR {vehicle.pricePerDay}
            <span className="ml-1 text-xs font-medium text-slate-500">/ day</span>
          </p>
          <BookNowButton
            vehicle={vehicle}
            bookingHref={bookingHref}
            tripDatesCommitted={tripDatesCommitted}
            pickupDate={tripDatesCommitted ? pickupDate : null}
            returnDate={tripDatesCommitted ? returnDate : null}
            pickupTime={tripDatesCommitted ? pickupTime : null}
            returnTime={tripDatesCommitted ? returnTime : null}
            className="inline-flex min-h-10 items-center rounded-full bg-[var(--brand-orange)] px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[var(--brand-orange-strong)]"
          />
        </div>
      </div>
    </>
  );
}
