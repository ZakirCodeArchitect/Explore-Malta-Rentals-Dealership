import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Container } from "@/components/ui/container";
import { FooterColumn, FooterTrustItem } from "./footer-column";
import { FooterNewsletterForm } from "./footer-newsletter-form";
import { FooterSocialLinks } from "./footer-social-links";
import { digitsOnlyForWa, getEnvValue, normalizeUrl } from "./footer-utils";

/** Footer backdrop (`public/footer-image.jpg`). */
const FOOTER_BACKDROP = "/footer-image.jpg";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function hasConfiguredSocialLinks() {
  return Boolean(
    normalizeUrl(getEnvValue("facebook")) ||
      normalizeUrl(getEnvValue("Instagram")) ||
      normalizeUrl(getEnvValue("TikTok")) ||
      normalizeUrl(getEnvValue("linkedin", "LinkedIn", "NEXT_PUBLIC_LINKEDIN")) ||
      normalizeUrl(getEnvValue("twitter", "NEXT_PUBLIC_TWITTER", "x", "X")),
  );
}

export function SiteFooter() {
  const brandName =
    getEnvValue("NEXT_PUBLIC_SITE_NAME", "CompanyName", "businessName") ?? "Explore Malta Rentals";
  const logoSrc = "/explore%20malta%20rentals%20logo.png";
  const email = getEnvValue("email");
  const address = getEnvValue("address");
  const phoneRaw = getEnvValue("phone", "NEXT_PUBLIC_PHONE", "telephone");
  const whatsappRaw = getEnvValue("whatsapp_number", "NEXT_PUBLIC_WHATSAPP_NUMBER");
  const currentYear = new Date().getFullYear();

  const telHref = phoneRaw ? `tel:${phoneRaw.replace(/[^\d+]/g, "")}` : undefined;
  const waDigits = whatsappRaw ? digitsOnlyForWa(whatsappRaw) : "";

  const exploreLinks = [
    { href: "/", label: "Home" },
    { href: "/#fleet-preview", label: "Fleet & bikes" },
    { href: "/#services", label: "Services & tours" },
    { href: "/#faq", label: "FAQ" },
  ] as const;

  const companyLinks = [
    { href: "/about", label: "About us" },
    { href: "/tours", label: "Tours" },
    { href: "/#contact", label: "Contact" },
    { href: "/#services", label: "How renting works" },
  ] as const;

  const supportLinks = [
    { href: "/#faq", label: "Help center" },
    { href: "/#contact", label: "Talk to us" },
    { href: "/#booking-preview", label: "Book a rental" },
  ] as const;

  const legalLinks = [
    { href: "/terms", label: "Terms of service" },
    { href: "/privacy", label: "Privacy policy" },
    { href: "/#faq", label: "Cookies & data" },
  ] as const;

  return (
    <footer
      role="contentinfo"
      className="relative isolate overflow-hidden border-t border-white/10 bg-[#050d18] text-white"
    >
      <Image
        src={FOOTER_BACKDROP}
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none object-cover object-center"
        aria-hidden
        priority={false}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050d18]/78 via-[#0a1628]/52 to-[#050d18]/82"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_0%,rgba(58,124,165,0.14),transparent_55%)]"
        aria-hidden
      />

      <Container className="relative z-10 py-14 sm:py-16 lg:py-20">
        <div
          className={joinClasses(
            "rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)] backdrop-blur-md sm:p-8 lg:p-10",
            "motion-safe:transition-shadow motion-safe:duration-300 hover:shadow-[0_28px_90px_-48px_rgba(58,124,165,0.25)]",
          )}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange)]">
                Based in Pietà
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl lg:text-[2rem] lg:leading-tight">
                Motorcycle, ATV, and bicycle rentals from Pietà, plus guided tours — explore Malta by road,
                trail, or town at your own pace.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
                Quick booking, well-kept bikes and quads, and local advice so you can ride with confidence.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/#booking-preview">Book a rental</ButtonLink>
              <Link
                href="/#fleet-preview"
                className={joinClasses(
                  "inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/90 transition-colors duration-200",
                  "hover:border-white/35 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628]",
                )}
              >
                See fleet & tours
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FooterTrustItem
              title="Straightforward booking"
              description="Clear pricing and simple pick-up from Pietà so you know what to expect before you ride."
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
            <FooterTrustItem
              title="Maintained fleet"
              description="Motorcycles, ATVs, and bicycles looked after for safe, reliable hire."
              icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4.5 8-11V5l-8-3-8 3v6c0 6.5 8 11 8 11Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4" />
                </svg>
              }
            />
            <FooterTrustItem
              title="Local support"
              description="Malta-based team for routes, tours, and help before and during your rental."
              icon={
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 15a4 4 0 0 1-4 4H9l-4 3v-3H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
                </svg>
              }
            />
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050d18]">
              <Image
                src={logoSrc}
                alt={brandName}
                width={300}
                height={52}
                className="h-11 w-auto max-w-full rounded-md object-contain object-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              Motorcycle, ATV, and bicycle rentals from Pietà, plus guided tours — explore Malta by road, trail,
              or town at your own pace.
            </p>
            {hasConfiguredSocialLinks() ? (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Follow us</p>
                <div className="mt-3">
                  <FooterSocialLinks />
                </div>
              </>
            ) : (
              <p className="mt-5 text-sm text-white/45">Social links appear here when you add Facebook, Instagram, or other URLs in your environment config.</p>
            )}
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
            <FooterColumn id="footer-explore" title="Explore" links={exploreLinks} />
            <FooterColumn id="footer-company" title="Company" links={companyLinks} />
            <FooterColumn id="footer-support" title="Support" links={supportLinks} />
            <FooterColumn id="footer-legal" title="Legal" links={legalLinks} />
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Newsletter</p>
            <p className="mt-2 text-sm text-white/65">Offers, new fleet additions, and Malta riding tips in your inbox.</p>
            <FooterNewsletterForm />

            <div className="mt-10 border-t border-white/10 pt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">Contact</p>
              <ul className="mt-4 list-none space-y-3 p-0 text-sm">
                {email ? (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050d18] rounded-sm"
                    >
                      {email}
                    </a>
                  </li>
                ) : null}
                {phoneRaw && telHref ? (
                  <li>
                    <a
                      href={telHref}
                      className="text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050d18] rounded-sm"
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
                      className="inline-flex items-center gap-2 text-white/80 transition-colors duration-200 hover:text-[#25D366] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050d18] rounded-sm"
                    >
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </a>
                  </li>
                ) : null}
                {address ? <li className="text-white/70 leading-relaxed">{address}</li> : null}
                {!email && !phoneRaw && !whatsappRaw && !address ? (
                  <li className="text-white/50">Add contact details via environment variables.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} {brandName}. All rights reserved.
          </p>
          <p className="max-w-prose sm:text-right">
            Explore Malta on two wheels or four — on your schedule.
          </p>
        </div>
      </Container>
    </footer>
  );
}
