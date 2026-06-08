"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormEvent, useTransition } from "react";

import type { AdminHotelPartnerOption } from "@/lib/admin/hotel-partners/types";

type AdminHotelCodeFiltersProps = Readonly<{
  locale: string;
  partners: AdminHotelPartnerOption[];
}>;

export function AdminHotelCodeFilters({ locale, partners }: AdminHotelCodeFiltersProps) {
  const t = useTranslations("Admin.hotelCodes.filters");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const key of ["search", "code", "hotelPartnerId", "isActive"] as const) {
      const value = String(formData.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }

    startTransition(() => {
      const query = params.toString();
      router.push(`/${locale}/admin/hotel-codes${query ? `?${query}` : ""}`);
    });
  }

  function handleClear() {
    startTransition(() => {
      router.push(`/${locale}/admin/hotel-codes`);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-6"
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
          {t("code")}
        </span>
        <input
          name="code"
          defaultValue={searchParams.get("code") ?? ""}
          placeholder={t("codePlaceholder")}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm uppercase outline-none focus:border-[#3a7ca5]/40 focus:ring-2 focus:ring-[#3a7ca5]/15"
        />
      </label>
      <label>
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("partner")}
        </span>
        <select
          name="hotelPartnerId"
          defaultValue={searchParams.get("hotelPartnerId") ?? ""}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#3a7ca5]/40 focus:ring-2 focus:ring-[#3a7ca5]/15"
        >
          <option value="">{t("allPartners")}</option>
          {partners.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.name}
              {!partner.isActive ? ` (${t("inactivePartner")})` : ""}
            </option>
          ))}
        </select>
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
