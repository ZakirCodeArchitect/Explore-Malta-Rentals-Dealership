import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

type PrivacyPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("privacyTitle"),
    description: t("privacyDescription"),
    openGraph: {
      title: t("privacyTitle"),
      description: t("privacyDescription"),
      locale,
      type: "website",
    },
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PrivacyPage");

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-[var(--brand-orange)]">{t("legalKicker")}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
        {t("title")}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-600">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex text-sm font-semibold text-slate-900 underline decoration-[var(--brand-orange)]/45 underline-offset-4 transition-colors hover:text-[var(--brand-orange-strong)] hover:underline hover:decoration-[var(--brand-orange)]"
      >
        {t("backToHome")}
      </Link>
    </main>
  );
}
