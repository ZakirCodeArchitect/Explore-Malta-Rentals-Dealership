import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { VehicleListingShell } from "@/features/vehicles/components/vehicle-listing-shell";

type VehiclesPageProps = Readonly<{
  params: Promise<{ locale: string }>;
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

export default async function VehiclesPage({ params }: VehiclesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "VehiclesPage" });
  const heroIntro = {
    title: t("heroTitle"),
    description: t("heroDescription"),
  } as const;

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
        <VehicleListingShell heroIntro={heroIntro} />
      </Suspense>
    </main>
  );
}
