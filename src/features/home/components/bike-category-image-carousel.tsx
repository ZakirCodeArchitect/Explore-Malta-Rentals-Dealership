"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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
  layout?: "inline" | "overlay";
  onCardToneChange?: (tone: CardTone) => void;
};

export function BikeCategoryImageCarousel({
  images,
  title,
  layout = "inline",
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

  const layoutClasses =
    layout === "overlay"
      ? "relative h-full w-full"
      : [
          "relative z-0 shrink-0",
          "mx-auto h-44 w-full max-w-[min(100%,18rem)] sm:h-52 sm:max-w-[min(100%,22rem)]",
          "md:mx-0 md:h-56 md:w-[min(42%,13.75rem)] md:max-w-[13.75rem]",
          "lg:h-60 lg:w-[min(40%,15rem)] lg:max-w-[15rem]",
          "xl:h-[15.5rem] xl:w-[min(38%,17.5rem)] xl:max-w-[17.5rem]",
        ].join(" ");

  return (
    <div
      className={layoutClasses}
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
              sizes="(min-width: 1280px) 280px, (min-width: 1024px) 240px, (min-width: 768px) 200px, (min-width: 640px) 352px, 288px"
              className={
                layout === "overlay"
                  ? "object-contain object-right object-bottom drop-shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
                  : "object-contain object-bottom md:object-right md:object-bottom"
              }
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
