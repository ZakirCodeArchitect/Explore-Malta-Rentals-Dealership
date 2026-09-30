import { FinalConversionCta } from "@/components/cta/final-conversion-cta";
import { LOGO_PATH } from "@/lib/site-brand-copy";
import { getTranslations } from "next-intl/server";

export async function QuickBookingCtaSection() {
  const t = await getTranslations("Home");
  const tNav = await getTranslations("Nav");
  const tBrand = await getTranslations("Brand");
  const footerLine = `${tBrand("locationKicker")} · ${tBrand("primarySupporting")}`;

  return (
    <FinalConversionCta
      titleId="quick-booking-title"
      kicker={t("quickCtaKicker")}
      title={t("quickCtaTitle")}
      description={t("quickCtaDescription")}
      primaryCta={{ href: "/booking", label: t("quickCtaPrimary") }}
      secondaryCta={{ href: "/#contact", label: t("quickCtaSecondary") }}
      imageSrc={LOGO_PATH}
      imageAlt={tNav("logoAlt")}
      /* Logo is only a texture here — spread it wide so the CTA reads as light, not artwork. */
      imageClassName="object-contain object-center scale-[1.15]"
      footerLine={footerLine}
    />
  );
}
