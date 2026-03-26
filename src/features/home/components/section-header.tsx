import type { ReactNode } from "react";

type SectionHeaderProps = Readonly<{
  kicker?: string;
  title: string;
  titleId?: string;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}>;

export function SectionHeader({
  kicker,
  title,
  titleId,
  description,
  align = "center",
  tone = "light",
}: SectionHeaderProps) {
  const alignClasses =
    align === "left" ? "text-left" : "text-center";

  const titleColor =
    tone === "dark"
      ? "text-white"
      : "text-slate-950";

  const descriptionColor =
    tone === "dark"
      ? "text-white/80"
      : "text-slate-600";

  return (
    <div className={alignClasses}>
      {kicker ? (
        <p className="text-sm font-semibold tracking-[0.08em] text-[var(--brand-orange)]">
          {kicker}
        </p>
      ) : null}
      <h2
        id={titleId}
        className={`${kicker ? "mt-2" : "mt-0"} text-3xl font-bold tracking-[-0.045em] ${titleColor} sm:text-4xl`}
      >
        {title}
      </h2>
      {description ? (
        <div className={`mt-3 text-base leading-7 ${descriptionColor}`}>
          {description}
        </div>
      ) : null}
    </div>
  );
}

