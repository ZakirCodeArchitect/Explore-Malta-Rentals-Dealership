import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminHotelCodeForm } from "@/features/admin/components/admin-hotel-code-form";
import { listAdminHotelPartnerOptions } from "@/lib/admin/hotel-partners";

export const dynamic = "force-dynamic";

type AdminNewHotelCodePageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function AdminNewHotelCodePage({ params }: AdminNewHotelCodePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.hotelCodes" });
  const partners = await listAdminHotelPartnerOptions();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">{t("createTitle")}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("createDescription")}</p>
        {partners.length === 0 ? (
          <p className="mt-3 text-sm font-medium text-amber-800">{t("noPartnersWarning")}</p>
        ) : null}
      </section>
      <AdminHotelCodeForm locale={locale} mode="create" partners={partners} />
    </div>
  );
}
