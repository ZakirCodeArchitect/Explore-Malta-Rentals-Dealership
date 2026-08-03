"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";

import { StepShell } from "@/features/booking-flow/components/step-shell";
import { useBookingFlow } from "@/features/booking-flow/context/booking-flow-context";
import {
  colorsMatch,
  formatVehicleColorLabel,
  parseVehicleColorValue,
} from "@/features/vehicles/lib/vehicle-color";
import { useVehicles } from "@/features/vehicles/lib/use-vehicles";

export function ColorSelectorStep() {
  const t = useTranslations("BookingSteps.color");
  const { state, reservationHold, updateSection, getFieldError } = useBookingFlow();

  const rentalWindow = useMemo(() => {
    const { pickupDate, pickupTime, returnDate, returnTime } = state.rental;
    if (!pickupDate.trim() || !pickupTime.trim() || !returnDate.trim() || !returnTime.trim()) {
      return null;
    }
    return {
      pickupDate: pickupDate.trim(),
      pickupTime: pickupTime.trim(),
      returnDate: returnDate.trim(),
      returnTime: returnTime.trim(),
      sessionKey: reservationHold.sessionKey?.trim() || undefined,
    };
  }, [
    reservationHold.sessionKey,
    state.rental.pickupDate,
    state.rental.pickupTime,
    state.rental.returnDate,
    state.rental.returnTime,
  ]);

  const { vehicles, isLoading } = useVehicles({ rentalWindow });

  const selectedVehicle = useMemo(() => {
    if (!state.rental.vehicleId) {
      return null;
    }
    return vehicles.find((vehicle) => vehicle.id === state.rental.vehicleId) ?? null;
  }, [state.rental.vehicleId, vehicles]);

  const availableColors = selectedVehicle?.availableColors ?? [];
  const showSelector = Boolean(state.rental.vehicleId && rentalWindow && availableColors.length > 0);
  const colorError = getFieldError("rental.selectedColor");

  // Normalize incoming color (URL / hold) to the canonical label once options are known.
  useEffect(() => {
    if (!showSelector || !state.rental.selectedColor) {
      return;
    }
    const match = availableColors.find((option) =>
      colorsMatch(option.label, state.rental.selectedColor),
    );
    if (match && match.label !== state.rental.selectedColor) {
      updateSection("rental", { selectedColor: match.label });
    }
  }, [availableColors, showSelector, state.rental.selectedColor, updateSection]);

  useEffect(() => {
    // Wait until the rental window vehicle list has loaded — clearing while loading
    // would wipe a color carried from the vehicle details page.
    if (isLoading || !rentalWindow || !state.rental.vehicleId) {
      return;
    }

    if (!showSelector) {
      if (state.rental.selectedColor) {
        updateSection("rental", { selectedColor: null });
      }
      return;
    }

    const current = state.rental.selectedColor;
    if (!current) {
      return;
    }

    const stillAvailable = availableColors.some((option) => colorsMatch(option.label, current));
    if (!stillAvailable) {
      updateSection("rental", { selectedColor: null });
    }
  }, [
    availableColors,
    isLoading,
    rentalWindow,
    showSelector,
    state.rental.selectedColor,
    state.rental.vehicleId,
    updateSection,
  ]);

  // Prefer hold/URL color even before vehicle list finishes loading (for display readiness).
  useEffect(() => {
    if (state.rental.selectedColor || !reservationHold.selectedColor) {
      return;
    }
    const canonical =
      parseVehicleColorValue(reservationHold.selectedColor) ??
      formatVehicleColorLabel(reservationHold.selectedColor);
    if (canonical) {
      updateSection("rental", { selectedColor: canonical });
    }
  }, [reservationHold.selectedColor, state.rental.selectedColor, updateSection]);

  if (!showSelector) {
    return null;
  }

  return (
    <StepShell title={t("title")} description={t("description")}>
      <fieldset className="space-y-3">
        <legend className="sr-only">{t("title")}</legend>
        <div className="flex flex-wrap gap-2">
          {availableColors.map((option) => {
            const isSelected = colorsMatch(state.rental.selectedColor, option.label);
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={isSelected}
                onClick={() => updateSection("rental", { selectedColor: option.label })}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  isSelected
                    ? "border-[#3a7ca5] bg-[#3a7ca5] text-white"
                    : "border-slate-200 bg-white text-slate-800 hover:border-[#3a7ca5]/40",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {colorError ? (
          <p className="text-sm font-medium text-rose-700" role="alert">
            {colorError}
          </p>
        ) : null}
      </fieldset>
    </StepShell>
  );
}
