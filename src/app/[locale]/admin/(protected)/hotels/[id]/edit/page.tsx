import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminHotelPartnerForm } from "@/features/admin/components/admin-hotel-partner-form";
import { getAdminHotelPartnerById } from "@/lib/admin/hotel-partners";

export const dynamic = "force-dynamic";

type AdminEditHotelPageProps = Readonly<{
  params: Promise<{ locale: string; id: string }>;
}>;

export default async function AdminEditHotelPage({ params }: AdminEditHotelPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.hotels" });

  const partner = await getAdminHotelPartnerById(id);
  if (!partner) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">{t("editTitle", { name: partner.name })}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("editDescription")}</p>
      </section>
      <AdminHotelPartnerForm locale={locale} mode="edit" partner={partner} />
    </div>
  );
}
