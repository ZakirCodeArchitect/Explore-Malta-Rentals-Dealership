-- CreateEnum
CREATE TYPE "VehicleUnitStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE', 'SOLD', 'INACTIVE');

-- CreateTable
CREATE TABLE "VehicleUnit" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "status" "VehicleUnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleUnit_licensePlate_key" ON "VehicleUnit"("licensePlate");

-- CreateIndex
CREATE INDEX "VehicleUnit_vehicleId_isActive_status_idx" ON "VehicleUnit"("vehicleId", "isActive", "status");

-- CreateIndex
CREATE INDEX "VehicleUnit_vehicleId_createdAt_idx" ON "VehicleUnit"("vehicleId", "createdAt");

-- AddForeignKey
ALTER TABLE "VehicleUnit" ADD CONSTRAINT "VehicleUnit_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill VehicleUnit from existing Vehicle.licensePlate
INSERT INTO "VehicleUnit" ("id", "vehicleId", "licensePlate", "status", "isActive", "createdAt", "updatedAt")
SELECT
    'vu_mig_' || v."id",
    v."id",
    v."licensePlate",
    CASE
        WHEN v."catalogStatus" = 'MAINTENANCE' THEN 'MAINTENANCE'::"VehicleUnitStatus"
        WHEN v."catalogStatus" = 'SOLD' THEN 'SOLD'::"VehicleUnitStatus"
        WHEN v."catalogStatus" = 'INACTIVE' OR v."isActive" = false THEN 'INACTIVE'::"VehicleUnitStatus"
        ELSE 'AVAILABLE'::"VehicleUnitStatus"
    END,
    v."isActive",
    v."createdAt",
    v."updatedAt"
FROM "Vehicle" v
WHERE v."licensePlate" IS NOT NULL
ON CONFLICT ("licensePlate") DO NOTHING;

-- AlterTable: nullable deprecated Vehicle.licensePlate (kept for legacy reads)
ALTER TABLE "Vehicle" ALTER COLUMN "licensePlate" DROP NOT NULL;

-- AlterTable: Booking.vehicleUnitId
ALTER TABLE "Booking" ADD COLUMN "vehicleUnitId" TEXT;

-- CreateIndex
CREATE INDEX "Booking_vehicleUnitId_idx" ON "Booking"("vehicleUnitId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleUnitId_fkey" FOREIGN KEY ("vehicleUnitId") REFERENCES "VehicleUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill Booking.vehicleUnitId from license plate snapshot
UPDATE "Booking" b
SET "vehicleUnitId" = u."id"
FROM "VehicleUnit" u
WHERE b."vehicleId" = u."vehicleId"
  AND b."vehicleUnitId" IS NULL
  AND b."vehicleLicensePlateSnapshot" IS NOT NULL
  AND UPPER(TRIM(b."vehicleLicensePlateSnapshot")) = u."licensePlate";

-- Backfill remaining bookings to sole unit when vehicle has exactly one unit
UPDATE "Booking" b
SET "vehicleUnitId" = u."id"
FROM (
    SELECT "vehicleId", MIN("id") AS "id", COUNT(*) AS cnt
    FROM "VehicleUnit"
    GROUP BY "vehicleId"
    HAVING COUNT(*) = 1
) u
WHERE b."vehicleId" = u."vehicleId"
  AND b."vehicleUnitId" IS NULL
  AND u.cnt = 1;

-- AlterTable: ReservationHold.vehicleUnitId
ALTER TABLE "ReservationHold" ADD COLUMN "vehicleUnitId" TEXT;

-- CreateIndex
CREATE INDEX "ReservationHold_vehicleUnitId_status_expiresAt_idx" ON "ReservationHold"("vehicleUnitId", "status", "expiresAt");

-- AddForeignKey
ALTER TABLE "ReservationHold" ADD CONSTRAINT "ReservationHold_vehicleUnitId_fkey" FOREIGN KEY ("vehicleUnitId") REFERENCES "VehicleUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
