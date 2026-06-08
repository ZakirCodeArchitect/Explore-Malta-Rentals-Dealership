import type { Prisma } from "@/generated/prisma/index";

import type { AdminHotelSettlementPreview } from "@/lib/admin/hotel-payments/types";
import { prisma } from "@/lib/prisma";

const EXCLUDED_BOOKING_STATUSES = ["CANCELLED", "FAILED"] as const;

function monthRangeUtc(month: number, year: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

function buildHotelBookingWhere(hotelPartnerId: string, month: number, year: number): Prisma.BookingWhereInput {
  const { start, end } = monthRangeUtc(month, year);

  return {
    createdAt: {
      gte: start,
      lt: end,
    },
    status: {
      notIn: [...EXCLUDED_BOOKING_STATUSES],
    },
    AND: [
      {
        OR: [{ hotelPartnerId }, { hotelCode: { hotelPartnerId } }],
      },
      {
        OR: [{ hotelPartnerId: { not: null } }, { hotelCodeId: { not: null } }],
      },
    ],
  };
}

export async function calculateHotelSettlementPreview(
  hotelPartnerId: string,
  month: number,
  year: number,
): Promise<AdminHotelSettlementPreview> {
  const where = buildHotelBookingWhere(hotelPartnerId, month, year);

  const bookings = await prisma.booking.findMany({
    where,
    select: {
      subtotal: true,
      hotelDiscountAmountSnapshot: true,
    },
  });

  let totalBookingAmount = 0;
  let totalHotelDiscount = 0;

  for (const booking of bookings) {
    totalBookingAmount += booking.subtotal.toNumber();
    totalHotelDiscount += booking.hotelDiscountAmountSnapshot?.toNumber() ?? 0;
  }

  return {
    hotelPartnerId,
    month,
    year,
    bookingCount: bookings.length,
    totalBookingAmount,
    totalHotelDiscount,
  };
}
