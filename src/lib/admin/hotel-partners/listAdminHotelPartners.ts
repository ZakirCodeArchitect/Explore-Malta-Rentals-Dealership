import type { Prisma } from "@/generated/prisma/index";

import type {
  AdminHotelPartnerDetail,
  AdminHotelPartnerListFilters,
  AdminHotelPartnerListResult,
  AdminHotelPartnerOption,
} from "@/lib/admin/hotel-partners/types";
import { prisma } from "@/lib/prisma";

function normalizeSearchTerm(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export async function listAdminHotelPartners(
  filters: AdminHotelPartnerListFilters = {},
): Promise<AdminHotelPartnerListResult> {
  const where: Prisma.HotelPartnerWhereInput = {};
  const search = normalizeSearchTerm(filters.search);

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { contactPerson: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const [partners, total] = await Promise.all([
    prisma.hotelPartner.findMany({
      where,
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        contactPerson: true,
        email: true,
        phone: true,
        isActive: true,
        _count: {
          select: {
            hotelCodes: true,
            bookings: true,
          },
        },
      },
    }),
    prisma.hotelPartner.count({ where }),
  ]);

  return {
    total,
    partners: partners.map((partner) => ({
      id: partner.id,
      name: partner.name,
      contactPerson: partner.contactPerson,
      email: partner.email,
      phone: partner.phone,
      isActive: partner.isActive,
      hotelCodeCount: partner._count.hotelCodes,
      bookingCount: partner._count.bookings,
      canDelete: partner._count.hotelCodes === 0 && partner._count.bookings === 0,
    })),
  };
}

export async function listAdminHotelPartnerOptions(): Promise<AdminHotelPartnerOption[]> {
  const partners = await prisma.hotelPartner.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      isActive: true,
    },
  });

  return partners;
}

export async function getAdminHotelPartnerById(id: string): Promise<AdminHotelPartnerDetail | null> {
  const partner = await prisma.hotelPartner.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      contactPerson: true,
      email: true,
      phone: true,
      address: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          hotelCodes: true,
          bookings: true,
        },
      },
    },
  });

  if (!partner) {
    return null;
  }

  return {
    id: partner.id,
    name: partner.name,
    contactPerson: partner.contactPerson,
    email: partner.email,
    phone: partner.phone,
    address: partner.address,
    isActive: partner.isActive,
    hotelCodeCount: partner._count.hotelCodes,
    bookingCount: partner._count.bookings,
    canDelete: partner._count.hotelCodes === 0 && partner._count.bookings === 0,
    createdAt: partner.createdAt.toISOString(),
    updatedAt: partner.updatedAt.toISOString(),
  };
}
