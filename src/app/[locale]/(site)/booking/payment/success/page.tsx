import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import {
  CheckCircle2,
  Calendar,
  Mail,
  MapPin,
  Clock,
  Shield,
  ExternalLink,
  FileText,
  ArrowRight,
  Home,
  AlertCircle,
} from "lucide-react";
import { verifyCheckoutSession } from "@/lib/stripe/payment-service";
import type { VerifiedPaymentData } from "@/lib/stripe/payment-service";
import { PaymentVerifyingPoller } from "./payment-verifying-poller";

export const metadata: Metadata = {
  title: "Booking Confirmed | Explore Malta Rentals",
  description: "Your payment was successful and your rental is confirmed.",
};

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return <NoSessionState locale={locale} />;
  }

  const result = await verifyCheckoutSession(sessionId);

  if (!result.ok) {
    return <ErrorState locale={locale} />;
  }

  const { data } = result;

  // Stripe confirmed payment (session.payment_status === "paid")
  if (data.paymentStatus === "paid") {
    return <SuccessState data={data} locale={locale} />;
  }

  // Edge case: user arrived before webhook fired — poll until confirmed
  return (
    <PaymentVerifyingPoller
      sessionId={sessionId}
      locale={locale}
      bookingReference={data.bookingReference}
    />
  );
}

// ─── Success State ─────────────────────────────────────────────────────────────

function SuccessState({ data, locale }: { data: VerifiedPaymentData; locale: string }) {
  const pickupLabel = data.pickupOption === "DELIVERY" ? "Delivery to" : "Pick up at office";
  const dropoffLabel = data.dropoffOption === "DROPOFF" ? "Drop off at" : "Return to office";
  const depositAtPickup = data.depositMethod === "IN_PERSON";

  return (
    <main className="min-h-[calc(100dvh-var(--site-header-offset))] bg-gradient-to-b from-[#e8f7f0] via-[var(--surface-elevated)] to-[var(--background)] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl space-y-5">

        {/* ── Header card ─────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border border-emerald-200/80 bg-white shadow-sm">
          {/* Green top bar */}
          <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-100">Payment confirmed</p>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                Your rental is booked!
              </h1>
            </div>
          </div>

          <div className="p-6">
            {/* Booking reference */}
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Booking Reference
                </p>
                <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-slate-900">
                  {data.bookingReference}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <FileText className="h-5 w-5 text-emerald-700" />
              </div>
            </div>

            {/* Payment row */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
                <span className="text-sm font-semibold text-slate-900">
                  €{data.amountEur.toFixed(2)} paid
                </span>
              </div>
              {data.paidAt && (
                <span className="text-xs text-slate-500">
                  {format(data.paidAt, "d MMM yyyy, HH:mm")}
                </span>
              )}
            </div>

            {/* Email + receipt links */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">Confirmation sent to</p>
                  <p className="truncate text-sm font-semibold text-slate-900">{data.customerEmail}</p>
                </div>
              </div>
              {data.stripeReceiptUrl && (
                <a
                  href={data.stripeReceiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Receipt
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Booking summary card ─────────────────────────────────────────── */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Booking Summary</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Vehicle */}
            <div className="flex items-start gap-4 px-6 py-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-blue)]/10">
                <span className="text-base">🛵</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Vehicle</p>
                <p className="mt-0.5 font-semibold text-slate-900">{data.vehicleName}</p>
              </div>
            </div>

            {/* Dates + duration */}
            <div className="flex items-start gap-4 px-6 py-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-blue)]/10">
                <Calendar className="h-4 w-4 text-[var(--brand-blue)]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500">Rental Dates</p>
                <div className="mt-0.5 grid grid-cols-2 gap-x-4 gap-y-0.5">
                  <div>
                    <p className="text-xs text-slate-400">Pickup</p>
                    <p className="font-semibold text-slate-900">
                      {format(data.pickupDateTime, "EEE, d MMM yyyy")}
                    </p>
                    <p className="text-sm text-slate-600">{format(data.pickupDateTime, "HH:mm")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Return</p>
                    <p className="font-semibold text-slate-900">
                      {format(data.returnDateTime, "EEE, d MMM yyyy")}
                    </p>
                    <p className="text-sm text-slate-600">{format(data.returnDateTime, "HH:mm")}</p>
                  </div>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span className="text-xs font-medium text-slate-600">
                    {data.billableDays} {data.billableDays === 1 ? "day" : "days"}
                  </span>
                </div>
              </div>
            </div>

            {/* Pickup location */}
            <div className="flex items-start gap-4 px-6 py-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-blue)]/10">
                <MapPin className="h-4 w-4 text-[var(--brand-blue)]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500">Pickup</p>
                <p className="mt-0.5 font-semibold text-slate-900">{pickupLabel}</p>
                {data.pickupAddress && (
                  <p className="text-sm text-slate-600">{data.pickupAddress}</p>
                )}
                {data.pickupOption === "OFFICE" && (
                  <p className="text-sm text-slate-600">
                    42, Triq il-Marina, Pietà, PTA 9046
                  </p>
                )}

                <div className="mt-2 border-t border-slate-100 pt-2">
                  <p className="text-xs font-medium text-slate-500">Return</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">{dropoffLabel}</p>
                  {data.dropoffAddress && (
                    <p className="text-sm text-slate-600">{data.dropoffAddress}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Security deposit notice */}
            {depositAtPickup && (
              <div className="flex items-start gap-4 px-6 py-4">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                  <Shield className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Security Deposit</p>
                  <p className="mt-0.5 font-semibold text-slate-900">
                    €{data.depositAmountEur.toFixed(2)} due at pickup
                  </p>
                  <p className="text-sm text-slate-600">
                    Fully refundable · payable in cash or card at the office
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── What to bring ────────────────────────────────────────────────── */}
        <div className="rounded-3xl border border-[var(--brand-blue)]/20 bg-gradient-to-br from-[var(--brand-blue)]/5 to-white px-6 py-5">
          <h2 className="font-semibold text-slate-900">What to bring at pickup</h2>
          <ul className="mt-3 space-y-2">
            {[
              "Valid driving licence (original)",
              "Passport or national ID",
              depositAtPickup ? `€${data.depositAmountEur.toFixed(2)} security deposit (cash or card)` : null,
              "This booking reference: " + data.bookingReference,
            ]
              .filter(Boolean)
              .map((item) => (
                <li key={item as string} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                    strokeWidth={2.5}
                  />
                  {item}
                </li>
              ))}
          </ul>
        </div>

        {/* ── CTAs ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}/booking?ref=${encodeURIComponent(data.bookingReference)}&submitted=1`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--brand-orange)] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-orange-strong)]"
          >
            View My Booking
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/${locale}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400">
          Questions?{" "}
          <a href="mailto:info@exploremaltarentals.com" className="underline hover:text-slate-600">
            info@exploremaltarentals.com
          </a>
          {" · "}
          <a href="https://wa.me/35677506799" className="underline hover:text-slate-600">
            WhatsApp
          </a>
        </p>
      </div>
    </main>
  );
}

// ─── Error States ──────────────────────────────────────────────────────────────

function NoSessionState({ locale }: { locale: string }) {
  return (
    <StateShell
      locale={locale}
      icon={<AlertCircle className="h-7 w-7 text-amber-500" />}
      iconBg="bg-amber-100"
      title="No payment session found"
      message="If you completed a payment, check your email for a confirmation. If something went wrong, please contact us."
    />
  );
}

function ErrorState({ locale }: { locale: string }) {
  return (
    <StateShell
      locale={locale}
      icon={<AlertCircle className="h-7 w-7 text-amber-500" />}
      iconBg="bg-amber-100"
      title="Could not verify payment"
      message="We couldn't confirm your payment status right now. If you were charged, check your email — a confirmation will arrive shortly. Otherwise contact us."
    />
  );
}

function StateShell({
  locale,
  icon,
  iconBg,
  title,
  message,
}: {
  locale: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  message: string;
}) {
  return (
    <main className="min-h-[calc(100dvh-var(--site-header-offset))] bg-[var(--surface-elevated)] px-4 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
            {icon}
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </div>
        <div className="mt-6 space-y-3">
          <Link
            href={`/${locale}/booking`}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-orange)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-orange-strong)]"
          >
            Look Up My Booking
          </Link>
          <Link
            href={`/${locale}`}
            className="flex w-full items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            Back to Home
          </Link>
        </div>
        <p className="mt-5 text-center text-xs text-slate-400">
          <a href="mailto:info@exploremaltarentals.com" className="underline hover:text-slate-600">
            info@exploremaltarentals.com
          </a>
          {" · "}
          <a href="https://wa.me/35677506799" className="underline hover:text-slate-600">
            WhatsApp
          </a>
        </p>
      </div>
    </main>
  );
}
