"use client";

import { useCallback, useState } from "react";
import { BookingFlowProvider, useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { BookingStepper } from "@/features/booking-flow/components/booking-stepper";
import { TermsConsentModal } from "@/features/booking-flow/components/terms-consent-modal";
import { BookingSuccess } from "@/features/booking-flow/components/booking-success";
import { BOOKING_FLOW_STEPS } from "@/features/booking-flow/lib/steps";
import { bookingFlowSchema } from "@/features/booking-flow/lib/validation";
import { mapBookingFlowStateToSubmission } from "@/features/booking-flow/lib/map-booking-flow-to-submission";
import {
  mapApiBookingErrorPathToFormPath,
  summarizeApiBookingErrors,
} from "@/features/booking-flow/lib/map-api-booking-error-to-form";
import { submitBooking } from "@/features/booking-flow/lib/submit-booking-api";
import { RentalDetailsStep } from "@/features/booking-flow/steps/rental-details-step";
import { OptionsDeliveryStep } from "@/features/booking-flow/steps/options-delivery-step";
import { YourInformationStep } from "@/features/booking-flow/steps/your-information-step";
import { ReviewConfirmStep } from "@/features/booking-flow/steps/review-confirm-step";

type SuccessState = {
  bookingReference: string;
  customerEmail: string;
  vehicleName: string;
};

function BookingFlowBody() {
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    activeStepId,
    activeStepIndex,
    isFirstStep,
    isLastStep,
    stepErrors,
    goBack,
    goNext,
    updateSection,
    getBookingValues,
    applyConsentFromTermsModal,
    clearServerFieldErrors,
    applyApiValidationErrors,
    resetBookingForm,
    validateAllBookingFields,
  } = useBookingFlow();

  const activeStep =
    activeStepId === "rental_details" ? (
      <RentalDetailsStep />
    ) : activeStepId === "options_delivery" ? (
      <OptionsDeliveryStep />
    ) : activeStepId === "your_information" ? (
      <YourInformationStep />
    ) : activeStepId === "review_confirm" ? (
      <ReviewConfirmStep />
    ) : null;

  const handlePrimaryClick = useCallback(async () => {
    if (!isLastStep) {
      void goNext();
      return;
    }

    setSubmitError(null);
    clearServerFieldErrors();
    const valid = await validateAllBookingFields();
    if (!valid) {
      const parsed = bookingFlowSchema.safeParse(getBookingValues());
      setSubmitError(
        parsed.success
          ? "Please review the highlighted fields."
          : parsed.error.issues[0]?.message ?? "Please review the highlighted fields.",
      );
      return;
    }

    setTermsModalOpen(true);
  }, [
    clearServerFieldErrors,
    getBookingValues,
    goNext,
    isLastStep,
    validateAllBookingFields,
  ]);

  const handleTermsAgree = useCallback(async () => {
    const acceptedAt = new Date().toISOString();
    applyConsentFromTermsModal(acceptedAt);

    const stateAfterConsent = getBookingValues();
    if (!stateAfterConsent.consent.termsAccepted) {
      setSubmitError("Please accept the terms and conditions to continue.");
      return;
    }

    const customerEmail = stateAfterConsent.customer.email.trim();
    const vehicleName = stateAfterConsent.rental.vehicleName;

    setSubmitting(true);
    setSubmitError(null);
    clearServerFieldErrors();

    const payload = mapBookingFlowStateToSubmission(stateAfterConsent);
    const result = await submitBooking(payload);
    setSubmitting(false);

    if (result.ok) {
      setTermsModalOpen(false);
      setSuccess({
        bookingReference: result.bookingReference,
        customerEmail,
        vehicleName,
      });
      resetBookingForm();
      return;
    }

    setTermsModalOpen(false);
    updateSection("consent", { termsAccepted: false, termsAcceptedAt: "" });

    if (result.errors?.length) {
      applyApiValidationErrors(result.errors);
      const mapped = result.errors.filter((err) => mapApiBookingErrorPathToFormPath(err.path));
      const unmapped = result.errors.filter((err) => !mapApiBookingErrorPathToFormPath(err.path));
      const parts = [
        result.message,
        unmapped.length ? summarizeApiBookingErrors(unmapped) : "",
        mapped.length ? "Some issues are highlighted next to the relevant fields." : "",
      ].filter(Boolean);
      setSubmitError(parts.join(" "));
      return;
    }

    setSubmitError(result.message);
  }, [
    applyApiValidationErrors,
    applyConsentFromTermsModal,
    clearServerFieldErrors,
    getBookingValues,
    resetBookingForm,
    updateSection,
  ]);

  if (success) {
    return (
      <BookingSuccess
        bookingReference={success.bookingReference}
        customerEmail={success.customerEmail}
        vehicleName={success.vehicleName}
      />
    );
  }

  return (
    <div className="space-y-5">
      <BookingStepper />

      <div>{activeStep}</div>

      {stepErrors[activeStepId] ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {stepErrors[activeStepId]}
        </p>
      ) : null}

      {submitError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{submitError}</p>
      ) : null}

      <TermsConsentModal
        isOpen={termsModalOpen}
        isSubmitting={submitting}
        onCancel={() => {
          if (submitting) {
            return;
          }
          setTermsModalOpen(false);
        }}
        onAgree={handleTermsAgree}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Step {activeStepIndex + 1} of {BOOKING_FLOW_STEPS.length}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            disabled={isFirstStep || submitting}
            className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              void handlePrimaryClick();
            }}
            disabled={submitting}
            className="min-h-11 rounded-full bg-[var(--brand-orange)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-orange-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLastStep ? (submitting ? "Submitting…" : "Confirm booking") : "Next"}
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
