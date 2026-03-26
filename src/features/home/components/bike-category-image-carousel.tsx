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
      className="absolute -right-2 bottom-0 top-0 z-0 w-[min(100%,17rem)] sm:-right-4 sm:w-[min(100%,20rem)]"
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
      <div className="relative h-full w-full">
        {parsed.map(({ file }, i) => (
          <div
            key={file}
            className={`absolute inset-0 transition-opacity duration-500 ease-out ${
              i === safeIndex ? "z-[1] opacity-100" : "z-0 opacity-0"
            }`}
            aria-hidden={i !== safeIndex}
          >
            <Image
              src={bikeImageSrc(file)}
              alt={`${title} — ${file.replace(/\.[^.]+$/, "")}`}
              fill
              sizes="(min-width: 768px) 320px, 272px"
              className="object-contain object-right object-bottom"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {n > 1 && (
        <div
          className="pointer-events-auto absolute bottom-1 right-0 z-10 flex items-center gap-0.5 sm:bottom-2"
          role="group"
          aria-label={`${title} photos`}
        >
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex items-center justify-center rounded-md bg-transparent p-0.5 text-slate-600 transition hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-blue)]"
            aria-label="Previous bike photo"
          >
            <ChevronIcon dir="left" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex items-center justify-center rounded-md bg-transparent p-0.5 text-slate-600 transition hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-blue)]"
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
      className="h-3.5 w-3.5"
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
