import type { LucideIcon } from "lucide-react";

type ServiceBenefitCardProps = Readonly<{
  title: string;
  description: string;
  icon: LucideIcon;
  variant: "featured" | "compact";
  /** Shown below the description on the featured (large) card only */
  featuredFootnote?: string;
}>;

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Hover uses transform-only: animating box-shadow/border causes repaint “steps” and jerk.
 * Long ease-in-out curve + no competing icon scale = one smooth motion.
 */
const smoothMove =
  "duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:duration-180 motion-reduce:ease-linear";

const baseCard = joinClasses(
  "group relative flex h-full flex-col rounded-2xl border border-slate-200/90 bg-[color-mix(in_srgb,var(--surface-card)_92%,var(--brand-blue)_8%)] text-left backdrop-blur-sm",
  /* Single static depth — depth does not morph on hover (avoids shadow interpolation jank). */
  "shadow-[0_18px_46px_-26px_rgba(15,23,42,0.28)]",
  "transform-gpu transition-transform",
  smoothMove,
  "motion-safe:hover:-translate-y-[6px]",
  "focus-within:ring-2 focus-within:ring-[var(--brand-blue)]/35 focus-within:ring-offset-2",
);

const iconWrapFeatured = joinClasses(
  "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--surface-soft)] to-[var(--surface-card)] text-slate-700 shadow-inner ring-1 ring-slate-200/60",
);

const iconWrapCompact = joinClasses(
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--surface-soft)] to-[var(--surface-card)] text-slate-700 shadow-inner ring-1 ring-slate-200/60",
);

export function ServiceBenefitCard({
  title,
  description,
  icon: Icon,
  variant,
  featuredFootnote,
}: ServiceBenefitCardProps) {
  if (variant === "featured") {
    return (
      <article
        className={joinClasses(
          baseCard,
          "overflow-hidden p-8 sm:p-9 lg:p-10",
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-[var(--brand-blue)]/[0.06] before:via-transparent before:to-[var(--brand-orange)]/[0.05]",
        )}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--brand-blue)]/[0.07] blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-1 flex-col">
          <div className={iconWrapFeatured}>
            <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </div>
          <h3 className="mt-6 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[1.65rem]">
            {title}
          </h3>
          <p className="mt-3 flex-1 text-base leading-relaxed text-slate-600 sm:text-[1.05rem]">
            {description}
          </p>
          {featuredFootnote ? (
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange)]">
              {featuredFootnote}
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      className={joinClasses(
        baseCard,
        "p-6 sm:p-7",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white before:to-[var(--surface-soft)]/50",
      )}
    >
      <div className="relative flex gap-4">
        <div className={iconWrapCompact}>
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-[-0.02em] text-slate-950 sm:text-[1.05rem]">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
      </div>
    </article>
  );
}
