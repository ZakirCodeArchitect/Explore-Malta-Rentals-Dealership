"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { VEHICLE_CATALOG_STATUSES, VEHICLE_TYPES } from "@/lib/admin/vehicles/types";

export function AdminVehicleFilters() {
  const t = useTranslations("Admin.vehicles");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") ?? "";
  const vehicleType = searchParams.get("vehicleType") ?? "";
  const catalogStatus = searchParams.get("catalogStatus") ?? "";

  const applyFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        const trimmed = value.trim();
        if (trimmed) {
          params.set(key, trimmed);
        } else {
          params.delete(key);
        }
      }

      startTransition(() => {
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
      });
    },
    [pathname, router, searchParams],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    applyFilters({
      search: String(formData.get("search") ?? ""),
      vehicleType: String(formData.get("vehicleType") ?? ""),
      catalogStatus: String(formData.get("catalogStatus") ?? ""),
    });
  }

  function clearFilters() {
    startTransition(() => {
      router.replace(pathname);
    });
  }

  const hasFilters = Boolean(search || vehicleType || catalogStatus);

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto] md:items-end">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("filters.search")}
          </span>
          <span className="relative flex">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder={t("filters.searchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#3a7ca5]/40 focus:bg-white focus:ring-2 focus:ring-[#3a7ca5]/15"
            />
          </span>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("filters.category")}
          </span>
          <select
            name="vehicleType"
            defaultValue={vehicleType}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3a7ca5]/40 focus:bg-white focus:ring-2 focus:ring-[#3a7ca5]/15"
          >
            <option value="">{t("filters.allCategories")}</option>
            {VEHICLE_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`vehicleTypes.${type}`)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("filters.status")}
          </span>
          <select
            name="catalogStatus"
            defaultValue={catalogStatus}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3a7ca5]/40 focus:bg-white focus:ring-2 focus:ring-[#3a7ca5]/15"
          >
            <option value="">{t("filters.allStatuses")}</option>
            {VEHICLE_CATALOG_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`catalogStatus.${status}`)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-[#3a7ca5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f6688] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? t("filters.applying") : t("filters.apply")}
          </button>
          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              disabled={isPending}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <X className="size-4" aria-hidden />
              {t("filters.clear")}
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
