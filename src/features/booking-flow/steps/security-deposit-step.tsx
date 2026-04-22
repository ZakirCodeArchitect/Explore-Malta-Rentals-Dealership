"use client";

import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { SECURITY_DEPOSIT_EUR } from "@/features/booking/lib/booking-schema";

export function SecurityDepositStep() {
  const { state, updateSection } = useBookingFlow();

  return (
    <StepShell
      title="Security Deposit"
      description="Deposit details are separated in state and will be finalized with logic in Phase 5."
    >
      <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">
          Refundable security deposit of EUR {SECURITY_DEPOSIT_EUR} required.
        </p>
        <p className="mt-1">Held for 7-10 days after return.</p>
      </div>
      <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="depositMethod"
            value="online"
            checked={state.securityDeposit.method === "online"}
            onChange={() => updateSection("securityDeposit", { method: "online" })}
          />
          Pay online
        </label>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="radio"
            name="depositMethod"
            value="in_person"
            checked={state.securityDeposit.method === "in_person"}
            onChange={() => updateSection("securityDeposit", { method: "in_person" })}
          />
          Pay in person
        </label>
      </div>
    </StepShell>
  );
}
