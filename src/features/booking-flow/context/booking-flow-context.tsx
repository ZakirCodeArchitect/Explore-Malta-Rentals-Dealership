"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type FieldErrors,
  type FieldPath,
  get,
  useForm,
  useWatch,
} from "react-hook-form";
import { BOOKING_FLOW_STEPS, type BookingFlowStepId } from "@/features/booking-flow/lib/steps";
import {
  type BookingFlowState,
  type ReservationHoldState,
  INITIAL_RESERVATION_HOLD_STATE,
} from "@/features/booking-flow/lib/types";
import { buildBookingInitialState } from "@/features/booking-flow/lib/init-state";
import {
  bookingFlowSchema,
  canAccessStep,
  getStepFirstError,
  STEP_FIELD_PATHS,
} from "@/features/booking-flow/lib/validation";
import { mapApiBookingErrorPathToFormPath } from "@/features/booking-flow/lib/map-api-booking-error-to-form";
import type { BookingApiValidationError } from "@/features/booking-flow/lib/submit-booking-api";
import { getReservationHold } from "@/features/booking-flow/lib/reservation-hold-api";
import { useReservationHold } from "@/features/booking-flow/hooks/use-reservation-hold";
import { RESERVATION_HOLD_STORAGE_KEY } from "@/features/booking-flow/lib/reservation-hold-storage";

function createBookingSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const SERVER_VALIDATED_PATHS = [
  "customer.driverLicenseUpload",
  "customer.passportUpload",
  "additionalDriver.passportIdUpload",
  "delivery.pickupAddress",
  "delivery.dropoffAddress",
  "customer.licenseConfirmationCheckbox",
  "customer.idConfirmationCheckbox",
  "additionalDriver.officeIdConfirmed",
  "customer.fullName",
  "customer.phone",
  "customer.email",
  "customer.nationality",
  "customer.dateOfBirth",
  "customer.licenseCategory",
  "additionalDriver.fullName",
  "additionalDriver.phone",
  "additionalDriver.email",
  "additionalDriver.nationality",
  "additionalDriver.dateOfBirth",
  "additionalDriver.licenseCategory",
  "rental.pickupDate",
  "rental.returnDate",
  "rental.pickupTime",
  "rental.returnTime",
  "addons.helmetSize1",
  "addons.helmetSize2",
  "addons.cdwPlan",
  "deposit.depositMethod",
  "consent.termsAccepted",
] as const satisfies readonly FieldPath<BookingFlowState>[];

function loadStoredReservationHold(): ReservationHoldState {
  if (typeof window === "undefined") {
    return INITIAL_RESERVATION_HOLD_STATE;
  }
  const stored = window.sessionStorage.getItem(RESERVATION_HOLD_STORAGE_KEY);
  if (!stored) {
    return INITIAL_RESERVATION_HOLD_STATE;
  }
  try {
    const parsed = JSON.parse(stored) as ReservationHoldState;
    if (!parsed || typeof parsed !== "object" || !parsed.holdReference) {
      window.sessionStorage.removeItem(RESERVATION_HOLD_STORAGE_KEY);
      return INITIAL_RESERVATION_HOLD_STATE;
    }
    return {
      holdReference: parsed.holdReference ?? null,
      sessionKey: parsed.sessionKey ?? null,
      expiresAt: parsed.expiresAt ?? null,
      status: parsed.status ?? null,
      vehicleId: parsed.vehicleId ?? null,
      vehicleType: parsed.vehicleType ?? null,
      pickupDate: parsed.pickupDate ?? null,
      pickupTime: parsed.pickupTime ?? null,
      returnDate: parsed.returnDate ?? null,
      returnTime: parsed.returnTime ?? null,
    };
  } catch {
    window.sessionStorage.removeItem(RESERVATION_HOLD_STORAGE_KEY);
    return INITIAL_RESERVATION_HOLD_STATE;
  }
}

type BookingFlowContextValue = {
  state: BookingFlowState;
  reservationHold: ReservationHoldState;
  reservationHoldError: string | null;
  isCreatingHold: boolean;
  isReleasingHold: boolean;
  activeStepIndex: number;
  activeStepId: BookingFlowStepId;
  stepErrors: Partial<Record<BookingFlowStepId, string>>;
  fieldErrors: FieldErrors<BookingFlowState>;
  isFirstStep: boolean;
  isLastStep: boolean;
  bookingSessionId: string;
  updateSection: <K extends keyof BookingFlowState>(
    section: K,
    value: Partial<BookingFlowState[K]>,
  ) => void;
  getFieldError: (path: FieldPath<BookingFlowState>) => string | null;
  isFieldInvalid: (path: FieldPath<BookingFlowState>) => boolean;
  goBack: () => void;
  goNext: () => Promise<boolean>;
  goToStep: (stepId: BookingFlowStepId) => void;
  getBookingValues: () => BookingFlowState;
  applyConsentFromTermsModal: (acceptedAtIso: string) => void;
  clearServerFieldErrors: () => void;
  applyApiValidationErrors: (errors: BookingApiValidationError[]) => void;
  setReservationHoldError: (message: string | null) => void;
  updateReservationHold: (next: Partial<ReservationHoldState>) => void;
  createOrRefreshReservationHold: () => Promise<{ ok: boolean; message?: string }>;
  releaseReservationHold: () => Promise<void>;
  markReservationHoldExpired: (message?: string) => void;
  refreshReservationHoldFromServer: () => Promise<void>;
  clearReservationHold: () => void;
  resetBookingForm: () => void;
  validateCurrentStep: () => Promise<boolean>;
  validateAllBookingFields: () => Promise<boolean>;
};

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

type BookingFlowProviderProps = PropsWithChildren<{
  initialVehicleSlug?: string;
  initialRental?: {
    pickupDate?: string;
    pickupTime?: string;
    returnDate?: string;
    returnTime?: string;
  };
}>;

export function BookingFlowProvider({ children, initialVehicleSlug, initialRental }: BookingFlowProviderProps) {
  const initialVehicleSlugRef = useRef(initialVehicleSlug);
  const initialRentalRef = useRef(initialRental);
  useEffect(() => {
    initialVehicleSlugRef.current = initialVehicleSlug;
    initialRentalRef.current = initialRental;
  }, [initialRental, initialVehicleSlug]);

  const [bookingSessionId, setBookingSessionId] = useState(createBookingSessionId);
  /** Same initial value on server and client — session restore runs after mount to avoid hydration mismatch. */
  const [reservationHold, setReservationHold] = useState<ReservationHoldState>(INITIAL_RESERVATION_HOLD_STATE);
  const [reservationHoldError, setReservationHoldError] = useState<string | null>(null);
  const [isCreatingHold, setIsCreatingHold] = useState(false);
  const [isReleasingHold, setIsReleasingHold] = useState(false);

  const form = useForm<BookingFlowState>({
    resolver: zodResolver(bookingFlowSchema),
    defaultValues: buildBookingInitialState(initialVehicleSlug, initialRental),
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const watchedState = useWatch({ control: form.control }) as BookingFlowState | undefined;
  const state = watchedState ?? form.getValues();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepErrors, setStepErrors] = useState<Partial<Record<BookingFlowStepId, string>>>({});
  const shouldScrollToErrorRef = useRef(false);

  const activeStepId = BOOKING_FLOW_STEPS[activeStepIndex]?.id ?? BOOKING_FLOW_STEPS[0].id;
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === BOOKING_FLOW_STEPS.length - 1;
  const fieldErrors = form.formState.errors;

  const clearReservationHold = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(RESERVATION_HOLD_STORAGE_KEY);
    }
    setReservationHold(INITIAL_RESERVATION_HOLD_STATE);
  }, []);

  const mergeReservationHold = useCallback((next: Partial<ReservationHoldState>) => {
    setReservationHold((prev) => ({ ...prev, ...next }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (!reservationHold.holdReference) {
      return;
    }
    window.sessionStorage.setItem(RESERVATION_HOLD_STORAGE_KEY, JSON.stringify(reservationHold));
  }, [reservationHold]);

  /** Restore hold from sessionStorage after paint so SSR + first client paint match. */
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const restored = loadStoredReservationHold();
      if (restored.holdReference) {
        setReservationHold(restored);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!shouldScrollToErrorRef.current) {
      return;
    }

    const firstPath = STEP_FIELD_PATHS[activeStepId].find(
      (fieldPath) => get(fieldErrors, fieldPath)?.message,
    );
    if (!firstPath) {
      return;
    }

    const element = document.querySelector(
      `[name="${firstPath}"], [data-field="${firstPath}"]`,
    ) as HTMLElement | null;

    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: "smooth", block: "center" });
    shouldScrollToErrorRef.current = false;
  }, [activeStepId, fieldErrors]);

  const updateSection = useCallback(
    <K extends keyof BookingFlowState>(section: K, value: Partial<BookingFlowState[K]>) => {
      const currentSection = form.getValues(section);
      form.setValue(section, { ...currentSection, ...value }, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      setStepErrors((prev) => {
        if (!prev[activeStepId]) {
          return prev;
        }

        const next = { ...prev };
        delete next[activeStepId];
        return next;
      });
    },
    [activeStepId, form],
  );

  const validateCurrentStep = useCallback(async () => {
    const fields = STEP_FIELD_PATHS[activeStepId];
    const isValid = await form.trigger(fields, { shouldFocus: true });
    const error = getStepFirstError(activeStepId, state);

    if (!isValid || error) {
      const message = error ?? "Please review the highlighted fields.";
      shouldScrollToErrorRef.current = true;
      setStepErrors((prev) => ({
        ...prev,
        [activeStepId]: message,
      }));
      return false;
    }

    setStepErrors((prev) => {
      if (!prev[activeStepId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[activeStepId];
      return next;
    });

    return true;
  }, [activeStepId, form, state]);

  const goNext = useCallback(async () => {
    const valid = await validateCurrentStep();
    if (!valid) {
      return false;
    }

    setActiveStepIndex((prev) => Math.min(prev + 1, BOOKING_FLOW_STEPS.length - 1));
    return true;
  }, [validateCurrentStep]);

  const goBack = useCallback(() => {
    setActiveStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (stepId: BookingFlowStepId) => {
      if (!canAccessStep(stepId, state)) {
        return;
      }

      const nextIndex = BOOKING_FLOW_STEPS.findIndex((step) => step.id === stepId);
      if (nextIndex === -1) {
        return;
      }

      setActiveStepIndex(nextIndex);
    },
    [state],
  );

  const getFieldError = useCallback(
    (path: FieldPath<BookingFlowState>) => {
      const maybeError = get(fieldErrors, path) as
        | {
            message?: unknown;
          }
        | undefined;
      return typeof maybeError?.message === "string" ? maybeError.message : null;
    },
    [fieldErrors],
  );

  const isFieldInvalid = useCallback(
    (path: FieldPath<BookingFlowState>) => Boolean(get(fieldErrors, path)),
    [fieldErrors],
  );

  const getBookingValues = useCallback(() => form.getValues(), [form]);

  const applyConsentFromTermsModal = useCallback(
    (acceptedAtIso: string) => {
      const consent = form.getValues("consent");
      form.setValue(
        "consent",
        { ...consent, termsAccepted: true, termsAcceptedAt: acceptedAtIso },
        { shouldDirty: true, shouldValidate: true, shouldTouch: true },
      );
    },
    [form],
  );

  const clearServerFieldErrors = useCallback(() => {
    form.clearErrors([...SERVER_VALIDATED_PATHS]);
  }, [form]);

  const applyApiValidationErrors = useCallback(
    (errors: BookingApiValidationError[]) => {
      for (const err of errors) {
        const path = mapApiBookingErrorPathToFormPath(err.path);
        if (path) {
          form.setError(path, { type: "server", message: err.message });
        }
      }
    },
    [form],
  );

  const {
    createOrRefreshHold,
    releaseActiveHold,
  } = useReservationHold({
    bookingState: state,
    reservationHold,
    setHold: mergeReservationHold,
    clearHold: clearReservationHold,
    setError: setReservationHoldError,
  });

  const createOrRefreshReservationHold = useCallback(async () => {
    setIsCreatingHold(true);
    const result = await createOrRefreshHold();
    setIsCreatingHold(false);
    if (!result.ok && result.message) {
      setReservationHoldError(result.message);
    }
    return result;
  }, [createOrRefreshHold]);

  const releaseReservationHold = useCallback(async () => {
    setIsReleasingHold(true);
    await releaseActiveHold();
    setIsReleasingHold(false);
    setReservationHoldError(null);
  }, [releaseActiveHold]);

  const markReservationHoldExpired = useCallback((message?: string) => {
    setReservationHold((prev) => ({
      ...prev,
      status: "EXPIRED",
      expiresAt: prev.expiresAt,
    }));
    setReservationHoldError(message ?? "Your reservation has expired. Please reserve the vehicle again.");
  }, []);

  const refreshReservationHoldFromServer = useCallback(async () => {
    if (!reservationHold.holdReference) {
      return;
    }
    const result = await getReservationHold(reservationHold.holdReference);
    if (!result.ok) {
      if (result.status === 404 || result.status === 409) {
        markReservationHoldExpired();
      }
      return;
    }
    mergeReservationHold({
      holdReference: result.data.holdReference,
      status: result.data.status,
      expiresAt: result.data.expiresAt,
      vehicleId: result.data.vehicleId,
      vehicleType: result.data.vehicleType,
    });
    if (result.data.status !== "ACTIVE") {
      setReservationHoldError("Your reservation has expired. Please reserve the vehicle again.");
    } else {
      setReservationHoldError(null);
    }
  }, [markReservationHoldExpired, mergeReservationHold, reservationHold.holdReference]);

  useEffect(() => {
    if (!reservationHold.holdReference) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      void refreshReservationHoldFromServer();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [refreshReservationHoldFromServer, reservationHold.holdReference]);

  const resetBookingForm = useCallback(() => {
    form.reset(buildBookingInitialState(initialVehicleSlugRef.current, initialRentalRef.current));
    setBookingSessionId(createBookingSessionId());
    setStepErrors({});
    setActiveStepIndex(0);
    clearReservationHold();
    setReservationHoldError(null);
  }, [clearReservationHold, form]);

  const validateAllBookingFields = useCallback(() => form.trigger(), [form]);

  const value = useMemo<BookingFlowContextValue>(
    () => ({
      state,
      reservationHold,
      reservationHoldError,
      isCreatingHold,
      isReleasingHold,
      activeStepIndex,
      activeStepId,
      stepErrors,
      fieldErrors,
      isFirstStep,
      isLastStep,
      bookingSessionId,
      updateSection,
      getFieldError,
      isFieldInvalid,
      goBack,
      goNext,
      goToStep,
      getBookingValues,
      applyConsentFromTermsModal,
      clearServerFieldErrors,
      applyApiValidationErrors,
      setReservationHoldError,
      updateReservationHold: mergeReservationHold,
      createOrRefreshReservationHold,
      releaseReservationHold,
      markReservationHoldExpired,
      refreshReservationHoldFromServer,
      clearReservationHold,
      resetBookingForm,
      validateCurrentStep,
      validateAllBookingFields,
    }),
    [
      state,
      reservationHold,
      reservationHoldError,
      isCreatingHold,
      isReleasingHold,
      activeStepIndex,
      activeStepId,
      stepErrors,
      fieldErrors,
      isFirstStep,
      isLastStep,
      bookingSessionId,
      updateSection,
      getFieldError,
      isFieldInvalid,
      goBack,
      goNext,
      goToStep,
      getBookingValues,
      applyConsentFromTermsModal,
      clearServerFieldErrors,
      applyApiValidationErrors,
      setReservationHoldError,
      mergeReservationHold,
      createOrRefreshReservationHold,
      releaseReservationHold,
      markReservationHoldExpired,
      refreshReservationHoldFromServer,
      clearReservationHold,
      resetBookingForm,
      validateCurrentStep,
      validateAllBookingFields,
    ],
  );

  return <BookingFlowContext.Provider value={value}>{children}</BookingFlowContext.Provider>;
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext);
  if (!context) {
    throw new Error("useBookingFlow must be used within BookingFlowProvider");
  }
  return context;
}
