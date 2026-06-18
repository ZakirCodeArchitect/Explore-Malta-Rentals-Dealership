import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { bikeCategories } from "@/features/home/data/home-sections";
import { SectionHeader } from "@/features/home/components/section-header";
import { BikeCategoryCard } from "@/features/home/components/bike-category-card";
import { getTranslations } from "next-intl/server";

export async function BikeCategoriesSection() {
  const t = await getTranslations("Home");

  return (
    <section
      id="fleet-preview"
      aria-labelledby="bike-categories-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-white py-0"
    >
      <div className="relative overflow-hidden">
        <Container className="relative z-10 py-6 sm:py-8">
          <SectionHeader
            titleId="bike-categories-title"
            title={t("sectionBikePickerTitle")}
            description={t("sectionBikePickerDescription")}
            tone="light"
          />

          <div className="mt-6 grid min-w-0 gap-5 sm:mt-8 md:grid-cols-2">
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
