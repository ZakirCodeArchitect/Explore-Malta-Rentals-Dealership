import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEnvValue } from "@/components/footer/footer-utils";
import { TourContent } from "@/features/tours/components/tour-content";

type ToursPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: ToursPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("toursTitle"),
    description: t("toursDescription"),
    openGraph: {
      title: t("toursTitle"),
      description: t("toursDescription"),
      locale,
      type: "website",
    },
  };
}

export default async function ToursPage({ params }: ToursPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const companyName =
    getEnvValue("CompanyName", "NEXT_PUBLIC_SITE_NAME", "businessName") ?? "Explore Malta Rentals";

  const contact = { companyName };

  return (
    <main className="flex flex-1 flex-col">
      <TourContent contact={contact} />
    </main>
  );
}
