export type CreateCheckoutSessionInput = {
  bookingId: string;
  bookingReference: string;
  customerEmail: string;
  customerName: string;
  vehicleName: string;
  pickupDate: string;
  returnDate: string;
  /** Amount in euros (e.g. 150.00) — converted to cents internally */
  amountEur: number;
  locale?: string;
};

export type CreateCheckoutSessionResult =
  | { ok: true; checkoutUrl: string; sessionId: string }
  | { ok: false; error: string };

export type ProcessWebhookResult =
  | { ok: true; action: string }
  | { ok: false; error: string; alreadyProcessed?: boolean };

export type CreateRefundInput = {
  bookingId: string;
  /** Amount in euros — full refund if omitted */
  amountEur?: number;
  reason: "duplicate" | "fraudulent" | "requested_by_customer";
  initiatedBy: string;
  notes?: string;
};

export type CreateRefundResult =
  | { ok: true; refundId: string; amountEur: number }
  | { ok: false; error: string };

export type AuditAction =
  | "checkout_session_created"
  | "payment_succeeded"
  | "payment_failed"
  | "payment_cancelled"
  | "refund_initiated"
  | "refund_succeeded"
  | "refund_failed"
  | "dispute_created"
  | "dispute_closed"
  | "webhook_received"
  | "webhook_duplicate"
  | "booking_payment_status_updated";
