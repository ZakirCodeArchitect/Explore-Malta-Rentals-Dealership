import type { BookingStatus, Prisma } from "@/generated/prisma/index";

type StatusChangeDb = Pick<Prisma.TransactionClient, "bookingStatusHistory">;

export async function recordBookingStatusChange(
  db: StatusChangeDb,
  input: {
    bookingId: string;
    oldStatus: BookingStatus;
    newStatus: BookingStatus;
    adminUserId: string;
    note?: string | null;
  },
): Promise<void> {
  await db.bookingStatusHistory.create({
    data: {
      bookingId: input.bookingId,
      oldStatus: input.oldStatus,
      newStatus: input.newStatus,
      note: input.note?.trim() || null,
      changedByAdminId: input.adminUserId,
    },
  });
}
