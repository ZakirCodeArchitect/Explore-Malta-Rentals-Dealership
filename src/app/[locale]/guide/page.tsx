import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getEnvValue } from "@/components/footer/footer-utils";
import { GuideContent } from "@/features/guide/components/guide-content";
import { SITE_CONTACT, SITE_GOOGLE_MAPS_URL } from "@/lib/site-brand-copy";

type GuidePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("guideTitle"),
    description: t("guideDescription"),
    openGraph: {
      title: t("guideTitle"),
      description: t("guideDescription"),
      locale,
      type: "website",
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const location = getEnvValue("location") ?? SITE_GOOGLE_MAPS_URL;
  const address = getEnvValue("address") ?? SITE_CONTACT.address;

  return (
    <main className="flex flex-1 flex-col">
      <GuideContent location={location.replace(/^"|"$/g, "")} address={address} />
    </main>
  );
}
