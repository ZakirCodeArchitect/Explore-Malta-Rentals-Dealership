import Image from "next/image";

import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { Container } from "@/components/ui/container";
import { SiteShell } from "@/components/site-shell";
import { BrandBlueUnderlinedText } from "@/features/guide/components/brand-blue-underlined-text";
import { SectionHeader } from "@/features/home/components/section-header";
import { TourRequestForm } from "@/features/tours/components/tour-request-form";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const TOUR_BIKES_PHOTO_SRC = `/TourPage-images/${encodeURIComponent("TOURS PAGE BIKES PHOTO.webp")}`;
const TOUR_QUAD_PHOTO_SRC = `/TourPage-images/${encodeURIComponent("TOURS PAGE PHOTO QUAD.jpg")}`;

function BulletList({ items }: Readonly<{ items: readonly string[] }>) {
  return (
    <Stagger
      as="ul"
      className="mt-2 space-y-4 text-left text-[0.9375rem] leading-[1.7] text-[var(--text-secondary)]"
      step={0.06}
    >
      {items.map((item) => (
        <StaggerItem as="li" key={item} className="flex gap-4" y={14}>
          <span
            className="mt-[0.5rem] h-2 w-2 shrink-0 rounded-full bg-orange-400 ring-4 ring-orange-400/15"
            aria-hidden
          />
          <span>{item}</span>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

export type TourSiteContact = Readonly<{
  companyName: string;
}>;

export async function TourContent({ contact }: Readonly<{ contact: TourSiteContact }>) {
  const { companyName } = contact;
  const t = await getTranslations("Tours");

  const tourOptions = [
    t("option1"),
    t("option2"),
    t("option3"),
    t("option4"),
    t("option5"),
    t("option6"),
  ];
  const whyChoose = [t("why1"), t("why2"), t("why3"), t("why4"), t("why5")];

  return (
    <>
      <section
        id="tours-hero"
        aria-labelledby="tours-hero-title"
        className="relative isolate flex min-h-svh scroll-mt-28 flex-col overflow-hidden bg-[var(--surface-card)] pt-[var(--site-header-offset)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-[center_38%] bg-no-repeat"
          style={{
            backgroundImage: [
              "linear-gradient(100deg, rgba(251,251,250,0.96) 0%, rgba(243,245,248,0.90) 42%, rgba(238,244,250,0.80) 100%)",
              `url("${TOUR_BIKES_PHOTO_SRC}")`,
            ].join(", "),
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,var(--surface-card))]"
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center py-16 sm:py-20 lg:py-24">
          <SiteShell>
            <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
              <Reveal className="min-w-0 max-w-2xl" y={26} duration={0.8}>
                <h1
                  id="tours-hero-title"
                  className="type-h1 flex flex-col items-start gap-1 text-[var(--text-primary)] sm:gap-2"
                >
                  <span>{t("heroLine1")}</span>
                  <BrandBlueUnderlinedText>{t("heroLine2")}</BrandBlueUnderlinedText>
                </h1>
                <p className="mt-8 max-w-[54ch] text-[length:var(--text-lead)] leading-[1.68] text-[var(--text-secondary)]">
                  {t("heroLead", { companyName })}
                </p>
              </Reveal>
              <Reveal
                className="relative mx-auto hidden min-h-[min(20rem,44svh)] w-full max-w-md overflow-hidden rounded-[var(--r-feature)] shadow-[var(--elev-4)] ring-1 ring-inset ring-[var(--line)] sm:min-h-[min(22rem,46svh)] lg:block lg:max-w-none"
                y={28}
                delay={0.1}
                scale={0.985}
              >
                <Image
                  src={TOUR_QUAD_PHOTO_SRC}
                  alt={t("quadPhotoAlt")}
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  priority
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(10,20,32,0.68)_100%)]"
                />
                <p className="absolute bottom-5 left-6 right-6 text-sm font-semibold leading-snug text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.4)]">
                  {t("quadImageCaption")}
                </p>
              </Reveal>
            </div>
          </SiteShell>
        </div>
      </section>

      <section
        id="custom-tours"
        aria-labelledby="custom-tours-title"
        className="scroll-mt-28 border-t border-[var(--line-subtle)] bg-[var(--surface-card)] py-20 sm:py-24 lg:py-28"
      >
        <Container>
          <div className="mx-auto w-full max-w-[68ch]">
            <Reveal y={18}>
              <h2 id="custom-tours-title" className="type-h2 text-center text-[var(--text-primary)]">
                {t("customTitle")}
              </h2>
            </Reveal>
            <Reveal
              className="mt-10 space-y-6 text-left text-[length:var(--text-lead)] leading-[1.72] text-[var(--text-secondary)]"
              y={20}
              delay={0.06}
            >
              <p>{t("customP1")}</p>
              <p className="rounded-r-[var(--r-card)] border-l-[3px] border-l-blue-400 bg-blue-50/70 px-5 py-4 text-[0.9375rem] leading-[1.7] text-[var(--ink-800)]">
                {t("customHighlight")}
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      <section
        id="guided-tours"
        aria-labelledby="guided-tours-title"
        className="scroll-mt-28 border-t border-[var(--line-subtle)] bg-[var(--surface-band)] py-20 sm:py-24 lg:py-28"
      >
        <Container>
          <div className="mx-auto w-full max-w-[68ch]">
            <Reveal y={18}>
              <h2 id="guided-tours-title" className="type-h2 text-center text-[var(--text-primary)]">
                {t("guidedTitle")}
              </h2>
            </Reveal>
            <Reveal
              className="mt-10 text-left text-[length:var(--text-lead)] leading-[1.72] text-[var(--text-secondary)]"
              y={20}
              delay={0.06}
            >
              <p>{t("guidedBody")}</p>
            </Reveal>
          </div>
        </Container>
      </section>

      <section
        id="tour-options"
        aria-labelledby="tour-options-title"
        className="scroll-mt-28 border-t border-[var(--line-subtle)] bg-[var(--surface-card)] py-20 sm:py-24 lg:py-28"
      >
        <Container>
          <Reveal y={18}>
            <SectionHeader
              titleId="tour-options-title"
              title={t("optionsTitle")}
              tone="light"
              description={t("optionsDescription")}
            />
          </Reveal>
          <div className="mx-auto mt-12 max-w-[46rem]">
            <div className="surface-panel px-7 py-8 sm:px-9 sm:py-10">
              <BulletList items={tourOptions} />
            </div>
          </div>
        </Container>
      </section>

      <section
        id="why-choose-tours"
        aria-labelledby="why-choose-tours-title"
        className="scroll-mt-28 border-t border-[var(--line-subtle)] bg-[var(--surface-band)] py-20 sm:py-24 lg:py-28"
      >
        <Container>
          <Reveal y={18}>
            <SectionHeader
              titleId="why-choose-tours-title"
              title={t("whyTitle")}
              tone="light"
              description={t("whyDescription")}
            />
          </Reveal>
          <div className="mx-auto mt-12 max-w-[46rem]">
            <div className="surface-panel px-7 py-8 sm:px-9 sm:py-10">
              <BulletList items={whyChoose} />
            </div>
          </div>
        </Container>
      </section>

      <section
        id="book-tour-cta"
        aria-labelledby="book-tour-title"
        className="scroll-mt-28 border-t border-[var(--line-subtle)] bg-[var(--surface-sunken)] py-20 sm:py-24 lg:py-28"
      >
        <Container>
          <Reveal
            className="relative isolate min-h-[min(19rem,50svh)] overflow-hidden rounded-[var(--r-feature)] shadow-[var(--elev-4)] ring-1 ring-inset ring-[var(--line)] sm:min-h-[min(21rem,46svh)]"
            y={24}
            scale={0.99}
          >
            <Image
              src={TOUR_BIKES_PHOTO_SRC}
              alt={t("bikesPhotoAlt")}
              fill
              className="object-cover object-[center_42%]"
              sizes="(min-width: 1280px) 76rem, 100vw"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-[rgba(10,20,32,0.94)] via-[rgba(10,20,32,0.76)] to-[rgba(10,20,32,0.34)] sm:via-[rgba(10,20,32,0.64)] sm:to-[rgba(10,20,32,0.24)]"
            />
            <div className="relative flex min-h-[inherit] flex-col justify-center px-7 py-11 sm:px-10 sm:py-12 lg:max-w-2xl lg:py-14 lg:pl-12 lg:pr-8">
              <h2 id="book-tour-title" className="type-h2 text-white">
                {t("ctaTitle")}
              </h2>
              <p className="mt-5 max-w-[52ch] text-[length:var(--text-lead)] leading-[1.62] text-white/88">
                {t("ctaBody", { companyName })}
              </p>
              <p className="mt-6 max-w-[48ch] text-[0.9375rem] font-semibold leading-snug text-orange-300">
                {t("ctaTagline")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--r-field)] bg-orange-400 px-6 py-2.5 text-sm font-semibold tracking-tight text-[var(--ink-950)] shadow-[var(--elev-orange)] transition-[background-color,box-shadow,transform] duration-[var(--dur-base)] ease-[var(--ease-standard)] hover:-translate-y-0.5 hover:bg-orange-500 hover:shadow-[var(--elev-orange-lift)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink-950)] motion-reduce:hover:translate-y-0"
                >
                  {t("ctaRequestTour")}
                </Link>
                <Link
                  href="/#booking-preview"
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--r-field)] bg-white/10 px-6 py-2.5 text-sm font-semibold tracking-tight text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm transition-[background-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-standard)] hover:bg-white/18 hover:ring-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink-950)]"
                >
                  {t("ctaVehicleRental")}
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section
        id="tour-contact"
        aria-labelledby="tour-contact-title"
        className="scroll-mt-28 border-t border-[var(--line-subtle)] bg-[var(--surface-card)] py-20 sm:py-24 lg:py-32"
      >
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-16">
            <Reveal className="lg:col-span-5" y={20}>
              <SectionHeader
                titleId="tour-contact-title"
                title={t("contactTitle")}
                tone="light"
                align="left"
                description={t("contactDescription")}
              />
              <hr className="rule-fade my-7" aria-hidden />
              <p className="text-[0.9375rem] leading-[1.7] text-[var(--text-secondary)]">
                {t("contactWhatsAppHint")}
              </p>
            </Reveal>
            <Reveal className="lg:col-span-7" y={24} delay={0.08}>
              <TourRequestForm />
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
