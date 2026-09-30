import { Container } from "@/components/ui/container";
import { bikeCategories } from "@/features/home/data/home-sections";
import { SectionHeader } from "@/features/home/components/section-header";
import { BikeCategoryCard } from "@/features/home/components/bike-category-card";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { getTranslations } from "next-intl/server";

export async function BikeCategoriesSection() {
  const t = await getTranslations("Home");

  return (
    <section
      id="fleet-preview"
      aria-labelledby="bike-categories-title"
      className="scroll-mt-28 bg-[var(--surface-page)] py-20 sm:py-24 lg:py-32"
    >
      <Container className="relative">
        <Reveal as="div" y={22}>
          <SectionHeader
            titleId="bike-categories-title"
            title={t("sectionBikePickerTitle")}
            description={t("sectionBikePickerDescription")}
            tone="light"
          />
        </Reveal>

        <Stagger
          as="ul"
          step={0.09}
          delay={0.05}
          className="mt-14 grid min-w-0 list-none gap-6 p-0 md:grid-cols-2 lg:gap-8"
        >
          {bikeCategories.map((cat) => (
            <StaggerItem
              as="li"
              key={cat.id}
              className="min-w-0"
              y={26}
              scale={0.985}
            >
              <BikeCategoryCard cat={cat} />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
