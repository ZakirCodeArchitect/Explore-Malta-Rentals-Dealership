import Image from "next/image";

import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/features/home/components/section-header";
import { aboutBusiness } from "@/features/home/data/home-sections";

const BIKE_IMAGES_BASE = "/BikeImages";

const iconStroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function BadgeTouristIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[var(--brand-orange)]"
      {...iconStroke}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function BadgeSafetyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-slate-600"
      {...iconStroke}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function AboutBusinessSection() {
  const bgSrc = `${BIKE_IMAGES_BASE}/${encodeURIComponent(aboutBusiness.backgroundImage)}`;

  return (
    <section
      id="about"
      aria-labelledby="about-business-title"
      className="relative overflow-hidden scroll-mt-28 border-t border-slate-200/70 bg-white"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(241_245_249)_0%,rgb(248_250_252)_28%,rgb(255_255_255)_50%,rgb(255_255_255)_100%)]"
      />
      <Container className="relative z-10 py-12 pb-14 sm:py-14 sm:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="min-w-0">
            <SectionHeader
              titleId="about-business-title"
              title={aboutBusiness.title}
              tone="light"
              description={
                <span className="block">{aboutBusiness.tagline}</span>
              }
              align="left"
            />

            <div className="mt-8">
              {aboutBusiness.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? "text-base leading-8 text-slate-800"
                      : "mt-4 text-base leading-8 text-slate-700"
                  }
                >
                  {p}
                </p>
              ))}

              <div
                className="mt-7 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-white to-[color-mix(in_srgb,var(--brand-orange)_6%,white)] p-4 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] sm:p-5"
                role="note"
                aria-label="Starting prices"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-orange)]">
                  Pricing
                </p>
                <p className="mt-2 text-lg font-bold tracking-[-0.02em] text-slate-950 sm:text-xl">
                  {aboutBusiness.pricingFromLabel}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
                  {aboutBusiness.pricingFromSupporting}
                </p>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                  <BadgeTouristIcon />
                  Tourist-friendly
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
                  <BadgeSafetyIcon />
                  Safety-first
                </span>
              </div>
            </div>
          </div>

          <div className="relative mx-auto h-[min(22rem,58vh)] w-full min-h-[18rem] overflow-hidden sm:h-[min(26rem,56vh)] sm:min-h-[20rem] lg:h-[min(30rem,32rem)]">
            <Image
              src={bgSrc}
              alt="Motorcycle and rental fleet - Explore Malta Rentals"
              fill
              className="origin-center object-contain object-center scale-[1.16]"
              sizes="(min-width: 1024px) 42vw, 100vw"
              priority={false}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
