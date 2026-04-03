"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/button-link";
import {
  parseBikeImageEntry,
  type BikeCategory,
} from "@/features/home/data/home-sections";
import { BikeCategoryImageCarousel } from "@/features/home/components/bike-category-image-carousel";

type CardTone = "default" | "white";

export function BikeCategoryCard({ cat }: { cat: BikeCategory }) {
  const [tone, setTone] = useState<CardTone>(() => {
    const first = cat.images[0];
    if (first == null) return "default";
    return parseBikeImageEntry(first).whiteBg ? "white" : "default";
  });

  return (
    <div
      className={`group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 p-4 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)] transition-[background-color,box-shadow] duration-300 ease-out hover:shadow-[0_22px_55px_-30px_rgba(2,6,23,0.16)] sm:p-6 ${
        tone === "white" ? "bg-white" : "bg-[#f8fafc]"
      }`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          aria-hidden="true"
          className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(58,124,165,0.12),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,169,57,0.12),transparent_60%)]"
        />
      </div>

      <div className="relative flex min-w-0 flex-col-reverse gap-5 md:flex-row md:items-start md:gap-5 lg:gap-6">
        <div className="relative z-10 min-w-0 flex-1 basis-0">
          <div>
            <p className="text-xs font-semibold tracking-[0.12em] text-[var(--brand-blue)]">
              {cat.id.toUpperCase()}
            </p>
            <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-slate-950 sm:text-2xl">
              {cat.title}
            </h3>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base">
            {cat.description}
          </p>

          <ul className="mt-4 space-y-2">
            {cat.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-[var(--brand-orange)]"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 0 1 .006 1.415l-8.2 8.4a1 1 0 0 1-1.42-.006l-3.4-3.5a1 1 0 1 1 1.426-1.4l2.69 2.76 7.49-7.67a1 1 0 0 1 1.412-.002Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="min-w-0 leading-snug">{b}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink
              href="#booking-preview"
              className="w-full justify-center gap-2 sm:w-auto sm:min-w-[10.5rem] focus-visible:ring-offset-white"
            >
              <BookCtaIcon />
              Book {cat.id}
            </ButtonLink>
            <ButtonLink
              href="#services"
              variant="secondary"
              className="w-full justify-center border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 sm:w-auto sm:min-w-[10.5rem] focus-visible:ring-offset-white"
            >
              See benefits
            </ButtonLink>
          </div>
        </div>

        <BikeCategoryImageCarousel
          images={cat.images}
          title={cat.title}
          onCardToneChange={setTone}
        />
      </div>
    </div>
  );
}

function BookCtaIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-[1.05em] w-[1.05em] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}
