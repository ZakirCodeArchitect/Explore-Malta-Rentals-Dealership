import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminHotelCodeForm } from "@/features/admin/components/admin-hotel-code-form";
import { getAdminHotelCodeById } from "@/lib/admin/hotel-codes";
import { listAdminHotelPartnerOptions } from "@/lib/admin/hotel-partners";

export const dynamic = "force-dynamic";

type AdminEditHotelCodePageProps = Readonly<{
  params: Promise<{ locale: string; id: string }>;
}>;

export default async function AdminEditHotelCodePage({ params }: AdminEditHotelCodePageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.hotelCodes" });

  const [code, partners] = await Promise.all([getAdminHotelCodeById(id), listAdminHotelPartnerOptions()]);
  if (!code) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">{t("editTitle", { code: code.code })}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("editDescription")}</p>
      </section>
      <AdminHotelCodeForm locale={locale} mode="edit" code={code} partners={partners} />
    </div>
  );
}
