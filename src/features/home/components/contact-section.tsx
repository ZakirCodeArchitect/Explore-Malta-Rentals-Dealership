import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { GoogleMapEmbed } from "@/components/google-map-embed";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeader } from "@/features/home/components/section-header";
import { getEnvValue } from "@/components/footer/footer-utils";
import { SITE_CONTACT, SITE_GOOGLE_MAPS_URL } from "@/lib/site-brand-copy";
import { getTranslations } from "next-intl/server";

const iconPlateClass =
  "flex size-10 shrink-0 items-center justify-center rounded-[var(--r-field)] bg-[color-mix(in_srgb,var(--blue-500)_10%,white)] text-blue-700 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--blue-500)_20%,transparent)]";

const rowLabelClass = "type-spec text-ink-500";

const inlineLinkClass =
  "underline decoration-[color-mix(in_srgb,var(--orange-400)_55%,transparent)] underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-orange-700 hover:decoration-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-500)]";

export async function ContactSection() {
  const t = await getTranslations("Contact");
  const tCommon = await getTranslations("Common");

  const phoneRaw =
    getEnvValue("phone", "NEXT_PUBLIC_PHONE", "telephone") ?? SITE_CONTACT.phone;
  const address = getEnvValue("address") ?? SITE_CONTACT.address;
  const email = getEnvValue("email") ?? SITE_CONTACT.email;
  const telHref = `tel:${phoneRaw.replace(/[^\d+]/g, "")}`;
  const mailHref = `mailto:${email}`;

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="scroll-mt-28 bg-[var(--surface-page)] py-20 sm:py-24 lg:py-32"
    >
      <Container>
        <Reveal as="div" y={22} className="mx-auto max-w-2xl">
          <SectionHeader
            title={t("title")}
            titleId="contact-title"
            description={t("description")}
            tone="light"
            align="center"
          />
        </Reveal>

        <Reveal as="div" delay={0.06} y={26} className="mt-14">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <div className="surface-panel flex flex-col p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span className={iconPlateClass} aria-hidden>
                  <Phone className="size-[1.125rem]" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <p className={rowLabelClass}>{tCommon("mobile")}</p>
                  <a
                    href={telHref}
                    className="mt-1.5 block text-2xl font-bold tracking-[-0.03em] tabular-nums text-ink-900 transition-colors duration-[var(--dur-fast)] hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-500)] sm:text-3xl"
                  >
                    {phoneRaw}
                  </a>
                  <p className="mt-2 text-sm leading-[1.6] text-ink-500">
                    {tCommon("tapToCall")}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex items-start gap-4 border-t border-[var(--line-subtle)] pt-7">
                <span className={iconPlateClass} aria-hidden>
                  <Mail className="size-[1.125rem]" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <p className={rowLabelClass}>{tCommon("email")}</p>
                  <a
                    href={mailHref}
                    className={`mt-1.5 block break-words text-[0.9375rem] font-semibold text-ink-800 ${inlineLinkClass}`}
                  >
                    {email}
                  </a>
                </div>
              </div>

              <div className="mt-7 flex items-start gap-4 border-t border-[var(--line-subtle)] pt-7">
                <span className={iconPlateClass} aria-hidden>
                  <MapPin className="size-[1.125rem]" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <p className={rowLabelClass}>{tCommon("address")}</p>
                  <p className="mt-1.5 text-[0.9375rem] font-medium leading-[1.65] text-ink-800">
                    {address}
                  </p>
                  <a
                    href={SITE_GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-3 inline-flex text-sm font-semibold text-ink-900 ${inlineLinkClass}`}
                  >
                    {tCommon("openInMaps")}
                  </a>
                </div>
              </div>
            </div>

            <div className="surface-panel flex min-h-[22rem] flex-col overflow-hidden lg:min-h-0">
              <p className="border-b border-[var(--line-subtle)] px-5 py-4 type-spec text-ink-500">
                {tCommon("location")}
              </p>
              <GoogleMapEmbed
                className="min-h-[18rem] w-full flex-1 lg:min-h-0"
                query={address}
              />
            </div>
          </div>

          <div className="surface-card mt-6 flex items-start gap-4 p-6 sm:p-7">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-[var(--r-field)] bg-[color-mix(in_srgb,var(--orange-400)_16%,white)] text-orange-700 shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--orange-400)_28%,transparent)]"
              aria-hidden
            >
              <Clock className="size-[1.125rem]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.9375rem] font-semibold text-ink-900">
                {tCommon("responseTimeTitle")}
              </p>
              <p className="mt-1.5 text-sm leading-[1.65] text-ink-600">
                {tCommon("responseTimeBody")}
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
