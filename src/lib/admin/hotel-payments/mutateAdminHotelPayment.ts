import { Prisma } from "@/generated/prisma/index";

import { calculateHotelSettlementPreview } from "@/lib/admin/hotel-payments/calculateHotelSettlementPreview";
import { DUPLICATE_HOTEL_SETTLEMENT_MESSAGE } from "@/lib/admin/hotel-payments/hotel-payment-errors";
import type { AdminHotelPaymentWriteInput } from "@/lib/admin/hotel-payments/hotel-payment-schema";
import { getAdminHotelPaymentById } from "@/lib/admin/hotel-payments/listAdminHotelPayments";
import type { AdminHotelPaymentDetail, AdminHotelPaymentStatus } from "@/lib/admin/hotel-payments/types";
import { prisma } from "@/lib/prisma";

export class DuplicateHotelSettlementError extends Error {
  constructor() {
    super(DUPLICATE_HOTEL_SETTLEMENT_MESSAGE);
    this.name = "DuplicateHotelSettlementError";
  }
}

function isSettlementUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes("hotelPartnerId") && target.includes("month") && target.includes("year");
  }

  if (typeof target === "string") {
    return target.includes("hotelPartnerId");
  }

  return false;
}

function toDateOrNull(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  return new Date(value);
}

function normalizeNotes(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

async function assertHotelExists(hotelPartnerId: string): Promise<boolean> {
  const hotel = await prisma.hotelPartner.findUnique({
    where: { id: hotelPartnerId },
    select: { id: true },
  });
  return Boolean(hotel);
}

async function buildSettlementData(input: AdminHotelPaymentWriteInput) {
  const preview = await calculateHotelSettlementPreview(input.hotelPartnerId, input.month, input.year);

  return {
    hotelPartnerId: input.hotelPartnerId,
    month: input.month,
    year: input.year,
    bookingCountSnapshot: preview.bookingCount,
    totalBookingAmountSnapshot: preview.totalBookingAmount,
    totalHotelDiscountSnapshot: preview.totalHotelDiscount,
    settlementAmountDue: input.settlementAmountDue,
    amountPaid: input.amountPaid,
    status: input.status,
    paidAt: input.status === "PAID" || input.status === "PARTIALLY_PAID" ? toDateOrNull(input.paidAt) : null,
    notes: normalizeNotes(input.notes),
  };
}

export async function createAdminHotelPayment(input: AdminHotelPaymentWriteInput): Promise<AdminHotelPaymentDetail> {
  if (!(await assertHotelExists(input.hotelPartnerId))) {
    throw new Error("Hotel not found");
  }

  const data = await buildSettlementData(input);

  let createdId: string;
  try {
    const created = await prisma.hotelMonthlySettlement.create({
      data,
      select: { id: true },
    });
    createdId = created.id;
  } catch (error) {
    if (isSettlementUniqueConstraintError(error)) {
      throw new DuplicateHotelSettlementError();
    }
    throw error;
  }

  const loaded = await getAdminHotelPaymentById(createdId);
  if (!loaded) {
    throw new Error("Failed to load settlement after create");
  }

  return loaded;
}

export async function updateAdminHotelPayment(
  id: string,
  input: AdminHotelPaymentWriteInput,
): Promise<AdminHotelPaymentDetail | null> {
  const existing = await prisma.hotelMonthlySettlement.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return null;
  }

  if (!(await assertHotelExists(input.hotelPartnerId))) {
    throw new Error("Hotel not found");
  }

  const data = await buildSettlementData(input);

  try {
    await prisma.hotelMonthlySettlement.update({
      where: { id },
      data,
    });
  } catch (error) {
    if (isSettlementUniqueConstraintError(error)) {
      throw new DuplicateHotelSettlementError();
    }
    throw error;
  }

  return getAdminHotelPaymentById(id);
}

export type UpdateAdminHotelPaymentStatusResult =
  | { ok: true; settlement: AdminHotelPaymentDetail }
  | { ok: false; reason: "not_found" | "invalid_partial_amount" };

export async function updateAdminHotelPaymentStatus(
  id: string,
  status: AdminHotelPaymentStatus,
): Promise<UpdateAdminHotelPaymentStatusResult> {
  const existing = await prisma.hotelMonthlySettlement.findUnique({
    where: { id },
    select: {
      id: true,
      settlementAmountDue: true,
      amountPaid: true,
      paidAt: true,
    },
  });

  if (!existing) {
    return { ok: false, reason: "not_found" };
  }

  const settlementAmountDue = existing.settlementAmountDue.toNumber();
  let amountPaid = existing.amountPaid.toNumber();
  let paidAt = existing.paidAt;

  if (status === "PAID") {
    amountPaid = settlementAmountDue;
    paidAt = paidAt ?? new Date();
  } else if (status === "DUE") {
    amountPaid = 0;
    paidAt = null;
  } else if (status === "PARTIALLY_PAID") {
    if (amountPaid <= 0 || amountPaid >= settlementAmountDue) {
      return { ok: false, reason: "invalid_partial_amount" };
    }
    paidAt = paidAt ?? new Date();
  }

  await prisma.hotelMonthlySettlement.update({
    where: { id },
    data: {
      status,
      amountPaid,
      paidAt,
    },
  });

  const settlement = await getAdminHotelPaymentById(id);
  if (!settlement) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, settlement };
}
