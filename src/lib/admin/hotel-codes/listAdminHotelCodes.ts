import type { Prisma } from "@/generated/prisma/index";

import { normalizeHotelCode } from "@/lib/hotel-codes/normalize-hotel-code";
import type {
  AdminHotelCodeDetail,
  AdminHotelCodeListFilters,
  AdminHotelCodeListResult,
} from "@/lib/admin/hotel-codes/types";
import { prisma } from "@/lib/prisma";

type HotelCodeRow = {
  id: string;
  code: string;
  discountPercent: { toNumber: () => number };
  isActive: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  hotelPartnerId: string;
  hotelPartner: { name: string; isActive: boolean };
  _count: { bookings: number };
  bookings: { subtotal: { toNumber: () => number } }[];
};

function normalizeSearchTerm(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

function mapCodeRow(row: HotelCodeRow) {
  const totalBookingValue = row.bookings.reduce((sum, booking) => sum + booking.subtotal.toNumber(), 0);

  return {
    id: row.id,
    code: row.code,
    discountPercent: row.discountPercent.toNumber(),
    isActive: row.isActive,
    validFrom: row.validFrom?.toISOString() ?? null,
    validUntil: row.validUntil?.toISOString() ?? null,
    hotelPartnerId: row.hotelPartnerId,
    hotelPartnerName: row.hotelPartner.name,
    hotelPartnerIsActive: row.hotelPartner.isActive,
    bookingCount: row._count.bookings,
    totalBookingValue,
    canDelete: row._count.bookings === 0,
    createdAt: row.createdAt?.toISOString() ?? "",
    updatedAt: row.updatedAt?.toISOString() ?? "",
  };
}

export async function listAdminHotelCodes(
  filters: AdminHotelCodeListFilters = {},
): Promise<AdminHotelCodeListResult> {
  const where: Prisma.HotelCodeWhereInput = {};
  const search = normalizeSearchTerm(filters.search);
  const code = filters.code ? normalizeHotelCode(filters.code) : undefined;

  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { hotelPartner: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (code) {
    where.code = { contains: code, mode: "insensitive" };
  }

  if (filters.hotelPartnerId) {
    where.hotelPartnerId = filters.hotelPartnerId;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const [codes, total] = await Promise.all([
    prisma.hotelCode.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { code: "asc" }],
      select: {
        id: true,
        code: true,
        discountPercent: true,
        isActive: true,
        validFrom: true,
        validUntil: true,
        hotelPartnerId: true,
        hotelPartner: {
          select: {
            name: true,
            isActive: true,
          },
        },
        _count: {
          select: { bookings: true },
        },
        bookings: {
          select: { subtotal: true },
        },
      },
    }),
    prisma.hotelCode.count({ where }),
  ]);

  return {
    total,
    codes: codes.map((codeRow) => {
      const mapped = mapCodeRow(codeRow);
      return {
        id: mapped.id,
        code: mapped.code,
        discountPercent: mapped.discountPercent,
        isActive: mapped.isActive,
        validFrom: mapped.validFrom,
        validUntil: mapped.validUntil,
        hotelPartnerId: mapped.hotelPartnerId,
        hotelPartnerName: mapped.hotelPartnerName,
        hotelPartnerIsActive: mapped.hotelPartnerIsActive,
        bookingCount: mapped.bookingCount,
        totalBookingValue: mapped.totalBookingValue,
        canDelete: mapped.canDelete,
      };
    }),
  };
}

export async function getAdminHotelCodeById(id: string): Promise<AdminHotelCodeDetail | null> {
  const code = await prisma.hotelCode.findUnique({
    where: { id },
    select: {
      id: true,
      code: true,
      discountPercent: true,
      isActive: true,
      validFrom: true,
      validUntil: true,
      createdAt: true,
      updatedAt: true,
      hotelPartnerId: true,
      hotelPartner: {
        select: {
          name: true,
          isActive: true,
        },
      },
      _count: {
        select: { bookings: true },
      },
      bookings: {
        select: { subtotal: true },
      },
    },
  });

  if (!code) {
    return null;
  }

  const mapped = mapCodeRow(code);
  return {
    ...mapped,
    createdAt: code.createdAt.toISOString(),
    updatedAt: code.updatedAt.toISOString(),
  };
}
