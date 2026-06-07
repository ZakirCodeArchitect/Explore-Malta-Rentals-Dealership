import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";

type AdminUnauthorizedPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function AdminUnauthorizedPage({ params }: AdminUnauthorizedPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin" });

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center py-16 text-center">
      <h1 className="text-2xl font-bold text-slate-950">{t("unauthorizedTitle")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{t("unauthorizedDescription")}</p>
      <Link
        href={`/${locale}/admin/login`}
        className="mt-6 inline-flex rounded-lg bg-[var(--brand-orange)] px-4 py-2.5 text-sm font-bold text-[#0f2233] transition hover:bg-[var(--brand-orange-strong)]"
      >
        {t("backToLogin")}
      </Link>
    </div>
  );
}
