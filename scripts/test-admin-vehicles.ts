import "dotenv/config";
import assert from "node:assert/strict";

import { deleteAdminVehicle, DuplicateLicensePlateError } from "../src/lib/admin/vehicles/mutateAdminVehicle";
import { getAdminVehicleById } from "../src/lib/admin/vehicles/listAdminVehicles";
import { adminVehicleWriteSchema } from "../src/lib/admin/vehicles/vehicle-schema";
import { prisma } from "../src/lib/prisma";

const basePayload = {
  name: "License Plate Test Vehicle",
  slug: `license-plate-test-${Date.now()}`,
  licensePlate: "TST-9001",
  vehicleType: "Scooter" as const,
  brand: null,
  model: null,
  shortDescription: null,
  description: null,
  mainImageUrl: null,
  catalogStatus: "AVAILABLE" as const,
  isActive: true,
  displayOrder: 0,
  helmetIncludedCount: 2,
  supportsStorageBox: false,
  images: [],
  baseDailyRate: 25,
};

async function run() {
  const parsed = adminVehicleWriteSchema.safeParse(basePayload);
  assert.equal(parsed.success, true, "valid payload should pass schema");

  const missingPlate = adminVehicleWriteSchema.safeParse({ ...basePayload, licensePlate: "" });
  assert.equal(missingPlate.success, false, "empty license plate should fail");

  const normalized = adminVehicleWriteSchema.safeParse({ ...basePayload, licensePlate: " abc-123 " });
  assert.equal(normalized.success, true, "license plate with whitespace should pass");
  if (normalized.success) {
    assert.equal(normalized.data.licensePlate, "ABC-123");
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      name: basePayload.name,
      slug: basePayload.slug,
      licensePlate: basePayload.licensePlate,
      vehicleType: basePayload.vehicleType,
      baseDailyRate: 25,
      catalogStatus: basePayload.catalogStatus,
      isActive: true,
    },
  });

  try {
    const loaded = await getAdminVehicleById(vehicle.id);
    assert.ok(loaded);
    assert.equal(loaded.licensePlate, "TST-9001");
    assert.equal(loaded.canDelete, true);

    const duplicate = adminVehicleWriteSchema.safeParse({
      ...basePayload,
      slug: `${basePayload.slug}-dup`,
      licensePlate: "TST-9001",
    });
    assert.equal(duplicate.success, true);

    try {
      await prisma.vehicle.create({
        data: {
          name: "Duplicate Plate Vehicle",
          slug: `${basePayload.slug}-duplicate`,
          licensePlate: "TST-9001",
          vehicleType: "Scooter",
          baseDailyRate: 25,
        },
      });
      assert.fail("duplicate license plate should throw");
    } catch (error) {
      assert.ok(error instanceof Error);
    }

    const deleteResult = await deleteAdminVehicle(vehicle.id);
    assert.equal(deleteResult.ok, true);
    assert.equal(await getAdminVehicleById(vehicle.id), null);
  } finally {
    await prisma.vehicle.deleteMany({ where: { slug: { startsWith: basePayload.slug } } }).catch(() => undefined);
  }

  const bookedVehicle = await prisma.vehicle.create({
    data: {
      name: "Booked Guard Test Vehicle",
      slug: `booked-guard-test-${Date.now()}`,
      licensePlate: `BKD-${Date.now()}`,
      vehicleType: "Scooter",
      baseDailyRate: 25,
      catalogStatus: "AVAILABLE",
      isActive: true,
      bookings: {
        create: {
          bookingReference: `TEST-${Date.now()}`,
          status: "PENDING",
          vehicleType: "Scooter",
          pickupDateTime: new Date("2026-07-01T10:00:00.000Z"),
          returnDateTime: new Date("2026-07-02T10:00:00.000Z"),
          actualDurationHours: 24,
          billableDays: 1,
          pickupOption: "OFFICE",
          dropoffOption: "OFFICE",
          customerFullName: "Test User",
          customerPhone: "+35600000000",
          customerEmail: "test@example.com",
          customerNationality: "Malta",
          customerDateOfBirth: new Date("1990-01-01T00:00:00.000Z"),
          customerLicenseCategory: "B",
          depositMethod: "IN_PERSON",
        },
      },
    },
    include: { bookings: true },
  });

  try {
    const loadedBooked = await getAdminVehicleById(bookedVehicle.id);
    assert.ok(loadedBooked);
    assert.equal(loadedBooked.canDelete, false);

    const blockedDelete = await deleteAdminVehicle(bookedVehicle.id);
    assert.equal(blockedDelete.ok, false);
    if (!blockedDelete.ok) {
      assert.equal(blockedDelete.reason, "has_related_records");
    }
  } finally {
    await prisma.booking.deleteMany({ where: { vehicleId: bookedVehicle.id } });
    await prisma.vehicle.delete({ where: { id: bookedVehicle.id } });
  }

  assert.ok(DuplicateLicensePlateError);

  console.log("Admin vehicle license plate and safe delete checks passed.");
}

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
