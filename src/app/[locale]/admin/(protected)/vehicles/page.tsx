import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { AdminVehicleFilters } from "@/features/admin/components/admin-vehicle-filters";
import { AdminVehicleTable } from "@/features/admin/components/admin-vehicle-table";
import { listAdminVehicles } from "@/lib/admin/vehicles";
import type { VehicleCatalogStatus, VehicleType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type AdminVehiclesPageProps = Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    vehicleType?: string;
    catalogStatus?: string;
  }>;
}>;

function isVehicleType(value: string | undefined): value is VehicleType {
  return value === "Scooter" || value === "Motorcycle" || value === "Bicycle" || value === "ATV";
}

function isCatalogStatus(value: string | undefined): value is VehicleCatalogStatus {
  return (
    value === "AVAILABLE" ||
    value === "BOOKED" ||
    value === "UNDER_PROCESS" ||
    value === "SOLD" ||
    value === "MAINTENANCE" ||
    value === "INACTIVE"
  );
}

function FiltersFallback() {
  return <div className="h-28 animate-pulse rounded-2xl bg-white/70" aria-hidden />;
}

export default async function AdminVehiclesPage({ params, searchParams }: AdminVehiclesPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.vehicles" });

  const { vehicles, total } = await listAdminVehicles({
    search: query.search,
    vehicleType: isVehicleType(query.vehicleType) ? query.vehicleType : undefined,
    catalogStatus: isCatalogStatus(query.catalogStatus) ? query.catalogStatus : undefined,
  });

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{t("pageTitle")}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{t("pageDescription")}</p>
        </div>
        <a
          href={`/${locale}/admin/vehicles/new`}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3a7ca5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f6688]"
        >
          <Plus className="size-4" aria-hidden />
          {t("addVehicle")}
        </a>
      </section>

      <Suspense fallback={<FiltersFallback />}>
        <AdminVehicleFilters />
      </Suspense>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{t("resultsCount", { count: total })}</p>
      </div>

      <AdminVehicleTable locale={locale} vehicles={vehicles} />
    </div>
  );
}
