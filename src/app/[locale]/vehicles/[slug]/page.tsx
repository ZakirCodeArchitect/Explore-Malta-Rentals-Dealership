import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VehicleDetailsShell } from "@/features/vehicles/components/vehicle-details-shell";

type VehicleDetailsPageProps = Readonly<{
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
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

export default async function VehicleDetailsPage({ params, searchParams }: VehicleDetailsPageProps) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const initialPickupDate = str(sp.pickupDate);
  const initialReturnDate = str(sp.returnDate);
  const initialPickupTime = str(sp.pickupTime);
  const initialReturnTime = str(sp.returnTime);

  return (
    <main className="flex flex-1 flex-col bg-[var(--background)]">
      <VehicleDetailsShell
        slug={slug}
        initialPickupDate={initialPickupDate}
        initialReturnDate={initialReturnDate}
        initialPickupTime={initialPickupTime}
        initialReturnTime={initialReturnTime}
      />
    </main>
  );
}
