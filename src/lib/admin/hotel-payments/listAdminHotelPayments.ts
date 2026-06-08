import type { Prisma } from "@/generated/prisma/index";

import type {
  AdminHotelPaymentDetail,
  AdminHotelPaymentListFilters,
  AdminHotelPaymentListResult,
} from "@/lib/admin/hotel-payments/types";
import { prisma } from "@/lib/prisma";

type SettlementRow = {
  id: string;
  hotelPartnerId: string;
  month: number;
  year: number;
  bookingCountSnapshot: number;
  totalBookingAmountSnapshot: { toNumber: () => number };
  totalHotelDiscountSnapshot: { toNumber: () => number };
  settlementAmountDue: { toNumber: () => number };
  amountPaid: { toNumber: () => number };
  status: "DUE" | "PAID" | "PARTIALLY_PAID";
  paidAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  hotelPartner: {
    name: string;
    isActive: boolean;
  };
};

function mapSettlementRow(row: SettlementRow): AdminHotelPaymentDetail {
  return {
    id: row.id,
    hotelPartnerId: row.hotelPartnerId,
    hotelName: row.hotelPartner.name,
    hotelIsActive: row.hotelPartner.isActive,
    month: row.month,
    year: row.year,
    bookingCountSnapshot: row.bookingCountSnapshot,
    totalBookingAmountSnapshot: row.totalBookingAmountSnapshot.toNumber(),
    totalHotelDiscountSnapshot: row.totalHotelDiscountSnapshot.toNumber(),
    settlementAmountDue: row.settlementAmountDue.toNumber(),
    amountPaid: row.amountPaid.toNumber(),
    status: row.status,
    paidAt: row.paidAt?.toISOString() ?? null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAdminHotelPayments(
  filters: AdminHotelPaymentListFilters = {},
): Promise<AdminHotelPaymentListResult> {
  const where: Prisma.HotelMonthlySettlementWhereInput = {};

  if (filters.hotelPartnerId) {
    where.hotelPartnerId = filters.hotelPartnerId;
  }

  if (filters.month !== undefined) {
    where.month = filters.month;
  }

  if (filters.year !== undefined) {
    where.year = filters.year;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  const [settlements, total] = await Promise.all([
    prisma.hotelMonthlySettlement.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "desc" }, { hotelPartner: { name: "asc" } }],
      select: {
        id: true,
        hotelPartnerId: true,
        month: true,
        year: true,
        bookingCountSnapshot: true,
        totalBookingAmountSnapshot: true,
        totalHotelDiscountSnapshot: true,
        settlementAmountDue: true,
        amountPaid: true,
        status: true,
        paidAt: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        hotelPartner: {
          select: {
            name: true,
            isActive: true,
          },
        },
      },
    }),
    prisma.hotelMonthlySettlement.count({ where }),
  ]);

  return {
    total,
    settlements: settlements.map(mapSettlementRow),
  };
}

export async function getAdminHotelPaymentById(id: string): Promise<AdminHotelPaymentDetail | null> {
  const settlement = await prisma.hotelMonthlySettlement.findUnique({
    where: { id },
    select: {
      id: true,
      hotelPartnerId: true,
      month: true,
      year: true,
      bookingCountSnapshot: true,
      totalBookingAmountSnapshot: true,
      totalHotelDiscountSnapshot: true,
      settlementAmountDue: true,
      amountPaid: true,
      status: true,
      paidAt: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      hotelPartner: {
        select: {
          name: true,
          isActive: true,
        },
      },
    },
  });

  if (!settlement) {
    return null;
  }

  return mapSettlementRow(settlement);
}
