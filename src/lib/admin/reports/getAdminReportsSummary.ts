import type { Prisma } from "@/generated/prisma/index";

import type {
  AdminReportFilters,
  AdminReportsSummary,
} from "@/lib/admin/reports/types";
import { prisma } from "@/lib/prisma";

const MALTA_TIME_ZONE = "Europe/Malta";
const REVENUE_EXCLUDED_STATUSES = ["CANCELLED", "FAILED"] as const;
const TOP_HOTELS_LIMIT = 5;
const TOP_HOTEL_CODES_LIMIT = 5;
const RECENT_BOOKINGS_LIMIT = 15;
const SETTLEMENT_TABLE_LIMIT = 12;

const MONTH_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  timeZone: MALTA_TIME_ZONE,
});

function monthKeyFromDate(date: Date): string {
  return MONTH_KEY_FORMATTER.format(date).slice(0, 7);
}

function monthRangeUtc(month: number, year: number): { start: Date; end: Date } {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

function buildBookingWhere(filters: AdminReportFilters): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.hotelPartnerId) {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { hotelPartnerId: filters.hotelPartnerId },
          { hotelCode: { hotelPartnerId: filters.hotelPartnerId } },
        ],
      },
    ];
  }

  if (filters.month !== undefined && filters.year !== undefined) {
    const { start, end } = monthRangeUtc(filters.month, filters.year);
    where.createdAt = { gte: start, lt: end };
  } else if (filters.year !== undefined) {
    where.createdAt = {
      gte: new Date(Date.UTC(filters.year, 0, 1)),
      lt: new Date(Date.UTC(filters.year + 1, 0, 1)),
    };
  }

  return where;
}

function buildRevenueWhere(filters: AdminReportFilters): Prisma.BookingWhereInput {
  const base = buildBookingWhere(filters);

  if (filters.status) {
    return base;
  }

  return {
    ...base,
    status: { notIn: [...REVENUE_EXCLUDED_STATUSES] },
  };
}

function buildPeriodWhere(filters: AdminReportFilters): Prisma.BookingWhereInput {
  const where: Prisma.BookingWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.hotelPartnerId) {
    where.OR = [
      { hotelPartnerId: filters.hotelPartnerId },
      { hotelCode: { hotelPartnerId: filters.hotelPartnerId } },
    ];
  }

  return where;
}

async function getPeriodBookingCounts(periodWhere: Prisma.BookingWhereInput): Promise<{
  thisMonth: number;
  lastMonth: number;
}> {
  const now = new Date();
  const thisMonthKey = monthKeyFromDate(now);
  const lastMonthDate = new Date(now);
  lastMonthDate.setDate(1);
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthKey = monthKeyFromDate(lastMonthDate);

  const prismaWhere: Prisma.BookingWhereInput = { ...periodWhere };

  const [thisMonth, lastMonth] = await Promise.all([
    prisma.booking.count({
      where: {
        ...prismaWhere,
        createdAt: monthCreatedAtRange(thisMonthKey),
      },
    }),
    prisma.booking.count({
      where: {
        ...prismaWhere,
        createdAt: monthCreatedAtRange(lastMonthKey),
      },
    }),
  ]);

  return { thisMonth, lastMonth };
}

function monthCreatedAtRange(monthKey: string): Prisma.DateTimeFilter {
  const [year, month] = monthKey.split("-").map(Number);
  const { start, end } = monthRangeUtc(month, year);
  return { gte: start, lt: end };
}

async function getBookingSummary(filters: AdminReportFilters) {
  const countWhere = buildBookingWhere(filters);
  const revenueWhere = buildRevenueWhere(filters);
  const periodWhere = buildPeriodWhere(filters);

  const [statusGroups, revenueAggregate, discountAggregate, periodCounts] = await Promise.all([
    prisma.booking.groupBy({
      by: ["status"],
      where: countWhere,
      _count: { _all: true },
    }),
    prisma.booking.aggregate({
      where: revenueWhere,
      _sum: { subtotal: true },
    }),
    prisma.booking.aggregate({
      where: countWhere,
      _sum: { hotelDiscountAmountSnapshot: true },
    }),
    getPeriodBookingCounts(periodWhere),
  ]);

  const statusCounts = Object.fromEntries(
    statusGroups.map((row) => [row.status, row._count._all]),
  ) as Record<string, number>;

  return {
    totalBookings: statusGroups.reduce((sum, row) => sum + row._count._all, 0),
    confirmedBookings: statusCounts.CONFIRMED ?? 0,
    cancelledBookings: statusCounts.CANCELLED ?? 0,
    failedBookings: statusCounts.FAILED ?? 0,
    pendingBookings: statusCounts.PENDING ?? 0,
    bookingsThisMonth: periodCounts.thisMonth,
    bookingsLastMonth: periodCounts.lastMonth,
    totalBookingValue: revenueAggregate._sum.subtotal?.toNumber() ?? 0,
    totalHotelDiscount: discountAggregate._sum.hotelDiscountAmountSnapshot?.toNumber() ?? 0,
  };
}

async function getVehicleSummary() {
  const [totalVehicles, activeVehicles, byCatalogStatus, byType] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { isActive: true } }),
    prisma.vehicle.groupBy({
      by: ["catalogStatus"],
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleType"],
      _count: { _all: true },
      orderBy: { vehicleType: "asc" },
    }),
  ]);

  const statusCounts = Object.fromEntries(
    byCatalogStatus.map((row) => [row.catalogStatus, row._count._all]),
  ) as Record<string, number>;

  return {
    totalVehicles,
    activeVehicles,
    availableVehicles: statusCounts.AVAILABLE ?? 0,
    bookedVehicles: statusCounts.BOOKED ?? 0,
    underProcessVehicles: statusCounts.UNDER_PROCESS ?? 0,
    soldVehicles: statusCounts.SOLD ?? 0,
    maintenanceVehicles: statusCounts.MAINTENANCE ?? 0,
    inactiveCatalogVehicles: statusCounts.INACTIVE ?? 0,
    byType: byType.map((row) => ({
      vehicleType: row.vehicleType,
      count: row._count._all,
    })),
    byCatalogStatus: byCatalogStatus.map((row) => ({
      catalogStatus: row.catalogStatus,
      count: row._count._all,
    })),
  };
}

async function getHotelCodeSummary() {
  const [
    totalHotels,
    activeHotels,
    totalHotelCodes,
    activeHotelCodes,
    bookingsViaHotelCodes,
    discountAggregate,
    topHotelsRows,
    topCodesRows,
  ] = await Promise.all([
    prisma.hotelPartner.count(),
    prisma.hotelPartner.count({ where: { isActive: true } }),
    prisma.hotelCode.count(),
    prisma.hotelCode.count({ where: { isActive: true } }),
    prisma.booking.count({ where: { hotelCodeId: { not: null } } }),
    prisma.booking.aggregate({
      where: { hotelCodeId: { not: null } },
      _sum: { hotelDiscountAmountSnapshot: true },
    }),
    prisma.$queryRaw<{ hotel_partner_id: string; hotel_name: string; booking_count: number }[]>`
      SELECT
        hp.id AS hotel_partner_id,
        hp.name AS hotel_name,
        COUNT(b.id)::integer AS booking_count
      FROM "Booking" b
      LEFT JOIN "HotelCode" hc ON hc.id = b."hotelCodeId"
      INNER JOIN "HotelPartner" hp ON hp.id = COALESCE(b."hotelPartnerId", hc."hotelPartnerId")
      WHERE COALESCE(b."hotelPartnerId", hc."hotelPartnerId") IS NOT NULL
      GROUP BY hp.id, hp.name
      ORDER BY booking_count DESC, hp.name ASC
      LIMIT ${TOP_HOTELS_LIMIT}
    `,
    prisma.$queryRaw<{ hotel_code_id: string; code: string; hotel_name: string; booking_count: number }[]>`
      SELECT
        hc.id AS hotel_code_id,
        hc.code,
        hp.name AS hotel_name,
        COUNT(b.id)::integer AS booking_count
      FROM "Booking" b
      INNER JOIN "HotelCode" hc ON hc.id = b."hotelCodeId"
      INNER JOIN "HotelPartner" hp ON hp.id = hc."hotelPartnerId"
      WHERE b."hotelCodeId" IS NOT NULL
      GROUP BY hc.id, hc.code, hp.name
      ORDER BY booking_count DESC, hc.code ASC
      LIMIT ${TOP_HOTEL_CODES_LIMIT}
    `,
  ]);

  return {
    totalHotels,
    activeHotels,
    totalHotelCodes,
    activeHotelCodes,
    bookingsViaHotelCodes,
    totalHotelDiscountAmount: discountAggregate._sum.hotelDiscountAmountSnapshot?.toNumber() ?? 0,
    topHotelsByBookings: topHotelsRows.map((row) => ({
      hotelPartnerId: row.hotel_partner_id,
      hotelName: row.hotel_name,
      bookingCount: row.booking_count,
    })),
    topHotelCodesByBookings: topCodesRows.map((row) => ({
      hotelCodeId: row.hotel_code_id,
      code: row.code,
      hotelName: row.hotel_name,
      bookingCount: row.booking_count,
    })),
  };
}

function buildSettlementWhere(filters: AdminReportFilters): Prisma.HotelMonthlySettlementWhereInput {
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

  return where;
}

async function getHotelPaymentSummary(filters: AdminReportFilters) {
  const where = buildSettlementWhere(filters);

  const [statusGroups, settlements] = await Promise.all([
    prisma.hotelMonthlySettlement.groupBy({
      by: ["status"],
      where,
      _count: { _all: true },
      _sum: {
        settlementAmountDue: true,
        amountPaid: true,
      },
    }),
    prisma.hotelMonthlySettlement.findMany({
      where,
      orderBy: [{ year: "desc" }, { month: "desc" }, { hotelPartner: { name: "asc" } }],
      take: SETTLEMENT_TABLE_LIMIT,
      select: {
        id: true,
        month: true,
        year: true,
        settlementAmountDue: true,
        amountPaid: true,
        status: true,
        bookingCountSnapshot: true,
        hotelPartner: {
          select: { name: true },
        },
      },
    }),
  ]);

  let totalSettlementAmountDue = 0;
  let totalAmountPaid = 0;
  let dueCount = 0;
  let paidCount = 0;
  let partiallyPaidCount = 0;

  for (const row of statusGroups) {
    totalSettlementAmountDue += row._sum.settlementAmountDue?.toNumber() ?? 0;
    totalAmountPaid += row._sum.amountPaid?.toNumber() ?? 0;

    if (row.status === "DUE") dueCount = row._count._all;
    if (row.status === "PAID") paidCount = row._count._all;
    if (row.status === "PARTIALLY_PAID") partiallyPaidCount = row._count._all;
  }

  return {
    totalSettlementAmountDue,
    totalAmountPaid,
    totalOutstanding: Math.max(0, totalSettlementAmountDue - totalAmountPaid),
    dueCount,
    paidCount,
    partiallyPaidCount,
    monthlySettlements: settlements.map((row) => {
      const amountDue = row.settlementAmountDue.toNumber();
      const amountPaid = row.amountPaid.toNumber();
      return {
        id: row.id,
        hotelName: row.hotelPartner.name,
        month: row.month,
        year: row.year,
        settlementAmountDue: amountDue,
        amountPaid,
        outstanding: Math.max(0, amountDue - amountPaid),
        status: row.status,
        bookingCountSnapshot: row.bookingCountSnapshot,
      };
    }),
  };
}

async function getRecentBookings() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: RECENT_BOOKINGS_LIMIT,
    select: {
      id: true,
      bookingReference: true,
      customerFullName: true,
      vehicleNameSnapshot: true,
      createdAt: true,
      status: true,
      subtotal: true,
      hotelCodeSnapshot: true,
      vehicle: {
        select: { name: true },
      },
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    bookingReference: booking.bookingReference,
    customerFullName: booking.customerFullName,
    vehicleName: booking.vehicleNameSnapshot ?? booking.vehicle?.name ?? "—",
    createdAt: booking.createdAt.toISOString(),
    status: booking.status,
    subtotal: booking.subtotal.toNumber(),
    hotelCode: booking.hotelCodeSnapshot,
  }));
}

export async function getAdminReportsSummary(filters: AdminReportFilters = {}): Promise<AdminReportsSummary> {
  const [bookingSummary, vehicleSummary, hotelCodeSummary, hotelPaymentSummary, recentBookings] =
    await Promise.all([
      getBookingSummary(filters),
      getVehicleSummary(),
      getHotelCodeSummary(),
      getHotelPaymentSummary(filters),
      getRecentBookings(),
    ]);

  return {
    filters,
    bookingSummary,
    vehicleSummary,
    hotelCodeSummary,
    hotelPaymentSummary,
    recentBookings,
  };
}
