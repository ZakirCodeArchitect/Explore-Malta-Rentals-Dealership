import { Bike, CalendarCheck, MapPinned } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeader } from "@/features/home/components/section-header";
import { howItWorksSteps } from "@/features/home/data/home-sections";
import { getTranslations } from "next-intl/server";

const STEP_ICONS: Record<(typeof howItWorksSteps)[number], LucideIcon> = {
  choose: Bike,
  schedule: CalendarCheck,
  ride: MapPinned,
};

export async function HowItWorksSection() {
  const t = await getTranslations("Home");
  const tDynamic = t as unknown as (key: string) => string;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-white py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <SectionHeader
          kicker={t("howItWorks.kicker")}
          title={t("howItWorks.title")}
          titleId="how-it-works-title"
          description={t("howItWorks.description")}
          align="center"
        />

        <ol className="relative mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:mt-14 md:grid-cols-3 md:gap-5 lg:gap-8">
          {/* Connector line (desktop) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-[var(--brand-orange)]/40 to-transparent md:block"
          />

          {howItWorksSteps.map((step, index) => {
            const Icon = STEP_ICONS[step];
            const title = tDynamic(`howItWorks.steps.${step}.title`);
            const description = tDynamic(`howItWorks.steps.${step}.description`);
            return (
              <Reveal
                as="li"
                key={step}
                delay={index * 120}
                className="relative"
              >
                <div className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_18px_50px_-38px_rgba(2,6,23,0.35)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_64px_-34px_rgba(2,6,23,0.45)] sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-[var(--brand-orange)] shadow-[0_14px_30px_-14px_rgba(15,23,42,0.55)]">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <span
                      aria-hidden
                      className="text-5xl font-black leading-none tracking-[-0.05em] text-slate-100"
                    >
                      {`0${index + 1}`}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold tracking-[-0.02em] text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
