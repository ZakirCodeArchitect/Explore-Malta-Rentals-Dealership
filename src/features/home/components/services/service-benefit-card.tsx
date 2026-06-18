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
  "group relative flex h-full flex-col rounded-lg border border-white/60 bg-white/30 text-left",
  "shadow-[0_8px_32px_rgba(255,169,57,0.14),inset_0_1px_0_rgba(255,255,255,0.72)]",
  "backdrop-blur-xl backdrop-saturate-150",
  "transform-gpu transition-transform",
  smoothMove,
  "motion-safe:hover:-translate-y-[6px]",
  "focus-within:ring-2 focus-within:ring-[var(--brand-orange)]/35 focus-within:ring-offset-2",
);

const iconGlass = joinClasses(
  "border border-white/65 bg-white/40 text-slate-700 backdrop-blur-md",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ring-1 ring-white/35",
);

const iconWrapFeatured = joinClasses(
  "flex h-14 w-14 items-center justify-center rounded-lg",
  iconGlass,
);

const iconWrapCompact = joinClasses(
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
  iconGlass,
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
          "before:pointer-events-none before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/45 before:via-white/10 before:to-[var(--brand-orange)]/[0.08]",
        )}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[var(--brand-orange)]/[0.18] blur-3xl"
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
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/40 before:via-transparent before:to-[var(--brand-orange)]/[0.06]",
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
