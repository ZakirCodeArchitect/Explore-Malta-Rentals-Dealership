import { Prisma } from "@/generated/prisma/index";

import { getAdminHotelCodeById } from "@/lib/admin/hotel-codes/listAdminHotelCodes";
import type { AdminHotelCodeDetail } from "@/lib/admin/hotel-codes/types";
import type { AdminHotelCodeWriteInput } from "@/lib/admin/hotel-codes/hotel-code-schema";
import { prisma } from "@/lib/prisma";

export class DuplicateHotelCodeError extends Error {
  constructor() {
    super("A hotel code with this value already exists.");
    this.name = "DuplicateHotelCodeError";
  }
}

export class InactiveHotelPartnerError extends Error {
  constructor() {
    super("Cannot activate a code while the linked hotel is inactive.");
    this.name = "InactiveHotelPartnerError";
  }
}

function isCodeUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes("code");
  }

  if (typeof target === "string") {
    return target.includes("code");
  }

  return false;
}

async function assertPartnerAllowsActiveCode(hotelPartnerId: string, isActive: boolean): Promise<void> {
  if (!isActive) {
    return;
  }

  const partner = await prisma.hotelPartner.findUnique({
    where: { id: hotelPartnerId },
    select: { isActive: true },
  });

  if (!partner?.isActive) {
    throw new InactiveHotelPartnerError();
  }
}

function toDateOrNull(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  return new Date(value);
}

export async function createAdminHotelCode(input: AdminHotelCodeWriteInput): Promise<AdminHotelCodeDetail> {
  await assertPartnerAllowsActiveCode(input.hotelPartnerId, input.isActive);

  let createdId: string;
  try {
    const created = await prisma.hotelCode.create({
      data: {
        code: input.code,
        hotelPartnerId: input.hotelPartnerId,
        discountPercent: input.discountPercent,
        isActive: input.isActive,
        validFrom: toDateOrNull(input.validFrom),
        validUntil: toDateOrNull(input.validUntil),
      },
      select: { id: true },
    });
    createdId = created.id;
  } catch (error) {
    if (isCodeUniqueConstraintError(error)) {
      throw new DuplicateHotelCodeError();
    }
    throw error;
  }

  const loaded = await getAdminHotelCodeById(createdId);
  if (!loaded) {
    throw new Error("Failed to load hotel code after create");
  }

  return loaded;
}

export async function updateAdminHotelCode(
  id: string,
  input: AdminHotelCodeWriteInput,
): Promise<AdminHotelCodeDetail | null> {
  const existing = await prisma.hotelCode.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  await assertPartnerAllowsActiveCode(input.hotelPartnerId, input.isActive);

  try {
    await prisma.hotelCode.update({
      where: { id },
      data: {
        code: input.code,
        hotelPartnerId: input.hotelPartnerId,
        discountPercent: input.discountPercent,
        isActive: input.isActive,
        validFrom: toDateOrNull(input.validFrom),
        validUntil: toDateOrNull(input.validUntil),
      },
    });
  } catch (error) {
    if (isCodeUniqueConstraintError(error)) {
      throw new DuplicateHotelCodeError();
    }
    throw error;
  }

  return getAdminHotelCodeById(id);
}

export type DeactivateAdminHotelCodeResult =
  | { ok: true; code: AdminHotelCodeDetail }
  | { ok: false; reason: "not_found" };

export async function deactivateAdminHotelCode(id: string): Promise<DeactivateAdminHotelCodeResult> {
  const existing = await prisma.hotelCode.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return { ok: false, reason: "not_found" };
  }

  await prisma.hotelCode.update({
    where: { id },
    data: { isActive: false },
  });

  const code = await getAdminHotelCodeById(id);
  if (!code) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, code };
}

export type DeleteAdminHotelCodeResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "has_related_records" };

export async function deleteAdminHotelCode(id: string): Promise<DeleteAdminHotelCodeResult> {
  const existing = await prisma.hotelCode.findUnique({
    where: { id },
    select: {
      id: true,
      _count: {
        select: { bookings: true },
      },
    },
  });

  if (!existing) {
    return { ok: false, reason: "not_found" };
  }

  if (existing._count.bookings > 0) {
    return { ok: false, reason: "has_related_records" };
  }

  await prisma.hotelCode.delete({ where: { id } });

  return { ok: true };
}
