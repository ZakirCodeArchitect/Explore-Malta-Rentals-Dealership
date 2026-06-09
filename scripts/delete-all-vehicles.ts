import "dotenv/config";

import { prisma } from "../src/lib/prisma";

async function main() {
  const before = {
    vehicles: await prisma.vehicle.count(),
    vehicleImages: await prisma.vehicleImage.count(),
    vehiclePricingRules: await prisma.vehiclePricingRule.count({
      where: { vehicleId: { not: null } },
    }),
    reservationHolds: await prisma.reservationHold.count(),
    availabilityBlocks: await prisma.availabilityBlock.count({
      where: { vehicleId: { not: null } },
    }),
    bookingsWithVehicleRefs: await prisma.booking.count({
      where: { vehicleId: { not: null } },
    }),
  };

  console.log("Records before deletion:");
  console.log(before);

  if (before.vehicles === 0) {
    console.log("No vehicles found. Nothing to delete.");
    return;
  }

  if (before.bookingsWithVehicleRefs > 0) {
    console.error(
      `Cannot delete vehicles: ${before.bookingsWithVehicleRefs} booking(s) still reference vehicles.`,
    );
    console.error("Run scripts/delete-all-bookings.ts first, then retry.");
    process.exitCode = 1;
    return;
  }

  const deleted = await prisma.$transaction(async (tx) => {
    const reservationHolds = await tx.reservationHold.deleteMany();
    const availabilityBlocks = await tx.availabilityBlock.deleteMany({
      where: { vehicleId: { not: null } },
    });
    const vehiclePricingRules = await tx.vehiclePricingRule.deleteMany({
      where: { vehicleId: { not: null } },
    });
    const vehicles = await tx.vehicle.deleteMany();

    return {
      reservationHolds: reservationHolds.count,
      availabilityBlocks: availabilityBlocks.count,
      vehiclePricingRules: vehiclePricingRules.count,
      vehicles: vehicles.count,
    };
  });

  const after = {
    vehicles: await prisma.vehicle.count(),
    vehicleImages: await prisma.vehicleImage.count(),
    vehiclePricingRules: await prisma.vehiclePricingRule.count({
      where: { vehicleId: { not: null } },
    }),
    reservationHolds: await prisma.reservationHold.count(),
    availabilityBlocks: await prisma.availabilityBlock.count({
      where: { vehicleId: { not: null } },
    }),
  };

  console.log("Deleted:");
  console.log(deleted);
  console.log("Records after deletion:");
  console.log(after);
}

main()
  .catch((error) => {
    console.error("Failed to delete vehicles:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
