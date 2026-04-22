"use client";

import { BookingSummaryStep } from "@/features/booking-flow/steps/booking-summary-step";
import { SecurityDepositStep } from "@/features/booking-flow/steps/security-deposit-step";

export function ReviewConfirmStep() {
  return (
    <div className="space-y-4">
      <BookingSummaryStep />
      <SecurityDepositStep />
    </div>
  );
}
