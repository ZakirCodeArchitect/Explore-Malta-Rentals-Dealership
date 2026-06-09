import { isOnlinePaymentEnabled } from "@/lib/booking/online-payment-config";

export type BookingPaymentSummaryDepositMethod = "ONLINE" | "IN_PERSON" | "online" | "in_person";

export type BookingPaymentSummaryInput = {
  subtotal: number;
  depositAmount: number;
  depositMethod: BookingPaymentSummaryDepositMethod;
  totalDueOnline: number;
  totalDueLater: number;
};

export type BookingPaymentSummary = {
  bookingChargesTotal: number;
  securityDeposit: number;
  securityDepositDueAtPickup: boolean;
  /** Null when online payment is not active for this booking. */
  amountPayableOnline: number | null;
  amountDueAtPickupLater: number;
  totalCustomerLiability: number;
  onlinePaymentEnabled: boolean;
};

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function normalizeDepositMethod(method: BookingPaymentSummaryDepositMethod): "ONLINE" | "IN_PERSON" {
  return method === "ONLINE" || method === "online" ? "ONLINE" : "IN_PERSON";
}

/** Display-only payment summary from stored pricing fields. Does not recalculate pricing rules. */
export function buildBookingPaymentSummary(
  input: BookingPaymentSummaryInput,
): BookingPaymentSummary {
  const bookingChargesTotal = input.subtotal;
  const securityDeposit = input.depositAmount;
  const totalCustomerLiability = roundMoney(bookingChargesTotal + securityDeposit);
  const depositMethod = normalizeDepositMethod(input.depositMethod);
  const securityDepositDueAtPickup = depositMethod === "IN_PERSON";
  const onlinePaymentEnabled = isOnlinePaymentEnabled();

  if (!onlinePaymentEnabled) {
    return {
      bookingChargesTotal,
      securityDeposit,
      securityDepositDueAtPickup,
      amountPayableOnline: null,
      amountDueAtPickupLater: totalCustomerLiability,
      totalCustomerLiability,
      onlinePaymentEnabled: false,
    };
  }

  if (depositMethod === "ONLINE") {
    return {
      bookingChargesTotal,
      securityDeposit,
      securityDepositDueAtPickup: false,
      amountPayableOnline: input.totalDueOnline,
      amountDueAtPickupLater: input.totalDueLater,
      totalCustomerLiability,
      onlinePaymentEnabled: true,
    };
  }

  return {
    bookingChargesTotal,
    securityDeposit,
    securityDepositDueAtPickup: true,
    amountPayableOnline: input.totalDueOnline,
    amountDueAtPickupLater: input.totalDueLater,
    totalCustomerLiability,
    onlinePaymentEnabled: true,
  };
}
