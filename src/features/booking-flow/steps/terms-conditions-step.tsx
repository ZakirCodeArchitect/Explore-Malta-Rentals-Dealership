"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";

export function TermsConditionsStep() {
  const t = useTranslations("BookingWizard.terms");
  const { state, updateSection } = useBookingFlow();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <StepShell title={t("shellTitle")} description={t("shellDescription")}>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>{t("bullet1")}</li>
          <li>{t("bullet2")}</li>
          <li>{t("bullet3")}</li>
        </ul>
        <p className="mt-3 text-sm text-slate-700">
          {t("readFull")}{" "}
          <Link href="/terms" className="font-semibold text-[var(--brand-blue)] underline">
            {t("termsPage")}
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-3 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-400"
        >
          {t("openModal")}
        </button>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={state.consent.termsAccepted}
          onChange={(event) => updateSection("consent", { termsAccepted: event.target.checked })}
          className="mt-0.5 h-4 w-4"
        />
        <span>{t("agreeCheckbox")}</span>
      </label>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">{t("modalTitle")}</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>{t("modalBullet1")}</li>
              <li>{t("modalBullet2")}</li>
              <li>{t("modalBullet3")}</li>
            </ul>
            <p className="mt-3 text-sm text-slate-700">
              {t("fullAgreement")}{" "}
              <Link href="/terms" className="font-semibold text-[var(--brand-blue)] underline">
                {t("viewComplete")}
              </Link>
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {t("close")}
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSection("consent", {
                    termsAccepted: true,
                    termsAcceptedAt: new Date().toISOString(),
                  });
                  setIsModalOpen(false);
                }}
                className="rounded-full bg-[var(--brand-orange)] px-4 py-2 text-sm font-semibold text-white"
              >
                {t("iAgree")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </StepShell>
  );
}
