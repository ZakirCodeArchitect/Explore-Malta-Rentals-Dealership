import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { SITE_LOCATION_KICKER, SITE_PRIMARY_TAGLINE } from "@/lib/site-brand-copy";
import { BookingDisabledCtaContent } from "@/components/booking/booking-disabled-cta-content";
import { ONLINE_BOOKING_DISABLED } from "@/lib/booking-availability";

export type FinalConversionCtaProps = Readonly<{
  /** Section `aria-labelledby` target */
  titleId: string;
  kicker?: string;
  title: string;
  description: string;
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  /** Remote Unsplash URL or local path under `/public` */
  imageSrc: string;
  /** Empty string when image is decorative */
  imageAlt?: string;
  /** Override default full-bleed cover (e.g. logo with `object-contain`) */
  imageClassName?: string;
  /** When set, replaces the default English site-brand footer line */
  footerLine?: string;
}>;

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Full-bleed cinematic closing CTA: Malta-themed backdrop, dark overlays,
 * staggered fade-up (see `globals.css`), subtle Ken Burns on hover.
 */
export function FinalConversionCta({
  titleId,
  kicker,
  title,
  description,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt = "",
  imageClassName,
  footerLine,
}: FinalConversionCtaProps) {
  const decorativeImage = !imageAlt;

  return (
    <section
      aria-labelledby={titleId}
      className="group relative isolate flex min-h-[min(88vh,56rem)] w-full scroll-mt-28 items-center overflow-hidden bg-slate-950 py-20 sm:py-24 md:min-h-[min(90vh,60rem)] md:py-28"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className={joinClasses(
            "absolute inset-0 origin-center motion-safe:transition-transform motion-safe:duration-[2.6s] motion-safe:ease-out",
            "motion-safe:group-hover:scale-[1.04]",
            "motion-reduce:transition-none motion-reduce:group-hover:scale-100",
          )}
        >
          <Image
            src={imageSrc}
            alt={decorativeImage ? "" : imageAlt}
            fill
            sizes="100vw"
            loading="lazy"
            quality={80}
            className={imageClassName ?? "object-cover object-[center_35%]"}
            aria-hidden={decorativeImage}
            priority={false}
          />
        </div>
        {/* Readability stack — dark gradient + cool tint */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/35"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-[var(--brand-blue)]/[0.22] via-transparent to-[var(--brand-orange)]/[0.12]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_120%,rgba(0,0,0,0.65),transparent)]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {kicker ? (
            <p
              className={joinClasses(
                "final-cta-fade-up final-cta-delay-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brand-orange)]",
              )}
            >
              {kicker}
            </p>
          ) : null}
          <h2
            id={titleId}
            className={joinClasses(
              "final-cta-fade-up final-cta-delay-2 mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl md:text-6xl md:leading-[1.08]",
              kicker ? "" : "final-cta-delay-1",
            )}
          >
            {title}
          </h2>
          {secondaryCta ? (
            <p className="final-cta-fade-up final-cta-delay-3 mt-5">
              <Link
                href={secondaryCta.href}
                className={joinClasses(
                  "text-sm font-semibold tracking-wide text-white/90 underline decoration-white/35 underline-offset-[0.35em] transition-colors duration-300",
                  "hover:text-white hover:decoration-[var(--brand-orange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-black/60 rounded-sm",
                )}
              >
                {secondaryCta.label}
              </Link>
            </p>
          ) : null}
          <p
            className={joinClasses(
              "final-cta-fade-up mt-6 max-w-2xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg md:text-xl md:leading-relaxed",
              secondaryCta ? "final-cta-delay-4" : "final-cta-delay-3",
            )}
          >
            {description}
          </p>

          {ONLINE_BOOKING_DISABLED ? (
            <div
              className={joinClasses(
                "final-cta-fade-up mt-10 w-full max-w-lg text-left sm:text-center",
                secondaryCta ? "final-cta-delay-5" : "final-cta-delay-4",
              )}
            >
              <div className="flex w-full max-w-md flex-col items-stretch sm:mx-auto sm:max-w-none sm:items-center">
                <span
                  aria-disabled
                  className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 text-sm font-semibold text-white/75 sm:w-auto"
                >
                  <BookingDisabledCtaContent iconClassName="h-4 w-4 shrink-0 text-white/90" />
                </span>
              </div>
            </div>
          ) : (
            <div
              className={joinClasses(
                "final-cta-fade-up mt-10 flex w-full max-w-md flex-col items-stretch sm:max-w-none sm:flex-row sm:justify-center",
                secondaryCta ? "final-cta-delay-5" : "final-cta-delay-4",
              )}
            >
              <ButtonLink
                href={primaryCta.href}
                className={joinClasses(
                  "w-full min-w-[12rem] justify-center shadow-[0_22px_50px_-18px_rgba(255,147,15,0.65)] transition-[transform,box-shadow] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.4,0,0.2,1)] motion-safe:hover:scale-[1.03] motion-safe:hover:shadow-[0_26px_56px_-16px_rgba(255,147,15,0.75)] motion-reduce:hover:scale-100 sm:w-auto",
                  "focus-visible:ring-offset-4 focus-visible:ring-offset-black/50",
                )}
              >
                {primaryCta.label}
              </ButtonLink>
            </div>
          )}

          <p
            className={joinClasses(
              "final-cta-fade-up mt-8 text-xs text-white/50",
              secondaryCta ? "final-cta-delay-6" : "final-cta-delay-4",
            )}
          >
            {footerLine ?? `${SITE_LOCATION_KICKER} · ${SITE_PRIMARY_TAGLINE.supporting}`}
          </p>
        </div>
      </div>

      {/* Bottom edge blend into footer */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-[var(--background)] to-transparent"
        aria-hidden
      />
    </section>
  );
}
