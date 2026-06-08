"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import type { AdminHotelCodeDetail } from "@/lib/admin/hotel-codes/types";
import type { AdminHotelPartnerOption } from "@/lib/admin/hotel-partners/types";

type AdminHotelCodeFormProps = Readonly<{
  locale: string;
  mode: "create" | "edit";
  code?: AdminHotelCodeDetail;
  partners: AdminHotelPartnerOption[];
}>;

function inputClassName(): string {
  return "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3a7ca5]/40 focus:bg-white focus:ring-2 focus:ring-[#3a7ca5]/15";
}

function toLocalDateTimeValue(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function AdminHotelCodeForm({ locale, mode, code, partners }: AdminHotelCodeFormProps) {
  const t = useTranslations("Admin.hotelCodes");
  const router = useRouter();
  const [codeValue, setCodeValue] = useState(code?.code ?? "");
  const [hotelPartnerId, setHotelPartnerId] = useState(code?.hotelPartnerId ?? partners[0]?.id ?? "");
  const [discountPercent, setDiscountPercent] = useState(String(code?.discountPercent ?? ""));
  const [validFrom, setValidFrom] = useState(toLocalDateTimeValue(code?.validFrom ?? null));
  const [validUntil, setValidUntil] = useState(toLocalDateTimeValue(code?.validUntil ?? null));
  const [isActive, setIsActive] = useState(code?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const parsedDiscount = Number(discountPercent);
    const endpoint = mode === "create" ? "/api/admin/hotel-codes" : `/api/admin/hotel-codes/${code?.id ?? ""}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: codeValue,
          hotelPartnerId,
          discountPercent: parsedDiscount,
          isActive,
          validFrom: validFrom ? new Date(validFrom).toISOString() : null,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
        }),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        setError(payload.message ?? t("saveError"));
        return;
      }

      router.push(`/${locale}/admin/hotel-codes`);
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
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.code")}</span>
          <input
            value={codeValue}
            onChange={(e) => setCodeValue(e.target.value.toUpperCase())}
            required
            className={`${inputClassName()} uppercase tracking-wide`}
          />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.partner")}</span>
          <select
            value={hotelPartnerId}
            onChange={(e) => setHotelPartnerId(e.target.value)}
            required
            className={inputClassName()}
          >
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
                {!partner.isActive ? ` (${t("form.inactivePartner")})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.discountPercent")}</span>
          <input
            type="number"
            min={0}
            max={100}
            step={0.01}
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            required
            className={inputClassName()}
          />
        </label>
        <label className="flex items-center gap-2 self-end">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4" />
          <span className="text-sm font-medium text-slate-800">{t("form.isActive")}</span>
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.validFrom")}</span>
          <input type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} className={inputClassName()} />
        </label>
        <label>
          <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.validUntil")}</span>
          <input type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className={inputClassName()} />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSubmitting || partners.length === 0}
          className="inline-flex items-center gap-2 rounded-xl bg-[#3a7ca5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6688] disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {mode === "create" ? t("form.create") : t("form.save")}
        </button>
        <a href={`/${locale}/admin/hotel-codes`} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          {t("form.cancel")}
        </a>
      </div>
    </form>
  );
}
