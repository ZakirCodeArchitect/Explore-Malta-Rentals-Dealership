import "dotenv/config";

import { prisma } from "../src/lib/prisma";

async function main() {
  const before = {
    hotelPayments: await prisma.hotelMonthlySettlement.count(),
    hotelCodes: await prisma.hotelCode.count(),
    hotels: await prisma.hotelPartner.count(),
    bookingsWithHotelRefs: await prisma.booking.count({
      where: {
        OR: [{ hotelCodeId: { not: null } }, { hotelPartnerId: { not: null } }],
      },
    }),
  };

  console.log("Records before deletion:");
  console.log(before);

  if (
    before.hotelPayments === 0 &&
    before.hotelCodes === 0 &&
    before.hotels === 0
  ) {
    console.log("No hotel data found. Nothing to delete.");
    return;
  }

  if (before.bookingsWithHotelRefs > 0) {
    console.error(
      `Cannot delete hotel data: ${before.bookingsWithHotelRefs} booking(s) still reference hotels or hotel codes.`,
    );
    console.error("Run scripts/delete-all-bookings.ts first, then retry.");
    process.exitCode = 1;
    return;
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const hotelPayments = await tx.hotelMonthlySettlement.deleteMany();
    const hotelCodes = await tx.hotelCode.deleteMany();
    const hotels = await tx.hotelPartner.deleteMany();

    return {
      hotelPayments: hotelPayments.count,
      hotelCodes: hotelCodes.count,
      hotels: hotels.count,
    };
  });

  const after = {
    hotelPayments: await prisma.hotelMonthlySettlement.count(),
    hotelCodes: await prisma.hotelCode.count(),
    hotels: await prisma.hotelPartner.count(),
  };

  console.log("Deleted:");
  console.log(deleted);
  console.log("Records after deletion:");
  console.log(after);
}

main()
  .catch((error) => {
    console.error("Failed to delete hotel data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
