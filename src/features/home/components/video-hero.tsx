import { SiteShell } from "@/components/site-shell";
import { heroContent } from "@/features/home/data/hero-content";
import { HeroBookingPanel } from "@/features/home/components/hero-booking-panel";

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

export function VideoHero() {
  const poster = heroContent.media.poster ?? undefined;
  const posterProps = poster ? { poster } : {};

  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate overflow-hidden bg-[var(--background)] text-[var(--foreground)]"
    >
      <div className="absolute inset-0">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-[center_30%] bg-no-repeat"
          style={
            poster
              ? { backgroundImage: `url("${poster}")` }
              : undefined
          }
        />
        <video
          aria-hidden="true"
          className="absolute inset-0 hidden h-full w-full object-cover object-[center_28%] motion-safe:block motion-reduce:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          {...posterProps}
        >
          <source src={heroContent.media.videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-slate-950/25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,124,165,0.18),transparent_42%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(95deg,rgba(12,24,38,0.78)_0%,rgba(22,42,62,0.52)_32%,rgba(245,251,255,0.08)_58%,rgba(245,251,255,0.28)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(10,22,36,0.72)_0%,rgba(16,34,52,0.45)_38%,rgba(245,251,255,0)_72%)] lg:w-[72%]" />
        <div className="absolute inset-x-0 bottom-0 h-52 bg-[linear-gradient(180deg,rgba(245,251,255,0)_0%,rgba(245,251,255,0.12)_38%,rgba(245,251,255,0.55)_100%)] sm:h-60" />
      </div>

      <div className="relative z-10">
        <SiteShell>
          <div className="flex min-h-[min(100svh,52rem)] flex-col justify-between pb-7 pt-24 sm:min-h-[min(100svh,54rem)] sm:pb-8 sm:pt-28 lg:min-h-[56rem] lg:pb-10 lg:pt-32">
            <div className="flex min-h-0 flex-1 flex-col justify-center pb-8 sm:pb-10 lg:pb-12">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-white/90">
                  <PinIcon />
                  <span>{heroContent.location}</span>
                </div>

                <div className="mt-5 max-w-2xl sm:mt-6">
                  <h1
                    id="home-hero-title"
                    className="max-w-4xl text-5xl font-bold tracking-[-0.045em] text-white sm:text-6xl sm:leading-[0.95] lg:text-[5.25rem] lg:leading-[0.96] xl:text-[5.75rem]"
                  >
                    {heroContent.title}
                  </h1>
                  <p className="mt-5 max-w-xl text-base leading-7 text-white/88 sm:mt-6 sm:text-lg sm:leading-8">
                    {heroContent.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <HeroBookingPanel />
            </div>
          </div>
        </SiteShell>
      </div>
    </section>
  );
}
