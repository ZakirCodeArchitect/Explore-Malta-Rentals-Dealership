"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";

type Props = {
  sessionId: string;
  locale: string;
  bookingReference: string;
};

type PollStatus = "verifying" | "confirmed" | "failed" | "timeout";

/**
 * Shown when the user arrives on the success page before the Stripe webhook fires.
 * Polls /api/stripe/verify-session every 2 seconds for up to 30 seconds.
 * Once confirmed, transitions to a success view and pushes the user to the booking page.
 */
export function PaymentVerifyingPoller({ sessionId, locale, bookingReference }: Props) {
  const [status, setStatus] = useState<PollStatus>("verifying");
  const [dots, setDots] = useState(".");
  const pollCount = useRef(0);
  const MAX_POLLS = 15; // 15 × 2s = 30s max wait

  // Animated dots for loading indicator
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 500);
    return () => clearInterval(id);
  }, []);

  // Poll the verify endpoint
  useEffect(() => {
    if (status !== "verifying") return;

    const poll = async () => {
      pollCount.current += 1;

      if (pollCount.current > MAX_POLLS) {
        setStatus("timeout");
        return;
      }

      try {
        const res = await fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`);
        if (!res.ok) {
          // Server error — keep polling
          return;
        }
        const data = (await res.json()) as { paymentStatus?: string };
        if (data.paymentStatus === "paid") {
          setStatus("confirmed");
          // Redirect to booking page after a brief celebration moment
          setTimeout(() => {
            window.location.href = `/${locale}/booking?ref=${encodeURIComponent(bookingReference)}&submitted=1`;
          }, 2500);
        }
      } catch {
        // Network error — keep polling
      }
    };

    const id = setInterval(() => { void poll(); }, 2000);
    void poll(); // immediate first check
    return () => clearInterval(id);
  }, [status, sessionId, locale, bookingReference]);

  if (status === "confirmed") {
    return (
      <main className="flex min-h-[calc(100dvh-var(--site-header-offset))] items-center justify-center bg-[var(--surface-elevated)] px-4">
        <div className="mx-auto max-w-sm text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" strokeWidth={1.5} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">Payment Confirmed!</h1>
          <p className="mt-2 text-slate-600">Taking you to your booking{dots}</p>
        </div>
      </main>
    );
  }

  if (status === "timeout") {
    return (
      <main className="flex min-h-[calc(100dvh-var(--site-header-offset))] items-center justify-center bg-[var(--surface-elevated)] px-4">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <AlertCircle className="h-7 w-7 text-amber-500" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Still verifying your payment</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your payment was likely successful — Stripe can sometimes take a moment to confirm.
            Please check your email for a confirmation, or look up your booking below.
          </p>
          <div className="mt-6 space-y-3">
            <Link
              href={`/${locale}/booking?ref=${encodeURIComponent(bookingReference)}`}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-orange)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-orange-strong)]"
            >
              View My Booking
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="mailto:info@exploremaltarentals.com"
              className="flex w-full items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Contact Support
            </a>
          </div>
          <p className="mt-4 font-mono text-sm font-bold text-slate-900">{bookingReference}</p>
        </div>
      </main>
    );
  }

  // Default: verifying spinner
  return (
    <main className="flex min-h-[calc(100dvh-var(--site-header-offset))] items-center justify-center bg-[var(--surface-elevated)] px-4">
      <div className="mx-auto max-w-sm text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-blue)]/10">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--brand-blue)]" strokeWidth={1.5} />
        </div>
        <h1 className="mt-5 text-xl font-bold text-slate-900">Verifying your payment{dots}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Please stay on this page — this only takes a few seconds.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5">
          <span className="text-xs font-medium text-slate-500">Booking</span>
          <span className="font-mono text-xs font-bold text-slate-900">{bookingReference}</span>
        </div>
      </div>
    </main>
  );
}
