import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminHotelPartnerForm } from "@/features/admin/components/admin-hotel-partner-form";

export const dynamic = "force-dynamic";

type AdminNewHotelPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function AdminNewHotelPage({ params }: AdminNewHotelPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.hotels" });

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">{t("createTitle")}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("createDescription")}</p>
      </section>
      <AdminHotelPartnerForm locale={locale} mode="create" />
    </div>
  );
}
