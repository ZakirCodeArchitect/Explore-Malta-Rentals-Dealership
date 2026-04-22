"use client";

import { BOOKING_FLOW_STEPS } from "@/features/booking-flow/lib/steps";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { canAccessStep } from "@/features/booking-flow/lib/validation";

export function BookingStepper() {
  const { activeStepId, state, goToStep } = useBookingFlow();

  return (
    <nav aria-label="Booking progress" className="rounded-lg border border-slate-200/80 bg-white p-4 sm:p-5">
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {BOOKING_FLOW_STEPS.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isAccessible = canAccessStep(step.id, state);

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => goToStep(step.id)}
                disabled={!isAccessible}
                aria-current={isActive ? "step" : undefined}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  isActive
                    ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/10"
                    : "border-slate-200 bg-white"
                } ${isAccessible ? "hover:border-slate-300" : "cursor-not-allowed opacity-60"}`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Step {index + 1}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">{step.title}</p>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
