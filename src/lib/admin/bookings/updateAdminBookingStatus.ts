import type { BookingStatus } from "@/generated/prisma/index";

import type { AdminBookingDetail } from "@/lib/admin/bookings/types";
import { getAdminBookingById } from "@/lib/admin/bookings/getAdminBookingById";
import { prisma } from "@/lib/prisma";

export type UpdateAdminBookingStatusResult =
  | { ok: true; booking: AdminBookingDetail }
  | { ok: false; reason: "not_found" | "same_status" };

export async function updateAdminBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  adminUserId: string,
  note?: string,
): Promise<UpdateAdminBookingStatusResult> {
  const existing = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, status: true },
  });

  if (!existing) {
    return { ok: false, reason: "not_found" };
  }

  if (existing.status === newStatus) {
    return { ok: false, reason: "same_status" };
  }

  await prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: { status: newStatus },
    }),
    prisma.bookingStatusHistory.create({
      data: {
        bookingId,
        oldStatus: existing.status,
        newStatus,
        note: note?.trim() || null,
        changedByAdminId: adminUserId,
      },
    }),
  ]);

  const booking = await getAdminBookingById(bookingId);
  if (!booking) {
    return { ok: false, reason: "not_found" };
  }

  return { ok: true, booking };
}
