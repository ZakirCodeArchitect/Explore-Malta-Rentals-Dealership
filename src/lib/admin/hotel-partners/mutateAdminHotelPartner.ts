import { getAdminHotelPartnerById } from "@/lib/admin/hotel-partners/listAdminHotelPartners";
import type { AdminHotelPartnerDetail } from "@/lib/admin/hotel-partners/types";
import type { AdminHotelPartnerWriteInput } from "@/lib/admin/hotel-partners/hotel-partner-schema";
import { prisma } from "@/lib/prisma";

export async function createAdminHotelPartner(
  input: AdminHotelPartnerWriteInput,
): Promise<AdminHotelPartnerDetail> {
  const partner = await prisma.hotelPartner.create({
    data: {
      name: input.name.trim(),
      contactPerson: input.contactPerson?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      isActive: input.isActive,
    },
    select: { id: true },
  });

  const created = await getAdminHotelPartnerById(partner.id);
  if (!created) {
    throw new Error("Failed to load hotel partner after create");
  }

  return created;
}

export async function updateAdminHotelPartner(
  id: string,
  input: AdminHotelPartnerWriteInput,
): Promise<AdminHotelPartnerDetail | null> {
  const existing = await prisma.hotelPartner.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  await prisma.hotelPartner.update({
    where: { id },
    data: {
      name: input.name.trim(),
      contactPerson: input.contactPerson?.trim() || null,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      address: input.address?.trim() || null,
      isActive: input.isActive,
    },
  });

  if (!input.isActive) {
    await prisma.hotelCode.updateMany({
      where: { hotelPartnerId: id, isActive: true },
      data: { isActive: false },
    });
  }

  return getAdminHotelPartnerById(id);
}

export type DeactivateAdminHotelPartnerResult =
  | { ok: true; partner: AdminHotelPartnerDetail }
  | { ok: false; reason: "not_found" };

export async function deactivateAdminHotelPartner(
  id: string,
): Promise<DeactivateAdminHotelPartnerResult> {
  const existing = await prisma.hotelPartner.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false, reason: "not_found" };
  }

  await prisma.$transaction([
    prisma.hotelPartner.update({
      where: { id },
      data: { isActive: false },
    }),
    prisma.hotelCode.updateMany({
      where: { hotelPartnerId: id, isActive: true },
      data: { isActive: false },
    }),
  ]);

  const partner = await getAdminHotelPartnerById(id);
  if (!partner) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, partner };
}

export type DeleteAdminHotelPartnerResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "has_related_records" };

export async function deleteAdminHotelPartner(id: string): Promise<DeleteAdminHotelPartnerResult> {
  const existing = await prisma.hotelPartner.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: {
          hotelCodes: true,
          bookings: true,
        },
      },
    },
  });

  if (!existing) {
    return { ok: false, reason: "not_found" };
  }

  if (existing._count.hotelCodes > 0 || existing._count.bookings > 0) {
    return { ok: false, reason: "has_related_records" };
  }

  await prisma.hotelPartner.delete({ where: { id } });

  return { ok: true };
}
