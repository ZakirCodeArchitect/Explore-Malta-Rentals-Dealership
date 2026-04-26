import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SiteShell } from "@/components/site-shell";
import { heroContent } from "@/features/home/data/hero-content";
import { BookingSearchForm } from "@/features/booking/components/booking-search-form";
import { LOGO_PATH } from "@/lib/site-brand-copy";

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
  const backgroundImage =
    "backgroundImage" in heroContent.media &&
    typeof heroContent.media.backgroundImage === "string"
      ? heroContent.media.backgroundImage
      : null;

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden bg-[var(--background)] text-white"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="sticky top-[var(--site-header-offset)] h-[calc(100svh-var(--site-header-offset))] overflow-hidden">
          {backgroundImage ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-[center_40%] bg-no-repeat [mask-image:linear-gradient(to_bottom,black_0%,black_52%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_52%,transparent_100%)]"
              style={{ backgroundImage: `url("${backgroundImage}")` }}
            />
          ) : (
            <video
              aria-hidden="true"
              className="absolute left-0 right-0 top-0 hidden h-auto w-full motion-safe:block motion-reduce:hidden"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              webkit-playsinline
              disablePictureInPicture
            >
              <source src={heroContent.media.videoSrc} type="video/mp4" />
            </video>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[min(58vh,34rem)] sm:h-[min(54vh,36rem)]"
            style={{
              background: `linear-gradient(
                to top,
                color-mix(in srgb, var(--background) 90%, transparent) 0%,
                color-mix(in srgb, var(--background) 72%, transparent) 20%,
                color-mix(in srgb, var(--background) 48%, transparent) 42%,
                color-mix(in srgb, var(--background) 24%, transparent) 62%,
                color-mix(in srgb, var(--background) 8%, transparent) 80%,
                transparent 100%
              )`,
            }}
          />
        </div>
      </div>

      <div className="relative z-10">
        <SiteShell>
          <div className="flex min-h-[min(100svh,48rem)] flex-col justify-between gap-10 pb-10 pt-[calc(var(--site-header-offset)_+_2.5rem)] sm:min-h-0 sm:pb-12 sm:pt-[calc(var(--site-header-offset)_+_3rem)] lg:gap-12 lg:pb-14 lg:pt-[calc(var(--site-header-offset)_+_3.5rem)]">
            <div className="flex min-h-0 flex-1 flex-col justify-start pb-4 sm:pb-6 lg:pb-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.85)]">
                  <PinIcon />
                  <span>{tBrand("locationKicker")}</span>
                </div>

                <div className="mt-6 sm:mt-7">
                  <Image
                    src={LOGO_PATH}
                    alt={tNav("logoAlt")}
                    width={480}
                    height={96}
                    priority
                    className="h-16 w-auto max-w-[min(100%,22rem)] object-contain object-left drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)] sm:h-20 md:h-24 md:max-w-[min(100%,26rem)]"
                    style={{ width: "auto" }}
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

            <div className="w-full max-w-5xl shrink-0">
              <BookingSearchForm />
            </div>
          </div>
        </SiteShell>
      </div>
    </section>
  );
}
