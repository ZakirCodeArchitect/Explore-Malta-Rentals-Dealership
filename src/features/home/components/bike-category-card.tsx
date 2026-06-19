"use client";

import { ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button-link";
import type { BikeCategory } from "@/features/home/data/home-sections";
import { BikeCategoryImageCarousel } from "@/features/home/components/bike-category-image-carousel";

const CARD_GLOW: Record<string, string> = {
  "50cc":
    "radial-gradient(circle at 50% 72%, rgba(255, 147, 15, 0.42) 0%, rgba(255, 147, 15, 0.14) 38%, transparent 72%)",
  "125cc":
    "radial-gradient(circle at 50% 72%, rgba(234, 179, 8, 0.36) 0%, rgba(234, 179, 8, 0.12) 38%, transparent 72%)",
};

type BikeCategoryCardProps = Readonly<{
  cat: BikeCategory;
}>;

export function BikeCategoryCard({ cat }: BikeCategoryCardProps) {
  const t = useTranslations("Home.bikeCategories");
  const tDynamic = t as unknown as (key: string) => string;
  const tHome = useTranslations("Home");
  const title = tDynamic(`${cat.id}.title`);
  const subtitle = tDynamic(`${cat.id}.subtitle`);
  const description = tDynamic(`${cat.id}.description`);
  const bullet1 = tDynamic(`${cat.id}.bullet1`);
  const bullet2 = tDynamic(`${cat.id}.bullet2`);
  const includesLabel = tDynamic("includesLabel");
  const glow = CARD_GLOW[cat.id] ?? CARD_GLOW["50cc"];

  return (
    <article className="group relative flex min-h-[21rem] min-w-0 overflow-hidden rounded-[1.6rem] bg-[#111111] p-[1.6rem] ring-1 ring-inset ring-white/[0.06] transition-[box-shadow,ring-color] duration-300 hover:ring-white/[0.1] hover:shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] sm:min-h-[24rem] sm:p-8 lg:min-h-[27rem] lg:rounded-[1.6rem] lg:p-10">
      <div className="absolute bottom-3 right-4 z-20 h-[8.8rem] w-[10.4rem] sm:bottom-5 sm:right-6 sm:h-48 sm:w-[14.4rem] lg:bottom-6 lg:right-8 lg:h-[14.4rem] lg:w-64">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 scale-110 blur-2xl lg:blur-3xl"
          style={{ background: glow }}
        />
        <BikeCategoryImageCarousel
          images={cat.images}
          title={title}
          layout="overlay"
        />
      </div>

      <div className="relative z-10 flex flex-1 flex-col sm:max-w-[68%] lg:max-w-[62%]">
        <span className="inline-flex w-fit rounded-full bg-white/[0.08] px-3 py-1 text-[11px] font-medium tracking-wide text-white/70 ring-1 ring-inset ring-white/[0.08] sm:px-3.5 sm:text-xs">
          {subtitle}
        </span>

        <h3 className="mt-5 text-[clamp(1.6rem,3.2vw,2.4rem)] font-bold leading-[0.98] tracking-[-0.04em] text-white sm:mt-6">
          {title}
        </h3>

        <p className="mt-2.5 max-w-md text-sm leading-6 text-white/55 sm:mt-3 sm:text-base sm:leading-7">
          {description}
        </p>

        <p className="mt-6 text-sm font-semibold text-white sm:mt-8 sm:text-base">
          {includesLabel}
        </p>

        <ul className="mt-3 space-y-2.5 sm:space-y-3">
          {[bullet1, bullet2].map((bullet) => (
            <li
              key={bullet}
              className="flex items-start gap-2.5 text-sm leading-6 text-white/85 sm:text-base sm:leading-7"
            >
              <Check
                className="mt-0.5 size-3.5 shrink-0 text-white/90 sm:size-4"
                strokeWidth={2.25}
                aria-hidden
              />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8 sm:pt-10">
          <ButtonLink
            href="/vehicles"
            variant="secondary"
            className="!min-h-9 !rounded-full !px-5 !py-2 !text-xs !font-semibold sm:!text-sm"
          >
            <span>{tHome("heroViewFleet")}</span>
            <ArrowRight className="size-3.5 shrink-0" aria-hidden />
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
