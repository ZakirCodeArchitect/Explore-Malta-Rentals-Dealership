"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { lookupBooking } from "@/features/booking-flow/lib/lookup-booking-api";
import type { PublicBookingSummary } from "@/lib/booking/lookupPublicBooking";

type BookingLookupPanelProps = {
  initialReference?: string;
  initialEmail?: string;
  showSubmittedBanner?: boolean;
};

function formatIsoDateTime(iso: string, format: ReturnType<typeof useFormatter>): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  return format.dateTime(d, { dateStyle: "medium", timeStyle: "short" });
}

function bookingStatusLabel(status: PublicBookingSummary["status"], t: (key: string) => string): string {
  switch (status) {
    case "PENDING":
      return t("status.PENDING");
    case "CONFIRMED":
      return t("status.CONFIRMED");
    case "CANCELLED":
      return t("status.CANCELLED");
    case "FAILED":
      return t("status.FAILED");
    default:
      return status;
  }
}

function BookingSummaryCard({
  summary,
  format,
}: {
  summary: PublicBookingSummary;
  format: ReturnType<typeof useFormatter>;
}) {
  const t = useTranslations("BookingPage.lookup");

  return (
    <div className="mt-5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 px-4 py-4 text-sm text-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t("referenceLabel")}</p>
      <p className="mt-1 font-mono text-base font-bold tracking-tight text-[var(--brand-blue)]">
        {summary.bookingReference}
      </p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("statusLabel")}</p>
      <p className="mt-1 font-medium text-slate-900">{bookingStatusLabel(summary.status, t)}</p>
      {summary.vehicleName ? (
        <>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("vehicleLabel")}</p>
          <p className="mt-1 font-medium text-slate-900">{summary.vehicleName}</p>
        </>
      ) : null}
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("pickupLabel")}</p>
      <p className="mt-1 text-slate-800">{formatIsoDateTime(summary.pickupDateTime, format)}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("returnLabel")}</p>
      <p className="mt-1 text-slate-800">{formatIsoDateTime(summary.returnDateTime, format)}</p>
    </div>
  );
}

export function BookingLookupPanel({
  initialReference,
  initialEmail,
  showSubmittedBanner,
}: BookingLookupPanelProps) {
  const t = useTranslations("BookingPage.lookup");
  const format = useFormatter();
  const [reference, setReference] = useState(() => initialReference?.trim() ?? "");
  const [email, setEmail] = useState(() => initialEmail?.trim() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PublicBookingSummary | null>(null);
  const [autoLookupDone, setAutoLookupDone] = useState(false);

  useEffect(() => {
    const next = initialReference?.trim();
    if (next) {
      queueMicrotask(() => {
        setReference(next);
      });
    }
  }, [initialReference]);

  useEffect(() => {
    const next = initialEmail?.trim();
    if (next) {
      queueMicrotask(() => {
        setEmail(next);
      });
    }
  }, [initialEmail]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSummary(null);
    setLoading(true);
    const result = await lookupBooking(reference, email);
    setLoading(false);
    if (result.ok) {
      setSummary(result.booking);
      return;
    }
    setError(result.message);
  }

  useEffect(() => {
    if (autoLookupDone || !showSubmittedBanner || !reference.trim() || !email.trim()) {
      return;
    }
    let cancelled = false;
    queueMicrotask(() => {
      setLoading(true);
      setError(null);
      setSummary(null);
    });
    void lookupBooking(reference, email).then((result) => {
      if (cancelled) {
        return;
      }
      setLoading(false);
      setAutoLookupDone(true);
      if (result.ok) {
        setSummary(result.booking);
        return;
      }
      setError(result.message);
    });
    return () => {
      cancelled = true;
    };
  }, [autoLookupDone, email, reference, showSubmittedBanner]);

  return (
    <section
      aria-labelledby="booking-lookup-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {showSubmittedBanner ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-950">
          <p className="font-semibold">{t("submittedTitle")}</p>
          <p className="mt-1 text-emerald-900/90">{t("submittedBody")}</p>
        </div>
      ) : null}

      <h2 id="booking-lookup-heading" className="text-lg font-bold text-slate-900">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-slate-600">{t("lead")}</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            {t("referenceLabelShort")}
            <input
              type="text"
              name="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20"
              placeholder={t("referencePlaceholder")}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            {t("emailLabel")}
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--brand-blue)] focus:ring-2 focus:ring-[var(--brand-blue)]/20"
              placeholder={t("emailPlaceholder")}
              suppressHydrationWarning
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading || !reference.trim() || !email.trim()}
          className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--brand-blue)] px-5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t("loading") : t("submit")}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {summary ? <BookingSummaryCard summary={summary} format={format} /> : null}
    </section>
  );
}
