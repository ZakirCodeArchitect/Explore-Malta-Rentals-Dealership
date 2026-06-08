import { Prisma } from "@/generated/prisma/index";

import { getAdminHotelCodeById } from "@/lib/admin/hotel-codes/listAdminHotelCodes";
import {
  DuplicateHotelCodeError,
  InactiveHotelPartnerError,
} from "@/lib/admin/hotel-codes/mutateAdminHotelCode";
import type { AdminHotelCodeDetail } from "@/lib/admin/hotel-codes/types";
import {
  HOTEL_DELETE_ERROR_CODES,
  hotelDeleteBlockedReason,
  type HotelDeleteBlockedReason,
} from "@/lib/admin/hotel-partners/hotel-partner-errors";
import { getAdminHotelPartnerById } from "@/lib/admin/hotel-partners/listAdminHotelPartners";
import type { AdminHotelPartnerCreateInput } from "@/lib/admin/hotel-partners/hotel-partner-schema";
import type { AdminHotelPartnerDetail } from "@/lib/admin/hotel-partners/types";
import type { AdminHotelPartnerWriteInput } from "@/lib/admin/hotel-partners/hotel-partner-schema";
import { prisma } from "@/lib/prisma";

function isCodeUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  if (!target) {
    return true;
  }
  if (Array.isArray(target)) {
    return target.includes("code");
  }

  if (typeof target === "string") {
    return target.includes("code");
  }

  return false;
}

function toDateOrNull(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  return new Date(value);
}

export type CreateAdminHotelPartnerResult = Readonly<{
  partner: AdminHotelPartnerDetail;
  initialCode?: AdminHotelCodeDetail;
}>;

export async function createAdminHotelPartner(
  input: AdminHotelPartnerCreateInput,
): Promise<CreateAdminHotelPartnerResult> {
  if (input.initialCode?.isActive && !input.isActive) {
    throw new InactiveHotelPartnerError();
  }

  let partnerId: string;
  let initialCodeId: string | undefined;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const partner = await tx.hotelPartner.create({
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

      if (!input.initialCode) {
        return { partnerId: partner.id, initialCodeId: undefined };
      }

      const code = await tx.hotelCode.create({
        data: {
          code: input.initialCode.code,
          hotelPartnerId: partner.id,
          discountPercent: input.initialCode.discountPercent,
          isActive: input.initialCode.isActive,
          validFrom: toDateOrNull(input.initialCode.validFrom),
          validUntil: toDateOrNull(input.initialCode.validUntil),
        },
        select: { id: true },
      });

      return { partnerId: partner.id, initialCodeId: code.id };
    });

    partnerId = created.partnerId;
    initialCodeId = created.initialCodeId;
  } catch (error) {
    if (isCodeUniqueConstraintError(error)) {
      throw new DuplicateHotelCodeError();
    }
    throw error;
  }

  const partner = await getAdminHotelPartnerById(partnerId);
  if (!partner) {
    throw new Error("Failed to load hotel partner after create");
  }

  let initialCode: AdminHotelCodeDetail | undefined;
  if (initialCodeId) {
    const loadedCode = await getAdminHotelCodeById(initialCodeId);
    if (!loadedCode) {
      throw new Error("Failed to load initial hotel code after create");
    }
    initialCode = loadedCode;
  }

  return { partner, initialCode };
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
  | { ok: false; reason: "not_found" | HotelDeleteBlockedReason };

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

  const blockedReason = hotelDeleteBlockedReason(
    existing._count.hotelCodes,
    existing._count.bookings,
  );
  if (blockedReason) {
    return { ok: false, reason: blockedReason };
  }

  await prisma.hotelPartner.delete({ where: { id } });

  return { ok: true };
}

export { HOTEL_DELETE_ERROR_CODES };
