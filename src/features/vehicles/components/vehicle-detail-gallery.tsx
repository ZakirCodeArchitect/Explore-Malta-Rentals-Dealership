"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

type VehicleDetailGalleryProps = Readonly<{
  name: string;
  images: readonly string[];
}>;

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-400">
      {label}
    </div>
  );
}

function ModalGallery({
  images,
  name,
  startIndex,
  onClose,
}: {
  images: readonly string[];
  name: string;
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(
    () => setCurrent((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  const src = images[current];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/92 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-label={`${name} full gallery`}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close gallery"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={prev}
        disabled={images.length <= 1}
        aria-label="Previous photo"
        className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-0"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={next}
        disabled={images.length <= 1}
        aria-label="Next photo"
        className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 disabled:opacity-0"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="relative h-[min(90svh,56rem)] w-[min(90vw,76rem)]">
        {src ? (
          <Image
            src={src}
            alt={`${name} — photo ${current + 1} of ${images.length}`}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        ) : (
          <Placeholder label="Image unavailable" />
        )}
      </div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-white/80">
        {current + 1} / {images.length}
      </p>

      {/* thumbnail strip */}
      {images.length > 1 ? (
        <div className="absolute bottom-14 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Photo ${i + 1}`}
              className={[
                "h-12 w-16 overflow-hidden rounded-lg border-2 transition",
                i === current
                  ? "border-white opacity-100"
                  : "border-transparent opacity-50 hover:opacity-80",
              ].join(" ")}
            >
              <Image
                src={img}
                alt=""
                width={64}
                height={48}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function VehicleDetailGallery({ name, images }: VehicleDetailGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStart, setModalStart] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const openModal = (index: number) => {
    setModalStart(index);
    setModalOpen(true);
  };

  const carouselPrev = () =>
    setCarouselIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const carouselNext = () =>
    setCarouselIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  useEffect(() => {
    if (!carouselRef.current) return;
    const el = carouselRef.current.children[carouselIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [carouselIndex]);

  if (images.length === 0) {
    return (
      <div className="relative h-72 overflow-hidden rounded-2xl bg-slate-100 sm:h-96">
        <Placeholder label="Image coming soon" />
      </div>
    );
  }

  const main = images[0]!;
  const side = images.slice(1, 5);

  return (
    <>
      {/* ─── DESKTOP grid (≥ sm) ─────────────────────────────── */}
      <div className="relative hidden sm:block">
        <div
          className={[
            "grid gap-2 overflow-hidden rounded-2xl",
            side.length === 0
              ? ""
              : side.length === 1
                ? "grid-cols-2"
                : side.length <= 3
                  ? "grid-cols-[2fr_1fr]"
                  : "grid-cols-[2fr_1fr] grid-rows-2",
          ].join(" ")}
          style={{ maxHeight: "28rem" }}
        >
          {/* main */}
          <button
            type="button"
            onClick={() => openModal(0)}
            className={[
              "group relative block overflow-hidden bg-slate-100",
              side.length >= 2 ? "row-span-2" : "",
            ].join(" ")}
            aria-label="View main photo"
          >
            <Image
              src={main}
              alt={`${name} — main photo`}
              fill
              sizes="(min-width: 1024px) 55vw, 65vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              priority
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
          </button>

          {/* side images */}
          {side.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => openModal(i + 1)}
              className="group relative block overflow-hidden bg-slate-100"
              aria-label={`View photo ${i + 2}`}
            >
              <Image
                src={src}
                alt={`${name} — photo ${i + 2}`}
                fill
                sizes="25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                loading="lazy"
              />
              {/* dim overlay for last thumbnail + "show all" label */}
              {i === 3 && images.length > 5 ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900">
                    +{images.length - 5} more
                  </span>
                </div>
              ) : null}
            </button>
          ))}
        </div>

        {/* "Show all photos" pill */}
        <button
          type="button"
          onClick={() => openModal(0)}
          className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-md transition hover:bg-slate-50"
        >
          <Images className="h-3.5 w-3.5" />
          Show all photos
        </button>
      </div>

      {/* ─── MOBILE carousel ─────────────────────────────────── */}
      <div className="relative sm:hidden">
        <div className="relative h-64 overflow-hidden rounded-2xl bg-slate-100">
          {images[carouselIndex] ? (
            <Image
              src={images[carouselIndex]!}
              alt={`${name} — photo ${carouselIndex + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              priority={carouselIndex === 0}
              loading={carouselIndex === 0 ? "eager" : "lazy"}
            />
          ) : (
            <Placeholder label="Image unavailable" />
          )}
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={carouselPrev}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={carouselNext}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-slate-900 shadow-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-0.5 text-xs font-medium text-white">
                {carouselIndex + 1}/{images.length}
              </span>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => openModal(carouselIndex)}
            className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900"
          >
            <Images className="h-3 w-3" />
            All photos
          </button>
        </div>

        {/* dot indicators */}
        {images.length > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCarouselIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
                className={[
                  "h-1.5 rounded-full transition-all duration-200",
                  i === carouselIndex
                    ? "w-5 bg-[var(--brand-orange)]"
                    : "w-1.5 bg-slate-300",
                ].join(" ")}
              />
            ))}
          </div>
        ) : null}

        {/* hidden scroll-snap track for keyboard/btn nav */}
        <div ref={carouselRef} aria-hidden className="sr-only" />
      </div>

      {modalOpen ? (
        <ModalGallery
          images={images}
          name={name}
          startIndex={modalStart}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  );
}
