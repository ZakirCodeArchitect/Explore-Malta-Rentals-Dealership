import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { SiteNavbar } from "@/components/site-navbar";
import { DocumentLang } from "@/components/document-lang";
import { Footer } from "@/features/home/components/footer";
import { WhatsAppFloatingButton } from "@/features/home/components/whatsapp-floating-button";
import { routing } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

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
  return {
    title: { default: title, template: `%s | ${t("siteName")}` },
    description,
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
      <NextIntlClientProvider locale={locale} messages={messages}>
        <SiteNavbar />
        {children}
        <Footer />
        <WhatsAppFloatingButton />
      </NextIntlClientProvider>
    </div>
  );
}
