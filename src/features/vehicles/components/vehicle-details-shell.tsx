"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { VehicleBookingCard } from "@/features/vehicles/components/vehicle-booking-card";
import { VehicleGallery } from "@/features/vehicles/components/vehicle-gallery";
import { formatVehicleTypeLabel } from "@/features/vehicles/data/vehicles";
import { useVehicle } from "@/features/vehicles/lib/use-vehicles";

type VehicleDetailsShellProps = Readonly<{
  slug: string;
}>;

function VehicleTitleBlock({
  slug,
  name,
  typeLabel,
  subtitle,
  brandModel,
}: Readonly<{
  slug: string;
  name: string;
  typeLabel: string;
  subtitle: string;
  brandModel: string | null;
}>) {
  const t = useTranslations("VehicleDetail");
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange)]">{typeLabel}</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">{name}</h1>
      {brandModel ? <p className="mt-3 text-base font-medium text-slate-700">{brandModel}</p> : null}
      <p className="mt-3 text-base text-slate-600 sm:text-lg">{subtitle}</p>
      <div className="mt-5">
        <Link
          href={`/booking?vehicle=${encodeURIComponent(slug)}`}
          className="inline-flex items-center rounded-full bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2"
        >
          {t("bookNow")}
        </Link>
      </div>
    </>
  );
}

export function VehicleDetailsShell({ slug }: VehicleDetailsShellProps) {
  const t = useTranslations("VehicleDetail");
  const { vehicle, isLoading, error } = useVehicle(slug);

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
  const subtitle = vehicle.shortDescription ?? vehicle.tagline;
  const brandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ") || null;
  const galleryImages = vehicle.images;
  const mainImage = vehicle.mainImageUrl ?? vehicle.images[0] ?? null;
  const hasGallery = galleryImages.length > 1;

  return (
    <Container className="pb-16 pt-28 sm:pt-32">
      <nav aria-label={t("breadcrumb")} className="text-sm text-slate-600">
        <Link href="/vehicles" className="hover:text-slate-900">
          {t("vehiclesCrumb")}
        </Link>{" "}
        / <span className="font-medium text-slate-900">{vehicle.name}</span>
      </nav>

      <header className="mt-5">
        <VehicleTitleBlock
          slug={vehicle.slug}
          name={vehicle.name}
          typeLabel={typeLabel}
          subtitle={subtitle}
          brandModel={brandModel}
        />
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
                alt={t("mainImageAlt", { name: vehicle.name })}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
          ) : (
            <div className="flex min-h-[18rem] items-center justify-center bg-slate-100 text-sm text-slate-500">
              {t("imageSoon")}
            </div>
          )}
        </div>
      )}

      <section className="mt-10 grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">{t("aboutHeading")}</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">{vehicle.description}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">{t("specificationsHeading")}</h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">{t("specVehicleType")}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{typeLabel}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">{t("specBrandModel")}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{brandModel ?? t("notSpecified")}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">{t("specHelmets")}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{vehicle.helmetIncludedCount}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <dt className="text-xs uppercase tracking-wide text-slate-500">{t("specStorageBox")}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {vehicle.supportsStorageBox ? t("storageSupported") : t("storageNotSupported")}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <div className="lg:col-span-5">
          <VehicleBookingCard vehicle={vehicle} />
        </div>
      </section>
    </Container>
  );
}
