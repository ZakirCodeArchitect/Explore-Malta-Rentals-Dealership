import Image from "next/image";
import type { ReactNode } from "react";

import { IndicativeDailyRatesCard } from "@/components/pricing/indicative-daily-rates-card";
import { SiteShell } from "@/components/site-shell";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/features/home/components/section-header";
import { WhatWeOfferSlider } from "@/features/about/components/what-we-offer-slider";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const EXPLORE_MALTA_BACKDROP = "/malta.png";
const ABOUT_US_IMAGE = "/about-us-image.png";

const FLEET_NECO_ONE_SRC = `/BikeImages/${encodeURIComponent("neco one.png")}`;
const FLEET_LEX_AURA_SRC = `/BikeImages/${encodeURIComponent("lex moto grey.png")}`;

export type AboutSiteContact = Readonly<{
  companyName: string;
}>;

function AboutUsHeadingWithWave({
  titleId,
  label,
}: Readonly<{ titleId: string; label: string }>) {
  return (
    <h2
      id={titleId}
      className="mx-auto inline-block text-2xl font-bold leading-none tracking-[-0.02em] sm:text-[1.65rem]"
    >
      <span className="relative inline-flex flex-col items-center">
        <span className="px-0.5 text-slate-950">{label}</span>
        <svg
          viewBox="0 0 200 16"
          aria-hidden
          className="-mt-1 block h-[0.65rem] w-[68%] max-w-[9.5rem] min-w-[5.5rem] overflow-visible text-[var(--brand-orange)] sm:-mt-1.5 sm:h-[0.7rem] sm:w-[70%] sm:max-w-[10rem] sm:min-w-[6rem]"
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

function FleetDisplacementBadge({
  displacement,
  variant,
}: Readonly<{ displacement: string; variant: "orange" | "blue" }>) {
  const tone =
    variant === "orange"
      ? "border-orange-200/90 bg-orange-50/95 text-orange-950"
      : "border-slate-200/90 bg-slate-100 text-slate-800";
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

function AboutHeroTitle({ titleId, title }: Readonly<{ titleId: string; title: string }>) {
  return (
    <h1
      id={titleId}
      className="max-w-[22ch] text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-white drop-shadow-[0_2px_28px_rgba(0,0,0,0.45)] sm:text-5xl sm:leading-[1.06] lg:max-w-[24ch] lg:text-[3.25rem] lg:leading-[1.05] xl:text-6xl xl:leading-[1.04]"
    >
      {title}
    </h1>
  );
}

export async function AboutContent({ contact }: Readonly<{ contact: AboutSiteContact }>) {
  const { companyName } = contact;
  const t = await getTranslations("About");
  const tCommon = await getTranslations("Common");
  const tBrand = await getTranslations("Brand");

  return (
    <>
      <section
        id="company-story"
        aria-labelledby="about-story-hero-title"
        className="relative isolate flex min-h-svh w-full scroll-mt-28 flex-col overflow-hidden border-t border-slate-200/70 bg-[#0b1624] pt-20 sm:pt-24"
      >
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="absolute inset-0 bg-[#0b1624]">
            <Image
              src={ABOUT_US_IMAGE}
              alt=""
              fill
              unoptimized
              className="object-cover object-center"
              sizes="100vw"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-slate-950/18" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.5)_0%,rgba(15,23,42,0.24)_50%,rgba(15,23,42,0.1)_100%)]" />
        </div>
        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end pb-12 pt-8 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-12">
          <SiteShell>
            <div className="w-full max-w-4xl text-left">
              <AboutHeroTitle titleId="about-story-hero-title" title={t("heroTitle")} />
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
              <AboutUsHeadingWithWave titleId="company-story-narrative-title" label={t("headingWave")} />
            </header>
            <div className="mt-8 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 shadow-sm ring-1 ring-slate-950/[0.04]">
              <Image
                src={ABOUT_US_IMAGE}
                alt={t("imageAlt")}
                width={1200}
                height={800}
                unoptimized
                className="h-auto w-full object-cover object-center"
                sizes="(min-width: 1024px) 42rem, 100vw"
              />
            </div>
            <div className="mt-8 space-y-5 text-left text-sm leading-relaxed text-slate-600 sm:mt-9 sm:leading-7">
              <p>{t("narrativeP1", { companyName })}</p>
              <p>{t("narrativeP2")}</p>
              <p>{t("narrativeP3")}</p>
              <p>{t("narrativeP4")}</p>
              <p>{t("narrativeP5")}</p>
              <p>{t("narrativeP6")}</p>
              <p className="font-semibold text-slate-800">{t("journeyStarts")}</p>
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
          <div
            className={[
              "relative isolate overflow-hidden rounded-2xl border border-white/10 bg-[#050d18] p-6 text-white shadow-[0_24px_80px_-48px_rgba(0,0,0,0.45)] sm:p-8 lg:p-10",
              "motion-safe:transition-shadow motion-safe:duration-300",
            ].join(" ")}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(58,124,165,0.14),transparent_55%)]"
              aria-hidden
            />
            <div className="relative max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange)]">
                {tBrand("locationKicker")}
              </p>
              <h2
                id="about-offer-title"
                className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl lg:text-[2rem] lg:leading-tight"
              >
                {tBrand("primaryHeadline")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                {tBrand("primaryBody")}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/65 sm:text-base">
                {tBrand("primarySupporting")}
              </p>
            </div>
          </div>
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
              alt={t("maltaImageAlt")}
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
                {t("exploreKicker")}
              </p>
              <h2
                id="about-explore-title"
                className="mt-2 text-2xl font-bold tracking-[-0.03em] text-white sm:text-[1.65rem] sm:leading-snug"
              >
                {t("exploreTitle")}
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-6 text-white/88 sm:text-[0.9375rem] sm:leading-7">
                {t("exploreBody")}
              </p>
              <p className="mt-5 max-w-prose text-sm font-semibold leading-snug text-[var(--brand-orange)] sm:text-[0.9375rem]">
                {t("exploreCta")}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-medium tracking-tight text-slate-950 transition-colors hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  {tCommon("bookNow")}
                </Link>
                <Link
                  href="/#contact"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/20 bg-white px-5 py-2.5 text-sm font-medium tracking-tight text-slate-900 transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  {t("checkAvailability")}
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
            title={t("fleetSectionTitle")}
            tone="light"
            description={t("fleetSectionDescription")}
          />
          <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-10">
            <FleetModelCard
              imageSrc={FLEET_NECO_ONE_SRC}
              imageAlt={t("fleet50Alt")}
              displacement="50cc"
              variant="orange"
              categoryLabel={t("categoryScooter")}
              title="NECO ONE 12"
              imagePanelClassName="bg-[linear-gradient(160deg,#eef2f6_0%,#e8f2f9_42%,#f8fafc_100%)]"
            >
              <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-[0.8125rem] sm:leading-[1.45]">
                {t("fleet50Body")}
              </p>
            </FleetModelCard>

            <FleetModelCard
              imageSrc={FLEET_LEX_AURA_SRC}
              imageAlt={t("fleet125Alt")}
              displacement="125cc"
              variant="blue"
              categoryLabel={t("categoryMotorcycle")}
              title="LEX MOTO AURA"
              imagePanelClassName="bg-[linear-gradient(160deg,#eef2f6_0%,#e8f0f8_40%,#fafbfc_100%)]"
            >
              <p className="mt-2 text-xs leading-5 text-slate-600 sm:text-[0.8125rem] sm:leading-[1.45]">
                {t("fleet125Body")}
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
