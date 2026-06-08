-- AlterTable: add license plate (nullable until backfill)
ALTER TABLE "Vehicle" ADD COLUMN "licensePlate" TEXT;

-- Backfill demo/seed vehicles with realistic Malta-style plates
UPDATE "Vehicle" SET "licensePlate" = 'MLT-101' WHERE "slug" = 'neco-one-50cc' AND "licensePlate" IS NULL;
UPDATE "Vehicle" SET "licensePlate" = 'MLT-204' WHERE "slug" = 'lexmoto-aura-125cc' AND "licensePlate" IS NULL;
UPDATE "Vehicle" SET "licensePlate" = 'MLT-318' WHERE "slug" = 'giant-escape-city-bike' AND "licensePlate" IS NULL;
UPDATE "Vehicle" SET "licensePlate" = 'MLT-452' WHERE "slug" = 'cfmoto-cforce-atv' AND "licensePlate" IS NULL;

-- Backfill any remaining vehicles with unique derived plates
UPDATE "Vehicle" AS v
SET "licensePlate" = sub.plate
FROM (
  SELECT
    id,
    'MLT-' || UPPER(SUBSTRING(REPLACE("slug", '-', ''), 1, 6)) || '-' || SUBSTRING(id, 1, 4) AS plate
  FROM "Vehicle"
  WHERE "licensePlate" IS NULL
) AS sub
WHERE v.id = sub.id;

ALTER TABLE "Vehicle" ALTER COLUMN "licensePlate" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- AlterTable: remove fleet quantity column
ALTER TABLE "Vehicle" DROP COLUMN "totalFleetUnits";

-- AlterTable: booking license plate snapshot for historical records
ALTER TABLE "Booking" ADD COLUMN "vehicleLicensePlateSnapshot" TEXT;
