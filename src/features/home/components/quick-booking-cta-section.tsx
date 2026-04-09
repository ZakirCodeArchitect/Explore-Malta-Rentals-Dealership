import { FinalConversionCta } from "@/components/cta/final-conversion-cta";
import { quickBookingCta } from "@/features/home/data/home-sections";
import { LOGO_PATH } from "@/lib/site-brand-copy";

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
      imageSrc={LOGO_PATH}
      imageAlt="Explore Malta Rentals"
      imageClassName="object-contain object-center scale-[0.92] opacity-[0.97]"
    />
  );
}
