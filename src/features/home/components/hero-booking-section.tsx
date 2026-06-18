import Image from "next/image";
import { SiteShell } from "@/components/site-shell";
import { HeroBookingConsole } from "@/features/home/components/hero-booking-console";
import { HeroVideoBackground } from "@/features/home/components/hero-video-background";
import { heroContent } from "@/features/home/data/hero-content";

export function HeroBookingSection() {
  const { videoSrc, posterSrc } = heroContent.media;

  return (
    <section
      id="hero-booking"
      className="relative isolate w-full overflow-hidden scroll-mt-[var(--site-header-offset)]"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src={posterSrc}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <HeroVideoBackground src={videoSrc} posterSrc={posterSrc} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,0,0,0.35),transparent)]" />
      </div>

      <SiteShell>
        <div className="relative z-10 py-10 sm:py-12 lg:py-14">
          <HeroBookingConsole />
        </div>
      </SiteShell>
    </section>
  );
}
