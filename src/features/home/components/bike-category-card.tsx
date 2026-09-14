"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ButtonLink } from "@/components/ui/button-link";
import {
  parseBikeImageEntry,
  type BikeCategory,
} from "@/features/home/data/home-sections";
import { BikeCategoryImageCarousel } from "@/features/home/components/bike-category-image-carousel";

type CardTone = "default" | "white";

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

  const [tone, setTone] = useState<CardTone>(() => {
    const first = cat.images[0];
    if (first == null) return "default";
    return parseBikeImageEntry(first).whiteBg ? "white" : "default";
  });

  return (
    <div className="group surface-card lift flex h-full min-w-0 flex-col overflow-hidden">
      {/* Full-bleed photo plate — tonal so cut-out bike shots read as product shots. */}
      <div
        className={`relative isolate flex min-w-0 items-end justify-center overflow-hidden ${
          tone === "white"
            ? "bg-[linear-gradient(175deg,#ffffff_0%,#f7f9fb_58%,var(--surface-sunken)_100%)]"
            : "bg-[linear-gradient(175deg,var(--blue-50)_0%,#f4f7fa_55%,var(--surface-sunken)_100%)]"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-24 z-0 mx-auto h-64 w-[75%] rounded-full bg-[radial-gradient(ellipse_at_center,rgb(58_124_165_/_0.10),transparent_70%)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-[-10%] z-0 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgb(255_169_57_/_0.16),transparent_65%)] blur-2xl"
        />
        <BikeCategoryImageCarousel
          images={cat.images}
          title={title}
          onCardToneChange={setTone}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-px bg-[var(--line-subtle)]"
        />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col p-6 sm:p-7 lg:p-8">
        <p className="type-eyebrow text-orange-600">{subtitle}</p>
        <h3 className="type-h3 mt-3 text-ink-900">{title}</h3>

        <p className="mt-3 text-[0.9375rem] leading-[1.65] text-ink-600">
          {description}
        </p>

        <ul className="mt-6 space-y-2.5 border-t border-[var(--line-subtle)] pt-6">
          {[bullet1, bullet2].map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 text-sm font-medium leading-[1.55] text-ink-700"
            >
              <span
                aria-hidden
                className="mt-[0.3rem] inline-flex size-[0.4375rem] shrink-0 rounded-full bg-orange-400 ring-4 ring-[color-mix(in_srgb,var(--orange-400)_16%,transparent)]"
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-1 items-end">
          <ButtonLink
            href="/vehicles"
            variant="primary"
            className="!min-h-10 !gap-2 !rounded-[var(--r-field)] !px-4 !py-0 !text-sm !text-ink-950 !shadow-[var(--elev-orange)] !duration-[var(--dur-base)] hover:!shadow-[var(--elev-orange-lift)] active:!scale-[0.985] sm:!min-h-11 sm:!px-5 sm:!text-sm"
          >
            <span>{tHome("heroViewFleet")}</span>
            <ArrowRight
              className="size-4 shrink-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
              aria-hidden
            />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
