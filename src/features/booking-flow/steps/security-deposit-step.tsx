"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { SECURITY_DEPOSIT_EUR } from "@/features/booking/lib/booking-schema";

export function SecurityDepositStep() {
  const t = useTranslations("BookingWizard.securityDeposit");
  const { state, updateSection } = useBookingFlow();

  useEffect(() => {
    if (state.deposit.depositMethod !== "in_person") {
      updateSection("deposit", { depositMethod: "in_person" });
    }
  }, [state.deposit.depositMethod, updateSection]);

  return (
    <StepShell title={t("shellTitle")} description={t("shellDescription")}>
      <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">{t("intro", { amount: SECURITY_DEPOSIT_EUR })}</p>
        <p className="mt-1">{t("heldNote")}</p>
      </div>
      <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">
        <p>{t("payInPerson")}</p>
      </div>
    </StepShell>
  );
}
