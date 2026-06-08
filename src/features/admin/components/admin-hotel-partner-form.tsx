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
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const endpoint =
      mode === "create" ? "/api/admin/hotel-partners" : `/api/admin/hotel-partners/${partner?.id ?? ""}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contactPerson: contactPerson || null,
          email: email || null,
          phone: phone || null,
          address: address || null,
          isActive,
        }),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        setError(payload.message ?? t("saveError"));
        return;
      }

      router.push(`/${locale}/admin/hotels`);
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
