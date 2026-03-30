import { FinalConversionCta } from "@/components/cta/final-conversion-cta";
import { quickBookingCta } from "@/features/home/data/home-sections";

/** Mediterranean coast — wide, emotional backdrop (Unsplash). */
const CTA_BACKDROP =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80";

export function QuickBookingCtaSection() {
  const { kicker, title, description, primaryCta, secondaryCta } = quickBookingCta;

  return (
    <FinalConversionCta
      titleId="quick-booking-title"
      kicker={kicker}
      title={title}
      description={description}
      primaryCta={primaryCta}
      secondaryCta={secondaryCta}
      imageSrc={CTA_BACKDROP}
      imageAlt=""
    />
  );
}
