"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  parseBikeImageEntry,
  type BikeImageEntry,
} from "@/features/home/data/home-sections";

const BIKE_IMAGES_BASE = "/BikeImages";
const AUTO_MS = 5500;

function bikeImageSrc(fileName: string) {
  return `${BIKE_IMAGES_BASE}/${encodeURIComponent(fileName)}`;
}

/**
 * Circular hairline control. Hidden at rest on pointer devices and revealed on
 * card hover, but always painted for keyboard focus and touch (no hover state).
 */
const arrowButtonClass = [
  "inline-flex size-9 items-center justify-center rounded-full",
  "bg-white/85 text-ink-700 backdrop-blur-sm",
  "shadow-[inset_0_0_0_1px_var(--line),var(--elev-2)]",
  "transition-[opacity,transform,color,background-color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
  "hover:bg-white hover:text-ink-950 active:scale-95",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-500)]",
  "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
  "[@media(hover:none)]:opacity-100",
  "motion-reduce:transition-none",
].join(" ");

type CardTone = "default" | "white";

type BikeCategoryImageCarouselProps = {
  images: readonly BikeImageEntry[];
  title: string;
  onCardToneChange?: (tone: CardTone) => void;
};

export function BikeCategoryImageCarousel({
  images,
  title,
  onCardToneChange,
}: BikeCategoryImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const pauseRef = useRef(false);

  const parsed = useMemo(
    () => images.map((entry) => parseBikeImageEntry(entry)),
    [images],
  );

  const n = parsed.length;
  const safeIndex = n === 0 ? 0 : ((index % n) + n) % n;

  useEffect(() => {
    if (!onCardToneChange || n === 0) return;
    const whiteBg = parsed[safeIndex]?.whiteBg ?? false;
    onCardToneChange(whiteBg ? "white" : "default");
  }, [safeIndex, parsed, n, onCardToneChange]);

  const go = useCallback(
    (delta: number) => {
      if (n <= 1) return;
      setIndex((i) => (i + delta + n) % n);
    },
    [n],
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (n <= 1 || reducedMotion) return;
    const id = window.setInterval(() => {
      if (!pauseRef.current) {
        setIndex((i) => (i + 1) % n);
      }
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [n, reducedMotion]);

  if (n === 0) return null;

  return (
    <div
      className={[
        "relative z-[1] w-full",
        /* Full-bleed photo stage inside the card's tonal plate. */
        "h-56 sm:h-64 lg:h-[17.5rem] xl:h-72",
      ].join(" ")}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} — photo gallery`}
      onMouseEnter={() => {
        pauseRef.current = true;
      }}
      onMouseLeave={() => {
        pauseRef.current = false;
      }}
    >
      {parsed.map(({ file }, i) => (
        <div
          key={file}
          className={`absolute inset-x-6 bottom-5 top-7 transition-opacity duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] motion-reduce:transition-none ${
            i === safeIndex ? "z-[1] opacity-100" : "z-0 opacity-0"
          }`}
          aria-hidden={i !== safeIndex}
        >
          <Image
            src={bikeImageSrc(file)}
            alt={`${title} — ${file.replace(/\.[^.]+$/, "")}`}
            fill
            sizes="(min-width: 1024px) 44vw, (min-width: 768px) 46vw, 92vw"
            className="origin-bottom object-contain object-bottom transition-transform duration-[var(--dur-slower)] ease-[var(--ease-out-expo)] motion-safe:group-hover:scale-[1.045] motion-reduce:transition-none"
            priority={i === 0}
          />
        </div>
      ))}

      {n > 1 && (
        <div
          className="absolute bottom-4 right-4 z-[2] flex items-center gap-2"
          role="group"
          aria-label={`${title} photos`}
        >
          <button
            type="button"
            onClick={() => go(-1)}
            className={arrowButtonClass}
            aria-label="Previous bike photo"
          >
            <ChevronIcon dir="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className={arrowButtonClass}
            aria-label="Next bike photo"
          >
            <ChevronIcon dir="right" />
          </button>
        </div>
      )}
    </div>
  );
}

function ChevronIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === "left" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}
