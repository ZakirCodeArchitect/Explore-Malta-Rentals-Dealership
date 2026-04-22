"use client";

import { SelectVehicleStep } from "@/features/booking-flow/steps/select-vehicle-step";
import { RentalDatesStep } from "@/features/booking-flow/steps/rental-dates-step";
import { PricingStep } from "@/features/booking-flow/steps/pricing-step";

export function RentalDetailsStep() {
  return (
    <div className="space-y-4">
      <SelectVehicleStep />
      <RentalDatesStep />
      <PricingStep />
    </div>
  );
}
