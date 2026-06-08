import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { AdminHotelPaymentFilters } from "@/features/admin/components/admin-hotel-payment-filters";
import { AdminHotelPaymentTable } from "@/features/admin/components/admin-hotel-payment-table";
import { listAdminHotelPayments } from "@/lib/admin/hotel-payments";
import { listAdminHotelPartnerOptions } from "@/lib/admin/hotel-partners";

export const dynamic = "force-dynamic";

type AdminHotelPaymentsPageProps = Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    hotelPartnerId?: string;
    month?: string;
    year?: string;
    status?: string;
  }>;
}>;

function FiltersFallback() {
  return <div className="h-28 animate-pulse rounded-2xl bg-white/70" aria-hidden />;
}

function parseOptionalInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export default async function AdminHotelPaymentsPage({ params, searchParams }: AdminHotelPaymentsPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.hotelPayments" });

  const month = parseOptionalInt(query.month);
  const year = parseOptionalInt(query.year);
  const status =
    query.status === "DUE" || query.status === "PAID" || query.status === "PARTIALLY_PAID"
      ? query.status
      : undefined;

  const [{ settlements, total }, partners] = await Promise.all([
    listAdminHotelPayments({
      hotelPartnerId: query.hotelPartnerId,
      month,
      year,
      status,
    }),
    listAdminHotelPartnerOptions(),
  ]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">{t("pageTitle")}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{t("pageDescription")}</p>
      </section>

      <Suspense fallback={<FiltersFallback />}>
        <AdminHotelPaymentFilters locale={locale} partners={partners} />
      </Suspense>

      <p className="text-sm font-medium text-slate-600">{t("resultsCount", { count: total })}</p>
      <AdminHotelPaymentTable locale={locale} settlements={settlements} partners={partners} />
    </div>
  );
}
