import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VideoHero } from "@/features/home/components/video-hero";
import { BikeCategoriesSection } from "@/features/home/components/bike-categories-section";
import { HighlightedServicesSection } from "@/features/home/components/highlighted-services-section";
import { QuickBookingCtaSection } from "@/features/home/components/quick-booking-cta-section";
import { ContactSection } from "@/features/home/components/contact-section";
import { FaqSection } from "@/features/home/components/faq-section";

type HomePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("homeTitle");
  const description = t("defaultDescription");
  return {
    title,
    description,
    openGraph: { title, description, locale },
  };
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex flex-1 flex-col">
      <VideoHero />
      <BikeCategoriesSection />
      <HighlightedServicesSection />
      <FaqSection />
      <QuickBookingCtaSection />
      <ContactSection />
    </main>
  );
}
