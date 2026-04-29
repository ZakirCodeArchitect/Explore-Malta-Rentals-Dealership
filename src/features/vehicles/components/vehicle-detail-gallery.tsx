"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X, ZoomIn } from "lucide-react";

/* ─────────────────────────── types ──────────────────────────── */

type VehicleDetailGalleryProps = Readonly<{
  name: string;
  /** Full-resolution image URLs. May be empty — fallback is shown automatically. */
  images: readonly string[];
}>;

/* ─────────────────────────── modal ──────────────────────────── */

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
      role="dialog"
      aria-modal
      aria-label={`${name} — full gallery`}
      className="fixed inset-0 z-[200] flex flex-col bg-slate-950/95 backdrop-blur-sm"
    >
      {/* header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3 text-white/70">
        <span className="text-sm font-medium">
          {name} — {current + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* main image */}
      <div className="relative flex-1 overflow-hidden">
        {src ? (
          <Image
            key={src}
            src={src}
            alt={`${name} — photo ${current + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/40">
            Image unavailable
          </div>
        )}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}
      </div>

      {/* thumbnail strip */}
      {images.length > 1 ? (
        <div className="shrink-0 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2">
            {images.map((img, i) => (
              <button
                key={img || i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Photo ${i + 1}`}
                className={[
                  "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-opacity",
                  i === current
                    ? "border-white opacity-100"
                    : "border-transparent opacity-40 hover:opacity-75",
                ].join(" ")}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── main export ────────────────────── */

export function VehicleDetailGallery({ name, images }: VehicleDetailGalleryProps) {
  const safeImages = useMemo(() => images ?? [], [images]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mainLoaded, setMainLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStart, setModalStart] = useState(0);

  // Reset active index whenever the images array changes
  // (e.g. vehicle data updated after initial render).
  useEffect(() => {
    queueMicrotask(() => {
      setActiveIdx(0);
      setMainLoaded(false);
    });
  }, [safeImages]);

  const openModal = (index: number) => {
    setModalStart(index);
    setModalOpen(true);
  };

  /* ── empty state ─────────────────────────────────────────── */
  if (safeImages.length === 0) {
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 sm:aspect-[21/9]">
        <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
          Images coming soon
        </div>
      </div>
    );
  }

  const mainSrc = safeImages[activeIdx] ?? safeImages[0]!;
  const thumbs = safeImages.slice(0, 8);
  const extraCount = safeImages.length - thumbs.length;

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          MAIN IMAGE
          Uses aspect-ratio to give Next.js <Image fill> a
          calculable height — this is what was broken before.
      ════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-100">
        {/* aspect-ratio wrapper — guarantees height is never 0 */}
        <div className="relative aspect-[4/3] sm:aspect-[16/9]">
          {/* skeleton — fades out once image loads */}
          <div
            aria-hidden
            className={[
              "absolute inset-0 animate-pulse bg-slate-200 transition-opacity duration-500",
              mainLoaded ? "opacity-0" : "opacity-100",
            ].join(" ")}
          />

          <Image
            key={mainSrc}
            src={mainSrc}
            alt={`${name} — main photo`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 80vw, 60vw"
            className={[
              "object-cover transition-all duration-500",
              mainLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]",
            ].join(" ")}
            priority
            onLoad={() => setMainLoaded(true)}
          />

          {/* hover zoom overlay — clicking opens modal */}
          <button
            type="button"
            onClick={() => openModal(activeIdx)}
            aria-label="View full photo"
            className="group absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-100"
          >
            <span className="flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              <ZoomIn className="h-4 w-4" aria-hidden />
              View full size
            </span>
          </button>

          {/* mobile prev / next arrows */}
          {safeImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setActiveIdx((i) => (i === 0 ? safeImages.length - 1 : i - 1))
                }
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-sm transition hover:bg-white sm:hidden"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveIdx((i) => (i === safeImages.length - 1 ? 0 : i + 1))
                }
                aria-label="Next photo"
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-900 shadow-sm transition hover:bg-white sm:hidden"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          {/* photo counter badge */}
          {safeImages.length > 1 ? (
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-0.5 text-xs font-medium text-white sm:hidden">
              {activeIdx + 1} / {safeImages.length}
            </span>
          ) : null}

          {/* "Show all photos" pill — always visible on desktop */}
          <button
            type="button"
            onClick={() => openModal(activeIdx)}
            className="absolute bottom-3 right-3 hidden items-center gap-1.5 rounded-full border border-white/30 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-lg backdrop-blur-sm transition hover:bg-white sm:flex"
          >
            <Images className="h-3.5 w-3.5" aria-hidden />
            Show all photos
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          THUMBNAIL STRIP
          Always visible — clicking selects main image.
      ════════════════════════════════════════════════════════ */}
      {safeImages.length > 1 ? (
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {thumbs.map((src, i) => (
            <button
              key={src || i}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`Photo ${i + 1}`}
              aria-pressed={i === activeIdx}
              className={[
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:h-20 sm:w-28",
                i === activeIdx
                  ? "border-[var(--brand-orange)] opacity-100 shadow-md"
                  : "border-transparent opacity-60 hover:opacity-90 hover:border-slate-200",
              ].join(" ")}
            >
              <Image
                src={src}
                alt={`${name} — thumbnail ${i + 1}`}
                fill
                sizes="(max-width: 640px) 96px, 112px"
                className="object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </button>
          ))}

          {/* overflow button */}
          {extraCount > 0 ? (
            <button
              type="button"
              onClick={() => openModal(thumbs.length)}
              className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 sm:h-20 sm:w-28"
            >
              <span className="text-sm font-semibold">+{extraCount} more</span>
            </button>
          ) : null}
        </div>
      ) : null}

      {/* mobile dot indicators */}
      {safeImages.length > 1 ? (
        <div className="mt-2 flex justify-center gap-1.5 sm:hidden">
          {safeImages.slice(0, 10).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIdx(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={[
                "h-1.5 rounded-full transition-all duration-200",
                i === activeIdx
                  ? "w-5 bg-[var(--brand-orange)]"
                  : "w-1.5 bg-slate-300",
              ].join(" ")}
            />
          ))}
        </div>
      ) : null}

      {/* modal */}
      {modalOpen ? (
        <ModalGallery
          images={safeImages}
          name={name}
          startIndex={modalStart}
          onClose={() => setModalOpen(false)}
        />
      ) : null}
    </>
  );
}
