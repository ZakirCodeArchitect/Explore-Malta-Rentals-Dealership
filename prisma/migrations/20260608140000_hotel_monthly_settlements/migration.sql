-- CreateEnum
CREATE TYPE "HotelSettlementStatus" AS ENUM ('DUE', 'PAID', 'PARTIALLY_PAID');

-- CreateTable
CREATE TABLE "HotelMonthlySettlement" (
    "id" TEXT NOT NULL,
    "hotelPartnerId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "bookingCountSnapshot" INTEGER NOT NULL,
    "totalBookingAmountSnapshot" DECIMAL(12,2) NOT NULL,
    "totalHotelDiscountSnapshot" DECIMAL(12,2) NOT NULL,
    "settlementAmountDue" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "HotelSettlementStatus" NOT NULL DEFAULT 'DUE',
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HotelMonthlySettlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HotelMonthlySettlement_year_month_idx" ON "HotelMonthlySettlement"("year", "month");

-- CreateIndex
CREATE INDEX "HotelMonthlySettlement_status_idx" ON "HotelMonthlySettlement"("status");

-- CreateIndex
CREATE UNIQUE INDEX "HotelMonthlySettlement_hotelPartnerId_month_year_key" ON "HotelMonthlySettlement"("hotelPartnerId", "month", "year");

-- AddForeignKey
ALTER TABLE "HotelMonthlySettlement" ADD CONSTRAINT "HotelMonthlySettlement_hotelPartnerId_fkey" FOREIGN KEY ("hotelPartnerId") REFERENCES "HotelPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
