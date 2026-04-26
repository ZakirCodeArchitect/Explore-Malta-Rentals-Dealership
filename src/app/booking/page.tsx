import type { Metadata } from "next";
import Link from "next/link";

import { IndicativeDailyRatesCard } from "@/components/pricing/indicative-daily-rates-card";
import { Container } from "@/components/ui/container";
import { BookingFlow } from "@/features/booking-flow/components/booking-flow";

export const metadata: Metadata = {
  title: "Booking | Malta Rentals",
  description:
    "Multi-step booking flow for Explore Malta Rentals with vehicle selection, trip details, add-ons and terms acceptance.",
};

type BookingPageProps = Readonly<{
  searchParams: Promise<{
    vehicle?: string;
    date?: string;
    returnDate?: string;
    pickupDate?: string;
    dropoffDate?: string;
    pickupTime?: string;
    dropoffTime?: string;
    returnTime?: string;
  }>;
}>;

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const { vehicle, date, returnDate, pickupDate, dropoffDate, pickupTime, dropoffTime, returnTime } = await searchParams;
  const resolvedPickupDate = date ?? pickupDate;
  const resolvedReturnDate = returnDate ?? dropoffDate;

  return (
    <main className="flex flex-1 flex-col">
      <section
        aria-labelledby="booking-heading"
        className="relative isolate flex min-h-dvh scroll-mt-28 flex-col overflow-hidden border-b border-slate-200/70 bg-[var(--surface-elevated)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-slate-100"
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
                Multi-step booking for Explore Malta Rentals
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:mx-0 sm:text-lg">
                Complete all booking stages from vehicle selection to terms acceptance.
                Pricing and backend submission are introduced in the next phases.
              </p>
            </header>

            <div className="mt-10">
              <BookingFlow
                initialVehicleSlug={vehicle}
                initialRental={{
                  pickupDate: resolvedPickupDate,
                  returnDate: resolvedReturnDate,
                  pickupTime,
                  returnTime: returnTime ?? dropoffTime,
                }}
              />
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
