import type { Metadata } from "next";

import { IndicativeDailyRatesCard } from "@/components/pricing/indicative-daily-rates-card";
import { Container } from "@/components/ui/container";
import { BookingSearchForm } from "@/features/booking/components/booking-search-form";
import { BrandBlueUnderlinedText } from "@/features/guide/components/brand-blue-underlined-text";

/** Booking hero backdrop (`public/malta-1.jpg`). */
const BOOKING_HERO_BACKDROP = "/malta-1.jpg";

export const metadata: Metadata = {
  title: "Booking | Malta Rentals",
  description:
    "Find, book and rent a bike easily — choose pickup location, dates, and times, then browse scooters, motorcycles, ATVs, and bicycles across Malta.",
};

export default function BookingPage() {
  return (
    <main className="flex flex-1 flex-col">
      <section
        aria-labelledby="booking-heading"
        className="relative isolate flex min-h-dvh scroll-mt-28 flex-col overflow-hidden border-b border-slate-200/70 bg-[#f0f6fa]"
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
                Find, book and rent a{" "}
                <BrandBlueUnderlinedText>bike</BrandBlueUnderlinedText> easily
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:mx-0 sm:text-lg">
                Set your pickup, dates, and times in one place, then explore available vehicles that match your trip.
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
        className="scroll-mt-28 border-t border-slate-200/70 bg-[#f8fafc] py-12 sm:py-16"
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
          </div>
        </Container>
      </section>
    </main>
  );
}
