import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { AdminReportDashboard } from "@/features/admin/components/admin-report-dashboard";
import { AdminReportFilters } from "@/features/admin/components/admin-report-filters";
import { adminReportQuerySchema, getAdminReportsSummary } from "@/lib/admin/reports";
import { listAdminHotelPartnerOptions } from "@/lib/admin/hotel-partners";

export const dynamic = "force-dynamic";

type AdminReportsPageProps = Readonly<{
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

function DashboardFallback() {
  return (
    <div className="space-y-5" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-48 animate-pulse rounded-2xl bg-white/70" />
      ))}
    </div>
  );
}

export default async function AdminReportsPage({ params, searchParams }: AdminReportsPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.reports" });

  const parsedFilters = adminReportQuerySchema.safeParse({
    hotelPartnerId: query.hotelPartnerId ?? undefined,
    month: query.month ?? undefined,
    year: query.year ?? undefined,
    status: query.status ?? undefined,
  });

  const filters = parsedFilters.success ? parsedFilters.data : {};

  const [summary, partners] = await Promise.all([
    getAdminReportsSummary(filters),
    listAdminHotelPartnerOptions(),
  ]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">{t("pageTitle")}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{t("pageDescription")}</p>
      </section>

      <Suspense fallback={<FiltersFallback />}>
        <AdminReportFilters locale={locale} partners={partners} />
      </Suspense>

      <Suspense fallback={<DashboardFallback />}>
        <AdminReportDashboard summary={summary} />
      </Suspense>
    </div>
  );
}
