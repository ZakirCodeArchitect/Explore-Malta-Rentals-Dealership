-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "SecurityDepositStatus" AS ENUM ('PENDING', 'COLLECTED', 'REFUNDED', 'DEDUCTED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'BANK', 'OTHER');

-- Extend BookingStatus with lifecycle values
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'VEHICLE_HANDED_OVER';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'RETURNED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';

-- Migrate legacy booking statuses before enum rebuild
UPDATE "Booking" SET status = 'CANCELLED' WHERE status = 'FAILED';
UPDATE "Booking" SET status = 'CONFIRMED' WHERE status = 'PENDING';

UPDATE "BookingStatusHistory" SET "oldStatus" = 'CANCELLED' WHERE "oldStatus" = 'FAILED';
UPDATE "BookingStatusHistory" SET "newStatus" = 'CANCELLED' WHERE "newStatus" = 'FAILED';
UPDATE "BookingStatusHistory" SET "oldStatus" = 'CONFIRMED' WHERE "oldStatus" = 'PENDING';
UPDATE "BookingStatusHistory" SET "newStatus" = 'CONFIRMED' WHERE "newStatus" = 'PENDING';

-- Rebuild BookingStatus without PENDING/FAILED
CREATE TYPE "BookingStatus_new" AS ENUM (
  'CONFIRMED',
  'VEHICLE_HANDED_OVER',
  'RETURNED',
  'COMPLETED',
  'CANCELLED'
);

ALTER TABLE "Booking" ALTER COLUMN status DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN status TYPE "BookingStatus_new" USING (status::text::"BookingStatus_new");
ALTER TABLE "BookingStatusHistory" ALTER COLUMN "oldStatus" TYPE "BookingStatus_new" USING ("oldStatus"::text::"BookingStatus_new");
ALTER TABLE "BookingStatusHistory" ALTER COLUMN "newStatus" TYPE "BookingStatus_new" USING ("newStatus"::text::"BookingStatus_new");

DROP TYPE "BookingStatus";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
ALTER TABLE "Booking" ALTER COLUMN status SET DEFAULT 'CONFIRMED';

-- Rebuild VehicleUnitStatus with lifecycle values
CREATE TYPE "VehicleUnitStatus_new" AS ENUM (
  'AVAILABLE',
  'RESERVED',
  'OUT_WITH_CUSTOMER',
  'MAINTENANCE',
  'NOT_AVAILABLE'
);

ALTER TABLE "VehicleUnit" ALTER COLUMN status DROP DEFAULT;
ALTER TABLE "VehicleUnit" ALTER COLUMN status TYPE "VehicleUnitStatus_new" USING (
  CASE status::text
    WHEN 'AVAILABLE' THEN 'AVAILABLE'::"VehicleUnitStatus_new"
    WHEN 'BOOKED' THEN 'RESERVED'::"VehicleUnitStatus_new"
    WHEN 'MAINTENANCE' THEN 'MAINTENANCE'::"VehicleUnitStatus_new"
    WHEN 'SOLD' THEN 'NOT_AVAILABLE'::"VehicleUnitStatus_new"
    WHEN 'INACTIVE' THEN 'NOT_AVAILABLE'::"VehicleUnitStatus_new"
    ELSE 'AVAILABLE'::"VehicleUnitStatus_new"
  END
);

DROP TYPE "VehicleUnitStatus";
ALTER TYPE "VehicleUnitStatus_new" RENAME TO "VehicleUnitStatus";
ALTER TABLE "VehicleUnit" ALTER COLUMN status SET DEFAULT 'AVAILABLE';

-- Reserve units tied to active confirmed bookings
UPDATE "VehicleUnit" u
SET status = 'RESERVED'
FROM "Booking" b
WHERE b."vehicleUnitId" = u.id
  AND b.status = 'CONFIRMED';

-- Booking lifecycle columns
ALTER TABLE "Booking" ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Booking" ADD COLUMN "securityDepositStatus" "SecurityDepositStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Booking" ADD COLUMN "paymentReceivedAmount" DECIMAL(10,2);
ALTER TABLE "Booking" ADD COLUMN "paymentMethod" "PaymentMethod";
ALTER TABLE "Booking" ADD COLUMN "securityDepositCollectedAmount" DECIMAL(10,2);
ALTER TABLE "Booking" ADD COLUMN "handoverDateTime" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "handoverNotes" TEXT;
ALTER TABLE "Booking" ADD COLUMN "returnRecordedAt" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "returnNotes" TEXT;
ALTER TABLE "Booking" ADD COLUMN "depositRefundAmount" DECIMAL(10,2);
ALTER TABLE "Booking" ADD COLUMN "depositDeductionAmount" DECIMAL(10,2);
ALTER TABLE "Booking" ADD COLUMN "depositDeductionReason" TEXT;
ALTER TABLE "Booking" ADD COLUMN "completionNotes" TEXT;

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");
CREATE INDEX "Booking_securityDepositStatus_idx" ON "Booking"("securityDepositStatus");
