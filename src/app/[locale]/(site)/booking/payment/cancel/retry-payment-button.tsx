"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";

type Props = {
  bookingReference: string;
  locale: string;
  amountDue: string | null;
};

/**
 * Calls /api/stripe/checkout to create a fresh Checkout Session,
 * then hard-redirects to Stripe's hosted payment page.
 */
export function RetryPaymentButton({ bookingReference, locale, amountDue }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRetry() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingReference, locale }),
      });

      const data = (await res.json()) as { ok: boolean; checkoutUrl?: string; error?: string };

      if (data.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setError(data.error ?? "Could not start payment. Please try again or contact us.");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => { void handleRetry(); }}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-orange)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-orange-strong)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting payment{"\u2026"}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            {amountDue ? `Pay €${amountDue} now` : "Retry Payment"}
          </>
        )}
      </button>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
