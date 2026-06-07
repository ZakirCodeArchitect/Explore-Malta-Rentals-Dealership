import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminBookingAnalytics } from "@/features/admin/components/admin-booking-analytics";
import { AdminVehicleList } from "@/features/admin/components/admin-vehicle-list";
import { getAdminDashboardOverview } from "@/lib/admin/getAdminDashboardOverview";

export const dynamic = "force-dynamic";

type AdminDashboardPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin" });
  const overview = await getAdminDashboardOverview();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-950">{t("welcomeTitle")}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{t("welcomeDescription")}</p>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
        <AdminVehicleList vehicles={overview.vehicles} />
        <AdminBookingAnalytics
          bookingMonths={overview.bookingMonths}
          bookingsThisMonth={overview.totals.bookingsThisMonth}
          bookingsLastMonth={overview.totals.bookingsLastMonth}
          confirmedThisMonth={overview.totals.confirmedThisMonth}
          activeVehicles={overview.totals.activeVehicles}
          inactiveVehicles={overview.totals.inactiveVehicles}
          totalVehicles={overview.totals.totalVehicles}
        />
      </div>
    </div>
  );
}
