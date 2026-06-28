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
      className="h-4 w-4 text-[var(--brand-orange)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
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
      className="relative isolate overflow-hidden bg-white text-white"
    >
      {/* ── BACKGROUND LAYER ──────────────────────────────────────
          Stacking order (bottom → top):
            0. dark slate base       — visible while video loads
            1. HeroVideoBackground   — client island, fades in once playing
            2. radial vignette       — subtle darkening at corners
      ──────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="sticky top-[var(--site-header-offset)] h-[calc(100svh-var(--site-header-offset))] overflow-hidden">

          {/* Poster image — fast SSR paint target before video/JS */}
          <Image
            src={posterSrc}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />

          {/* Dark overlay while video loads */}
          <div className="absolute inset-0 bg-slate-900/40" />

          {/* ── 1. Lazy video (client island) ─────────────────────
              Renders nothing on the server.
              Client-side: skipped on mobile / reduced-motion / slow network.
              Fades in over 1.2 s once the first frame is decoded.
          ──────────────────────────────────────────────────────── */}
          <HeroVideoBackground src={videoSrc} posterSrc={posterSrc} />

          {/* ── 2. Radial vignette ────────────────────────────────
              Darkens the corners of the frame to keep hero text readable.
          ──────────────────────────────────────────────────────── */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 140% 100% at 50% 0%, transparent 35%, rgba(0,0,0,0.45) 100%)",
            }}
          />

        </div>
      </div>

      {/* ── CONTENT LAYER ─────────────────────────────────────────
          All text / UI is server-rendered and visible immediately —
          no dependency on the video loading at all.
      ──────────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <SiteShell>
          <div className="flex min-h-[min(100svh,48rem)] flex-col justify-between gap-10 pb-10 pt-[calc(var(--site-header-offset)_+_2.5rem)] sm:min-h-0 sm:pb-12 sm:pt-[calc(var(--site-header-offset)_+_3rem)] lg:gap-12 lg:pb-14 lg:pt-[calc(var(--site-header-offset)_+_3.5rem)]">

            {/* hero text */}
            <div className="flex min-h-0 flex-1 flex-col justify-start pb-4 sm:pb-6 lg:pb-8">
              <div className="flex w-full justify-end">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]">
                  <PinIcon />
                  <span>{tBrand("locationKicker")}</span>
                </div>
              </div>

              <div className="max-w-3xl">
                <div className="mt-6 sm:mt-7">
                  <Image
                    src={LOGO_PATH}
                    alt={tNav("logoAlt")}
                    width={480}
                    height={96}
                    className="h-16 w-auto max-w-[min(100%,22rem)] object-contain object-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)] sm:h-20 md:h-24 md:max-w-[min(100%,26rem)]"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>

                <div className="mt-5 max-w-2xl sm:mt-6">
                  <h1
                    id="home-hero-title"
                    className="max-w-4xl text-[clamp(2.125rem,7vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.045em] text-white [text-shadow:0_2px_32px_rgba(0,0,0,0.75)] sm:text-6xl sm:leading-[0.95] lg:text-[5.25rem] lg:leading-[0.96] xl:text-[5.75rem]"
                  >
                    {tBrand("heroTitle")}
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-white/88 [text-shadow:0_1px_18px_rgba(0,0,0,0.75)] sm:mt-6 sm:text-lg sm:leading-8">
                    {tBrand("heroDescription")}
                  </p>
                </div>
              </div>
            </div>

            {/* booking search form */}
            <div className="w-full shrink-0">
              <BookingSearchForm quickFilterTone="hero" />
            </div>
          </div>
        </SiteShell>
      </div>
    </section>
  );
}
