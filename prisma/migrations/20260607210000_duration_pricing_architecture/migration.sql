-- Add vehicle base daily rate (single source per vehicle)
ALTER TABLE "Vehicle" ADD COLUMN "baseDailyRate" DECIMAL(10,2);

UPDATE "Vehicle" v
SET "baseDailyRate" = r."dailyRate"
FROM "VehiclePricingRule" r
WHERE r."vehicleId" = v."id"
  AND r."ruleType" = 'DAY_1'
  AND r."isActive" = true;

UPDATE "Vehicle"
SET "baseDailyRate" = 25
WHERE "baseDailyRate" IS NULL
  AND "vehicleType" IN ('Scooter', 'Motorcycle');

UPDATE "Vehicle"
SET "baseDailyRate" = 20
WHERE "baseDailyRate" IS NULL
  AND "vehicleType" = 'Bicycle';

UPDATE "Vehicle"
SET "baseDailyRate" = 110
WHERE "baseDailyRate" IS NULL
  AND "vehicleType" = 'ATV';

ALTER TABLE "Vehicle" ALTER COLUMN "baseDailyRate" SET NOT NULL;

-- Category/type duration discount rules
CREATE TABLE "DurationPricingRule" (
    "id" TEXT NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "minDays" INTEGER NOT NULL,
    "maxDays" INTEGER,
    "discountPercent" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DurationPricingRule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DurationPricingRule_vehicleType_isActive_displayOrder_idx"
ON "DurationPricingRule"("vehicleType", "isActive", "displayOrder");

-- Booking pricing snapshots for audit/history
ALTER TABLE "Booking" ADD COLUMN "baseDailyRateSnapshot" DECIMAL(10,2);
ALTER TABLE "Booking" ADD COLUMN "durationDiscountPercentSnapshot" DECIMAL(5,2);
ALTER TABLE "Booking" ADD COLUMN "appliedDailyRateSnapshot" DECIMAL(10,2);
