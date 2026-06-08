-- CreateEnum
CREATE TYPE "VehicleCatalogStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'UNDER_PROCESS', 'SOLD', 'MAINTENANCE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "catalogStatus" "VehicleCatalogStatus" NOT NULL DEFAULT 'AVAILABLE';

-- CreateIndex
CREATE INDEX "Vehicle_catalogStatus_isActive_idx" ON "Vehicle"("catalogStatus", "isActive");
