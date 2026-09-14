"use client";

import { Euro } from "lucide-react";
import { useTranslations } from "next-intl";
import { PRICING_TIERS } from "@/lib/pricing/pricing-tiers";
import { formatDurationRuleLabel } from "@/lib/pricing/duration-pricing";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type IndicativeDailyRatesCardProps = Readonly<{
  className?: string;
}>;

export function IndicativeDailyRatesCard({
  className,
}: IndicativeDailyRatesCardProps) {
  const t = useTranslations("IndicativeRates");
  return (
    <div
      className={joinClasses(
        "w-full overflow-hidden rounded-[var(--r-panel)] bg-[var(--surface-card)]",
        "shadow-[inset_0_0_0_1px_var(--line-subtle),var(--elev-3)]",
        className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-[var(--line-subtle)] bg-[var(--surface-soft)] px-6 py-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:px-7">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-xs font-semibold tracking-[0.02em] text-ink-500">
            <span
              aria-hidden
              className="inline-flex size-6 items-center justify-center rounded-md bg-[var(--surface-card)] text-orange-600 shadow-[inset_0_0_0_1px_var(--line-subtle)]"
            >
              <Euro className="size-3.5 shrink-0" />
            </span>
            {t("cardTitle")}
          </h3>
          <p className="mt-2.5 text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink-900">
            {t("cardSubtitle")}
          </p>
        </div>
        <p className="text-xs leading-[1.5] text-ink-500 sm:text-right">
          {t("beforeExtras")}
        </p>
      </div>

      <dl className="grid gap-px bg-[var(--line-subtle)] sm:grid-cols-2">
        {PRICING_TIERS.map((tier) => (
          <div
            key={tier.key}
            className="flex items-baseline justify-between gap-4 bg-[var(--surface-card)] px-6 py-4 transition-colors duration-[var(--dur-fast)] hover:bg-[var(--surface-soft)] sm:px-7"
          >
            <dt className="text-sm font-medium text-ink-700">
              {formatDurationRuleLabel(tier.minDays, tier.maxDays)}
            </dt>
            <dd className="shrink-0 text-right text-sm font-bold tabular-nums text-ink-900">
              {tier.discountPercent <= 0
                ? t("noDiscount")
                : t("percentOff", { percent: tier.discountPercent })}
            </dd>
          </div>
        ))}
      </dl>

      <p className="border-t border-[var(--line-subtle)] bg-[var(--surface-soft)] px-6 py-4 text-xs leading-[1.7] text-ink-500 sm:px-7">
        {t("footnote")}
      </p>
    </div>
  );
}
