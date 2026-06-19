import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { bikeCategories } from "@/features/home/data/home-sections";
import { BikeCategoryCard } from "@/features/home/components/bike-category-card";
import { getTranslations } from "next-intl/server";

export async function BikeCategoriesSection() {
  const t = await getTranslations("Home");

  return (
    <section
      id="fleet-preview"
      aria-labelledby="bike-categories-title"
      className="scroll-mt-28 border-t border-white/[0.06] bg-black"
    >
      <div className="relative">
        <div aria-hidden="true" className="bike-picker-section-bg__mesh" />
        <div aria-hidden="true" className="bike-picker-section-bg__grain" />

        <Container className="relative z-10 pt-[3.2rem] pb-[3.2rem] sm:pt-16 sm:pb-16 lg:pt-[5.6rem] lg:pb-[5.6rem] xl:pt-[6.4rem] xl:pb-[6.4rem]">
          <div className="max-w-5xl text-left">
            <h2
              id="bike-categories-title"
              className="text-[clamp(2rem,4.8vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.045em] text-white"
            >
              {t("sectionBikePickerTitle")}
            </h2>
            <p className="mt-2.5 max-w-4xl text-[clamp(1.08rem,2.6vw,2rem)] font-bold leading-[1.15] tracking-[-0.035em] text-white/38 sm:mt-3">
              {t("sectionBikePickerDescription")}
            </p>
          </div>

          <div className="max-w-5xl text-left">
            <p className="mt-10 text-base font-semibold tracking-[-0.02em] text-white sm:mt-12 sm:text-lg lg:mt-14 lg:text-xl">
              {t("sectionBikePickerKicker")}
            </p>
          </div>

          <div className="mt-8 grid min-w-0 gap-5 sm:mt-10 md:grid-cols-2 md:gap-5 lg:mt-11 lg:gap-6 xl:gap-8">
            {bikeCategories.map((cat, index) => (
              <Reveal key={cat.id} delay={index * 120}>
                <BikeCategoryCard cat={cat} />
              </Reveal>
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
