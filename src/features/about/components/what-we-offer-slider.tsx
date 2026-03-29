"use client";

import Image from "next/image";
import { useCallback, useId, useState } from "react";

const BASE = "/about-page-images";

const SLIDES = [
  {
    id: "motorcycles",
    title: "Motorcycles & scooters",
    description:
      "Zip along scenic coastal roads with nimble, well-prepared two-wheelers suited to Malta’s streets and day trips.",
    imageSrc: `${BASE}/motorcycle-rentals.png`,
    imageAlt: "Motorcycles and scooters for rent in Malta",
  },
  {
    id: "atvs",
    title: "ATVs",
    description:
      "Take on beaten-path trails and open stretches with a capable quad when you want more adventure off the main roads.",
    imageSrc: `${BASE}/atv.png`,
    imageAlt: "ATV rental for trails and open terrain in Malta",
  },
  {
    id: "bicycles",
    title: "Bicycles",
    description:
      "Enjoy a relaxed pace through historic streets, promenades, and seaside routes — perfect for easy exploration.",
    imageSrc: `${BASE}/bicycle-rentals.png`,
    imageAlt: "Bicycle rental for exploring Malta by bike",
  },
  {
    id: "tours",
    title: "Guided tours",
    description:
      "Go beyond rentals with tours designed to showcase iconic landmarks and local treasures, first visit or a fresh look at the island.",
    imageSrc: `${BASE}/guided-tours.jpg`,
    imageAlt: "Guided tours of Malta’s landmarks and local highlights",
  },
] as const;

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function WhatWeOfferSlider() {
  const [index, setIndex] = useState(0);
  const count = SLIDES.length;
  const labelId = useId();

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  /** Track is `count × viewport` wide; each slide is `1/count` of the track (= one full viewport). `min-w-full` breaks this because % is vs the flex row, not the clip box. */
  const trackWidthPercent = count * 100;
  const slideWidthOnTrackPercent = 100 / count;
  const translatePercent = (index * 100) / count;

  return (
    <div className="mt-10">
      <div
        className="relative w-full overflow-hidden rounded-xl"
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={labelId}
      >
        <p id={labelId} className="sr-only">
          What we offer: slide {index + 1} of {count}
        </p>
        <div
          className="flex motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-out"
          style={{
            width: `${trackWidthPercent}%`,
            transform: `translate3d(-${translatePercent}%, 0, 0)`,
          }}
        >
          {SLIDES.map((slide) => (
            <article
              key={slide.id}
              aria-hidden={SLIDES[index].id !== slide.id}
              className="box-border shrink-0 py-8 sm:py-10"
              style={{ width: `${slideWidthOnTrackPercent}%` }}
            >
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-10">
                <div className="min-w-0 text-left lg:pr-4">
                  <h3 className="text-2xl font-bold tracking-[-0.02em] text-slate-950 sm:text-[1.65rem]">
                    {slide.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-slate-600">{slide.description}</p>
                </div>
                <div className="mx-auto flex w-full min-w-0 max-w-xl flex-col lg:mx-0 lg:max-w-none">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative flex min-h-[min(18rem,48svh)] min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-slate-100 p-2 sm:min-h-[min(20rem,52svh)] sm:p-3 lg:min-h-[min(26rem,58svh)] lg:p-4">
                      <Image
                        src={slide.imageSrc}
                        alt={slide.imageAlt}
                        width={1200}
                        height={900}
                        className="h-auto max-h-[min(24rem,56svh)] w-full max-w-full rounded-lg object-contain object-center sm:max-h-[min(28rem,58svh)] lg:max-h-[min(34rem,64svh)]"
                        sizes="(min-width: 1024px) 50vw, 92vw"
                        priority={slide.id === "motorcycles"}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Next offer"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border-2 border-[var(--brand-orange)] text-[var(--brand-orange)] transition-colors hover:bg-[var(--brand-orange)]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                  <div
                    className="mt-3 flex flex-wrap items-center justify-center gap-2"
                    role="tablist"
                    aria-label="Choose offer"
                  >
                    {SLIDES.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        role="tab"
                        aria-selected={i === index}
                        aria-label={`Show ${s.title}`}
                        onClick={() => setIndex(i)}
                        className={
                          i === index
                            ? "h-2.5 w-8 shrink-0 rounded-full bg-[var(--brand-orange)] transition-all"
                            : "h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300 transition-colors hover:bg-slate-400"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
