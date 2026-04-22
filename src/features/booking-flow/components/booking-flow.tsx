"use client";

import { useMemo, useState } from "react";
import { BookingFlowProvider, useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { BookingStepper } from "@/features/booking-flow/components/booking-stepper";
import { TermsConsentModal } from "@/features/booking-flow/components/terms-consent-modal";
import { BOOKING_FLOW_STEPS } from "@/features/booking-flow/lib/steps";
import { RentalDetailsStep } from "@/features/booking-flow/steps/rental-details-step";
import { OptionsDeliveryStep } from "@/features/booking-flow/steps/options-delivery-step";
import { YourInformationStep } from "@/features/booking-flow/steps/your-information-step";
import { ReviewConfirmStep } from "@/features/booking-flow/steps/review-confirm-step";

function BookingFlowBody() {
  const [submitted, setSubmitted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const {
    activeStepId,
    activeStepIndex,
    isFirstStep,
    isLastStep,
    stepErrors,
    updateSection,
    goBack,
    goNext,
  } = useBookingFlow();

  const activeStep = useMemo(() => {
    switch (activeStepId) {
      case "rental_details":
        return <RentalDetailsStep />;
      case "options_delivery":
        return <OptionsDeliveryStep />;
      case "your_information":
        return <YourInformationStep />;
      case "review_confirm":
        return <ReviewConfirmStep />;
      default:
        return null;
    }
  }, [activeStepId]);

  return (
    <div className="space-y-5">
      <BookingStepper />

      <div>{activeStep}</div>

      {stepErrors[activeStepId] ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {stepErrors[activeStepId]}
        </p>
      ) : null}

      {submitted ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Booking flow completed successfully. Backend submission hook is the next step.
        </p>
      ) : null}

      <TermsConsentModal
        isOpen={termsModalOpen}
        onCancel={() => setTermsModalOpen(false)}
        onAgree={async () => {
          updateSection("consent", {
            agreedToTerms: true,
            agreedAt: new Date().toISOString(),
          });
          setTermsModalOpen(false);
          const isValid = await goNext();
          if (isValid) {
            setSubmitted(true);
          }
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Step {activeStepIndex + 1} of {BOOKING_FLOW_STEPS.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={isFirstStep}
            className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (isLastStep) {
                setTermsModalOpen(true);
                return;
              }

              void goNext();
            }}
            className="min-h-11 rounded-full bg-[var(--brand-orange)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-orange-strong)]"
          >
            {isLastStep ? "Confirm booking" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

type BookingFlowProps = {
  initialVehicleSlug?: string;
};

export function BookingFlow({ initialVehicleSlug }: BookingFlowProps) {
  return (
    <BookingFlowProvider initialVehicleSlug={initialVehicleSlug}>
      <BookingFlowBody />
    </BookingFlowProvider>
  );
}
