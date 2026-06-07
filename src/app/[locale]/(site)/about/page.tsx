import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AboutContent } from "@/features/about/components/about-content";
import { getEnvValue } from "@/components/footer/footer-utils";

type AboutPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("aboutTitle");
  const description = t("defaultDescription");
  return {
    title,
    description,
    openGraph: { title, description, locale },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const companyName =
    getEnvValue("CompanyName", "NEXT_PUBLIC_SITE_NAME", "businessName") ?? "Explore Malta Rentals";

  const contact = { companyName };

  return (
    <main className="flex flex-1 flex-col">
      <AboutContent contact={contact} />
    </main>
  );
}
