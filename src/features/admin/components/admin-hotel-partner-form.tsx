"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { AdminHotelPartnerDetail } from "@/lib/admin/hotel-partners/types";

type AdminHotelPartnerFormProps = Readonly<{
  locale: string;
  mode: "create" | "edit";
  partner?: AdminHotelPartnerDetail;
}>;

function inputClassName(): string {
  return "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3a7ca5]/40 focus:bg-white focus:ring-2 focus:ring-[#3a7ca5]/15";
}

export function AdminHotelPartnerForm({ locale, mode, partner }: AdminHotelPartnerFormProps) {
  const t = useTranslations("Admin.hotels");
  const router = useRouter();
  const [name, setName] = useState(partner?.name ?? "");
  const [contactPerson, setContactPerson] = useState(partner?.contactPerson ?? "");
  const [email, setEmail] = useState(partner?.email ?? "");
  const [phone, setPhone] = useState(partner?.phone ?? "");
  const [address, setAddress] = useState(partner?.address ?? "");
  const [isActive, setIsActive] = useState(partner?.isActive ?? true);
  const [initialCode, setInitialCode] = useState("");
  const [initialDiscountPercent, setInitialDiscountPercent] = useState("");
  const [initialValidFrom, setInitialValidFrom] = useState("");
  const [initialValidUntil, setInitialValidUntil] = useState("");
  const [initialCodeIsActive, setInitialCodeIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasInitialCodeInput = initialCode.trim().length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (hasInitialCodeInput) {
      const parsedDiscount = Number(initialDiscountPercent);
      if (!Number.isFinite(parsedDiscount) || initialDiscountPercent.trim() === "") {
        setError(t("form.initialCodeDiscountRequired"));
        return;
      }
      if (parsedDiscount < 0 || parsedDiscount > 100) {
        setError(t("form.initialCodeDiscountRange"));
        return;
      }
      if (initialValidFrom && initialValidUntil && new Date(initialValidFrom) > new Date(initialValidUntil)) {
        setError(t("form.initialCodeValidUntilError"));
        return;
      }
      if (!isActive && initialCodeIsActive) {
        setError(t("form.inactiveHotelCodeError"));
        return;
      }
    }

    setIsSubmitting(true);

    const endpoint =
      mode === "create" ? "/api/admin/hotel-partners" : `/api/admin/hotel-partners/${partner?.id ?? ""}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const body: Record<string, unknown> = {
      name,
      contactPerson: contactPerson || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
      isActive,
    };

    if (mode === "create" && hasInitialCodeInput) {
      body.initialCode = {
        code: initialCode,
        discountPercent: Number(initialDiscountPercent),
        isActive: initialCodeIsActive,
        validFrom: initialValidFrom ? new Date(initialValidFrom).toISOString() : null,
        validUntil: initialValidUntil ? new Date(initialValidUntil).toISOString() : null,
      };
    }

    try {
      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        partner?: { name?: string };
        initialCode?: { code?: string };
      };
      if (!response.ok || !payload.success) {
        setError(payload.message ?? t("saveError"));
        return;
      }

      if (mode === "create") {
        const params = new URLSearchParams({ created: "1" });
        if (payload.partner?.name) {
          params.set("name", payload.partner.name);
        }
        if (payload.initialCode?.code) {
          params.set("code", payload.initialCode.code);
        }
        router.push(`/${locale}/admin/hotels?${params.toString()}`);
      } else {
        router.push(`/${locale}/admin/hotels?saved=1`);
      }
      router.refresh();
    } catch {
      setError(t("saveError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.name")}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputClassName()} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.contactPerson")}</span>
          <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={inputClassName()} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.email")}</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClassName()} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.phone")}</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClassName()} />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.address")}</span>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className={inputClassName()} />
        </label>
        <label className="flex items-center gap-2 md:col-span-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4" />
          <span className="text-sm font-medium text-slate-800">{t("form.isActive")}</span>
        </label>
      </div>

      {mode === "create" ? (
        <section className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t("form.initialCodeSection")}</h3>
            <p className="mt-1 text-sm text-slate-600">{t("form.initialCodeSectionDescription")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.initialCode")}</span>
              <input
                value={initialCode}
                onChange={(e) => setInitialCode(e.target.value.toUpperCase())}
                className={`${inputClassName()} uppercase tracking-wide`}
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.discountPercent")}</span>
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={initialDiscountPercent}
                onChange={(e) => setInitialDiscountPercent(e.target.value)}
                className={inputClassName()}
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.validFrom")}</span>
              <input
                type="datetime-local"
                value={initialValidFrom}
                onChange={(e) => setInitialValidFrom(e.target.value)}
                className={inputClassName()}
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.validUntil")}</span>
              <input
                type="datetime-local"
                value={initialValidUntil}
                onChange={(e) => setInitialValidUntil(e.target.value)}
                className={inputClassName()}
              />
            </label>
            <label className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                checked={initialCodeIsActive}
                onChange={(e) => setInitialCodeIsActive(e.target.checked)}
                disabled={!isActive}
                className="size-4 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="text-sm font-medium text-slate-800">{t("form.initialCodeIsActive")}</span>
            </label>
            {!isActive ? (
              <p className="md:col-span-2 text-sm text-amber-800">{t("form.inactiveHotelCodeHint")}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3a7ca5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6688] disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {mode === "create" ? t("form.create") : t("form.save")}
        </button>
        <a
          href={`/${locale}/admin/hotels`}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {t("form.cancel")}
        </a>
      </div>
    </form>
  );
}
