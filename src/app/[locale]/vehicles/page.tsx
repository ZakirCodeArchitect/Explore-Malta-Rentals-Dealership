import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { mapVehicleListItemToVehicle, type Vehicle } from "@/features/vehicles/data/vehicles";
import { VehicleListingShell } from "@/features/vehicles/components/vehicle-listing-shell";
import { BookingSearchFormFromUrl } from "@/features/booking/components/booking-search-form-from-url";
import { getVehicles } from "@/lib/vehicles";

type VehiclesPageProps = Readonly<{
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

export async function generateMetadata({ params }: VehiclesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("vehiclesTitle");
  const description = t("vehiclesDescription");
  return {
    title,
    description,
    openGraph: { title, description, locale },
  };
}

export default async function VehiclesPage({ params, searchParams }: VehiclesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = (await searchParams) ?? {};
  const t = await getTranslations({ locale, namespace: "VehiclesPage" });
  const heroIntro = {
    title: t("heroTitle"),
    description: t("heroDescription"),
  } as const;

  const pickupDateRaw = resolvedSearchParams.pickupDate ?? resolvedSearchParams.date;
  const returnDateRaw = resolvedSearchParams.returnDate ?? resolvedSearchParams.dropoffDate;
  const pickupTimeRaw = resolvedSearchParams.pickupTime;
  const returnTimeRaw = resolvedSearchParams.dropoffTime;

  const pickupDate = typeof pickupDateRaw === "string" ? pickupDateRaw.trim() : "";
  const returnDate = typeof returnDateRaw === "string" ? returnDateRaw.trim() : "";
  const pickupTime = typeof pickupTimeRaw === "string" ? pickupTimeRaw.trim() : "";
  const returnTime = typeof returnTimeRaw === "string" ? returnTimeRaw.trim() : "";

  const shouldHydrateAvailabilityFromApi =
    pickupDate.length > 0 &&
    returnDate.length > 0 &&
    pickupTime.length > 0 &&
    returnTime.length > 0;

  let initialVehicles: Vehicle[] | undefined;
  if (!shouldHydrateAvailabilityFromApi) {
    const baseVehicles = await getVehicles();
    initialVehicles = baseVehicles.vehicles.map(mapVehicleListItemToVehicle);
  }

  return (
    <main className="flex flex-1 flex-col bg-[var(--background)]">
      <Suspense
        fallback={
          <Container className="pb-16 pt-28 sm:pt-32">
            <div
              className="h-10 max-w-md animate-pulse rounded-md bg-slate-200/70"
              aria-hidden
            />
            <div
              className="mt-4 h-20 max-w-2xl animate-pulse rounded-md bg-slate-200/60"
              aria-hidden
            />
            <div
              className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-100/80"
              aria-hidden
            />
          </Container>
        }
      >
        <VehicleListingShell
          heroIntro={heroIntro}
          vehicles={initialVehicles}
          searchPanel={
            <Suspense fallback={<div className="h-[440px] animate-pulse rounded-2xl bg-white/10" aria-hidden />}>
              <BookingSearchFormFromUrl />
            </Suspense>
          }
        />
      </Suspense>
    </main>
  );
}
