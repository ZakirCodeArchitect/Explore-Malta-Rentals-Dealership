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
    <div
      className={`group relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 p-4 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.12)] transition-[background-color,box-shadow] duration-300 ease-out hover:shadow-[0_22px_55px_-30px_rgba(2,6,23,0.16)] sm:p-6 ${
        tone === "white" ? "bg-white" : "bg-[#f8fafc]"
      }`}
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div
          aria-hidden="true"
          className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(58,124,165,0.12),transparent_60%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,169,57,0.12),transparent_60%)]"
        />
      </div>

      <div className="relative flex min-w-0 flex-col-reverse gap-5 md:flex-row md:items-start md:gap-5 lg:gap-6">
        <div className="relative z-10 min-w-0 flex-1 basis-0">
          <div>
            <h3 className="text-lg font-bold tracking-[-0.03em] text-slate-950 sm:text-xl">
              {title}
            </h3>
            <p className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-400 sm:text-[11px]">
              {subtitle}
            </p>
          </div>

          <div className="mt-6 sm:mt-8">
            <p className="text-xs leading-relaxed text-slate-600 sm:text-sm">
              {description}
            </p>

            <ul className="mt-3 space-y-1.5">
              {[bullet1, bullet2].map((b) => (
                <li key={b} className="flex items-start gap-2 text-xs text-slate-700 sm:text-sm">
                  <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
                    <span className="h-1 w-1 rounded-full bg-[var(--brand-orange)]" aria-hidden />
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <ButtonLink
                href="/vehicles"
                variant="primary"
                className="!min-h-7 !gap-1 !rounded !px-2.5 !py-0.5 !text-[11px] !font-medium !leading-tight !text-white sm:!min-h-7 sm:!px-2.5 sm:!py-0.5 sm:!text-[11px]"
              >
                <span>{tHome("heroViewFleet")}</span>
                <ArrowRight className="size-3 shrink-0" aria-hidden />
              </ButtonLink>
            </div>
          </div>
        </div>

        <BikeCategoryImageCarousel
          images={cat.images}
          title={title}
          onCardToneChange={setTone}
        />
      </div>
    </div>
  );
}
