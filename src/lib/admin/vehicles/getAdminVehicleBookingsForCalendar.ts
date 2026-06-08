import type { BookingStatus } from "@/generated/prisma/client";

import { BLOCKING_BOOKING_STATUSES } from "@/lib/availability/types";
import { prisma } from "@/lib/prisma";

export type AdminVehicleBookingCalendarItem = {
  id: string;
  bookingReference: string;
  status: BookingStatus;
  pickupDateTime: string;
  returnDateTime: string;
  customerFullName: string;
};

export async function getAdminVehicleBookingsForCalendar(
  vehicleId: string,
): Promise<AdminVehicleBookingCalendarItem[]> {
  const bookings = await prisma.booking.findMany({
    where: {
      vehicleId,
      status: { in: [...BLOCKING_BOOKING_STATUSES] },
    },
    orderBy: [{ pickupDateTime: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      bookingReference: true,
      status: true,
      pickupDateTime: true,
      returnDateTime: true,
      customerFullName: true,
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    bookingReference: booking.bookingReference,
    status: booking.status,
    pickupDateTime: booking.pickupDateTime.toISOString(),
    returnDateTime: booking.returnDateTime.toISOString(),
    customerFullName: booking.customerFullName,
  }));
}
