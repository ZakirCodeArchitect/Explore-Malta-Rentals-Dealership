"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { BookingFlowProvider, useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import { BookingStepper } from "@/features/booking-flow/components/booking-stepper";
import { ReservationBanner } from "@/features/booking-flow/components/reservation-banner";
import { HoldExpiredNotice } from "@/features/booking-flow/components/hold-expired-notice";
import { TermsConsentModal } from "@/features/booking-flow/components/terms-consent-modal";
import { BookingLookupPanel } from "@/features/booking-flow/components/booking-lookup-panel";
import { useHoldHeartbeat } from "@/features/booking-flow/hooks/use-hold-heartbeat";
import { useHoldCountdown } from "@/features/booking-flow/hooks/use-hold-countdown";
import { BOOKING_FLOW_STEPS } from "@/features/booking-flow/lib/steps";
import { mapBookingFlowStateToSubmission } from "@/features/booking-flow/lib/map-booking-flow-to-submission";
import {
  clearPendingBookingSessionUploads,
  collectPendingBookingUploads,
} from "@/features/booking-flow/lib/pending-booking-uploads";
import { uploadBookingDocument } from "@/features/booking-flow/lib/upload-booking-document";
import {
  mapApiBookingErrorPathToFormPath,
  summarizeApiBookingErrors,
} from "@/features/booking-flow/lib/map-api-booking-error-to-form";
import { submitBooking } from "@/features/booking-flow/lib/submit-booking-api";
import { RentalDetailsStep } from "@/features/booking-flow/steps/rental-details-step";
import { OptionsDeliveryStep } from "@/features/booking-flow/steps/options-delivery-step";
import { YourInformationStep } from "@/features/booking-flow/steps/your-information-step";
import { ReviewConfirmStep } from "@/features/booking-flow/steps/review-confirm-step";

type BookingFlowBodyProps = {
  bookingLookupReference?: string;
  bookingLookupEmail?: string;
  bookingSubmittedBanner?: boolean;
  bookedVehicleLabel?: string;
};

function BookingFlowBody({
  bookingLookupReference,
  bookingLookupEmail,
  bookingSubmittedBanner,
  bookedVehicleLabel,
}: BookingFlowBodyProps) {
  const router = useRouter();
  const t = useTranslations("BookingFlow");
  const tLookup = useTranslations("BookingPage.lookup");
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [heartbeatWarning, setHeartbeatWarning] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const flowContainerRef = useRef<HTMLDivElement>(null);
  const hasMountedRef = useRef(false);
  const {
    bookingFlowSchema,
    state,
    bookingSessionId,
    reservationHold,
    reservationHoldError,
    isCreatingHold,
    isReleasingHold,
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
    setReservationHoldError,
    updateReservationHold,
    createOrRefreshReservationHold,
    releaseReservationHold,
    markReservationHoldExpired,
    clearReservationHold,
    resetBookingForm,
    validateCurrentStep,
    validateAllBookingFields,
  } = useBookingFlow();

  const holdIsActive =
    reservationHold.status === "ACTIVE" &&
    Boolean(reservationHold.holdReference) &&
    Boolean(reservationHold.expiresAt);
  const holdMatchesCurrentRental =
    reservationHold.holdReference !== null &&
    reservationHold.vehicleId === state.rental.vehicleId &&
    reservationHold.vehicleType === state.rental.vehicleType &&
    reservationHold.pickupDate === state.rental.pickupDate &&
    reservationHold.pickupTime === state.rental.pickupTime &&
    reservationHold.returnDate === state.rental.returnDate &&
    reservationHold.returnTime === state.rental.returnTime;

  const countdown = useHoldCountdown(reservationHold.expiresAt, holdIsActive);
  const holdIsExpired = reservationHold.status === "EXPIRED" || (reservationHold.status === "ACTIVE" && countdown.isExpired);

  useHoldHeartbeat({
    holdReference: reservationHold.holdReference,
    status: reservationHold.status,
    enabled: !submitting,
    onHeartbeatSuccess: (expiresAt, status) => {
      setHeartbeatWarning(null);
      setReservationHoldError(null);
      updateReservationHold({ expiresAt, status });
    },
    onHeartbeatExpired: (message) => {
      markReservationHoldExpired(message);
      setHeartbeatWarning(null);
      setTermsModalOpen(false);
    },
    onHeartbeatTransientError: (message) => {
      setHeartbeatWarning(message);
    },
  });

  useEffect(() => {
    if (!holdIsExpired || reservationHold.status !== "ACTIVE") {
      return;
    }
    markReservationHoldExpired(t("holdExpiredDefault"));
  }, [holdIsExpired, markReservationHoldExpired, reservationHold.status, t]);

  useEffect(() => {
    if (!bookingSubmittedBanner || !bookingLookupReference) {
      return;
    }
    setShowSuccessToast(true);
    const timer = window.setTimeout(() => setShowSuccessToast(false), 6000);
    return () => window.clearTimeout(timer);
  }, [bookingLookupReference, bookingSubmittedBanner]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    flowContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeStepId]);

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
      if (activeStepId === "rental_details") {
        setSubmitError(null);
        const validStep = await validateCurrentStep();
        if (!validStep) {
          return;
        }
        const holdResult = await createOrRefreshReservationHold();
        if (!holdResult.ok) {
          setSubmitError(holdResult.message ?? t("unableReserve"));
          return;
        }
      }
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
          ? t("reviewFields")
          : parsed.error.issues[0]?.message ?? t("reviewFields"),
      );
      return;
    }

    setTermsModalOpen(true);
  }, [
    activeStepId,
    bookingFlowSchema,
    clearServerFieldErrors,
    createOrRefreshReservationHold,
    getBookingValues,
    goNext,
    isLastStep,
    t,
    validateCurrentStep,
    validateAllBookingFields,
  ]);

  const handleTermsAgree = useCallback(async () => {
    if (!reservationHold.holdReference || !holdIsActive || !holdMatchesCurrentRental) {
      setTermsModalOpen(false);
      setSubmitError(t("holdExpiredDefault"));
      markReservationHoldExpired();
      return;
    }

    const acceptedAt = new Date().toISOString();
    applyConsentFromTermsModal(acceptedAt);

    const stateAfterConsent = getBookingValues();
    if (!stateAfterConsent.consent.termsAccepted) {
      setSubmitError(t("acceptTerms"));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    clearServerFieldErrors();

    const payload = mapBookingFlowStateToSubmission(stateAfterConsent, reservationHold.holdReference);
    const pendingUploads = collectPendingBookingUploads(bookingSessionId);
    for (const pendingUpload of pendingUploads) {
      const uploaded = await uploadBookingDocument(
        pendingUpload.file,
        pendingUpload.category,
        bookingSessionId,
      );
      if (!uploaded.ok) {
        setSubmitting(false);
        setTermsModalOpen(false);
        updateSection("consent", { termsAccepted: false, termsAcceptedAt: "" });
        setSubmitError(uploaded.message);
        return;
      }

      if (pendingUpload.category === "customer_license") {
        payload.customer.licenseUploadPath = uploaded.relativePath;
      } else if (pendingUpload.category === "customer_passport") {
        payload.customer.passportUploadPath = uploaded.relativePath;
      } else if (pendingUpload.category === "additional_driver_passport") {
        payload.additionalDriver.passportUploadPath = uploaded.relativePath;
      } else if (pendingUpload.category === "additional_driver_license") {
        payload.additionalDriver.licenseUploadPath = uploaded.relativePath;
      }
    }

    const result = await submitBooking(payload);
    setSubmitting(false);

    if (result.ok) {
      setTermsModalOpen(false);
      clearPendingBookingSessionUploads(bookingSessionId);
      clearReservationHold();
      resetBookingForm();
      router.push(
        `/booking?ref=${encodeURIComponent(result.bookingReference)}&submitted=1&email=${encodeURIComponent(payload.customer.email)}&vehicle=${encodeURIComponent(state.rental.vehicleSlug || state.rental.vehicleType)}`,
      );
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
        mapped.length ? t("issuesHighlighted") : "",
      ].filter(Boolean);
      setSubmitError(parts.join(" "));
      const holdConflict = result.errors.some((err) => err.path === "holdReference");
      if (holdConflict || result.status === 409) {
        markReservationHoldExpired(t("holdExpiredDefault"));
      }
      return;
    }

    if (result.status === 409) {
      markReservationHoldExpired(t("holdExpiredDefault"));
    }
    setSubmitError(result.message);
  }, [
    applyApiValidationErrors,
    applyConsentFromTermsModal,
    clearServerFieldErrors,
    clearReservationHold,
    getBookingValues,
    holdIsActive,
    holdMatchesCurrentRental,
    markReservationHoldExpired,
    reservationHold.holdReference,
    resetBookingForm,
    router,
    bookingSessionId,
    t,
    updateSection,
  ]);

  const handleCancelBooking = useCallback(async () => {
    await releaseReservationHold();
    clearPendingBookingSessionUploads(bookingSessionId);
    resetBookingForm();
    router.push("/vehicles");
  }, [bookingSessionId, releaseReservationHold, resetBookingForm, router]);

  return (
    <div ref={flowContainerRef} className="space-y-5">
      <BookingLookupPanel
        initialReference={bookingLookupReference}
        initialEmail={bookingLookupEmail}
        showSubmittedBanner={bookingSubmittedBanner}
      />
      {showSuccessToast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-50 w-[min(92vw,24rem)] rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 shadow-lg"
        >
          <p className="font-semibold">{tLookup("toastTitle")}</p>
          <p className="mt-1 text-emerald-900">{tLookup("toastBody")}</p>
          <p className="mt-2 text-xs text-emerald-900/90">
            {tLookup("referenceLabel")}: <span className="font-mono">{bookingLookupReference}</span>
          </p>
          {bookedVehicleLabel ? (
            <p className="text-xs text-emerald-900/90">
              {tLookup("vehicleLabel")}: <span className="font-medium">{bookedVehicleLabel}</span>
            </p>
          ) : null}
        </div>
      ) : null}
      <BookingStepper />

      {holdIsActive ? (
        <ReservationBanner remainingLabel={countdown.remainingLabel} />
      ) : null}

      {holdIsExpired || reservationHoldError ? (
        <HoldExpiredNotice message={reservationHoldError ?? t("holdExpiredDefault")} />
      ) : null}

      {heartbeatWarning ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          {heartbeatWarning}
        </p>
      ) : null}

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
          {t("stepOf", { current: activeStepIndex + 1, total: BOOKING_FLOW_STEPS.length })}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void handleCancelBooking();
            }}
            disabled={submitting || isReleasingHold}
            className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReleasingHold ? t("cancelling") : t("cancelBooking")}
          </button>
          <button
            type="button"
            onClick={goBack}
            disabled={isFirstStep || submitting || isCreatingHold}
            className="min-h-11 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t("back")}
          </button>
          <button
            type="button"
            onClick={() => {
              void handlePrimaryClick();
            }}
            disabled={
              submitting ||
              isCreatingHold ||
              (isLastStep && (!holdIsActive || !holdMatchesCurrentRental || holdIsExpired))
            }
            className="min-h-11 rounded-full bg-[var(--brand-orange)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--brand-orange-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingHold
              ? t("reserving")
              : isLastStep
                ? (submitting ? t("submitting") : t("confirmBooking"))
                : activeStepId === "rental_details"
                  ? t("bookNow")
                  : t("next")}
          </button>
        </div>
      </div>
    </div>
  );
}

type BookingFlowProps = {
  initialVehicleSlug?: string;
  initialRental?: {
    pickupDate?: string;
    pickupTime?: string;
    returnDate?: string;
    returnTime?: string;
  };
  bookingLookupReference?: string;
  bookingLookupEmail?: string;
  bookingSubmittedBanner?: boolean;
  bookedVehicleLabel?: string;
};

export function BookingFlow({
  initialVehicleSlug,
  initialRental,
  bookingLookupReference,
  bookingLookupEmail,
  bookingSubmittedBanner,
  bookedVehicleLabel,
}: BookingFlowProps) {
  return (
    <BookingFlowProvider initialVehicleSlug={initialVehicleSlug} initialRental={initialRental}>
      <BookingFlowBody
        bookingLookupReference={bookingLookupReference}
        bookingLookupEmail={bookingLookupEmail}
        bookingSubmittedBanner={bookingSubmittedBanner}
        bookedVehicleLabel={bookedVehicleLabel}
      />
    </BookingFlowProvider>
  );
}
