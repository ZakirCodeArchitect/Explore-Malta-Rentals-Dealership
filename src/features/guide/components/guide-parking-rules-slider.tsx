"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";

const GUIDE_IMAGES_BASE = "/GuidePageImages";

/** Green line photo — swap the file at `public/GuidePageImages/green-line.png` to update. */
const IMG_GREEN_LINE = `${GUIDE_IMAGES_BASE}/${encodeURIComponent("green-line.png")}`;

const LINE_COLOR_SUBRULES = [
  {
    id: "blue",
    title: "Blue",
    tag: "Blue Parking",
    description:
      "Use dedicated motorcycle (MC) bays and valid white-line car spaces where allowed — park inside the markings or between two cars as per local rules.",
    images: [
      {
        src: `${GUIDE_IMAGES_BASE}/${encodeURIComponent("mc parking.png")}`,
        alt: "Motorcycle parking bay — blue parking for scooters",
      },
      {
        src: `${GUIDE_IMAGES_BASE}/${encodeURIComponent("white parking.jpg")}`,
        alt: "White-line parking space between vehicles",
      },
    ],
  },
  {
    id: "green",
    title: "Green",
    tag: "Green Lines",
    description:
      "Green markings indicate resident-only or restricted zones — do not park unless you are authorised.",
    images: [{ src: IMG_GREEN_LINE, alt: "Green line road marking — resident or restricted parking" }],
  },
] as const;

const LINE_COLOR_TAG_STYLES: Record<(typeof LINE_COLOR_SUBRULES)[number]["id"], string> = {
  blue: "border-sky-200/90 bg-sky-50 text-sky-950",
  green: "border-emerald-200/90 bg-emerald-50 text-emerald-950",
};

/** Keyboard focus ring per line colour (no brand blue on selected tags) */
const LINE_COLOR_FOCUS_RING: Record<(typeof LINE_COLOR_SUBRULES)[number]["id"], string> = {
  blue: "focus-visible:ring-sky-500/55",
  green: "focus-visible:ring-emerald-500/55",
};

const MAJOR_RULES = [
  {
    id: "line-colors",
    title: "Blue parking and green lines",
    description: "Blue parking and green line zones work differently — check both before you leave your scooter.",
  },
  {
    id: "valid-spaces",
    title: "Always park in valid scooter/motorcycle spaces",
    description:
      "Always park within marked MC parking spaces, or between any two cars in a valid white parking space.",
    images: [
      {
        src: `${GUIDE_IMAGES_BASE}/${encodeURIComponent("mc parking.png")}`,
        alt: "Dedicated MC parking space for scooters and motorcycles",
      },
      {
        src: `${GUIDE_IMAGES_BASE}/${encodeURIComponent("white parking.jpg")}`,
        alt: "White parking space between two parked cars",
      },
    ],
  },
] as const;

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

const LINE_COLOR_COUNT = LINE_COLOR_SUBRULES.length;

export type ActiveLineColorId = (typeof LINE_COLOR_SUBRULES)[number]["id"];

export type GuideParkingRulesSliderProps = Readonly<{
  /** Fires when the visible line-colour tab changes, or `null` when the “valid spaces” slide is active. */
  onActiveLineColorChange?: (id: ActiveLineColorId | null) => void;
}>;

export function GuideParkingRulesSlider({ onActiveLineColorChange }: GuideParkingRulesSliderProps = {}) {
  const [majorIndex, setMajorIndex] = useState(0);
  const [lineColorIndex, setLineColorIndex] = useState(0);
  const majorCount = MAJOR_RULES.length;
  const majorLabelId = useId();
  const lineColorRegionId = useId();

  const goNextMajor = useCallback(() => {
    setMajorIndex((i) => (i + 1) % majorCount);
  }, [majorCount]);

  useEffect(() => {
    setLineColorIndex(0);
  }, [majorIndex]);

  useEffect(() => {
    onActiveLineColorChange?.(majorIndex === 0 ? LINE_COLOR_SUBRULES[lineColorIndex].id : null);
  }, [majorIndex, lineColorIndex, onActiveLineColorChange]);

  const activeLineColorRule = LINE_COLOR_SUBRULES[lineColorIndex];
  const lineColorSingleImage = activeLineColorRule.images.length === 1;

  return (
    <div className="mt-10">
      <div
        className="relative w-full overflow-hidden rounded-xl bg-transparent"
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={majorLabelId}
      >
        <p id={majorLabelId} className="sr-only">
          Parking rules: slide {majorIndex + 1} of {majorCount}
        </p>
        {MAJOR_RULES.map((rule, slideIdx) => (
          <article
            key={rule.id}
            aria-hidden={majorIndex !== slideIdx}
            className={`bg-transparent py-6 sm:py-8 ${slideIdx === majorIndex ? "block" : "hidden"}`}
          >
            {rule.id === "line-colors" ? (
              <div
                className="grid items-start gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-10"
                role="region"
                aria-roledescription="carousel"
                aria-labelledby={lineColorRegionId}
              >
                <div className="flex flex-col gap-4">
                  <p id={lineColorRegionId} className="sr-only">
                    Line colour examples: slide {lineColorIndex + 1} of {LINE_COLOR_COUNT}
                  </p>
                  <article className="rounded-xl p-6">
                    <h3 className="text-base font-bold tracking-tight text-slate-950 sm:text-lg">{rule.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-slate-700 sm:text-[0.9375rem] sm:leading-7">
                      {rule.description}
                    </p>
                    <div className="mt-3 space-y-3">
                      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose line colour">
                        {LINE_COLOR_SUBRULES.map((sub, i) => (
                          <button
                            key={sub.id}
                            type="button"
                            role="tab"
                            aria-selected={i === lineColorIndex}
                            aria-label={`Show ${sub.tag}`}
                            onClick={() => setLineColorIndex(i)}
                            className={
                              i === lineColorIndex
                                ? `inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-tight shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${LINE_COLOR_FOCUS_RING[sub.id]} ${LINE_COLOR_TAG_STYLES[sub.id]}`
                                : "inline-flex items-center rounded-md border border-slate-200/70 bg-transparent px-2.5 py-1 text-xs font-semibold tracking-tight text-slate-600 shadow-sm transition-colors hover:border-slate-300/90 hover:bg-slate-950/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/80 focus-visible:ring-offset-2"
                            }
                          >
                            {sub.tag}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm font-semibold leading-snug text-slate-900">
                        {activeLineColorRule.description}
                      </p>
                    </div>
                  </article>
                </div>

                <div
                  className={`flex min-w-0 items-center gap-3 sm:gap-4 ${lineColorSingleImage ? "justify-center" : ""}`}
                >
                  <div
                    className={
                      lineColorSingleImage
                        ? "relative w-fit max-w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 p-2 sm:p-3"
                        : "relative min-w-0 flex-1 overflow-hidden rounded-lg bg-slate-100 p-2 sm:p-3"
                    }
                  >
                    <div
                      className={
                        lineColorSingleImage
                          ? "relative w-fit overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200/60"
                          : "relative mx-auto w-full max-w-[min(34rem,92vw)] overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200/60 sm:max-w-xl lg:max-w-2xl"
                      }
                    >
                      {LINE_COLOR_SUBRULES.map((sub, i) => (
                        <div
                          key={sub.id}
                          aria-hidden={lineColorIndex !== i}
                          className={lineColorIndex === i ? "block" : "hidden"}
                        >
                          <div
                            className={
                              sub.images.length > 1
                                ? "grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3"
                                : "grid w-[min(15rem,82vw)] max-w-full grid-cols-1 sm:w-[17rem]"
                            }
                          >
                            {sub.images.map((img, imgIdx) => (
                              <figure
                                key={img.src}
                                className="relative isolate aspect-square w-full min-w-0 overflow-hidden rounded-xl bg-slate-200/40"
                              >
                                <Image
                                  src={img.src}
                                  alt={img.alt}
                                  width={900}
                                  height={900}
                                  className="block h-full w-full object-cover"
                                  sizes={
                                    sub.images.length > 1
                                      ? "(min-width: 640px) 18vw, 44vw"
                                      : "(max-width: 640px) min(82vw, 15rem), 17rem"
                                  }
                                  priority={i === 0 && imgIdx === 0}
                                />
                              </figure>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={goNextMajor}
                    aria-label="Next major parking rule"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border-2 border-[var(--brand-orange)] bg-white/50 text-[var(--brand-orange)] backdrop-blur-sm transition-colors hover:bg-[var(--brand-orange)]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-0"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid items-start gap-6 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-10">
                <article className="rounded-xl p-6">
                  <h3 className="text-base font-bold tracking-tight text-slate-950 sm:text-lg">{rule.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-slate-700 sm:text-[0.9375rem] sm:leading-7">
                    {rule.description}
                  </p>
                </article>

                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div className="relative min-w-0 flex-1 overflow-hidden rounded-lg bg-slate-100 p-2 sm:p-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {rule.images.map((image) => (
                        <Image
                          key={image.src}
                          src={image.src}
                          alt={image.alt}
                          width={1200}
                          height={900}
                          className="h-[12rem] w-full rounded-md object-cover object-center sm:h-[16rem] lg:h-[20rem]"
                          sizes="(min-width: 1024px) 24vw, 92vw"
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={goNextMajor}
                    aria-label="Next major parking rule"
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-full border-2 border-[var(--brand-orange)] bg-white/50 text-[var(--brand-orange)] backdrop-blur-sm transition-colors hover:bg-[var(--brand-orange)]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-0"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <div
        className="mt-4 flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="Choose major parking rule"
      >
        {MAJOR_RULES.map((rule, i) => (
          <button
            key={rule.id}
            type="button"
            role="tab"
            aria-selected={i === majorIndex}
            aria-label={`Show: ${rule.title}`}
            onClick={() => setMajorIndex(i)}
            className={
              i === majorIndex
                ? "h-2.5 w-8 shrink-0 rounded-full bg-[var(--brand-orange)] transition-all"
                : "h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300 transition-colors hover:bg-slate-400"
            }
          />
        ))}
      </div>
    </div>
  );
}
