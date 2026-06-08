-- Hotel / partner management
CREATE TABLE "HotelPartner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelPartner_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HotelPartner_isActive_name_idx" ON "HotelPartner"("isActive", "name");

CREATE TABLE "HotelCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hotelPartnerId" TEXT NOT NULL,
    "discountPercent" DECIMAL(5,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "HotelCode_code_key" ON "HotelCode"("code");
CREATE INDEX "HotelCode_hotelPartnerId_isActive_idx" ON "HotelCode"("hotelPartnerId", "isActive");
CREATE INDEX "HotelCode_isActive_code_idx" ON "HotelCode"("isActive", "code");

ALTER TABLE "HotelCode" ADD CONSTRAINT "HotelCode_hotelPartnerId_fkey"
FOREIGN KEY ("hotelPartnerId") REFERENCES "HotelPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Booking hotel discount snapshots
ALTER TABLE "Booking" ADD COLUMN "hotelCodeId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "hotelPartnerId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "hotelCodeSnapshot" TEXT;
ALTER TABLE "Booking" ADD COLUMN "hotelPartnerNameSnapshot" TEXT;
ALTER TABLE "Booking" ADD COLUMN "hotelDiscountPercentSnapshot" DECIMAL(5,2);
ALTER TABLE "Booking" ADD COLUMN "hotelDiscountAmountSnapshot" DECIMAL(10,2);
ALTER TABLE "Booking" ADD COLUMN "subtotalAfterHotelDiscountSnapshot" DECIMAL(10,2);

CREATE INDEX "Booking_hotelCodeId_idx" ON "Booking"("hotelCodeId");
CREATE INDEX "Booking_hotelPartnerId_idx" ON "Booking"("hotelPartnerId");

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hotelCodeId_fkey"
FOREIGN KEY ("hotelCodeId") REFERENCES "HotelCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Booking" ADD CONSTRAINT "Booking_hotelPartnerId_fkey"
FOREIGN KEY ("hotelPartnerId") REFERENCES "HotelPartner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
