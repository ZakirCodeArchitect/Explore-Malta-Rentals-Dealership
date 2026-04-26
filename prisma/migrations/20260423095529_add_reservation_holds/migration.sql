-- CreateEnum
CREATE TYPE "ReservationHoldStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'RELEASED', 'CONVERTED');

-- CreateTable
CREATE TABLE "ReservationHold" (
    "id" TEXT NOT NULL,
    "holdReference" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "customerEmail" TEXT,
    "customerName" TEXT,
    "pickupDateTime" TIMESTAMP(3) NOT NULL,
    "returnDateTime" TIMESTAMP(3) NOT NULL,
    "status" "ReservationHoldStatus" NOT NULL DEFAULT 'ACTIVE',
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastHeartbeatAt" TIMESTAMP(3),
    "bookingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationHold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReservationHold_holdReference_key" ON "ReservationHold"("holdReference");

-- CreateIndex
CREATE INDEX "ReservationHold_vehicleId_status_expiresAt_idx" ON "ReservationHold"("vehicleId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "ReservationHold_sessionKey_status_idx" ON "ReservationHold"("sessionKey", "status");

-- CreateIndex
CREATE INDEX "ReservationHold_expiresAt_idx" ON "ReservationHold"("expiresAt");

-- CreateIndex
CREATE INDEX "ReservationHold_pickupDateTime_returnDateTime_idx" ON "ReservationHold"("pickupDateTime", "returnDateTime");

-- AddForeignKey
ALTER TABLE "ReservationHold" ADD CONSTRAINT "ReservationHold_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservationHold" ADD CONSTRAINT "ReservationHold_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
