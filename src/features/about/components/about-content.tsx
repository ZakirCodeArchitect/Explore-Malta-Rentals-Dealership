import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { IndicativeDailyRatesCard } from "@/components/pricing/indicative-daily-rates-card";
import { SiteShell } from "@/components/site-shell";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/features/home/components/section-header";
import { WhatWeOfferSlider } from "@/features/about/components/what-we-offer-slider";

/** Full-bleed backdrop for the about page company story (under a light wash for text contrast). */
const COMPANY_STORY_BACKDROP = "/GuidePageImages/disabled.jpg";

/** Scenic Malta backdrop for the Explore Malta callout (`public/malta.png`). */
const EXPLORE_MALTA_BACKDROP = "/malta.png";

const COMPANY_STORY_BIKE_SRC = `/BikeImages/${encodeURIComponent("lex moto grey.png")}`;

const FLEET_NECO_ONE_SRC = `/BikeImages/${encodeURIComponent("neco one.png")}`;
const FLEET_LEX_AURA_SRC = `/BikeImages/${encodeURIComponent("lex moto grey.png")}`;

export type AboutSiteContact = Readonly<{
  companyName: string;
}>;

/** Hand-drawn style wavy underline under “About us” (narrative section). */
function AboutUsHeadingWithWave({ titleId }: Readonly<{ titleId: string }>) {
  return (
    <h2
      id={titleId}
      className="mx-auto inline-block text-2xl font-bold leading-none tracking-[-0.02em] sm:text-[1.65rem]"
    >
      <span className="relative inline-flex flex-col items-center">
        <span className="px-0.5 text-slate-950">About us</span>
        <svg
          viewBox="0 0 200 16"
          aria-hidden
          className="-mt-1 block h-[0.65rem] w-[68%] max-w-[9.5rem] min-w-[5.5rem] overflow-visible text-[var(--brand-blue)] sm:-mt-1.5 sm:h-[0.7rem] sm:w-[70%] sm:max-w-[10rem] sm:min-w-[6rem]"
          preserveAspectRatio="none"
        >
          <path
            d="M3 11 C 10 15, 22 7, 36 10 C 52 13, 64 4, 82 9 C 100 14, 114 5, 132 10 C 150 15, 166 6, 184 11 C 192 13, 197 12, 197 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </h2>
  );
}

/** Engine class label — sits in the card body so the photo stays uncluttered. */
function FleetDisplacementBadge({
  displacement,
  variant,
}: Readonly<{ displacement: string; variant: "orange" | "blue" }>) {
  const tone =
    variant === "orange"
      ? "border-orange-200/90 bg-orange-50/95 text-orange-950"
      : "border-[var(--brand-blue)]/25 bg-[#eef6fb] text-[var(--brand-blue-strong)]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[0.65rem] font-semibold tabular-nums leading-none shadow-none ${tone}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3 shrink-0 opacity-90"
        aria-hidden
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v2.5l2.2 2.2" />
        <path d="M5 14h2" />
        <path d="M17 14h2" />
      </svg>
      {displacement}
    </span>
  );
}

function FleetModelCard({
  imageSrc,
  imageAlt,
  displacement,
  variant,
  categoryLabel,
  title,
  imagePanelClassName,
  children,
}: Readonly<{
  imageSrc: string;
  imageAlt: string;
  displacement: string;
  variant: "orange" | "blue";
  categoryLabel: string;
  title: string;
  imagePanelClassName: string;
  children: ReactNode;
}>) {
  return (
    <article className="group grid min-h-0 grid-cols-1 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/[0.04] transition-[box-shadow,transform] duration-300 hover:shadow-md motion-reduce:transition-none sm:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] sm:items-stretch">
      <div className="flex min-h-0 flex-col justify-center border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <FleetDisplacementBadge displacement={displacement} variant={variant} />
          <span className="text-[0.65rem] font-medium text-slate-500">{categoryLabel}</span>
        </div>
        <h3 className="mt-1.5 text-base font-bold tracking-tight text-slate-950 sm:text-[1.0625rem]">
          {title}
        </h3>
        {children}
      </div>
      <div
        className={`relative flex min-h-[min(14rem,38svh)] items-center justify-center p-5 sm:min-h-0 sm:p-6 ${imagePanelClassName}`}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={640}
          height={512}
          className="h-auto w-full max-h-[min(12rem,36svh)] object-contain object-center drop-shadow-[0_12px_24px_rgba(15,23,42,0.12)] transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100 sm:max-h-[min(16rem,36svh)] sm:w-full"
          sizes="(min-width: 640px) 38vw, 92vw"
        />
      </div>
    </article>
  );
}

function CompanyStoryHeroTitle({ titleId }: Readonly<{ titleId: string }>) {
  return (
    <h1
      id={titleId}
      className="text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl sm:leading-[1.06] lg:text-[3.25rem] lg:leading-[1.05]"
    >
      <span className="block sm:inline">Find, book and rent a bike</span>{" "}
      <span className="relative inline-block">
        <span className="text-[var(--brand-blue)]">easily</span>
        <svg
          viewBox="0 0 132 16"
          aria-hidden
          className="pointer-events-none absolute -bottom-1 left-[-2%] h-[0.45em] w-[104%] max-w-none overflow-visible text-[var(--brand-blue)] sm:-bottom-1.5 sm:h-[0.5em]"
          preserveAspectRatio="none"
        >
          <path
            d="M4 11 C 32 15.5, 56 3.5, 88 9.5 C 100 11.5, 112 10.5, 128 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </h1>
  );
}

export function AboutContent({ contact }: Readonly<{ contact: AboutSiteContact }>) {
  const { companyName } = contact;

  return (
    <>
      <section
        id="company-story"
        aria-labelledby="about-story-hero-title"
        className="relative isolate flex min-h-svh w-full scroll-mt-28 flex-col overflow-hidden border-t border-slate-200/70 bg-[#f0f6fa] pt-20 sm:pt-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-[center_40%] bg-no-repeat"
          style={{
            backgroundImage: [
              "linear-gradient(100deg, rgba(255,255,255,0.94) 0%, rgba(248,250,252,0.86) 38%, rgba(245,251,255,0.72) 62%, rgba(240,246,250,0.78) 100%)",
              `url("${COMPANY_STORY_BACKDROP}")`,
            ].join(", "),
          }}
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center py-8 sm:py-10 lg:py-12">
          <SiteShell>
            <div className="grid w-full items-center gap-10 text-left lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.48fr)] lg:gap-8 xl:gap-12">
              <div className="min-w-0 max-w-3xl lg:max-w-none">
                <CompanyStoryHeroTitle titleId="about-story-hero-title" />
                <p className="mt-6 max-w-xl text-base font-normal leading-7 text-slate-900 sm:mt-7 sm:text-lg sm:leading-8">
                  Explore Malta Rentals offers high-quality motorcycles, ATVs, and bicycles, giving you
                  the freedom to discover Malta at your own pace. From scenic coastal rides to guided
                  tours, they provide reliable vehicles and excellent service to ensure a smooth and
                  unforgettable experience.
                </p>
              </div>
              <div className="relative mx-auto h-[min(26rem,52svh)] w-full min-h-[18rem] max-w-2xl overflow-visible sm:h-[min(28rem,50svh)] sm:min-h-[20rem] lg:mx-0 lg:h-[min(40rem,64svh)] lg:max-w-none lg:min-h-[32rem] xl:h-[min(46rem,68svh)] xl:min-h-[36rem]">
                <Image
                  src={COMPANY_STORY_BIKE_SRC}
                  alt={`${companyName} — Lex Moto rental motorcycle`}
                  fill
                  className="object-contain object-center [transform:scale(1.28)] sm:[transform:scale(1.3)] lg:[transform:scale(1.35)] xl:[transform:scale(1.38)]"
                  sizes="(min-width: 1280px) 56vw, (min-width: 1024px) 54vw, 92vw"
                  priority
                />
              </div>
            </div>
          </SiteShell>
        </div>
      </section>

      <section
        id="company-story-narrative"
        aria-labelledby="company-story-narrative-title"
        className="scroll-mt-28 border-t border-slate-200/80 bg-white py-12 sm:py-14 lg:py-16"
      >
        <Container>
          <div className="mx-auto w-full max-w-prose">
            <header className="text-center">
              <AboutUsHeadingWithWave titleId="company-story-narrative-title" />
            </header>
            <div className="mt-6 space-y-5 text-left text-sm leading-relaxed text-slate-600 sm:mt-7 sm:leading-7">
              <p>
                Welcome to {companyName}, your gateway to discovering the beauty, culture, and hidden
                gems of Malta in the most exciting and flexible way possible. Based in Pieta, we specialize
                in providing high-quality Motorcycle&apos;s, ATV&apos;s, and bicycle&apos;s rentals, giving
                you the freedom to explore the island at your own pace.
              </p>
              <p>
                Whether you&apos;re looking for the thrill of riding along Malta&apos;s scenic coastal
                roads, the adventure of the beaten path trails on an ATV, or a relaxed cycling experience
                through historic streets and seaside promenades, we have the perfect ride for you.
              </p>
              <p>
                At {companyName}, we go beyond just rentals. We also offer guided tours designed to
                showcase the very best of Malta, from iconic landmarks to local treasures. Our goal is to
                create unforgettable experiences for every customer, whether you&apos;re visiting for the
                first time or rediscovering the island.
              </p>
              <p>
                We pride ourselves on excellent customer service, well-maintained vehicles, and a genuine
                passion for helping you explore Malta safely and comfortably.
              </p>
              
            </div>
          </div>
        </Container>
      </section>

      <section
        id="what-we-offer"
        aria-labelledby="about-offer-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-[#f8fafc] py-14 sm:py-16"
      >
        <Container>
          <SectionHeader
            titleId="about-offer-title"
            title="What we offer"
            tone="light"
            description="From coastal runs to trail days and relaxed town rides, pick the experience that fits your Malta plan."
          />
          <WhatWeOfferSlider />
        </Container>
      </section>

      <section
        id="explore-malta"
        aria-labelledby="about-explore-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-[#f1f5f9] py-14 sm:py-16"
      >
        <Container>
          <div className="relative isolate min-h-[min(17rem,52svh)] overflow-hidden rounded-lg border border-slate-200/60 shadow-md ring-1 ring-black/[0.04] sm:min-h-[min(19rem,48svh)] lg:min-h-[min(20rem,44svh)]">
            <Image
              src={EXPLORE_MALTA_BACKDROP}
              alt="Malta — coastal and landscape views"
              fill
              className="object-cover object-[center_35%]"
              sizes="(min-width: 1280px) 76rem, 100vw"
              priority={false}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-slate-950/[0.92] via-slate-950/70 to-slate-900/35 sm:via-slate-950/60 sm:to-slate-900/25"
            />
            <div className="relative flex min-h-[inherit] flex-col justify-center px-6 py-9 sm:px-9 sm:py-10 lg:max-w-xl lg:py-11 lg:pl-10 lg:pr-8">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/70">
                Your island
              </p>
              <h2
                id="about-explore-title"
                className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white sm:text-[1.65rem] sm:leading-snug"
              >
                Explore Malta
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-6 text-white/88 sm:text-[0.9375rem] sm:leading-7">
                Whether you want the thrill of Malta’s scenic coastal roads, adventure on trails with an
                ATV, or a calm cycle through historic streets and seaside promenades — the island opens
                up when you choose your own rhythm.
              </p>
              <p className="mt-5 max-w-prose text-sm font-semibold leading-snug text-[var(--brand-orange)] sm:text-[0.9375rem]">
                Start your journey with us and explore Malta like never before.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-medium tracking-tight text-slate-950 transition-colors hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Book now
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/20 bg-white px-5 py-2.5 text-sm font-medium tracking-tight text-slate-900 transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Check availability
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="fleet-licensing"
        aria-labelledby="about-fleet-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-[#f8fafc] py-14 sm:py-16"
      >
        <Container>
          <SectionHeader
            titleId="about-fleet-title"
            title="Fleet & licensing"
            tone="light"
            description="Popular models and what you need to ride legally in Malta — ask us if you are unsure which option fits your license."
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <FleetModelCard
              imageSrc={FLEET_NECO_ONE_SRC}
              imageAlt="NECO ONE 12 — 50cc scooter for town and coastal riding in Malta"
              displacement="50cc"
              variant="orange"
              categoryLabel="Scooter"
              title="NECO ONE 12"
              imagePanelClassName="bg-[linear-gradient(160deg,#eef2f6_0%,#e8f2f9_42%,#f8fafc_100%)]"
            >
              <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-[0.8125rem] sm:leading-[1.45]">
                Light and easy for town and coast. Typically suitable with a{" "}
                <strong className="font-semibold text-slate-800">standard car (Category B) license</strong>{" "}
                — confirm your eligibility with us when booking.
              </p>
            </FleetModelCard>

            <FleetModelCard
              imageSrc={FLEET_LEX_AURA_SRC}
              imageAlt="Lex Moto Aura — 125cc motorcycle for longer rides in Malta"
              displacement="125cc"
              variant="blue"
              categoryLabel="Motorcycle"
              title="LEX MOTO AURA"
              imagePanelClassName="bg-[linear-gradient(160deg,#eef2f6_0%,#e8f0f8_40%,#fafbfc_100%)]"
            >
              <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-[0.8125rem] sm:leading-[1.45]">
                More performance for longer rides and open roads. Requires a{" "}
                <strong className="font-semibold text-slate-800">motorcycle license</strong> appropriate
                for the class of vehicle.
              </p>
            </FleetModelCard>
          </div>

          <div className="mt-10">
            <IndicativeDailyRatesCard />
          </div>
        </Container>
      </section>
    </>
  );
}
