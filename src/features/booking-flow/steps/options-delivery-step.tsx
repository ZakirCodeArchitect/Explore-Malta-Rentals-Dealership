"use client";

import { PickupDropoffStep } from "@/features/booking-flow/steps/pickup-dropoff-step";
import { AddonsStep } from "@/features/booking-flow/steps/addons-step";

export function OptionsDeliveryStep() {
  return (
    <div className="space-y-4">
      <PickupDropoffStep />
      <AddonsStep />
    </div>
  );
}
