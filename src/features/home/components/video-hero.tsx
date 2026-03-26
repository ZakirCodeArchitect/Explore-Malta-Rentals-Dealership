import { Container } from "@/components/ui/container";
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
        <div className="absolute inset-0 bg-white/8" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,124,165,0.2),transparent_40%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(95deg,rgba(18,36,54,0.68)_0%,rgba(27,53,76,0.48)_30%,rgba(245,251,255,0.12)_58%,rgba(245,251,255,0.34)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(12,29,46,0.62)_0%,rgba(18,40,60,0.38)_34%,rgba(245,251,255,0)_68%)] lg:w-[68%]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,rgba(245,251,255,0)_0%,rgba(245,251,255,0.14)_42%,rgba(245,251,255,0.48)_100%)] sm:h-56" />
      </div>

      <Container className="relative z-10">
        <div className="flex min-h-[40rem] flex-col justify-between py-6 sm:min-h-[43rem] sm:py-7 lg:min-h-[46rem] lg:py-8">
          <div className="flex flex-1 items-end pb-4 sm:pb-5 lg:items-center lg:pb-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-sm text-white/86">
                <PinIcon />
                <span>{heroContent.location}</span>
              </div>

              <div className="mt-4 max-w-2xl">
                <h1
                  id="home-hero-title"
                  className="max-w-4xl text-5xl font-medium tracking-[-0.05em] text-white sm:text-6xl sm:leading-[0.94] lg:text-[6rem]"
                >
                  {heroContent.title}
                </h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-white/82 sm:text-lg sm:leading-8">
                  {heroContent.description}
                </p>
              </div>

          </div>
          </div>

          <div>
            <HeroBookingPanel />
          </div>
        </div>
      </Container>
    </section>
  );
}
