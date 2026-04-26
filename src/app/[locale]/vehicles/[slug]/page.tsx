import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VehicleDetailsShell } from "@/features/vehicles/components/vehicle-details-shell";

type VehicleDetailsPageProps = Readonly<{
  params: Promise<{ locale: string; slug: string }>;
}>;

export async function generateMetadata({ params }: VehicleDetailsPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("vehicleDetailTitle");
  const description = t("vehicleDetailDescription", { slug });
  return {
    title,
    description,
    openGraph: { title, description, locale },
  };
}

export default async function VehicleDetailsPage({ params }: VehicleDetailsPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex flex-1 flex-col bg-[var(--background)]">
      <VehicleDetailsShell slug={slug} />
    </main>
  );
}
