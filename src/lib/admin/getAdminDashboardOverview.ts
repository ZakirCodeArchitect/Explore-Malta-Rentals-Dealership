import { prisma } from "@/lib/prisma";

export type AdminDashboardVehicle = {
  id: string;
  name: string;
  slug: string;
  vehicleType: string;
  brand: string | null;
  model: string | null;
  mainImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
};

export type AdminBookingMonthStat = {
  monthKey: string;
  monthLabel: string;
  total: number;
  confirmed: number;
  cancelled: number;
};

export type AdminDashboardOverview = {
  vehicles: AdminDashboardVehicle[];
  bookingMonths: AdminBookingMonthStat[];
  totals: {
    bookingsThisMonth: number;
    bookingsLastMonth: number;
    confirmedThisMonth: number;
    activeVehicles: number;
    inactiveVehicles: number;
    totalVehicles: number;
  };
};

const MALTA_TIME_ZONE = "Europe/Malta";
const MONTHS_TO_SHOW = 6;

const MONTH_LABEL_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
  timeZone: MALTA_TIME_ZONE,
});

const MONTH_KEY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  timeZone: MALTA_TIME_ZONE,
});

type MonthlyBookingRow = {
  month_key: string;
  total: number;
  confirmed: number;
  cancelled: number;
};

function monthKeyFromDate(date: Date): string {
  return MONTH_KEY_FORMATTER.format(date).slice(0, 7);
}

function monthLabelFromKey(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return MONTH_LABEL_FORMATTER.format(new Date(Date.UTC(year, month - 1, 1)));
}

function buildRecentMonthKeys(count: number): string[] {
  const keys: string[] = [];
  const now = new Date();

  for (let index = count - 1; index >= 0; index -= 1) {
    const cursor = new Date(now);
    cursor.setDate(1);
    cursor.setHours(12, 0, 0, 0);
    cursor.setMonth(cursor.getMonth() - index);
    keys.push(monthKeyFromDate(cursor));
  }

  return keys;
}

async function getMonthlyBookingStats(monthKeys: string[]): Promise<MonthlyBookingRow[]> {
  const oldestMonthKey = monthKeys[0];

  return prisma.$queryRaw<MonthlyBookingRow[]>`
    SELECT
      to_char("createdAt" AT TIME ZONE ${MALTA_TIME_ZONE}, 'YYYY-MM') AS month_key,
      COUNT(*)::integer AS total,
      COUNT(*) FILTER (WHERE status = 'CONFIRMED')::integer AS confirmed,
      COUNT(*) FILTER (WHERE status = 'CANCELLED')::integer AS cancelled
    FROM "Booking"
    WHERE "createdAt" >= (
      to_timestamp(${oldestMonthKey} || '-01', 'YYYY-MM-DD') AT TIME ZONE ${MALTA_TIME_ZONE}
    )
    GROUP BY 1
    ORDER BY 1
  `;
}

async function getBookingCountForMonth(monthKey: string): Promise<number> {
  const result = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::integer AS count
    FROM "Booking"
    WHERE to_char("createdAt" AT TIME ZONE ${MALTA_TIME_ZONE}, 'YYYY-MM') = ${monthKey}
  `;
  return result[0]?.count ?? 0;
}

async function getConfirmedCountForMonth(monthKey: string): Promise<number> {
  const result = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::integer AS count
    FROM "Booking"
    WHERE status = 'CONFIRMED'
      AND to_char("createdAt" AT TIME ZONE ${MALTA_TIME_ZONE}, 'YYYY-MM') = ${monthKey}
  `;
  return result[0]?.count ?? 0;
}

export async function getAdminDashboardOverview(): Promise<AdminDashboardOverview> {
  const monthKeys = buildRecentMonthKeys(MONTHS_TO_SHOW);
  const currentMonthKey = monthKeys[monthKeys.length - 1];
  const previousMonthKey = monthKeys[monthKeys.length - 2];

  const [vehicles, monthlyRows, totalVehicles, activeVehicles, bookingsThisMonth, bookingsLastMonth, confirmedThisMonth] =
    await Promise.all([
      prisma.vehicle.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          vehicleType: true,
          brand: true,
          model: true,
          mainImageUrl: true,
          isActive: true,
          displayOrder: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
            take: 1,
            select: { imageUrl: true },
          },
        },
      }),
      getMonthlyBookingStats(monthKeys),
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { isActive: true } }),
      getBookingCountForMonth(currentMonthKey),
      getBookingCountForMonth(previousMonthKey),
      getConfirmedCountForMonth(currentMonthKey),
    ]);

  const monthlyByKey = new Map(monthlyRows.map((row) => [row.month_key, row]));

  const bookingMonths = monthKeys.map((monthKey) => {
    const row = monthlyByKey.get(monthKey);
    return {
      monthKey,
      monthLabel: monthLabelFromKey(monthKey),
      total: row?.total ?? 0,
      confirmed: row?.confirmed ?? 0,
      cancelled: row?.cancelled ?? 0,
    };
  });

  return {
    vehicles: vehicles.map((vehicle) => ({
      id: vehicle.id,
      name: vehicle.name,
      slug: vehicle.slug,
      vehicleType: vehicle.vehicleType,
      brand: vehicle.brand,
      model: vehicle.model,
      mainImageUrl: vehicle.mainImageUrl ?? vehicle.images[0]?.imageUrl ?? null,
      isActive: vehicle.isActive,
      displayOrder: vehicle.displayOrder,
    })),
    bookingMonths,
    totals: {
      bookingsThisMonth,
      bookingsLastMonth,
      confirmedThisMonth,
      activeVehicles,
      inactiveVehicles: totalVehicles - activeVehicles,
      totalVehicles,
    },
  };
}
