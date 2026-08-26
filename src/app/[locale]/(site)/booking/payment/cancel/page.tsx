import type { Metadata } from "next";
import Link from "next/link";
import { XCircle, AlertTriangle, MessageCircle, ArrowLeft, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { RetryPaymentButton } from "./retry-payment-button";

export const metadata: Metadata = {
  title: "Payment Cancelled | Explore Malta Rentals",
  description: "Your payment was cancelled. Retry within the checkout window to confirm your rental.",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
};

export default async function PaymentCancelPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { ref: bookingReference } = await searchParams;

  const booking = bookingReference
    ? await prisma.booking.findUnique({
        where: { bookingReference },
        select: {
          bookingReference: true,
          customerFullName: true,
          customerEmail: true,
          vehicleNameSnapshot: true,
          pickupDateTime: true,
          returnDateTime: true,
          billableDays: true,
          totalDueOnline: true,
          paymentStatus: true,
          status: true,
        },
      })
    : null;

  // If already paid (user came back to cancel URL by mistake)
  if (booking?.paymentStatus === "PAID") {
    return (
      <main className="flex min-h-[calc(100dvh-var(--site-header-offset))] items-center justify-center bg-[var(--surface-elevated)] px-4 py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-emerald-200 bg-white p-8 shadow-sm text-center">
          <p className="text-5xl">✅</p>
          <h1 className="mt-4 text-xl font-bold text-slate-900">This booking is already paid</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your rental <span className="font-mono font-bold">{bookingReference}</span> is confirmed.
          </p>
          <Link
            href={`/${locale}/booking?ref=${encodeURIComponent(bookingReference ?? "")}&submitted=1`}
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[var(--brand-orange)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-orange-strong)]"
          >
            View My Booking
          </Link>
        </div>
      </main>
    );
  }

  // Checkout window expired / payment failed — vehicle already released
  if (booking?.status === "CANCELLED") {
    return (
      <main className="flex min-h-[calc(100dvh-var(--site-header-offset))] items-center justify-center bg-[var(--surface-elevated)] px-4 py-16">
        <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm text-center">
          <XCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h1 className="mt-4 text-xl font-bold text-slate-900">Payment window expired</h1>
          <p className="mt-2 text-sm text-slate-600">
            Booking <span className="font-mono font-bold">{bookingReference}</span> was cancelled
            because payment was not completed in time. The vehicle has been released for other customers.
          </p>
          <Link
            href={`/${locale}/vehicles`}
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[var(--brand-orange)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-orange-strong)]"
          >
            Browse vehicles
          </Link>
        </div>
      </main>
    );
  }

  const amountDue = booking ? Number(booking.totalDueOnline).toFixed(2) : null;
  const canRetry =
    !!booking &&
    (booking.status === "PENDING_PAYMENT" || booking.status === "CONFIRMED");

  return (
    <main className="min-h-[calc(100dvh-var(--site-header-offset))] bg-gradient-to-b from-red-50/60 via-[var(--surface-elevated)] to-[var(--background)] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-xl space-y-5">

        <div className="overflow-hidden rounded-3xl border border-red-200/60 bg-white shadow-sm">
          <div className="flex items-center gap-4 bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
              <XCircle className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-medium text-red-100">Payment not completed</p>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Payment cancelled
              </h1>
            </div>
          </div>

          <div className="p-6">
            <p className="text-sm text-slate-600">
              You left the payment page before completing the transaction. Your booking is held
              temporarily — complete payment now to confirm your rental.
            </p>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" strokeWidth={2} />
              <p className="text-sm text-amber-900">
                <span className="font-semibold">Vehicle held for 30 minutes.</span>{" "}
                If payment is not completed within the checkout window, this booking is cancelled
                automatically and the vehicle is released.
              </p>
            </div>
          </div>
        </div>

        {booking && (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Awaiting Payment
              </p>
              <p className="mt-0.5 font-mono text-xl font-bold text-slate-900">
                {booking.bookingReference}
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="flex justify-between gap-4 px-6 py-3 text-sm">
                <span className="text-slate-500">Vehicle</span>
                <span className="font-semibold text-slate-900 text-right">
                  {booking.vehicleNameSnapshot ?? "—"}
                </span>
              </div>
              <div className="flex justify-between gap-4 px-6 py-3 text-sm">
                <span className="text-slate-500">Pickup</span>
                <span className="font-semibold text-slate-900 text-right">
                  {format(booking.pickupDateTime, "EEE d MMM, HH:mm")}
                </span>
              </div>
              <div className="flex justify-between gap-4 px-6 py-3 text-sm">
                <span className="text-slate-500">Return</span>
                <span className="font-semibold text-slate-900 text-right">
                  {format(booking.returnDateTime, "EEE d MMM, HH:mm")}
                </span>
              </div>
              <div className="flex justify-between gap-4 px-6 py-3 text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-slate-900">
                  {booking.billableDays} {booking.billableDays === 1 ? "day" : "days"}
                </span>
              </div>
              {amountDue && (
                <div className="flex justify-between gap-4 px-6 py-3 text-sm">
                  <span className="text-slate-500">Amount due</span>
                  <span className="text-lg font-bold text-slate-900">€{amountDue}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {canRetry && bookingReference ? (
            <RetryPaymentButton
              bookingReference={bookingReference}
              locale={locale}
              amountDue={amountDue}
            />
          ) : null}

          <Link
            href={`/${locale}/vehicles`}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse vehicles instead
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
          <p className="text-sm font-semibold text-slate-900">Need help?</p>
          <p className="mt-1 text-sm text-slate-600">
            If your card was declined or you hit an issue, contact us and we&apos;ll sort it out.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href="mailto:info@exploremaltarentals.com"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <MessageCircle className="h-4 w-4" />
              Email us
            </a>
            <a
              href="https://wa.me/35677506799"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              <Phone className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
