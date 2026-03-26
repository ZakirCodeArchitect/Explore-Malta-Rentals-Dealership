"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { testimonials } from "@/features/home/data/home-sections";

const TRUST_GREEN = "#19b15c";

function RatingSquares({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, idx) => {
        const filled = idx < rating;
        return (
          <span
            // Star badges in the screenshot are “square-ish”
            key={idx}
            className="inline-flex h-6 w-6 items-center justify-center rounded-[0.45rem] border"
            style={{
              background: filled ? TRUST_GREEN : "transparent",
              borderColor: filled ? TRUST_GREEN : "rgba(25,177,92,0.25)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
            >
              <path
                d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                stroke={filled ? "white" : "rgba(16,35,53,0.35)"}
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        );
      })}
    </div>
  );
}

function TestimonialCard({
  name,
  date,
  location,
  quote,
  rating,
}: {
  name: string;
  date: string;
  location: string;
  quote: string;
  rating: number;
}) {
  return (
    <article className="w-[340px] sm:w-[420px] shrink-0 rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <RatingSquares rating={rating} />
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-[var(--brand-blue)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 19H6a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h5v10Z" />
            <path d="M22 19h-5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h5v10Z" />
          </svg>
        </span>
      </div>

      <p className="mt-4 text-[0.98rem] leading-7 text-slate-700">
        {quote}
      </p>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-[-0.01em] text-slate-900">
            {name}
          </p>
          <p className="text-sm text-slate-500">{location}</p>
        </div>
        <p className="text-sm text-slate-500">{date}</p>
      </div>
    </article>
  );
}

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const cards = useMemo(() => testimonials, []);

  const measure = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    measure();
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;

    const cardWidth = 420; // keeps behavior stable with tailwind breakpoints
    el.scrollBy({
      left: dir * (cardWidth + 24),
      behavior: "smooth",
    });
  };

  return (
    <section
      aria-labelledby="testimonials-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-white py-16"
    >
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-[0.14em] text-[var(--brand-blue)]">
              THOUSANDS TRUST OUR RENTALS
            </p>
            <h2
              id="testimonials-title"
              className="mt-4 text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl"
            >
              Don't take our word for it,
              <br />
              see what our clients say
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Real feedback from tourists who explored Malta with our vehicles
              and support.
            </p>

            <div className="mt-7 inline-flex items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-[0_18px_50px_-45px_rgba(2,6,23,0.18)]">
                <span
                  aria-hidden="true"
                  className="inline-flex h-5 w-5 items-center justify-center rounded bg-[rgba(25,177,92,0.12)]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 text-[var(--brand-blue)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  TrustPilot
                </span>
                <span className="text-sm font-semibold text-[var(--brand-orange)]">
                  Excellent
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-12">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
          >
            {cards.map((t) => (
              <div key={t.id} className="snap-start">
                <TestimonialCard
                  name={t.name}
                  date={t.date}
                  location={t.location}
                  quote={t.quote}
                  rating={t.rating}
                />
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-end justify-end gap-3 pr-2">
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              disabled={!canLeft}
              aria-label="Scroll testimonials left"
              className="pointer-events-auto mb-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_20px_60px_-45px_rgba(2,6,23,0.35)] transition-opacity disabled:opacity-40"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => scrollByCards(1)}
              disabled={!canRight}
              aria-label="Scroll testimonials right"
              className="pointer-events-auto mb-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_20px_60px_-45px_rgba(2,6,23,0.35)] transition-opacity disabled:opacity-40"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}

