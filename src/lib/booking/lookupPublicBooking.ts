import type { BookingStatus } from "@/generated/prisma/index";
import { prisma } from "@/lib/prisma";

export type PublicBookingSummary = {
  bookingReference: string;
  status: BookingStatus;
  vehicleName: string | null;
  pickupDateTime: string;
  returnDateTime: string;
  createdAt: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeReference(reference: string): string {
  return reference.trim();
}

/**
 * Returns a minimal booking summary when reference and email match the stored booking.
 * Used for customer self-service lookup (no auth).
 */
export async function lookupPublicBookingByReferenceAndEmail(
  bookingReference: string,
  email: string,
): Promise<PublicBookingSummary | null> {
  const ref = normalizeReference(bookingReference);
  const em = normalizeEmail(email);
  if (!ref || !em) {
    return null;
  }

  const booking = await prisma.booking.findUnique({
    where: { bookingReference: ref },
    select: {
      customerEmail: true,
      bookingReference: true,
      status: true,
      vehicleNameSnapshot: true,
      pickupDateTime: true,
      returnDateTime: true,
      createdAt: true,
    },
  });

  if (!booking) {
    return null;
  }

  if (normalizeEmail(booking.customerEmail) !== em) {
    return null;
  }

  return {
    bookingReference: booking.bookingReference,
    status: booking.status,
    vehicleName: booking.vehicleNameSnapshot,
    pickupDateTime: booking.pickupDateTime.toISOString(),
    returnDateTime: booking.returnDateTime.toISOString(),
    createdAt: booking.createdAt.toISOString(),
  };
}
