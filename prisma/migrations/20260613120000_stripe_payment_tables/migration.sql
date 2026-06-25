-- Migration: stripe_payment_tables
-- Adds Stripe payment infrastructure: StripePayment, StripeTransaction, StripeRefund,
-- WebhookEvent, PaymentAuditLog, and the new enums they rely on.

-- ── Enums ──────────────────────────────────────────────────────────────────────

CREATE TYPE "StripePaymentStatus" AS ENUM (
  'PENDING',
  'PROCESSING',
  'SUCCEEDED',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
  'DISPUTED',
  'EXPIRED'
);

CREATE TYPE "RefundStatus" AS ENUM (
  'NONE',
  'PENDING',
  'PARTIAL',
  'FULL',
  'FAILED'
);

CREATE TYPE "RefundReason" AS ENUM (
  'DUPLICATE',
  'FRAUDULENT',
  'REQUESTED_BY_CUSTOMER',
  'ADMIN_INITIATED',
  'BOOKING_CANCELLED',
  'FAILED_BOOKING'
);

-- ── StripePayment ──────────────────────────────────────────────────────────────

CREATE TABLE "StripePayment" (
  "id"                      TEXT NOT NULL,
  "bookingId"               TEXT NOT NULL,
  "stripePaymentIntentId"   TEXT,
  "stripeCheckoutSessionId" TEXT,
  "amountCents"             INTEGER NOT NULL,
  "currency"                TEXT NOT NULL DEFAULT 'eur',
  "stripeStatus"            "StripePaymentStatus" NOT NULL DEFAULT 'PENDING',
  "refundStatus"            "RefundStatus" NOT NULL DEFAULT 'NONE',
  "refundedAmountCents"     INTEGER NOT NULL DEFAULT 0,
  "metadata"                JSONB,
  "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"               TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StripePayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StripePayment_bookingId_key"               ON "StripePayment"("bookingId");
CREATE UNIQUE INDEX "StripePayment_stripePaymentIntentId_key"   ON "StripePayment"("stripePaymentIntentId");
CREATE UNIQUE INDEX "StripePayment_stripeCheckoutSessionId_key" ON "StripePayment"("stripeCheckoutSessionId");
CREATE INDEX "StripePayment_stripeStatus_idx"                   ON "StripePayment"("stripeStatus");
CREATE INDEX "StripePayment_createdAt_idx"                      ON "StripePayment"("createdAt");

ALTER TABLE "StripePayment"
  ADD CONSTRAINT "StripePayment_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── StripeTransaction ──────────────────────────────────────────────────────────

CREATE TABLE "StripeTransaction" (
  "id"                  TEXT NOT NULL,
  "stripePaymentId"     TEXT NOT NULL,
  "transactionType"     TEXT NOT NULL,
  "stripeTransactionId" TEXT NOT NULL,
  "amountCents"         INTEGER NOT NULL,
  "currency"            TEXT NOT NULL DEFAULT 'eur',
  "status"              TEXT NOT NULL,
  "metadata"            JSONB,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StripeTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StripeTransaction_stripeTransactionId_key" ON "StripeTransaction"("stripeTransactionId");
CREATE INDEX "StripeTransaction_stripePaymentId_idx"            ON "StripeTransaction"("stripePaymentId");

ALTER TABLE "StripeTransaction"
  ADD CONSTRAINT "StripeTransaction_stripePaymentId_fkey"
  FOREIGN KEY ("stripePaymentId") REFERENCES "StripePayment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ── StripeRefund ───────────────────────────────────────────────────────────────

CREATE TABLE "StripeRefund" (
  "id"              TEXT NOT NULL,
  "stripePaymentId" TEXT NOT NULL,
  "stripeRefundId"  TEXT NOT NULL,
  "amountCents"     INTEGER NOT NULL,
  "reason"          "RefundReason" NOT NULL,
  "status"          TEXT NOT NULL,
  "initiatedBy"     TEXT,
  "notes"           TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,

  CONSTRAINT "StripeRefund_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StripeRefund_stripeRefundId_key" ON "StripeRefund"("stripeRefundId");
CREATE INDEX "StripeRefund_stripePaymentId_idx"       ON "StripeRefund"("stripePaymentId");

ALTER TABLE "StripeRefund"
  ADD CONSTRAINT "StripeRefund_stripePaymentId_fkey"
  FOREIGN KEY ("stripePaymentId") REFERENCES "StripePayment"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ── WebhookEvent ───────────────────────────────────────────────────────────────

CREATE TABLE "WebhookEvent" (
  "id"            TEXT NOT NULL,
  "stripeEventId" TEXT NOT NULL,
  "eventType"     TEXT NOT NULL,
  "processed"     BOOLEAN NOT NULL DEFAULT false,
  "processedAt"   TIMESTAMP(3),
  "payload"       JSONB NOT NULL,
  "error"         TEXT,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "WebhookEvent_stripeEventId_key"        ON "WebhookEvent"("stripeEventId");
CREATE INDEX "WebhookEvent_stripeEventId_idx"               ON "WebhookEvent"("stripeEventId");
CREATE INDEX "WebhookEvent_eventType_processed_idx"         ON "WebhookEvent"("eventType", "processed");
CREATE INDEX "WebhookEvent_createdAt_idx"                   ON "WebhookEvent"("createdAt");

-- ── PaymentAuditLog ────────────────────────────────────────────────────────────

CREATE TABLE "PaymentAuditLog" (
  "id"              TEXT NOT NULL,
  "bookingId"       TEXT,
  "stripePaymentId" TEXT,
  "action"          TEXT NOT NULL,
  "actor"           TEXT NOT NULL,
  "oldValue"        JSONB,
  "newValue"        JSONB,
  "ipAddress"       TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PaymentAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PaymentAuditLog_bookingId_createdAt_idx"       ON "PaymentAuditLog"("bookingId", "createdAt");
CREATE INDEX "PaymentAuditLog_stripePaymentId_createdAt_idx" ON "PaymentAuditLog"("stripePaymentId", "createdAt");
CREATE INDEX "PaymentAuditLog_createdAt_idx"                 ON "PaymentAuditLog"("createdAt");
