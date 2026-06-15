-- btree_gist is required for EXCLUDE constraints mixing equality (=) and range overlap (&&).
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Idempotency for duplicate booking submits (network retry / double-click protection).
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_idempotencyKey_key" ON "Booking"("idempotencyKey");

-- Physical unit occupancy periods enforced at the database layer.
CREATE TABLE IF NOT EXISTS "VehicleUnitOccupancy" (
    "id" TEXT NOT NULL,
    "vehicleUnitId" TEXT NOT NULL,
    "pickupAt" TIMESTAMPTZ(3) NOT NULL,
    "returnAt" TIMESTAMPTZ(3) NOT NULL,
    "bookingId" TEXT,
    "reservationHoldId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "period" tstzrange GENERATED ALWAYS AS (tstzrange("pickupAt", "returnAt", '[)')) STORED,

    CONSTRAINT "VehicleUnitOccupancy_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "VehicleUnitOccupancy_vehicleUnitId_fkey" FOREIGN KEY ("vehicleUnitId") REFERENCES "VehicleUnit"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleUnitOccupancy_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleUnitOccupancy_reservationHoldId_fkey" FOREIGN KEY ("reservationHoldId") REFERENCES "ReservationHold"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleUnitOccupancy_source_check" CHECK (
        ("bookingId" IS NOT NULL AND "reservationHoldId" IS NULL) OR
        ("bookingId" IS NULL AND "reservationHoldId" IS NOT NULL)
    ),
    CONSTRAINT "VehicleUnitOccupancy_period_valid_check" CHECK (
        "pickupAt" < "returnAt"
    ),
    CONSTRAINT "VehicleUnitOccupancy_vehicleUnitId_period_excl" EXCLUDE USING gist (
        "vehicleUnitId" WITH =,
        "period" WITH &&
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS "VehicleUnitOccupancy_bookingId_key" ON "VehicleUnitOccupancy"("bookingId");
CREATE UNIQUE INDEX IF NOT EXISTS "VehicleUnitOccupancy_reservationHoldId_key" ON "VehicleUnitOccupancy"("reservationHoldId");
CREATE INDEX IF NOT EXISTS "VehicleUnitOccupancy_vehicleUnitId_idx" ON "VehicleUnitOccupancy"("vehicleUnitId");
CREATE INDEX IF NOT EXISTS "VehicleUnitOccupancy_pickupAt_returnAt_idx" ON "VehicleUnitOccupancy"("pickupAt", "returnAt");

-- Backfill blocking bookings (CONFIRMED, VEHICLE_HANDED_OVER, RETURNED).
INSERT INTO "VehicleUnitOccupancy" ("id", "vehicleUnitId", "pickupAt", "returnAt", "bookingId", "createdAt")
SELECT
    'vuo_bk_' || b."id",
    b."vehicleUnitId",
    b."pickupDateTime",
    b."returnDateTime",
    b."id",
    b."createdAt"
FROM "Booking" b
WHERE b."vehicleUnitId" IS NOT NULL
  AND b."status" IN ('CONFIRMED', 'VEHICLE_HANDED_OVER', 'RETURNED')
  AND b."pickupDateTime" < b."returnDateTime"
ON CONFLICT DO NOTHING;

-- Backfill active non-expired holds with assigned units.
INSERT INTO "VehicleUnitOccupancy" ("id", "vehicleUnitId", "pickupAt", "returnAt", "reservationHoldId", "createdAt")
SELECT
    'vuo_hld_' || h."id",
    h."vehicleUnitId",
    h."pickupDateTime",
    h."returnDateTime",
    h."id",
    h."createdAt"
FROM "ReservationHold" h
WHERE h."vehicleUnitId" IS NOT NULL
  AND h."status" = 'ACTIVE'
  AND h."expiresAt" > NOW()
  AND h."pickupDateTime" < h."returnDateTime"
ON CONFLICT DO NOTHING;
