import Image from "next/image";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { SiteShell } from "@/components/site-shell";
import { heroContent } from "@/features/home/data/hero-content";
import { BookingSearchFormSkeleton } from "@/features/booking/components/booking-search-form-skeleton";
import { LOGO_PATH } from "@/lib/site-brand-copy";
import { HeroVideoBackground } from "@/features/home/components/hero-video-background";

const BookingSearchForm = dynamic(
  () =>
    import("@/features/booking/components/booking-search-form").then((m) => ({
      default: m.BookingSearchForm,
    })),
  {
    loading: () => <BookingSearchFormSkeleton tone="hero" />,
  },
);

/* ─── tiny SVG pin icon (no external dep, no client bundle cost) ─── */
function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5 text-[var(--orange-400)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21s6-5.2 6-10.2a6 6 0 1 0-12 0C6 15.8 12 21 12 21Z" />
      <circle cx="12" cy="10.8" r="2.2" />
    </svg>
  );
}

export async function VideoHero() {
  const tBrand = await getTranslations("Brand");
  const tNav = await getTranslations("Nav");

  const { videoSrc, posterSrc } = heroContent.media;

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden bg-[var(--ink-950)] text-white"
    >
      {/* ── BACKGROUND LAYER ──────────────────────────────────────
          Stacking order (bottom → top):
            0. ink base              — visible while video loads
            1. poster / video        — client island, fades in once playing
            2. directional scrim     — keeps the left-aligned type legible
            3. grain                 — stops the large gradients from banding
      ──────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="sticky top-[var(--site-header-offset)] h-[calc(100svh-var(--site-header-offset))] overflow-hidden">
          <div className="grain relative h-full w-full">
            {/*
              The footage is graded down here rather than in the overlays: the
              source carries a large, saturated branded billboard that would
              otherwise out-compete the headline no matter how dark the scrim.
              Desaturating and dimming turns it into texture.
            */}
            <div
              className="absolute inset-0"
              style={{ filter: "saturate(0.72) brightness(0.88) contrast(1.05)" }}
            >
              {/* Poster image — fast SSR paint target before video/JS */}
              <Image
                src={posterSrc}
                alt=""
                fill
                preload
                sizes="100vw"
                className="scale-[1.03] object-cover"
              />

              {/* ── Lazy video (client island) ───────────────────────
                  Renders nothing on the server.
                  Client-side: skipped on mobile / reduced-motion / slow network.
                  Fades in over 1.2 s once the first frame is decoded.
              ──────────────────────────────────────────────────────── */}
              <HeroVideoBackground src={videoSrc} posterSrc={posterSrc} />
            </div>

            {/* ── Readability stack ─────────────────────────────────
                Weighted to the left where the headline sits, deepened at the
                bottom to seat the booking panel, and softened at the top so
                the translucent header has something to sit against.
            ──────────────────────────────────────────────────────── */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(95deg, rgba(8,17,28,0.96) 0%, rgba(8,17,28,0.93) 26%, rgba(8,17,28,0.78) 44%, rgba(8,17,28,0.46) 66%, rgba(8,17,28,0.22) 88%, rgba(8,17,28,0.14) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(90% 70% at 16% 46%, rgba(8,17,28,0.42) 0%, transparent 62%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(8,17,28,0.94) 0%, rgba(8,17,28,0.45) 20%, transparent 50%)",
              }}
            />
            <div
              className="absolute inset-x-0 top-0 h-44"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(8,17,28,0.62), transparent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── CONTENT LAYER ─────────────────────────────────────────
          All text / UI is server-rendered and visible immediately —
          no dependency on the video loading at all.
      ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <SiteShell>
          <div className="flex min-h-[min(100svh,52rem)] flex-col justify-between gap-12 pb-14 pt-[calc(var(--site-header-offset)_+_3rem)] sm:min-h-0 sm:pb-16 sm:pt-[calc(var(--site-header-offset)_+_4rem)] lg:gap-16 lg:pb-20 lg:pt-[calc(var(--site-header-offset)_+_5rem)]">
            {/* hero text */}
            <div className="flex min-h-0 flex-1 flex-col justify-start">
              <div className="rise flex w-full justify-end">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-[0.01em] text-white/90 backdrop-blur-md">
                  <PinIcon />
                  {tBrand("locationKicker")}
                </span>
              </div>

              <div className="max-w-3xl">
                <Image
                  src={LOGO_PATH}
                  alt={tNav("logoAlt")}
                  width={480}
                  height={96}
                  className="rise rise-1 mt-8 h-11 w-auto max-w-[min(100%,15rem)] object-contain object-left drop-shadow-[0_6px_28px_rgba(0,0,0,0.55)] sm:h-12 sm:max-w-[min(100%,17rem)]"
                  style={{ width: "auto", height: "auto" }}
                />

                <h1
                  id="home-hero-title"
                  className="type-display rise rise-2 mt-7 max-w-[15ch] text-white [text-shadow:0_2px_40px_rgba(0,0,0,0.55)]"
                >
                  {tBrand("heroTitle")}
                </h1>

                <p className="rise rise-3 mt-6 max-w-xl text-[length:var(--text-lead)] leading-[1.6] text-white/80 [text-shadow:0_1px_20px_rgba(0,0,0,0.6)]">
                  {tBrand("heroDescription")}
                </p>
              </div>
            </div>

            {/* booking search form */}
            <div className="rise rise-4 w-full shrink-0">
              <BookingSearchForm quickFilterTone="hero" />
            </div>
          </div>
        </SiteShell>
      </div>
    </section>
  );
}
