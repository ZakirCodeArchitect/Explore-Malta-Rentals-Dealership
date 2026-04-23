"use client";

import Link from "next/link";

export type BookingSuccessProps = {
  bookingReference: string;
  customerEmail: string;
  vehicleName?: string;
};

export function BookingSuccess({ bookingReference, customerEmail, vehicleName }: BookingSuccessProps) {
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 text-center shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Booking submitted</p>
        <h2 className="text-2xl font-bold text-slate-900">Thank you for choosing Explore Malta Rentals</h2>
        <p className="text-sm text-slate-700">
          Your booking has been submitted successfully.
        </p>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-white px-4 py-4 text-left text-sm text-slate-800">
        <p className="font-semibold text-slate-900">Booking reference</p>
        <p className="mt-1 font-mono text-base font-bold tracking-tight text-[var(--brand-blue)]">{bookingReference}</p>
        {vehicleName ? (
          <p className="mt-3 text-xs text-slate-600">
            Vehicle: <span className="font-medium text-slate-800">{vehicleName}</span>
          </p>
        ) : null}
        <p className="mt-3 text-sm text-slate-700">
          A confirmation email has been sent to{" "}
          <span className="font-semibold text-slate-900">{customerEmail}</span>.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--brand-orange)] px-8 text-sm font-semibold text-white transition hover:bg-[var(--brand-orange-strong)]"
      >
        Back to home
      </Link>
    </div>
  );
}
