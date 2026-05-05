-- Rename VehicleType enum values to human-readable labels.
-- MOTORBIKE_50CC  → Scooter
-- MOTORBIKE_125CC → Motorcycle
-- BICYCLE         → Bicycle
-- ATV stays unchanged

ALTER TYPE "VehicleType" RENAME VALUE 'MOTORBIKE_50CC' TO 'Scooter';
ALTER TYPE "VehicleType" RENAME VALUE 'MOTORBIKE_125CC' TO 'Motorcycle';
ALTER TYPE "VehicleType" RENAME VALUE 'BICYCLE' TO 'Bicycle';
