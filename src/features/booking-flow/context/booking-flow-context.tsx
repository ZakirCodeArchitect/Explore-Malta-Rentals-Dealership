"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { BOOKING_FLOW_STEPS, type BookingFlowStepId } from "@/features/booking-flow/lib/steps";
import {
  type BookingFlowState,
} from "@/features/booking-flow/lib/types";
import { buildBookingInitialState } from "@/features/booking-flow/lib/init-state";
import { canAccessStep, validateUserStep } from "@/features/booking-flow/lib/validation";

type BookingFlowContextValue = {
  state: BookingFlowState;
  activeStepIndex: number;
  activeStepId: BookingFlowStepId;
  stepErrors: Partial<Record<BookingFlowStepId, string>>;
  isFirstStep: boolean;
  isLastStep: boolean;
  updateSection: <K extends keyof BookingFlowState>(
    section: K,
    value: Partial<BookingFlowState[K]>,
  ) => void;
  goBack: () => void;
  goNext: () => boolean;
  goToStep: (stepId: BookingFlowStepId) => void;
};

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null);

type BookingFlowProviderProps = PropsWithChildren<{
  initialVehicleSlug?: string;
}>;

export function BookingFlowProvider({ children, initialVehicleSlug }: BookingFlowProviderProps) {
  const [state, setState] = useState<BookingFlowState>(() =>
    buildBookingInitialState(initialVehicleSlug),
  );
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepErrors, setStepErrors] = useState<Partial<Record<BookingFlowStepId, string>>>({});

  const activeStepId = BOOKING_FLOW_STEPS[activeStepIndex]?.id ?? BOOKING_FLOW_STEPS[0].id;
  const isFirstStep = activeStepIndex === 0;
  const isLastStep = activeStepIndex === BOOKING_FLOW_STEPS.length - 1;

  const updateSection = useCallback(
    <K extends keyof BookingFlowState>(section: K, value: Partial<BookingFlowState[K]>) => {
      setState((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          ...value,
        },
      }));

      setStepErrors((prev) => {
        if (!prev[activeStepId]) {
          return prev;
        }

        const next = { ...prev };
        delete next[activeStepId];
        return next;
      });
    },
    [activeStepId],
  );

  const goNext = useCallback(() => {
    const error = validateUserStep(activeStepId, state);
    if (error) {
      setStepErrors((prev) => ({
        ...prev,
        [activeStepId]: error,
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
  }, [activeStepId, state]);

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

  const value = useMemo<BookingFlowContextValue>(
    () => ({
      state,
      activeStepIndex,
      activeStepId,
      stepErrors,
      isFirstStep,
      isLastStep,
      updateSection,
      goBack,
      goNext,
      goToStep,
    }),
    [
      state,
      activeStepIndex,
      activeStepId,
      stepErrors,
      isFirstStep,
      isLastStep,
      updateSection,
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
