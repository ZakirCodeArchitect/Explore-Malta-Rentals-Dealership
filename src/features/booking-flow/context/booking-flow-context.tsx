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

type BookingFlowContextValue = {
  state: BookingFlowState;
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
  resetBookingForm: () => void;
  validateAllBookingFields: () => Promise<boolean>;
};

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

type BookingFlowProviderProps = PropsWithChildren<{
  initialVehicleSlug?: string;
}>;

export function BookingFlowProvider({ children, initialVehicleSlug }: BookingFlowProviderProps) {
  const initialVehicleSlugRef = useRef(initialVehicleSlug);
  useEffect(() => {
    initialVehicleSlugRef.current = initialVehicleSlug;
  }, [initialVehicleSlug]);

  const [bookingSessionId, setBookingSessionId] = useState(createBookingSessionId);

  const form = useForm<BookingFlowState>({
    resolver: zodResolver(bookingFlowSchema),
    defaultValues: buildBookingInitialState(initialVehicleSlug),
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

  const goNext = useCallback(async () => {
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

    setActiveStepIndex((prev) => Math.min(prev + 1, BOOKING_FLOW_STEPS.length - 1));
    return true;
  }, [activeStepId, form, state]);

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

  const resetBookingForm = useCallback(() => {
    form.reset(buildBookingInitialState(initialVehicleSlugRef.current));
    setBookingSessionId(createBookingSessionId());
    setStepErrors({});
    setActiveStepIndex(0);
  }, [form]);

  const validateAllBookingFields = useCallback(() => form.trigger(), [form]);

  const value = useMemo<BookingFlowContextValue>(
    () => ({
      state,
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
      resetBookingForm,
      validateAllBookingFields,
    }),
    [
      state,
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
      resetBookingForm,
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
