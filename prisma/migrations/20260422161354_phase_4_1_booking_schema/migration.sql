-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('SCOOTER', 'QUAD_BIKE', 'MOTORBIKE', 'CAR');

-- CreateEnum
CREATE TYPE "PickupOption" AS ENUM ('SHOP', 'AIRPORT', 'HOTEL', 'CUSTOM_ADDRESS');

-- CreateEnum
CREATE TYPE "DropoffOption" AS ENUM ('SHOP', 'AIRPORT', 'HOTEL', 'CUSTOM_ADDRESS');

-- CreateEnum
CREATE TYPE "DepositMethod" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "LicenseCategory" AS ENUM ('AM', 'A1', 'A2', 'A', 'B', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "CdwOption" AS ENUM ('NONE', 'BASIC', 'PREMIUM');

-- CreateEnum
CREATE TYPE "ConfirmationEmailStatus" AS ENUM ('NOT_SENT', 'QUEUED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingReference" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "pickupDateTime" TIMESTAMP(3) NOT NULL,
    "returnDateTime" TIMESTAMP(3) NOT NULL,
    "actualDurationHours" DECIMAL(8,2) NOT NULL,
    "billableDays" INTEGER NOT NULL,
    "pickupOption" "PickupOption" NOT NULL,
    "pickupAddress" TEXT,
    "dropoffOption" "DropoffOption" NOT NULL,
    "dropoffAddress" TEXT,
    "customerFullName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerNationality" TEXT NOT NULL,
    "customerDateOfBirth" TIMESTAMP(3) NOT NULL,
    "customerLicenseCategory" "LicenseCategory" NOT NULL,
    "customerSpecialNotes" TEXT,
    "customerLicenseUploadPath" TEXT,
    "customerPassportUploadPath" TEXT,
    "customerWillPresentLicenseAtPickup" BOOLEAN NOT NULL DEFAULT false,
    "customerWillPresentIdAtPickup" BOOLEAN NOT NULL DEFAULT false,
    "additionalDriverEnabled" BOOLEAN NOT NULL DEFAULT false,
    "additionalDriverFullName" TEXT,
    "additionalDriverPhone" TEXT,
    "additionalDriverEmail" TEXT,
    "additionalDriverNationality" TEXT,
    "additionalDriverDateOfBirth" TIMESTAMP(3),
    "additionalDriverLicenseCategory" "LicenseCategory",
    "additionalDriverPassportUploadPath" TEXT,
    "additionalDriverWillPresentIdAtPickup" BOOLEAN NOT NULL DEFAULT false,
    "cdwOption" "CdwOption" NOT NULL DEFAULT 'NONE',
    "cdwDailyRate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cdwTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "additionalDriverDailyRate" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "additionalDriverTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "helmetSize1" TEXT,
    "helmetSize2" TEXT,
    "storageBoxSelected" BOOLEAN NOT NULL DEFAULT false,
    "storageBoxCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "rentalCost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dropoffFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deliveryTotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "depositAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "depositMethod" "DepositMethod" NOT NULL DEFAULT 'CASH',
    "totalDueOnline" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalDueLater" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "termsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "termsAcceptedAt" TIMESTAMP(3),
    "confirmationEmailSentAt" TIMESTAMP(3),
    "confirmationEmailStatus" "ConfirmationEmailStatus" NOT NULL DEFAULT 'NOT_SENT',

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingReference_key" ON "Booking"("bookingReference");

-- CreateIndex
CREATE INDEX "Booking_status_createdAt_idx" ON "Booking"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_pickupDateTime_returnDateTime_idx" ON "Booking"("pickupDateTime", "returnDateTime");

-- CreateIndex
CREATE INDEX "Booking_vehicleType_pickupDateTime_idx" ON "Booking"("vehicleType", "pickupDateTime");

-- CreateIndex
CREATE INDEX "Booking_customerEmail_customerPhone_idx" ON "Booking"("customerEmail", "customerPhone");

