"use client";

import { useTranslations } from "next-intl";
import {
  INSURANCE_PLAN_CODES,
  INSURANCE_PLANS,
  type InsurancePlanCode,
  type InsurancePlanSelection,
} from "@/lib/pricing/insurance-plans";
import { formatEur } from "@/lib/pricing/calculate-booking-price";

type InsurancePlanOptionsProps = {
  selectedPlan: InsurancePlanSelection;
  rentalDays: number | null;
  onSelect: (plan: InsurancePlanCode) => void;
  name?: string;
  compact?: boolean;
};

export function InsurancePlanOptions({
  selectedPlan,
  rentalDays,
  onSelect,
  name = "insurancePlan",
  compact = false,
}: InsurancePlanOptionsProps) {
  const t = useTranslations("BookingWizard.addons");
  const days = rentalDays !== null && rentalDays > 0 ? rentalDays : null;

  return (
    <div
      role="radiogroup"
      aria-label={t("insuranceTitle")}
      className={compact ? "grid gap-2" : "grid gap-3"}
    >
      {INSURANCE_PLAN_CODES.map((code) => {
        const plan = INSURANCE_PLANS[code];
        const selected = selectedPlan === code;
        const dailyRate = plan.dailyRate;
        const total = days !== null ? dailyRate * days : null;

        return (
          <label
            key={code}
            className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
              selected
                ? "border-[var(--brand-blue)] bg-[var(--brand-blue)]/5 ring-1 ring-[var(--brand-blue)]/30"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={code}
              checked={selected}
              onChange={() => onSelect(code)}
              className="mt-1 shrink-0"
            />
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-sm font-semibold text-slate-900">
                  {t(`insurancePlan.${code}.name`)}
                </span>
                <span className="text-sm font-medium text-slate-800">
                  {dailyRate === 0
                    ? t("insuranceFree")
                    : t("insurancePerDay", { amount: formatEur(dailyRate) })}
                </span>
              </span>
              <span className="mt-1 block text-xs text-slate-600">
                {t(`insurancePlan.${code}.coverage`)}
              </span>
              {days !== null && total !== null ? (
                <span className="mt-1.5 block text-xs font-medium text-slate-700">
                  {t("insuranceTotalLine", {
                    days,
                    rate: formatEur(dailyRate),
                    total: formatEur(total),
                  })}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}
