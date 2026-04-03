import Image from "next/image";
import { MapPin } from "lucide-react";

import { Container } from "@/components/ui/container";
import { BrandBlueUnderlinedText } from "@/features/guide/components/brand-blue-underlined-text";
import { GuideParkingRulesSection } from "@/features/guide/components/guide-parking-rules-section";
import { SectionHeader } from "@/features/home/components/section-header";

const TOURIST_GUIDE_MAP_SRC = "/guide%20map.png";
const MALTA_BACKDROP_SRC = "/malta.png";

function isHttpUrl(value: string) {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function GuideContent({
  location,
  address,
}: Readonly<{
  location: string;
  address: string;
}>) {
  const mapsPageUrl = isHttpUrl(location) ? location.trim() : undefined;
  const embedQuery = mapsPageUrl ? address : location;
  const mapQuery = encodeURIComponent(embedQuery);
  const mapEmbedSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  const locationTitle = mapsPageUrl ? address : location;
  const openMapsHref =
    mapsPageUrl ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  return (
    <>
      <section
        id="guide-location"
        aria-labelledby="guide-location-title"
        className="relative isolate flex min-h-svh scroll-mt-28 items-center overflow-hidden border-t border-slate-200/70 bg-[#f0f6fa] pt-24 pb-10 sm:pt-28 sm:pb-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: [
              "linear-gradient(100deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.86) 45%, rgba(240,246,250,0.9) 100%)",
              `url("${MALTA_BACKDROP_SRC}")`,
            ].join(", "),
          }}
        />
        <Container>
          <div className="relative z-10">
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.64fr)_minmax(0,1fr)] lg:items-center lg:gap-10">
              <div className="pt-1 lg:pt-0">
                <div className="text-left">
                  <h2
                    id="guide-location-title"
                    className="text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl"
                  >
                    <span>Find us in </span>
                    <BrandBlueUnderlinedText>Malta</BrandBlueUnderlinedText>
                  </h2>
                  <p className="mt-3 text-base leading-7 text-slate-600">
                    Use the live map to locate us quickly before your ride.
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/[0.04]">
                <div className="grid gap-0 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <iframe
                    title={`Map location for ${embedQuery}`}
                    src={mapEmbedSrc}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-[min(23rem,56svh)] w-full border-0 md:h-[min(28rem,62svh)]"
                  />
                  <div className="flex flex-col justify-center border-t border-slate-200/80 bg-slate-50/80 px-5 py-5 md:border-t-0 md:border-l">
                    <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--brand-orange)]">
                      <MapPin
                        className="size-3.5 shrink-0 stroke-[2.25]"
                        aria-hidden
                      />
                      Current location
                    </p>
                    <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-slate-950">
                      {locationTitle}
                    </h3>
                    {mapsPageUrl ? null : (
                      <p className="mt-3 text-sm leading-6 text-slate-600">{address}</p>
                    )}
                    <a
                      href={openMapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex w-fit text-sm font-semibold text-[var(--brand-blue)] underline decoration-[var(--brand-blue)]/35 underline-offset-4 hover:decoration-[var(--brand-blue)]"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section
        id="guide-map"
        aria-labelledby="guide-map-title"
        className="scroll-mt-28 border-t border-slate-200/70 bg-white py-14 sm:py-16"
      >
        <Container>
          <SectionHeader
            titleId="guide-map-title"
            title="Explore Malta Your way"
            tone="light"
            description="Tourist guide map with attraction points to help plan your route."
          />
          <div className="mt-8 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50 p-2 shadow-sm ring-1 ring-slate-950/[0.04] sm:p-3">
            <Image
              src={TOURIST_GUIDE_MAP_SRC}
              alt="Tourist guide map of Malta with attractions"
              width={2200}
              height={1500}
              className="h-auto w-full rounded-lg object-cover object-center"
              sizes="(min-width: 1280px) 76rem, 96vw"
              priority
            />
          </div>
        </Container>
      </section>

      <GuideParkingRulesSection />
    </>
  );
}
