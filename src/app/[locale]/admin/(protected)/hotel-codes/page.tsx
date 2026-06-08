import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { AdminHotelCodeFilters } from "@/features/admin/components/admin-hotel-code-filters";
import { AdminHotelCodeTable } from "@/features/admin/components/admin-hotel-code-table";
import { listAdminHotelCodes } from "@/lib/admin/hotel-codes";
import { listAdminHotelPartnerOptions } from "@/lib/admin/hotel-partners";

export const dynamic = "force-dynamic";

type AdminHotelCodesPageProps = Readonly<{
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    code?: string;
    hotelPartnerId?: string;
    isActive?: string;
  }>;
}>;

function FiltersFallback() {
  return <div className="h-28 animate-pulse rounded-2xl bg-white/70" aria-hidden />;
}

export default async function AdminHotelCodesPage({ params, searchParams }: AdminHotelCodesPageProps) {
  const { locale } = await params;
  const query = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Admin.hotelCodes" });

  const isActive =
    query.isActive === "true" ? true : query.isActive === "false" ? false : undefined;

  const [{ codes, total }, partners] = await Promise.all([
    listAdminHotelCodes({
      search: query.search,
      code: query.code,
      hotelPartnerId: query.hotelPartnerId,
      isActive,
    }),
    listAdminHotelPartnerOptions(),
  ]);

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{t("pageTitle")}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">{t("pageDescription")}</p>
        </div>
        <a
          href={`/${locale}/admin/hotel-codes/new`}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#3a7ca5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f6688]"
        >
          <Plus className="size-4" aria-hidden />
          {t("addCode")}
        </a>
      </section>

      <Suspense fallback={<FiltersFallback />}>
        <AdminHotelCodeFilters locale={locale} partners={partners} />
      </Suspense>

      <p className="text-sm font-medium text-slate-600">{t("resultsCount", { count: total })}</p>
      <AdminHotelCodeTable locale={locale} codes={codes} />
    </div>
  );
}
