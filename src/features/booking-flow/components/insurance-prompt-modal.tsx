"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { InsurancePlanOptions } from "@/features/booking-flow/components/insurance-plan-options";
import type { InsurancePlanCode, InsurancePlanSelection } from "@/lib/pricing/insurance-plans";

type InsurancePromptModalProps = {
  isOpen: boolean;
  rentalDays: number | null;
  initialPlan?: InsurancePlanSelection;
  onCancel: () => void;
  onConfirm: (plan: InsurancePlanCode) => void;
};

export function InsurancePromptModal({
  isOpen,
  rentalDays,
  initialPlan = null,
  onCancel,
  onConfirm,
}: InsurancePromptModalProps) {
  const t = useTranslations("BookingWizard.insurancePrompt");
  const tAddons = useTranslations("BookingWizard.addons");
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [draftPlan, setDraftPlan] = useState<InsurancePlanSelection>(initialPlan);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  function handleOverlayClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === overlayRef.current) {
      onCancel();
    }
  }

  function handleConfirm() {
    if (!draftPlan) {
      setShowError(true);
      return;
    }
    onConfirm(draftPlan);
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm sm:p-6"
      aria-modal="true"
      role="dialog"
      aria-labelledby={titleId}
    >
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60">
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--brand-blue)] via-sky-400 to-[var(--brand-blue)]" />

        <button
          type="button"
          onClick={onCancel}
          aria-label={t("dismiss")}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <h2 id={titleId} className="pr-8 text-lg font-semibold text-slate-900">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{t("description")}</p>

          <div className="mt-4">
            <InsurancePlanOptions
              selectedPlan={draftPlan}
              rentalDays={rentalDays}
              onSelect={(plan) => {
                setDraftPlan(plan);
                setShowError(false);
              }}
              name="insurancePromptPlan"
              compact
            />
          </div>

          {showError ? (
            <p className="mt-3 text-xs text-red-600" role="alert">
              {t("selectionRequired")}
            </p>
          ) : null}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-md bg-[var(--brand-blue)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {t("confirmContinue")}
            </button>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">{tAddons("insuranceExclusionsNote")}</p>
        </div>
      </div>
    </div>
  );
}
