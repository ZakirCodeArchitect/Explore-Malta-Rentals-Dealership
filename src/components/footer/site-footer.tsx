import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GoogleMapEmbed } from "@/components/google-map-embed";
import { Reveal } from "@/components/motion/reveal";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { LOGO_PATH, SITE_GOOGLE_MAPS_URL } from "@/lib/site-brand-copy";
import { FooterColumn, FooterTrustItem } from "./footer-column";
import { FooterNewsletterForm } from "./footer-newsletter-form";
import { FooterSocialLinks } from "./footer-social-links";
import { digitsOnlyForWa, getEnvValue, normalizeUrl } from "./footer-utils";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Focus ring tuned for the ink backdrop — reused by every footer control. */
const darkFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ink-950)]";

const dividerClass = "border-t border-[var(--line-inverse)]";

const microLabelClass = "type-spec text-[var(--ink-400)]";

function hasConfiguredSocialLinks() {
  return Boolean(
    normalizeUrl(getEnvValue("facebook")) ||
      normalizeUrl(getEnvValue("Instagram")) ||
      normalizeUrl(getEnvValue("TikTok")) ||
      normalizeUrl(getEnvValue("linkedin", "LinkedIn", "NEXT_PUBLIC_LINKEDIN")) ||
      normalizeUrl(getEnvValue("twitter", "NEXT_PUBLIC_TWITTER", "x", "X")),
  );
}

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const tBrand = await getTranslations("Brand");
  const tCommon = await getTranslations("Common");
  const brandName =
    getEnvValue("NEXT_PUBLIC_SITE_NAME", "CompanyName", "businessName") ?? "Explore Malta Rentals";
  const logoSrc = LOGO_PATH;
  const email = getEnvValue("email");
  const address = getEnvValue("address");
  const phoneRaw = getEnvValue("phone", "NEXT_PUBLIC_PHONE", "telephone");
  const whatsappRaw = getEnvValue("whatsapp_number", "NEXT_PUBLIC_WHATSAPP_NUMBER");
  const currentYear = new Date().getFullYear();

  const telHref = phoneRaw ? `tel:${phoneRaw.replace(/[^\d+]/g, "")}` : undefined;
  const waDigits = whatsappRaw ? digitsOnlyForWa(whatsappRaw) : "";

  const exploreLinks = [
    { href: "/", label: t("exploreHome") },
    { href: "/#fleet-preview", label: t("exploreFleet") },
    { href: "/#services", label: t("exploreServices") },
    { href: "/#faq", label: t("exploreFaq") },
  ] as const;

  const companyLinks = [
    { href: "/about", label: t("companyAbout") },
    { href: "/tours", label: t("companyTours") },
    { href: "/contact", label: t("companyContact") },
    { href: "/#services", label: t("companyHow") },
  ] as const;

  const supportLinks = [
    { href: "/#faq", label: t("supportHelp") },
    { href: "/contact", label: t("supportTalk") },
    { href: "/booking", label: t("supportBook") },
  ] as const;

  const legalLinks = [
    { href: "/terms", label: t("legalTerms") },
    { href: "/privacy", label: t("legalPrivacy") },
    { href: "/#faq", label: t("legalCookies") },
  ] as const;

  return (
    <footer
      role="contentinfo"
      className="grain relative isolate overflow-hidden border-t border-[var(--line-inverse)] bg-[var(--ink-950)] text-white"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(58,124,165,0.18),transparent_58%)]"
        aria-hidden
      />

      <Container className="relative z-10 py-20 sm:py-24 lg:py-28">
        <Reveal
          as="div"
          y={28}
          className={joinClasses(
            "rounded-[var(--r-feature)] bg-white/[0.04] p-7 backdrop-blur-md sm:p-9 lg:p-12",
            "shadow-[inset_0_0_0_1px_var(--line-inverse),0_32px_90px_-56px_rgb(0_0_0_/_0.95)]",
            "motion-safe:transition-shadow motion-safe:duration-[var(--dur-slow)]",
            "hover:shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.18),0_36px_100px_-52px_rgb(58_124_165_/_0.45)]",
          )}
        >
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <p className={joinClasses(microLabelClass, "text-[var(--orange-400)]")}>
                {tBrand("locationKicker")}
              </p>
              <h2 className="type-h2 mt-4 text-white">{tBrand("primaryHeadline")}</h2>
              <p className="mt-5 text-base leading-[1.62] text-[var(--ink-300)]">
                {tBrand("primaryBody")}
              </p>
              <p className="mt-2.5 text-base leading-[1.62] text-[var(--ink-400)]">
                {tBrand("primarySupporting")}
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/booking">{t("bookRental")}</ButtonLink>
              <ButtonLink href="/#fleet-preview" variant="secondary">
                {t("seeFleetTours")}
              </ButtonLink>
            </div>
          </div>

          <Stagger
            as="div"
            className="mt-10 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
            step={0.08}
          >
            <StaggerItem y={16}>
              <FooterTrustItem
                title={t("trustBookingTitle")}
                description={t("trustBookingDesc")}
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-3Z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
                  </svg>
                }
              />
            </StaggerItem>
            <StaggerItem y={16}>
              <FooterTrustItem
                title={t("trustFleetTitle")}
                description={t("trustFleetDesc")}
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
                  </svg>
                }
              />
            </StaggerItem>
            <StaggerItem y={16}>
              <FooterTrustItem
                title={t("trustSupportTitle")}
                description={t("trustSupportDesc")}
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a4 4 0 0 1-4 4H9l-4 3v-3H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
                  </svg>
                }
              />
            </StaggerItem>
          </Stagger>
        </Reveal>

        <div className="mt-20 grid gap-14 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-16">
          <Reveal as="div" className="lg:col-span-4" y={20}>
            <Link
              href="/"
              className={joinClasses("inline-block rounded-[var(--r-field)]", darkFocusRing)}
            >
              <Image
                src={logoSrc}
                alt={brandName}
                width={300}
                height={52}
                className="h-11 w-auto max-w-full object-contain object-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-[1.7] text-[var(--ink-400)]">
              {tBrand("primaryBody")} {tBrand("primarySupporting")}
            </p>
            {hasConfiguredSocialLinks() ? (
              <>
                <p className={joinClasses(microLabelClass, "mt-8")}>{t("followUs")}</p>
                <div className="mt-4">
                  <FooterSocialLinks />
                </div>
              </>
            ) : (
              <p className="mt-8 text-sm text-[var(--ink-500)]">{t("socialConfigHint")}</p>
            )}
          </Reveal>

          <Reveal
            as="div"
            className="grid gap-10 sm:grid-cols-2 sm:gap-x-8 lg:col-span-5 lg:grid-cols-2"
            y={20}
            delay={0.06}
          >
            <FooterColumn id="footer-explore" title={t("columnExplore")} links={exploreLinks} />
            <FooterColumn id="footer-company" title={t("columnCompany")} links={companyLinks} />
            <FooterColumn id="footer-support" title={t("columnSupport")} links={supportLinks} />
            <FooterColumn id="footer-legal" title={t("columnLegal")} links={legalLinks} />
          </Reveal>

          <Reveal as="div" className="lg:col-span-3" y={20} delay={0.12}>
            <p className={microLabelClass}>{t("newsletterTitle")}</p>
            <p className="mt-3 text-sm leading-[1.7] text-[var(--ink-300)]">
              {t("newsletterLeadIn")}
            </p>
            <FooterNewsletterForm />

            <div className={joinClasses("mt-12 pt-10", dividerClass)}>
              <p className={microLabelClass}>{t("sectionContact")}</p>
              <ul className="mt-5 list-none space-y-3.5 p-0 text-sm">
                {email ? (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className={joinClasses(
                        "rounded-sm text-[var(--ink-300)] underline decoration-transparent underline-offset-4",
                        "transition-[color,text-decoration-color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
                        "hover:text-white hover:decoration-[var(--orange-400)]",
                        darkFocusRing,
                      )}
                    >
                      {email}
                    </a>
                  </li>
                ) : null}
                {phoneRaw && telHref ? (
                  <li>
                    <a
                      href={telHref}
                      className={joinClasses(
                        "rounded-sm text-xl font-bold tracking-[-0.02em] tabular-nums text-white",
                        "transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-expo)] hover:text-[var(--orange-400)]",
                        darkFocusRing,
                      )}
                    >
                      {phoneRaw}
                    </a>
                  </li>
                ) : null}
                {whatsappRaw && waDigits ? (
                  <li>
                    <a
                      href={`https://wa.me/${waDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={joinClasses(
                        "inline-flex items-center gap-2 rounded-sm text-[var(--ink-300)]",
                        "transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-expo)] hover:text-[#25D366]",
                        darkFocusRing,
                      )}
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {t("whatsappLink")}
                    </a>
                  </li>
                ) : null}
                {address ? (
                  <li className="leading-[1.7] text-[var(--ink-400)]">{address}</li>
                ) : null}
                {!email && !phoneRaw && !whatsappRaw && !address ? (
                  <li className="text-[var(--ink-500)]">{t("envContactHint")}</li>
                ) : null}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal
          as="div"
          className={joinClasses(
            "mt-20 grid gap-8 pt-14 lg:grid-cols-12 lg:items-stretch",
            dividerClass,
          )}
          y={20}
        >
          <div className="flex flex-col justify-center lg:col-span-4">
            <p className={microLabelClass}>{t("visitCall")}</p>
            {address ? (
              <p className="mt-4 text-sm leading-[1.7] text-[var(--ink-300)]">{address}</p>
            ) : (
              <p className="mt-4 text-sm text-[var(--ink-500)]">{t("envAddressHint")}</p>
            )}
            <a
              href={SITE_GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={joinClasses(
                "mt-4 inline-flex self-start rounded-sm text-sm font-semibold text-[var(--orange-400)]",
                "underline decoration-[var(--orange-400)]/35 underline-offset-4",
                "transition-[color,text-decoration-color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
                "hover:text-white hover:decoration-white/60",
                darkFocusRing,
              )}
            >
              {tCommon("openInMaps")}
            </a>
            {phoneRaw && telHref ? (
              <a
                href={telHref}
                className={joinClasses(
                  "mt-6 inline-flex self-start rounded-sm text-2xl font-bold tracking-[-0.03em] tabular-nums text-white sm:text-3xl",
                  "transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-expo)] hover:text-[var(--orange-400)]",
                  darkFocusRing,
                )}
              >
                {phoneRaw}
              </a>
            ) : null}
          </div>
          <div className="min-h-[200px] lg:col-span-5">
            <GoogleMapEmbed
              query={address}
              className="h-full min-h-[200px] w-full rounded-[var(--r-card)] shadow-[inset_0_0_0_1px_var(--line-inverse)] sm:min-h-[240px]"
            />
          </div>
          <div
            className={joinClasses(
              "flex min-h-[160px] flex-col items-center justify-center rounded-[var(--r-card)] bg-white/[0.03] px-6 py-8 lg:col-span-3",
              "shadow-[inset_0_0_0_1px_var(--line-inverse)]",
            )}
          >
            <Image
              src={logoSrc}
              alt={brandName}
              width={320}
              height={56}
              className="h-16 w-auto max-w-full object-contain object-center sm:h-20"
              style={{ width: "auto" }}
            />
          </div>
        </Reveal>

        <div
          className={joinClasses(
            "mt-14 flex flex-col gap-4 pt-9 text-xs leading-[1.7] text-[var(--ink-500)] sm:flex-row sm:items-center sm:justify-between",
            dividerClass,
          )}
        >
          <p>{t("copyright", { year: currentYear, brand: brandName })}</p>
          <p className="max-w-prose sm:text-right">{tBrand("primarySupporting")}</p>
        </div>
      </Container>
    </footer>
  );
}
