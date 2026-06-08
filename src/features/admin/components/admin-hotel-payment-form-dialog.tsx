"use client";

import { Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormEvent, useEffect, useState } from "react";

import type { AdminHotelPaymentListItem, AdminHotelSettlementPreview } from "@/lib/admin/hotel-payments/types";
import type { AdminHotelPartnerOption } from "@/lib/admin/hotel-partners/types";

type AdminHotelPaymentFormDialogProps = Readonly<{
  locale: string;
  partners: AdminHotelPartnerOption[];
  settlement?: AdminHotelPaymentListItem | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}>;

const MONTH_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"] as const;

function inputClassName(): string {
  return "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#3a7ca5]/40 focus:bg-white focus:ring-2 focus:ring-[#3a7ca5]/15";
}

function formatEur(amount: number): string {
  return new Intl.NumberFormat("en-MT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function toLocalDateValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function AdminHotelPaymentFormDialog({
  partners,
  settlement,
  open,
  onClose,
  onSaved,
}: AdminHotelPaymentFormDialogProps) {
  const t = useTranslations("Admin.hotelPayments");
  const mode = settlement ? "edit" : "create";
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, index) => currentYear - index);

  const [hotelPartnerId, setHotelPartnerId] = useState(settlement?.hotelPartnerId ?? partners[0]?.id ?? "");
  const [month, setMonth] = useState(String(settlement?.month ?? new Date().getMonth() + 1));
  const [year, setYear] = useState(String(settlement?.year ?? currentYear));
  const [settlementAmountDue, setSettlementAmountDue] = useState(String(settlement?.settlementAmountDue ?? ""));
  const [amountPaid, setAmountPaid] = useState(String(settlement?.amountPaid ?? "0"));
  const [status, setStatus] = useState(settlement?.status ?? "DUE");
  const [paidAt, setPaidAt] = useState(toLocalDateValue(settlement?.paidAt ?? null));
  const [notes, setNotes] = useState(settlement?.notes ?? "");
  const [preview, setPreview] = useState<AdminHotelSettlementPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setHotelPartnerId(settlement?.hotelPartnerId ?? partners[0]?.id ?? "");
    setMonth(String(settlement?.month ?? new Date().getMonth() + 1));
    setYear(String(settlement?.year ?? currentYear));
    setSettlementAmountDue(String(settlement?.settlementAmountDue ?? ""));
    setAmountPaid(String(settlement?.amountPaid ?? "0"));
    setStatus(settlement?.status ?? "DUE");
    setPaidAt(toLocalDateValue(settlement?.paidAt ?? null));
    setNotes(settlement?.notes ?? "");
    setError(null);
    setPreview(null);
    setPreviewError(null);
  }, [open, settlement, partners, currentYear]);

  useEffect(() => {
    if (!open || !hotelPartnerId || !month || !year) {
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);

    const params = new URLSearchParams({
      hotelPartnerId,
      month,
      year,
    });

    fetch(`/api/admin/hotel-payments/preview?${params.toString()}`, { credentials: "same-origin" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          success?: boolean;
          preview?: AdminHotelSettlementPreview;
          message?: string;
        };
        if (cancelled) return;
        if (!response.ok || !payload.success || !payload.preview) {
          setPreview(null);
          setPreviewError(payload.message ?? t("previewError"));
          return;
        }
        setPreview(payload.preview);
      })
      .catch(() => {
        if (!cancelled) {
          setPreview(null);
          setPreviewError(t("previewError"));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, hotelPartnerId, month, year, t]);

  useEffect(() => {
    if (status === "DUE") {
      setAmountPaid("0");
      setPaidAt("");
    } else if (status === "PAID" && settlementAmountDue) {
      setAmountPaid(settlementAmountDue);
      if (!paidAt) {
        setPaidAt(new Date().toISOString().slice(0, 10));
      }
    }
  }, [status, settlementAmountDue, paidAt]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const endpoint =
      mode === "create" ? "/api/admin/hotel-payments" : `/api/admin/hotel-payments/${settlement?.id ?? ""}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const response = await fetch(endpoint, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hotelPartnerId,
          month: Number(month),
          year: Number(year),
          settlementAmountDue: Number(settlementAmountDue),
          amountPaid: Number(amountPaid),
          status,
          paidAt: paidAt ? new Date(`${paidAt}T12:00:00.000Z`).toISOString() : null,
          notes: notes.trim() || null,
        }),
      });

      const payload = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !payload.success) {
        setError(payload.message ?? t("saveError"));
        return;
      }

      onSaved();
      onClose();
    } catch {
      setError(t("saveError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              {mode === "create" ? t("form.createTitle") : t("form.editTitle")}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {mode === "create" ? t("form.createDescription") : t("form.editDescription")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label={t("form.cancel")}
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
              {error}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="md:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.hotel")}</span>
              <select
                value={hotelPartnerId}
                onChange={(e) => setHotelPartnerId(e.target.value)}
                required
                className={inputClassName()}
              >
                {partners.map((partner) => (
                  <option key={partner.id} value={partner.id}>
                    {partner.name}
                    {!partner.isActive ? ` (${t("form.inactiveHotel")})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.month")}</span>
              <select value={month} onChange={(e) => setMonth(e.target.value)} required className={inputClassName()}>
                {MONTH_KEYS.map((value) => (
                  <option key={value} value={value}>
                    {t(`filters.months.${value}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.year")}</span>
              <select value={year} onChange={(e) => setYear(e.target.value)} required className={inputClassName()}>
                {years.map((value) => (
                  <option key={value} value={String(value)}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-semibold text-slate-900">{t("form.previewTitle")}</p>
            <p className="mt-1 text-xs text-slate-600">{t("form.previewDescription")}</p>
            {previewLoading ? (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t("form.previewLoading")}
              </p>
            ) : previewError ? (
              <p className="mt-3 text-sm text-rose-700">{previewError}</p>
            ) : preview ? (
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-slate-500">{t("form.previewBookings")}</dt>
                  <dd className="font-semibold text-slate-900">{preview.bookingCount}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("form.previewTotalAmount")}</dt>
                  <dd className="font-semibold text-slate-900">{formatEur(preview.totalBookingAmount)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">{t("form.previewTotalDiscount")}</dt>
                  <dd className="font-semibold text-slate-900">{formatEur(preview.totalHotelDiscount)}</dd>
                </div>
              </dl>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.amountDue")}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={settlementAmountDue}
                onChange={(e) => setSettlementAmountDue(e.target.value)}
                required
                className={inputClassName()}
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.amountPaid")}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                required
                disabled={status === "DUE"}
                className={inputClassName()}
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.status")}</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClassName()}>
                <option value="DUE">{t("filters.due")}</option>
                <option value="PAID">{t("filters.paid")}</option>
                <option value="PARTIALLY_PAID">{t("filters.partiallyPaid")}</option>
              </select>
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.paidAt")}</span>
              <input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                disabled={status === "DUE"}
                className={inputClassName()}
              />
            </label>
            <label className="md:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-slate-900">{t("form.notes")}</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className={inputClassName()}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {t("form.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3a7ca5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#2f6688] disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
              {mode === "create" ? t("form.create") : t("form.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
