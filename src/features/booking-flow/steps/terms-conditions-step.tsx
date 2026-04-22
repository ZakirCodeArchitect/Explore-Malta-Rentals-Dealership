"use client";

import { useState } from "react";
import Link from "next/link";
import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";

export function TermsConditionsStep() {
  const { state, updateSection } = useBookingFlow();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <StepShell
      title="Terms & Conditions"
      description="Review key terms in modal and provide required consent before final confirmation."
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>Driver must present valid license and ID at handover.</li>
          <li>Vehicle should be returned in agreed condition and time.</li>
          <li>Late returns may incur additional charges.</li>
        </ul>
        <p className="mt-3 text-sm text-slate-700">
          Read full contract:{" "}
          <Link href="/terms" className="font-semibold text-[var(--brand-blue)] underline">
            Terms page
          </Link>
        </p>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="mt-3 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-400"
        >
          View Terms & Conditions
        </button>
      </div>

      <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={state.consent.agreedToTerms}
          onChange={(event) => updateSection("consent", { agreedToTerms: event.target.checked })}
          className="mt-0.5 h-4 w-4"
        />
        <span>I agree to the terms and conditions.</span>
      </label>

      {isModalOpen ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Terms & Conditions</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
              <li>Vehicle must be returned at agreed date/time.</li>
              <li>Traffic fines are renter responsibility.</li>
              <li>Deposit is refundable based on return inspection.</li>
            </ul>
            <p className="mt-3 text-sm text-slate-700">
              Full agreement:{" "}
              <Link href="/terms" className="font-semibold text-[var(--brand-blue)] underline">
                View complete contract
              </Link>
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSection("consent", { agreedToTerms: true, agreedAt: new Date().toISOString() });
                  setIsModalOpen(false);
                }}
                className="rounded-full bg-[var(--brand-orange)] px-4 py-2 text-sm font-semibold text-white"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </StepShell>
  );
}
