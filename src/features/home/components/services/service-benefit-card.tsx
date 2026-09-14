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

const focusRing =
  "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--blue-500)]";

/** Hairline is drawn as an inset ring so it never doubles up with the shadow. */
const cardShell = joinClasses(
  "group relative flex h-full flex-col text-left",
  "bg-[var(--surface-card)]",
  "transition-[transform,box-shadow] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]",
  "motion-reduce:transition-none",
  focusRing,
);

const iconPlate = joinClasses(
  "flex items-center justify-center rounded-[var(--r-field)]",
  "bg-[color-mix(in_srgb,var(--orange-400)_14%,white)] text-orange-700",
  "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--orange-400)_28%,transparent)]",
  "transition-[transform,background-color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
  "motion-reduce:transition-none",
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
          cardShell,
          "overflow-hidden rounded-[var(--r-feature)] p-8 sm:p-9 lg:p-10",
          "shadow-[inset_0_0_0_1px_var(--line-subtle),var(--elev-3)]",
          "motion-safe:hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_var(--line),var(--elev-4)]",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,color-mix(in_srgb,var(--orange-400)_11%,transparent),transparent_62%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--blue-400)_16%,transparent),transparent_66%)] blur-2xl"
        />

        <div className="relative flex flex-1 flex-col">
          <div
            className={joinClasses(
              iconPlate,
              "size-14 motion-safe:group-hover:scale-[1.04]",
            )}
          >
            <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </div>
          <h3 className="type-h3 mt-8 text-ink-900">{title}</h3>
          <p className="mt-4 flex-1 text-[length:var(--text-lead)] leading-[1.62] text-ink-600">
            {description}
          </p>
          {featuredFootnote ? (
            <p className="type-eyebrow mt-8 border-t border-[var(--line-subtle)] pt-6 text-orange-600">
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
        cardShell,
        "rounded-[var(--r-card)] p-6 sm:p-7",
        "shadow-[inset_0_0_0_1px_var(--line-subtle),var(--elev-1)]",
        "motion-safe:hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_var(--line),var(--elev-3)]",
      )}
    >
      <div className="relative flex gap-4">
        <div
          className={joinClasses(
            iconPlate,
            "size-11 shrink-0 motion-safe:group-hover:scale-[1.05]",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[1.0625rem] font-semibold leading-[1.25] tracking-[-0.02em] text-ink-900">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-[1.6] text-ink-600">{description}</p>
        </div>
      </div>
    </article>
  );
}
