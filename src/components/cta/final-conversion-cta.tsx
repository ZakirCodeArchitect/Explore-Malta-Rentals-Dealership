import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { SITE_LOCATION_KICKER, SITE_PRIMARY_TAGLINE } from "@/lib/site-brand-copy";

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
 * Full-bleed cinematic closing CTA.
 *
 * The backdrop is deliberately treated as *texture*, not imagery: callers pass
 * anything from a photograph to the brand logo, so the image sits on a wrapper
 * that scales, desaturates and heavily blurs it before a multi-stop ink scrim
 * lands on top. Type contrast therefore never depends on what was passed in.
 * Staggered entrance lives in `globals.css` (`final-cta-fade-up`).
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
      className="group grain relative isolate flex min-h-[min(88vh,56rem)] w-full scroll-mt-28 items-center overflow-hidden bg-[var(--surface-inverse)] py-20 sm:py-24 md:min-h-[min(90vh,60rem)] md:py-28 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0">
        {/*
         * Blur + desaturation + low opacity happen on the wrapper so a caller's
         * `imageClassName` (object-fit / position) can never weaken the stack.
         */}
        <div
          className={joinClasses(
            "absolute inset-0 origin-center scale-[1.35] opacity-[0.18]",
            "blur-[72px] saturate-[0.3] contrast-[0.85]",
            "motion-safe:transition-transform motion-safe:duration-[2.6s] motion-safe:ease-out",
            "motion-safe:group-hover:scale-[1.42]",
            "motion-reduce:transition-none motion-reduce:group-hover:scale-[1.35]",
          )}
        >
          <Image
            src={imageSrc}
            alt={decorativeImage ? "" : imageAlt}
            fill
            sizes="100vw"
            loading="lazy"
            quality={60}
            className={imageClassName ?? "object-cover object-[center_35%]"}
            aria-hidden={decorativeImage}
            priority={false}
          />
        </div>

        {/* Readability stack — ink scrim first, brand light second, vignette last. */}
        <div
          className="absolute inset-0 bg-[radial-gradient(125%_95%_at_50%_-10%,rgb(10_20_32_/_0.62),rgb(10_20_32_/_0.93)_68%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[var(--ink-950)] via-[rgb(10_20_32_/_0.88)] to-[rgb(10_20_32_/_0.74)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(72%_55%_at_16%_8%,color-mix(in_srgb,var(--blue-500)_26%,transparent),transparent_72%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(62%_48%_at_88%_98%,color-mix(in_srgb,var(--orange-500)_18%,transparent),transparent_72%)]"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_92%_62%_at_50%_120%,rgb(0_0_0_/_0.6),transparent)]"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 top-0 h-px bg-[var(--line-inverse)]"
          aria-hidden
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-5xl px-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {kicker ? (
            <p
              className={joinClasses(
                "final-cta-fade-up final-cta-delay-1 type-eyebrow text-orange-300",
              )}
            >
              {kicker}
            </p>
          ) : null}
          <h2
            id={titleId}
            className={joinClasses(
              "final-cta-fade-up final-cta-delay-2 type-h1 mt-5 text-balance text-white [text-shadow:0_1px_28px_rgb(10_20_32_/_0.55)]",
              kicker ? "" : "final-cta-delay-1",
            )}
          >
            {title}
          </h2>
          {secondaryCta ? (
            <p className="final-cta-fade-up final-cta-delay-3 mt-6">
              <Link
                href={secondaryCta.href}
                className={joinClasses(
                  "rounded-[0.25rem] text-sm font-semibold tracking-wide text-white/85 underline decoration-white/30 underline-offset-[0.35em] transition-colors duration-[var(--dur-base)]",
                  "hover:text-white hover:decoration-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400",
                )}
              >
                {secondaryCta.label}
              </Link>
            </p>
          ) : null}
          <p
            className={joinClasses(
              "final-cta-fade-up mt-6 max-w-2xl text-pretty text-base leading-[1.7] text-white/75 sm:text-lg md:text-xl",
              secondaryCta ? "final-cta-delay-4" : "final-cta-delay-3",
            )}
          >
            {description}
          </p>

          <div
            className={joinClasses(
              "final-cta-fade-up mt-11 flex w-full max-w-md flex-col items-stretch sm:max-w-none sm:flex-row sm:justify-center",
              secondaryCta ? "final-cta-delay-5" : "final-cta-delay-4",
            )}
          >
            <ButtonLink
              href={primaryCta.href}
              className={joinClasses(
                "w-full min-w-[12rem] justify-center !text-ink-950 !shadow-[var(--elev-orange)] sm:w-auto",
                "transition-[transform,box-shadow,background-color] motion-safe:duration-[var(--dur-base)] motion-safe:ease-[var(--ease-out-expo)]",
                "motion-safe:hover:-translate-y-0.5 hover:!shadow-[var(--elev-orange-lift)] motion-safe:active:translate-y-0 active:scale-[0.985]",
                "motion-reduce:hover:translate-y-0",
                "focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ink-950)]",
              )}
            >
              {primaryCta.label}
            </ButtonLink>
          </div>

          <p
            className={joinClasses(
              "final-cta-fade-up mt-10 text-xs tracking-[0.04em] text-white/45",
              secondaryCta ? "final-cta-delay-6" : "final-cta-delay-4",
            )}
          >
            {footerLine ?? `${SITE_LOCATION_KICKER} · ${SITE_PRIMARY_TAGLINE.supporting}`}
          </p>
        </div>
      </div>
    </section>
  );
}
