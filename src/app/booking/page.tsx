import type { Metadata } from "next";

import { Container } from "@/components/ui/container";
import { BookingSearchForm } from "@/features/booking/components/booking-search-form";
import { BrandBlueUnderlinedText } from "@/features/guide/components/brand-blue-underlined-text";

/** Scenic Malta backdrop — same treatment as Guide “Find us in Malta” hero (`public/malta.png`). */
const BOOKING_HERO_BACKDROP = "/malta.png";

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
        className="relative isolate scroll-mt-28 overflow-hidden border-b border-slate-200/70 bg-[#f0f6fa] pt-24 pb-16 sm:pt-28 sm:pb-20"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            /* Gradient stays lighter so the photo reads clearly; left side keeps text legibility */
            backgroundImage: [
              "linear-gradient(115deg, rgba(255,255,255,0.5) 0%, rgba(248,250,252,0.22) 38%, rgba(236,245,252,0.14) 65%, rgba(230,242,250,0.2) 100%)",
              `url("${BOOKING_HERO_BACKDROP}")`,
            ].join(", "),
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-[var(--background)]/65"
        />

        <Container>
          <div className="relative z-10 mx-auto max-w-5xl">
            <header className="text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange)]">Booking</p>
              <h1
                id="booking-heading"
                className="mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-950 [text-shadow:0_1px_2px_rgba(255,255,255,0.9),0_0_28px_rgba(255,255,255,0.75)] sm:text-5xl"
              >
                Find, book and rent a{" "}
                <BrandBlueUnderlinedText>bike</BrandBlueUnderlinedText> easily
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-slate-700 [text-shadow:0_1px_1px_rgba(255,255,255,0.85)] sm:mx-0 sm:text-lg">
                Set your pickup, dates, and times in one place — then explore available vehicles that match your trip.
              </p>
            </header>

            <div className="mt-10">
              <BookingSearchForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
