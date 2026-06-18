import {
  CalendarRange,
  Clock,
  Hotel,
  MessagesSquare,
  PackageCheck,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/features/home/components/section-header";
import { ServiceBenefitCard } from "@/features/home/components/services/service-benefit-card";
import { homeStats, servicesHighlights } from "@/features/home/data/home-sections";
import { getTranslations } from "next-intl/server";

const SERVICE_ICONS = {
  "easy-pickup": PackageCheck,
  helmets: ShieldCheck,
  flexible: CalendarRange,
  support: MessagesSquare,
  "hotel-delivery": Hotel,
} satisfies Record<(typeof servicesHighlights)[number]["id"], LucideIcon>;

const STAT_ICONS: Record<(typeof homeStats)[number], LucideIcon> = {
  support: Clock,
  pickup: Zap,
  helmets: ShieldCheck,
  duration: CalendarRange,
};

const SERVICE_MESSAGE_KEY: Record<(typeof servicesHighlights)[number]["id"], string> = {
  "easy-pickup": "easyPickup",
  helmets: "helmets",
  flexible: "flexible",
  support: "support",
  "hotel-delivery": "hotel",
};

export async function HighlightedServicesSection() {
  const t = await getTranslations("Home");
  const tDynamic = t as unknown as (key: string) => string;
  const [featured, ...rest] = servicesHighlights;
  const featuredKey = SERVICE_MESSAGE_KEY[featured.id];
  const featuredTitle = tDynamic(`services.${featuredKey}.title`);
  const featuredDescription = tDynamic(`services.${featuredKey}.description`);

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="relative scroll-mt-28 overflow-hidden border-t border-slate-200/80 bg-gradient-to-b from-[color-mix(in_srgb,var(--brand-orange)_10%,white)] via-white to-white py-16 sm:py-20 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-[var(--brand-orange)]/25 blur-3xl" />
        <div className="absolute -right-16 bottom-1/4 h-72 w-72 rounded-full bg-[var(--brand-orange-strong)]/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-orange)]/10 blur-3xl" />
      </div>
      <Container className="relative">
        <SectionHeader
          kicker={t("highlightedServicesKicker")}
          title={t("sectionServicesTitle")}
          titleId="services-title"
          tone="light"
          description={t("highlightedServicesDescription")}
          align="center"
        />

        <ul className="mt-10 grid list-none grid-cols-2 gap-3 p-0 sm:mt-12 lg:grid-cols-4 lg:gap-4">
          {homeStats.map((stat, index) => {
            const Icon = STAT_ICONS[stat];
            return (
              <Reveal as="li" key={stat} delay={index * 90}>
                <div className="group flex h-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-4 shadow-[0_18px_50px_-40px_rgba(2,6,23,0.4)] backdrop-blur-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_26px_60px_-36px_rgba(2,6,23,0.45)]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-orange)]/12 text-[var(--brand-orange-strong)]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold tracking-[-0.01em] text-slate-950 sm:text-base">
                      {tDynamic(`stats.${stat}.title`)}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {tDynamic(`stats.${stat}.sub`)}
                    </span>
                  </span>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <div className="mt-12 flex flex-col gap-5 lg:mt-14 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-5">
          <Reveal className="lg:col-span-5">
            <ServiceBenefitCard
              variant="featured"
              title={featuredTitle}
              description={featuredDescription}
              icon={SERVICE_ICONS[featured.id]}
              featuredFootnote={t("highlightedFeaturedFootnote")}
            />
          </Reveal>

          <ul
            className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:col-span-7 lg:grid-rows-2 lg:gap-5"
            role="list"
          >
            {rest.map((item, index) => {
              const key = SERVICE_MESSAGE_KEY[item.id];
              return (
                <Reveal as="li" key={item.id} delay={index * 90} className="min-h-0">
                  <ServiceBenefitCard
                    variant="compact"
                    title={tDynamic(`services.${key}.title`)}
                    description={tDynamic(`services.${key}.description`)}
                    icon={SERVICE_ICONS[item.id]}
                  />
                </Reveal>
              );
            })}
          </ul>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:mt-14 sm:flex-row sm:gap-4">
          <ButtonLink href="/#fleet-preview">{t("highlightedExploreRentals")}</ButtonLink>
          <p className="max-w-md text-center text-sm text-slate-500 sm:text-left">
            {t("highlightedExploreHint")}
          </p>
        </div>
      </Container>
    </section>
  );
}
