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
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
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
      className="relative scroll-mt-28 border-t border-[var(--line-subtle)] bg-[var(--surface-card)] py-20 sm:py-24 lg:py-32"
    >
      <Container className="relative">
        <Reveal as="div" y={22}>
          <SectionHeader
            kicker={t("highlightedServicesKicker")}
            title={t("sectionServicesTitle")}
            titleId="services-title"
            tone="light"
            description={t("highlightedServicesDescription")}
            align="center"
          />
        </Reveal>

        <Stagger
          as="div"
          step={0.075}
          delay={0.05}
          className="mt-14 grid gap-5 lg:mt-16 lg:grid-cols-12 lg:items-stretch lg:gap-6"
        >
          <StaggerItem as="div" className="lg:col-span-5" y={26} scale={0.99}>
            <ServiceBenefitCard
              variant="featured"
              title={featuredTitle}
              description={featuredDescription}
              icon={SERVICE_ICONS[featured.id]}
              featuredFootnote={t("highlightedFeaturedFootnote")}
            />
          </StaggerItem>

          <ul
            className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:col-span-7 lg:grid-rows-2 lg:gap-6"
            role="list"
          >
            {rest.map((item) => {
              const key = SERVICE_MESSAGE_KEY[item.id];
              return (
                <StaggerItem as="li" key={item.id} className="min-h-0" y={26}>
                  <ServiceBenefitCard
                    variant="compact"
                    title={tDynamic(`services.${key}.title`)}
                    description={tDynamic(`services.${key}.description`)}
                    icon={SERVICE_ICONS[item.id]}
                  />
                </StaggerItem>
              );
            })}
          </ul>
        </Stagger>

        <Reveal
          as="div"
          delay={0.08}
          className="mt-14 flex flex-col items-center justify-center gap-4 border-t border-[var(--line-subtle)] pt-10 sm:mt-16 sm:flex-row sm:gap-6"
        >
          <ButtonLink
            href="/#fleet-preview"
            className="!text-ink-950 !shadow-[var(--elev-orange)] !duration-[var(--dur-base)] hover:!shadow-[var(--elev-orange-lift)] active:!scale-[0.985]"
          >
            {t("highlightedExploreRentals")}
          </ButtonLink>
          <p className="max-w-md text-center text-sm leading-[1.6] text-ink-500 sm:text-left">
            {t("highlightedExploreHint")}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
