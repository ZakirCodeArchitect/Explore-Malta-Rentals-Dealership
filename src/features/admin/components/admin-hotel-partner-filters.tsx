"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormEvent, useTransition } from "react";

type AdminHotelPartnerFiltersProps = Readonly<{
  locale: string;
}>;

export function AdminHotelPartnerFilters({ locale }: AdminHotelPartnerFiltersProps) {
  const t = useTranslations("Admin.hotels.filters");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const search = String(formData.get("search") ?? "").trim();
    const isActive = String(formData.get("isActive") ?? "").trim();

    if (search) params.set("search", search);
    if (isActive) params.set("isActive", isActive);

    startTransition(() => {
      const query = params.toString();
      router.push(`/${locale}/admin/hotels${query ? `?${query}` : ""}`);
    });
  }

  function handleClear() {
    startTransition(() => {
      router.push(`/${locale}/admin/hotels`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-4"
    >
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("search")}
        </span>
        <input
          name="search"
          defaultValue={searchParams.get("search") ?? ""}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#3a7ca5]/40 focus:ring-2 focus:ring-[#3a7ca5]/15"
        />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("status")}
        </span>
        <select
          name="isActive"
          defaultValue={searchParams.get("isActive") ?? ""}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#3a7ca5]/40 focus:ring-2 focus:ring-[#3a7ca5]/15"
        >
          <option value="">{t("allStatuses")}</option>
          <option value="true">{t("active")}</option>
          <option value="false">{t("inactive")}</option>
        </select>
      </label>
      <div className="flex items-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#3a7ca5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6688] disabled:opacity-60"
        >
          {isPending ? t("applying") : t("apply")}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {t("clear")}
        </button>
      </div>
    </form>
  );
}
