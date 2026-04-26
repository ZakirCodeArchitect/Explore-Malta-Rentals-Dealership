"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { startTransition, useCallback, useEffect, useId, useMemo, useState } from "react";

const GUIDE_IMAGES_BASE = "/GuidePageImages";

/** Green line — `public/GuidePageImages/green-line.png`. */
const IMG_GREEN_LINE = `${GUIDE_IMAGES_BASE}/${encodeURIComponent("green-line.png")}`;
/** White parking bay — `white parking.jpg`. */
const IMG_WHITE_PARKING = `${GUIDE_IMAGES_BASE}/${encodeURIComponent("white parking.jpg")}`;
/** Motorcycle (MC) bay — `mc parking.png`. */
const IMG_MC_PARKING = `${GUIDE_IMAGES_BASE}/${encodeURIComponent("mc parking.png")}`;
/** Disabled bay — `disabled.jpg`. */
const IMG_BLUE_DISABLED = `${GUIDE_IMAGES_BASE}/${encodeURIComponent("disabled.jpg")}`;

export type ActiveLineColorId = "white" | "yellow" | "blue" | "green";

type LineColorSubrule = Readonly<{
  id: ActiveLineColorId;
  title: string;
  tag: string;
  description: string;
  images: readonly { src: string; alt: string }[];
}>;

type MajorRuleLineColors = Readonly<{
  id: "line-colors";
  title: string;
  description: string;
}>;

type MajorRuleValidSpaces = Readonly<{
  id: "valid-spaces";
  title: string;
  description: string;
  images: readonly { src: string; alt: string }[];
}>;

type MajorRule = MajorRuleLineColors | MajorRuleValidSpaces;

const LINE_COLOR_TAG_STYLES: Record<ActiveLineColorId, string> = {
  white: "border-slate-200/90 bg-slate-50 text-slate-900",
  yellow: "border-amber-200/90 bg-amber-50 text-amber-950",
  blue: "border-sky-200/90 bg-sky-50 text-sky-950",
  green: "border-emerald-200/90 bg-emerald-50 text-emerald-950",
};

const LINE_COLOR_FOCUS_RING: Record<ActiveLineColorId, string> = {
  white: "focus-visible:ring-slate-500/55",
  yellow: "focus-visible:ring-amber-500/55",
  blue: "focus-visible:ring-sky-500/55",
  green: "focus-visible:ring-emerald-500/55",
};

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

export type GuideParkingRulesSliderProps = Readonly<{
  onActiveLineColorChange?: (id: ActiveLineColorId | null) => void;
}>;

function imageGridClass(imageCount: number) {
  if (imageCount >= 3) return "grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3";
  if (imageCount === 2) return "grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3";
  return "grid w-[min(15rem,82vw)] max-w-full grid-cols-1 sm:w-[17rem]";
}

export function GuideParkingRulesSlider({ onActiveLineColorChange }: GuideParkingRulesSliderProps = {}) {
  const t = useTranslations("Guide");

  const lineColorSubrules = useMemo(
    (): LineColorSubrule[] => [
      {
        id: "white",
        title: t("parkingLineWhiteTitle"),
        tag: t("parkingLineWhiteTag"),
        description: t("parkingLineWhiteDescription"),
        images: [
          { src: IMG_WHITE_PARKING, alt: t("parkingLineWhiteImg1Alt") },
          { src: IMG_MC_PARKING, alt: t("parkingLineWhiteImg2Alt") },
        ],
      },
      {
        id: "yellow",
        title: t("parkingLineYellowTitle"),
        tag: t("parkingLineYellowTag"),
        description: t("parkingLineYellowDescription"),
        images: [
          {
            src: `${GUIDE_IMAGES_BASE}/${encodeURIComponent("double-yellow-lines.jpg")}`,
            alt: t("parkingLineYellowImg1Alt"),
          },
          {
            src: `${GUIDE_IMAGES_BASE}/${encodeURIComponent("reserved.jpg")}`,
            alt: t("parkingLineYellowImg2Alt"),
          },
          {
            src: `${GUIDE_IMAGES_BASE}/${encodeURIComponent("Yellow_lines_1.jpg")}`,
            alt: t("parkingLineYellowImg3Alt"),
          },
        ],
      },
      {
        id: "blue",
        title: t("parkingLineBlueTitle"),
        tag: t("parkingLineBlueTag"),
        description: t("parkingLineBlueDescription"),
        images: [{ src: IMG_BLUE_DISABLED, alt: t("parkingLineBlueImg1Alt") }],
      },
      {
        id: "green",
        title: t("parkingLineGreenTitle"),
        tag: t("parkingLineGreenTag"),
        description: t("parkingLineGreenDescription"),
        images: [{ src: IMG_GREEN_LINE, alt: t("parkingLineGreenImg1Alt") }],
      },
    ],
    [t],
  );

  const majorRules = useMemo(
    (): MajorRule[] => [
      { id: "line-colors", title: t("parkingMajor1Title"), description: t("parkingMajor1Description") },
      {
        id: "valid-spaces",
        title: t("parkingMajor2Title"),
        description: t("parkingMajor2Description"),
        images: [{ src: IMG_MC_PARKING, alt: t("parkingMajor2ImgAlt") }],
      },
    ],
    [t],
  );

  const [majorIndex, setMajorIndex] = useState(0);
  const [lineColorIndex, setLineColorIndex] = useState(0);
  const majorCount = majorRules.length;
  const lineColorCount = lineColorSubrules.length;
  const majorLabelId = useId();
  const lineColorRegionId = useId();

  const goNextMajor = useCallback(() => {
    setMajorIndex((i) => (i + 1) % majorCount);
  }, [majorCount]);

  useEffect(() => {
    startTransition(() => {
      setLineColorIndex(0);
    });
  }, [majorIndex]);

  useEffect(() => {
    onActiveLineColorChange?.(majorIndex === 0 ? lineColorSubrules[lineColorIndex]!.id : null);
  }, [majorIndex, lineColorIndex, onActiveLineColorChange, lineColorSubrules]);

  const activeLineColorRule = lineColorSubrules[lineColorIndex]!;
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
          {t("parkingSrMajorSlide", { current: majorIndex + 1, total: majorCount })}
        </p>
        {majorRules.map((rule, slideIdx) => (
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
                    {t("parkingSrLineColourSlide", { current: lineColorIndex + 1, total: lineColorCount })}
                  </p>
                  <article className="rounded-xl p-6">
                    <h3 className="text-base font-bold tracking-tight text-slate-950 sm:text-lg">{rule.title}</h3>
                    <p className="mt-4 text-sm leading-6 text-slate-700 sm:text-[0.9375rem] sm:leading-7">
                      {rule.description}
                    </p>
                    <div className="mt-3 space-y-3">
                      <div
                        className="flex flex-wrap gap-2"
                        role="tablist"
                        aria-label={t("parkingAriaTablistLineColour")}
                      >
                        {lineColorSubrules.map((sub, i) => (
                          <button
                            key={sub.id}
                            type="button"
                            role="tab"
                            aria-selected={i === lineColorIndex}
                            aria-label={t("parkingAriaShowLine", { line: sub.tag })}
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
                      {lineColorSubrules.map((sub, i) => (
                        <div
                          key={sub.id}
                          aria-hidden={lineColorIndex !== i}
                          className={lineColorIndex === i ? "block" : "hidden"}
                        >
                          <div className={imageGridClass(sub.images.length)}>
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
                                    sub.images.length > 2
                                      ? "(min-width: 640px) 28vw, 88vw"
                                      : sub.images.length > 1
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
                    aria-label={t("parkingAriaNextMajor")}
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
                    <div className="mx-auto max-w-lg">
                      {"images" in rule &&
                        rule.images.map((image) => (
                          <Image
                            key={image.src}
                            src={image.src}
                            alt={image.alt}
                            width={1200}
                            height={900}
                            className="h-auto w-full rounded-md object-cover object-center"
                            sizes="(min-width: 1024px) 28rem, 92vw"
                          />
                        ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={goNextMajor}
                    aria-label={t("parkingAriaNextMajor")}
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
        aria-label={t("parkingAriaMajorTablist")}
      >
        {majorRules.map((rule, i) => (
          <button
            key={rule.id}
            type="button"
            role="tab"
            aria-selected={i === majorIndex}
            aria-label={t("parkingAriaShowMajor", { title: rule.title })}
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
