-- CreateEnum
CREATE TYPE "HelmetSize" AS ENUM ('S', 'M', 'L');

-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED');
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "status" TYPE "BookingStatus_new" USING ("status"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "VehicleType_new" AS ENUM ('MOTORBIKE_50CC', 'MOTORBIKE_125CC', 'BICYCLE', 'ATV');
ALTER TABLE "Booking" ALTER COLUMN "vehicleType" TYPE "VehicleType_new" USING ("vehicleType"::text::"VehicleType_new");
ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";
DROP TYPE "VehicleType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PickupOption_new" AS ENUM ('OFFICE', 'DELIVERY');
ALTER TABLE "Booking" ALTER COLUMN "pickupOption" TYPE "PickupOption_new" USING ("pickupOption"::text::"PickupOption_new");
ALTER TYPE "PickupOption" RENAME TO "PickupOption_old";
ALTER TYPE "PickupOption_new" RENAME TO "PickupOption";
DROP TYPE "PickupOption_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "DropoffOption_new" AS ENUM ('OFFICE', 'DROPOFF');
ALTER TABLE "Booking" ALTER COLUMN "dropoffOption" TYPE "DropoffOption_new" USING ("dropoffOption"::text::"DropoffOption_new");
ALTER TYPE "DropoffOption" RENAME TO "DropoffOption_old";
ALTER TYPE "DropoffOption_new" RENAME TO "DropoffOption";
DROP TYPE "DropoffOption_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "DepositMethod_new" AS ENUM ('ONLINE', 'IN_PERSON');
ALTER TABLE "Booking" ALTER COLUMN "depositMethod" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "depositMethod" TYPE "DepositMethod_new" USING ("depositMethod"::text::"DepositMethod_new");
ALTER TYPE "DepositMethod" RENAME TO "DepositMethod_old";
ALTER TYPE "DepositMethod_new" RENAME TO "DepositMethod";
DROP TYPE "DepositMethod_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "LicenseCategory_new" AS ENUM ('AM', 'A1', 'A2', 'A', 'B');
ALTER TABLE "Booking" ALTER COLUMN "customerLicenseCategory" TYPE "LicenseCategory_new" USING ("customerLicenseCategory"::text::"LicenseCategory_new");
ALTER TABLE "Booking" ALTER COLUMN "additionalDriverLicenseCategory" TYPE "LicenseCategory_new" USING ("additionalDriverLicenseCategory"::text::"LicenseCategory_new");
ALTER TYPE "LicenseCategory" RENAME TO "LicenseCategory_old";
ALTER TYPE "LicenseCategory_new" RENAME TO "LicenseCategory";
DROP TYPE "LicenseCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CdwOption_new" AS ENUM ('NO_CDW', 'REDUCE_350_50CC', 'REDUCE_500_125CC', 'FULL_COVERAGE_50CC_125CC', 'REDUCE_800_ATV');
ALTER TABLE "Booking" ALTER COLUMN "cdwOption" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "cdwOption" TYPE "CdwOption_new" USING ("cdwOption"::text::"CdwOption_new");
ALTER TYPE "CdwOption" RENAME TO "CdwOption_old";
ALTER TYPE "CdwOption_new" RENAME TO "CdwOption";
DROP TYPE "CdwOption_old";
ALTER TABLE "Booking" ALTER COLUMN "cdwOption" SET DEFAULT 'NO_CDW';
COMMIT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "additionalDriverLicenseUploadPath" TEXT,
ADD COLUMN     "consentSource" TEXT,
ADD COLUMN     "dropoffLatitude" DECIMAL(9,6),
ADD COLUMN     "dropoffLongitude" DECIMAL(9,6),
ADD COLUMN     "pickupLatitude" DECIMAL(9,6),
ADD COLUMN     "pickupLongitude" DECIMAL(9,6),
ADD COLUMN     "termsVersion" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ALTER COLUMN "cdwOption" SET DEFAULT 'NO_CDW',
DROP COLUMN "helmetSize1",
ADD COLUMN     "helmetSize1" "HelmetSize",
DROP COLUMN "helmetSize2",
ADD COLUMN     "helmetSize2" "HelmetSize",
ALTER COLUMN "depositMethod" DROP DEFAULT;

