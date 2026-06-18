-- RESERVED was previously set on booking submit as a date-based lock.
-- Date-based locks now live in VehicleUnitOccupancy; physical status stays AVAILABLE
-- until handover (OUT_WITH_CUSTOMER) or admin maintenance/unavailable.
UPDATE "VehicleUnit"
SET "status" = 'AVAILABLE',
    "updatedAt" = NOW()
WHERE "status" = 'RESERVED';
