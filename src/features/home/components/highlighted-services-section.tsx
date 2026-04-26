import {
  CalendarRange,
  Hotel,
  MessagesSquare,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/features/home/components/section-header";
import { ServiceBenefitCard } from "@/features/home/components/services/service-benefit-card";
import { servicesHighlights } from "@/features/home/data/home-sections";
import { getTranslations } from "next-intl/server";

const SERVICE_ICONS = {
  "easy-pickup": PackageCheck,
  helmets: ShieldCheck,
  flexible: CalendarRange,
  support: MessagesSquare,
  "hotel-delivery": Hotel,
} satisfies Record<(typeof servicesHighlights)[number]["id"], LucideIcon>;

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
      className="relative scroll-mt-28 overflow-hidden border-t border-slate-200/80 bg-gradient-to-b from-[var(--surface-soft)] via-[var(--surface-elevated)] to-[var(--background)] py-16 sm:py-20 lg:py-24"
    >
      <div
        className="pointer-events-none absolute left-[max(-8rem,calc(50%-38rem))] top-0 h-72 w-72 rounded-full bg-[var(--brand-blue)]/[0.12] blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-[max(-6rem,calc(50%-36rem))] h-64 w-64 rounded-full bg-[var(--brand-orange)]/[0.08] blur-[90px]"
        aria-hidden
      />

      <Container className="relative">
        <SectionHeader
          kicker={t("highlightedServicesKicker")}
          title={t("sectionServicesTitle")}
          titleId="services-title"
          tone="light"
          description={t("highlightedServicesDescription")}
          align="center"
        />

        <div className="mt-12 flex flex-col gap-5 lg:mt-14 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-5">
          <div className="lg:col-span-5">
            <ServiceBenefitCard
              variant="featured"
              title={featuredTitle}
              description={featuredDescription}
              icon={SERVICE_ICONS[featured.id]}
              featuredFootnote={t("highlightedFeaturedFootnote")}
            />
          </div>

          <ul
            className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:col-span-7 lg:grid-rows-2 lg:gap-5"
            role="list"
          >
            {rest.map((item) => {
              const key = SERVICE_MESSAGE_KEY[item.id];
              return (
                <li key={item.id} className="min-h-0">
                  <ServiceBenefitCard
                    variant="compact"
                    title={tDynamic(`services.${key}.title`)}
                    description={tDynamic(`services.${key}.description`)}
                    icon={SERVICE_ICONS[item.id]}
                  />
                </li>
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
