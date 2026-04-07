import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/ui/container";
import { SiteShell } from "@/components/site-shell";
import { BrandBlueUnderlinedText } from "@/features/guide/components/brand-blue-underlined-text";
import { SectionHeader } from "@/features/home/components/section-header";
import { TourRequestForm } from "@/features/tours/components/tour-request-form";

/** `public/TourPage-images/` — motorbike & bicycle tour photo */
const TOUR_BIKES_PHOTO_SRC = `/TourPage-images/${encodeURIComponent("TOURS PAGE BIKES PHOTO.webp")}`;
/** `public/TourPage-images/` — quad tour photo */
const TOUR_QUAD_PHOTO_SRC = `/TourPage-images/${encodeURIComponent("TOURS PAGE PHOTO QUAD.jpg")}`;

const tourOptions = [
  "Motorbike tours in Malta",
  "Quad bike tours Malta",
  "Bicycle tours in Malta",
  "Scenic coastal tours",
  "City and historical tours",
  "Hidden gems and off-the-beaten-path routes",
] as const;

const whyChoose = [
  "Fully customizable tour experiences",
  "Affordable tour prices in Malta",
  "Self-drive or guided options available",
  "Local knowledge and insider routes",
  "Flexible booking on request",
] as const;

function BulletList({ items }: Readonly<{ items: readonly string[] }>) {
  return (
    <ul className="mt-6 space-y-3 text-left text-sm leading-relaxed text-slate-700 sm:text-[0.9375rem] sm:leading-7">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-orange)]"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type TourSiteContact = Readonly<{
  companyName: string;
}>;

export function TourContent({ contact }: Readonly<{ contact: TourSiteContact }>) {
  const { companyName } = contact;

  return (
    <>
      <section
        id="tours-hero"
        aria-labelledby="tours-hero-title"
        className="relative isolate flex min-h-svh scroll-mt-28 flex-col overflow-hidden border-t border-slate-200/70 bg-[#f0f6fa] pt-20 sm:pt-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-[center_38%] bg-no-repeat"
          style={{
            backgroundImage: [
              "linear-gradient(100deg, rgba(255,255,255,0.94) 0%, rgba(248,250,252,0.88) 42%, rgba(245,251,255,0.78) 100%)",
              `url("${TOUR_BIKES_PHOTO_SRC}")`,
            ].join(", "),
          }}
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center py-10 sm:py-12 lg:py-14">
          <SiteShell>
            <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-12">
              <div className="min-w-0 max-w-2xl">
                <h1
                  id="tours-hero-title"
                  className="flex flex-col items-start gap-1 text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-slate-950 sm:gap-1.5 sm:text-5xl sm:leading-[1.06] lg:text-[3.15rem]"
                >
                  <span className="text-slate-950">Malta Tours</span>
                  <span className="relative inline-block">
                    <span className="text-[var(--brand-blue)]">Explore Your Way</span>
                    <svg
                      viewBox="0 0 132 16"
                      aria-hidden
                      className="pointer-events-none absolute -bottom-1 left-[-2%] h-[0.45em] w-[104%] max-w-none overflow-visible text-[var(--brand-blue)] sm:-bottom-1.5 sm:h-[0.5em]"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M4 11 C 32 15.5, 56 3.5, 88 9.5 C 100 11.5, 112 10.5, 128 7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </h1>
                <p className="mt-6 max-w-xl text-base font-normal leading-7 text-slate-800 sm:text-lg sm:leading-8">
                  At <strong className="font-semibold text-slate-950">{companyName}</strong>, we offer{" "}
                  <strong className="font-semibold text-slate-950">Custom Malta Tours</strong> designed to
                  give you a unique and unforgettable experience of the island. Whether you prefer to
                  explore independently or with a local expert, our tours are flexible and tailored to your
                  needs.
                </p>
              </div>
              <div className="relative mx-auto hidden min-h-[min(18rem,42svh)] w-full max-w-md overflow-hidden rounded-xl border border-slate-200/90 bg-white/60 shadow-md ring-1 ring-slate-950/[0.04] sm:min-h-[min(20rem,44svh)] lg:block lg:max-w-none">
                <Image
                  src={TOUR_QUAD_PHOTO_SRC}
                  alt="Quad bike tour in Malta"
                  fill
                  className="object-cover object-center"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  priority
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent"
                />
                <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white drop-shadow-sm">
                  Coastal routes, historic towns, and hidden bays — your itinerary, your pace.
                </p>
              </div>
            </div>
          </SiteShell>
        </div>
      </section>

      <section
        id="custom-tours"
        aria-labelledby="custom-tours-title"
        className="scroll-mt-28 border-t border-slate-200/80 bg-white py-12 sm:py-14 lg:py-16"
      >
        <Container>
          <div className="mx-auto w-full max-w-prose">
            <h2
              id="custom-tours-title"
              className="text-center text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-[1.65rem]"
            >
              Custom Tours in <BrandBlueUnderlinedText>Malta</BrandBlueUnderlinedText>
            </h2>
            <div className="mt-6 space-y-5 text-left text-sm leading-relaxed text-slate-600 sm:mt-7 sm:text-[0.9375rem] sm:leading-7">
              <p>
                Our <strong className="font-semibold text-slate-800">Private Tours in Malta</strong> are
                fully customizable. You choose where to go, how long to stay, and what to see. From historic
                landmarks and scenic views to hidden beaches and local hotspots, we help you create the
                perfect itinerary.
              </p>
              <p className="rounded-xl border border-slate-200/90 bg-[#f8fafc] px-4 py-3 text-slate-700">
                Ideal for couples, friends, and small groups looking for a{" "}
                <strong className="font-semibold text-slate-900">Personalized Malta Experience</strong>.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="guided-tours"
        aria-labelledby="guided-tours-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-[#f8fafc] py-12 sm:py-14 lg:py-16"
      >
        <Container>
          <div className="mx-auto w-full max-w-prose">
            <h2
              id="guided-tours-title"
              className="text-center text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-[1.65rem]"
            >
              Guided Tours with Local Experts
            </h2>
            <p className="mt-6 text-left text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem] sm:leading-7">
              Want a deeper experience? Join one of our{" "}
              <strong className="font-semibold text-slate-800">Guided Tours in Malta</strong> and discover
              the island with a knowledgeable local guide. Learn about Malta&apos;s history, culture, and
              hidden gems while enjoying a smooth and stress-free ride.
            </p>
          </div>
        </Container>
      </section>

      <section
        id="tour-options"
        aria-labelledby="tour-options-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-white py-14 sm:py-16"
      >
        <Container>
          <SectionHeader
            titleId="tour-options-title"
            title="Tour options"
            tone="light"
            description="Pick a style that fits your group — we tailor routes and duration around you."
          />
          <div className="mx-auto mt-2 max-w-xl">
            <BulletList items={tourOptions} />
          </div>
        </Container>
      </section>

      <section
        id="why-choose-tours"
        aria-labelledby="why-choose-tours-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-[#f1f5f9] py-14 sm:py-16"
      >
        <Container>
          <SectionHeader
            titleId="why-choose-tours-title"
            title="Why choose our Malta tours?"
            tone="light"
            description="Straightforward pricing, local insight, and plans built around your dates."
          />
          <div className="mx-auto mt-2 max-w-xl">
            <BulletList items={whyChoose} />
          </div>
        </Container>
      </section>

      <section
        id="book-tour-cta"
        aria-labelledby="book-tour-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-[#f1f5f9] py-14 sm:py-16"
      >
        <Container>
          <div className="relative isolate min-h-[min(18rem,48svh)] overflow-hidden rounded-lg border border-slate-200/60 shadow-md ring-1 ring-black/[0.04] sm:min-h-[min(19rem,44svh)]">
            <Image
              src={TOUR_BIKES_PHOTO_SRC}
              alt="Motorbike and bicycle tours in Malta"
              fill
              className="object-cover object-[center_42%]"
              sizes="(min-width: 1280px) 76rem, 100vw"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-slate-950/[0.92] via-slate-950/72 to-slate-900/35 sm:via-slate-950/62 sm:to-slate-900/28"
            />
            <div className="relative flex min-h-[inherit] flex-col justify-center px-6 py-9 sm:px-9 sm:py-10 lg:max-w-2xl lg:py-11 lg:pl-10 lg:pr-8">
              <h2
                id="book-tour-title"
                className="text-2xl font-bold tracking-[-0.03em] text-white sm:text-[1.65rem] sm:leading-snug"
              >
                Book your Malta tour
              </h2>
              <p className="mt-3 max-w-prose text-sm leading-6 text-white/90 sm:text-[0.9375rem] sm:leading-7">
                All tours are <strong className="font-semibold text-white">available on request</strong>,
                allowing us to tailor every detail to your preferences. Contact{" "}
                <strong className="font-semibold text-white">{companyName}</strong> today to plan your
                perfect <strong className="font-semibold text-white">Malta Motorbike Tour</strong>,{" "}
                <strong className="font-semibold text-white">Quad Bike Adventure</strong>, or{" "}
                <strong className="font-semibold text-white">Bicycle tour</strong>.
              </p>
              <p className="mt-5 max-w-prose text-sm font-semibold leading-snug text-[var(--brand-orange)] sm:text-[0.9375rem]">
                Discover Malta your way, with freedom, flexibility, and unforgettable views.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/booking"
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-medium tracking-tight text-slate-950 transition-colors hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Request a tour
                </Link>
                <Link
                  href="/#booking-preview"
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-white/20 bg-white px-5 py-2.5 text-sm font-medium tracking-tight text-slate-900 transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  Vehicle rental
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="tour-contact"
        aria-labelledby="tour-contact-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-white py-14 sm:py-16"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="lg:col-span-5">
              <SectionHeader
                titleId="tour-contact-title"
                title="Get in touch"
                tone="light"
                align="left"
                description="Tell us what you have in mind — we will reply with a tailored suggestion and next steps."
              />
              <p className="mt-6 text-sm leading-6 text-slate-600">
                Prefer instant chat? Use WhatsApp for quick questions about routes, group size, and
                availability.
              </p>
            </div>
            <div className="lg:col-span-7">
              <TourRequestForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
