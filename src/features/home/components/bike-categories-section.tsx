import { Container } from "@/components/ui/container";
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
      className="scroll-mt-28 border-t border-slate-200/70 bg-[var(--surface-elevated)] py-0"
    >
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(58,124,165,0.08),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(255,169,57,0.08),transparent_45%)]"
        />

        <Container className="relative z-10 py-6 sm:py-8">
          <SectionHeader
            titleId="bike-categories-title"
            title={t("sectionBikePickerTitle")}
            description={t("sectionBikePickerDescription")}
            tone="light"
          />

          <div className="mt-6 grid min-w-0 gap-5 sm:mt-8 md:grid-cols-2">
            {bikeCategories.map((cat) => (
              <BikeCategoryCard key={cat.id} cat={cat} />
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
