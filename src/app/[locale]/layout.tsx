import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { SiteNavbar } from "@/components/site-navbar";
import { DocumentLang } from "@/components/document-lang";
import { Footer } from "@/features/home/components/footer";
import { WhatsAppFloatingButton } from "@/features/home/components/whatsapp-floating-button";
import { ONLINE_BOOKING_DISABLED } from "@/lib/booking-availability";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import { NextIntlWithReporting } from "@/components/next-intl-with-reporting";

type LocaleLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("defaultTitle");
  const description = t("defaultDescription");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const alternates =
    siteUrl && siteUrl.length > 0
      ? {
          canonical: `${siteUrl}/${locale}`,
          languages: Object.fromEntries(
            routing.locales.map((l) => [l, `${siteUrl}/${l}`]),
          ) as Record<string, string>,
        }
      : undefined;
  return {
    title: { default: title, template: `%s | ${t("siteName")}` },
    description,
    alternates,
    openGraph: {
      siteName: t("ogSiteName"),
      title,
      description,
      locale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DocumentLang locale={locale} />
      <NextIntlWithReporting locale={locale} messages={messages}>
        <SiteNavbar />
        {children}
        <Footer />
        {ONLINE_BOOKING_DISABLED ? null : <WhatsAppFloatingButton />}
      </NextIntlWithReporting>
    </div>
  );
}
