import type { Metadata } from "next";
import Link from "next/link";

import { IndicativeDailyRatesCard } from "@/components/pricing/indicative-daily-rates-card";
import { Container } from "@/components/ui/container";
import { BookingSearchForm } from "@/features/booking/components/booking-search-form";

/** Booking hero backdrop (`public/malta-1.jpg`). */
const BOOKING_HERO_BACKDROP = "/malta-1.jpg";

export const metadata: Metadata = {
  title: "Booking | Malta Rentals",
  description:
    "Find, book and rent easily with Explore Malta Rentals — Pietà pickup, optional off-site service, deposit options, then browse available scooters.",
};

export default function BookingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section
        aria-labelledby="booking-heading"
        className="relative isolate flex min-h-dvh scroll-mt-28 flex-col overflow-hidden border-b border-slate-200/70 bg-[var(--surface-elevated)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: [
              "linear-gradient(115deg, rgba(255,255,255,0.42) 0%, rgba(248,250,252,0.2) 42%, rgba(236,245,252,0.12) 100%)",
              `url("${BOOKING_HERO_BACKDROP}")`,
            ].join(", "),
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-white/35"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.12] via-transparent to-white/[0.08]"
        />

        <Container className="relative z-10 flex min-h-0 flex-1 flex-col justify-end pt-20 pb-10 sm:pt-24 sm:pb-14">
          <div className="relative z-10 mx-auto w-full max-w-5xl">
            <header className="text-center sm:text-left">
              <h1
                id="booking-heading"
                className="text-4xl font-bold tracking-[-0.04em] text-[var(--foreground)] sm:text-5xl"
              >
                Find, Book and Rent easily with Explore Malta Rentals
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:mx-0 sm:text-lg">
                Shop pickup in Pietà, optional off-site pickup or drop-off (€20 each, payable at checkout), then browse
                available scooters.
              </p>
            </header>

            <div className="mt-10">
              <BookingSearchForm />
            </div>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="booking-indicative-rates-heading"
        className="scroll-mt-28 border-t border-slate-200/70 bg-[var(--surface-soft)] py-12 sm:py-16"
      >
        <Container>
          <div className="mx-auto max-w-5xl">
            <h2
              id="booking-indicative-rates-heading"
              className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl"
            >
              Rates at a glance
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
              Ballpark per-calendar-day amounts for motorcycles and scooters before
              extras, use these as a guide while you search.
            </p>
            <div className="mt-8 w-full">
              <IndicativeDailyRatesCard />
            </div>
            <p className="mt-8 text-center text-sm text-slate-600 sm:text-left">
              Want the full picture on what&apos;s included?{" "}
              <Link
                href="/#services"
                className="font-semibold text-slate-900 underline decoration-[var(--brand-orange)]/45 underline-offset-4 transition-colors hover:text-[var(--brand-orange-strong)] hover:decoration-[var(--brand-orange)]"
              >
                Services &amp; benefits
              </Link>
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
