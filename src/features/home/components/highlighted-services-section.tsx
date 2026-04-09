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

const SERVICE_ICONS = {
  "easy-pickup": PackageCheck,
  helmets: ShieldCheck,
  flexible: CalendarRange,
  support: MessagesSquare,
  "hotel-delivery": Hotel,
} satisfies Record<(typeof servicesHighlights)[number]["id"], LucideIcon>;

export function HighlightedServicesSection() {
  const [featured, ...rest] = servicesHighlights;

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
          kicker="Malta Rentals"
          title="Services & benefits"
          titleId="services-title"
          tone="light"
          description={
            <>
              Premium support from pickup to drop-off —{" "}
              <span className="text-slate-800">so you focus on the ride, not the paperwork.</span>
            </>
          }
          align="center"
        />

        <div className="mt-12 flex flex-col gap-5 lg:mt-14 lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-5">
          <div className="lg:col-span-5">
            <ServiceBenefitCard
              variant="featured"
              title={featured.title}
              description={featured.description}
              icon={SERVICE_ICONS[featured.id]}
            />
          </div>

          <ul
            className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:col-span-7 lg:grid-rows-2 lg:gap-5"
            role="list"
          >
            {rest.map((item) => (
              <li key={item.id} className="min-h-0">
                <ServiceBenefitCard
                  variant="compact"
                  title={item.title}
                  description={item.description}
                  icon={SERVICE_ICONS[item.id]}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:mt-14 sm:flex-row sm:gap-4">
          <ButtonLink href="/#fleet-preview">Explore rentals</ButtonLink>
          <p className="max-w-md text-center text-sm text-slate-500 sm:text-left">
            See bikes, ATVs, and bicycles — then lock in your dates in minutes.
          </p>
        </div>
      </Container>
    </section>
  );
}
