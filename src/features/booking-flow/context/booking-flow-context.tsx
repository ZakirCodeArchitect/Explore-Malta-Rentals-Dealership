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

type BookingFlowContextValue = {
  state: BookingFlowState;
  activeStepIndex: number;
  activeStepId: BookingFlowStepId;
  stepErrors: Partial<Record<BookingFlowStepId, string>>;
  fieldErrors: FieldErrors<BookingFlowState>;
  isFirstStep: boolean;
  isLastStep: boolean;
  updateSection: <K extends keyof BookingFlowState>(
    section: K,
    value: Partial<BookingFlowState[K]>,
  ) => void;
  getFieldError: (path: FieldPath<BookingFlowState>) => string | null;
  isFieldInvalid: (path: FieldPath<BookingFlowState>) => boolean;
  goBack: () => void;
  goNext: () => Promise<boolean>;
  goToStep: (stepId: BookingFlowStepId) => void;
};

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

type BookingFlowProviderProps = PropsWithChildren<{
  initialVehicleSlug?: string;
}>;

export function BookingFlowProvider({ children, initialVehicleSlug }: BookingFlowProviderProps) {
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

  const value = useMemo<BookingFlowContextValue>(
    () => ({
      state,
      activeStepIndex,
      activeStepId,
      stepErrors,
      fieldErrors,
      isFirstStep,
      isLastStep,
      updateSection,
      getFieldError,
      isFieldInvalid,
      goBack,
      goNext,
      goToStep,
    }),
    [
      state,
      activeStepIndex,
      activeStepId,
      stepErrors,
      fieldErrors,
      isFirstStep,
      isLastStep,
      updateSection,
      getFieldError,
      isFieldInvalid,
      goBack,
      goNext,
      goToStep,
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
