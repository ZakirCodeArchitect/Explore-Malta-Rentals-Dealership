import "dotenv/config";
import { randomUUID } from "node:crypto";
import pg from "pg";

const TEST_PREFIX = `avail-db-${Date.now()}`;
const TEST_REASON = "Availability test fixture";
const API_BASE = (process.env.TEST_API_BASE ?? "http://localhost:3000").replace(/\/$/, "");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

function makeDate(year, month1Based, day, hour = 10) {
  return new Date(year, month1Based - 1, day, hour, 0, 0, 0);
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function assertTrue(name, value) {
  if (!value) throw new Error(`${name} failed: expected true`);
  console.log(`PASS ${name}`);
}

function assertFalse(name, value) {
  if (value) throw new Error(`${name} failed: expected false`);
  console.log(`PASS ${name}`);
}

function assertEqual(name, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${name} failed: expected ${expected}, got ${actual}`);
  }
  console.log(`PASS ${name}`);
}

async function createVehicle(nameSuffix, vehicleType = "MOTORBIKE_50CC") {
  const id = randomUUID();
  const slug = `${TEST_PREFIX}-${nameSuffix}-${Math.random().toString(36).slice(2, 8)}`;
  await pool.query(
    `
      INSERT INTO "Vehicle" (
        "id", "name", "slug", "vehicleType", "isActive",
        "displayOrder", "helmetIncludedCount", "supportsStorageBox",
        "createdAt", "updatedAt"
      )
      VALUES ($1, $2, $3, $4, true, 0, 2, false, NOW(), NOW())
    `,
    [id, `${TEST_PREFIX}-${nameSuffix}`, slug, vehicleType],
  );
  return { id, vehicleType };
}

async function createBooking({
  vehicleId,
  vehicleType = "MOTORBIKE_50CC",
  status = "CONFIRMED",
  start,
  end,
}) {
  await pool.query(
    `
      INSERT INTO "Booking" (
        "id", "bookingReference", "status", "vehicleId",
        "vehicleType", "vehicleTypeSnapshot",
        "pickupDateTime", "returnDateTime", "actualDurationHours", "billableDays",
        "pickupOption", "dropoffOption",
        "customerFullName", "customerPhone", "customerEmail", "customerNationality",
        "customerDateOfBirth", "customerLicenseCategory", "depositMethod",
        "createdAt", "updatedAt"
      )
      VALUES (
        $1, $2, $3, $4,
        $5, $5,
        $6, $7, $8, $9,
        'OFFICE', 'OFFICE',
        'Availability Fixture', '+35677770002', $10, 'Maltese',
        $11, 'B', 'IN_PERSON',
        NOW(), NOW()
      )
    `,
    [
      randomUUID(),
      `${TEST_PREFIX}-${Math.random().toString(36).slice(2, 9)}`.toUpperCase(),
      status,
      vehicleId,
      vehicleType,
      start,
      end,
      Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60)),
      Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))),
      `${TEST_PREFIX}-${Math.random().toString(36).slice(2, 6)}@example.com`,
      makeDate(1990, 1, 1, 9),
    ],
  );
}

async function createBlock({
  vehicleId = null,
  vehicleType = null,
  blockType,
  start,
  end,
}) {
  await pool.query(
    `
      INSERT INTO "AvailabilityBlock" (
        "id", "vehicleId", "vehicleType", "blockType",
        "startDateTime", "endDateTime", "reason", "createdAt"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `,
    [randomUUID(), vehicleId, vehicleType, blockType, start, end, TEST_REASON],
  );
}

async function apiAvailability(params) {
  const qs = new URLSearchParams(params);
  const response = await fetch(`${API_BASE}/api/availability?${qs.toString()}`);
  const json = await response.json();
  return { status: response.status, body: json };
}

function buildBookingPayload({ vehicleId, vehicleType, start, end }) {
  return {
    rental: {
      vehicleId,
      vehicleType,
      pickupDate: formatDate(start),
      returnDate: formatDate(end),
      pickupTime: formatTime(start),
      returnTime: formatTime(end),
    },
    vehicleId,
    delivery: {
      pickupOption: "OFFICE",
      pickupAddress: "",
      pickupLatitude: null,
      pickupLongitude: null,
      dropoffOption: "OFFICE",
      dropoffAddress: "",
      dropoffLatitude: null,
      dropoffLongitude: null,
    },
    addons: {
      cdwOption: "NO_CDW",
      additionalDriverEnabled: false,
      helmetSize1: "M",
      helmetSize2: "L",
      storageBoxSelected: false,
    },
    customer: {
      fullName: "Availability Test User",
      phone: "+35677770001",
      email: `${TEST_PREFIX}@example.com`,
      nationality: "Maltese",
      dateOfBirth: "1995-06-15",
      licenseCategory: "B",
      specialNotes: "",
      licenseUploadPath: "",
      passportUploadPath: "",
      willPresentLicenseAtPickup: true,
      willPresentIdAtPickup: true,
    },
    additionalDriver: {
      fullName: "",
      phone: "",
      email: "",
      nationality: "",
      dateOfBirth: null,
      licenseCategory: null,
      licenseUploadPath: "",
      passportUploadPath: "",
      willPresentLicenseAtPickup: false,
      willPresentIdAtPickup: false,
    },
    deposit: { depositMethod: "IN_PERSON" },
    consent: {
      termsAccepted: true,
      termsAcceptedAt: new Date().toISOString(),
    },
  };
}

async function createBookingViaApi({ vehicleId, vehicleType, start, end }) {
  const payload = buildBookingPayload({ vehicleId, vehicleType, start, end });
  const response = await fetch(`${API_BASE}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok || !body?.success || typeof body.bookingReference !== "string") {
    throw new Error(`Expected successful booking create, got ${response.status}: ${JSON.stringify(body)}`);
  }
  return body.bookingReference;
}

async function cleanup() {
  await pool.query(
    `
      DELETE FROM "Booking"
      WHERE "bookingReference" LIKE $1
         OR "customerEmail" LIKE $2
    `,
    [`${TEST_PREFIX.toUpperCase()}%`, `%${TEST_PREFIX}%`],
  );
  await pool.query(`DELETE FROM "AvailabilityBlock" WHERE "reason" = $1`, [TEST_REASON]);
  await pool.query(`DELETE FROM "Vehicle" WHERE "slug" LIKE $1`, [`${TEST_PREFIX}%`]);
}

async function main() {
  await cleanup();

  try {
    const type = "MOTORBIKE_50CC";

    const vehicleA = await createVehicle("a", type);
    const vehicleB = await createVehicle("b", type);
    const vehicleC = await createVehicle("c", type);
    const vehicleD = await createVehicle("d", type);
    const vehicleF = await createVehicle("f", type);
    const vehicleH = await createVehicle("h", type);

    // A
    const aStart = makeDate(2026, 8, 10, 10);
    const aEnd = makeDate(2026, 8, 12, 10);
    const scenarioA = await apiAvailability({
      vehicleId: vehicleA.id,
      pickupDate: "2026-08-10",
      pickupTime: "10:00",
      returnDate: "2026-08-12",
      returnTime: "10:00",
    });
    assertEqual("A availability API 200", scenarioA.status, 200);
    assertTrue("A vehicle with no overlap is available", scenarioA.body.isAvailable === true);

    // B
    await createBooking({
      vehicleId: vehicleA.id,
      vehicleType: type,
      status: "CONFIRMED",
      start: makeDate(2026, 8, 11, 9),
      end: makeDate(2026, 8, 13, 9),
    });
    const scenarioB = await apiAvailability({
      vehicleId: vehicleA.id,
      pickupDate: "2026-08-10",
      pickupTime: "10:00",
      returnDate: "2026-08-12",
      returnTime: "10:00",
    });
    assertFalse("B overlap booking blocks exact vehicle", scenarioB.body.isAvailable === true);

    // C
    await createBooking({
      vehicleId: vehicleC.id,
      vehicleType: type,
      status: "CANCELLED",
      start: makeDate(2026, 8, 11, 9),
      end: makeDate(2026, 8, 13, 9),
    });
    const scenarioC = await apiAvailability({
      vehicleId: vehicleC.id,
      pickupDate: "2026-08-10",
      pickupTime: "10:00",
      returnDate: "2026-08-12",
      returnTime: "10:00",
    });
    assertTrue("C cancelled booking does not block", scenarioC.body.isAvailable === true);

    // D
    await createBlock({
      vehicleId: vehicleD.id,
      blockType: "MANUAL_BLOCK",
      start: makeDate(2026, 8, 10, 8),
      end: makeDate(2026, 8, 12, 12),
    });
    const scenarioD = await apiAvailability({
      vehicleId: vehicleD.id,
      pickupDate: "2026-08-10",
      pickupTime: "10:00",
      returnDate: "2026-08-12",
      returnTime: "10:00",
    });
    assertFalse("D manual block blocks vehicle", scenarioD.body.isAvailable === true);

    // G (available case)
    const scenarioGAvailable = await apiAvailability({
      vehicleId: vehicleB.id,
      pickupDate: "2026-08-10",
      pickupTime: "10:00",
      returnDate: "2026-08-12",
      returnTime: "10:00",
    });
    assertEqual("G1 availability API available status 200", scenarioGAvailable.status, 200);
    assertTrue("G2 availability API available true", scenarioGAvailable.body.isAvailable === true);

    // E + G (unavailable case)
    await createBlock({
      vehicleType: type,
      blockType: "MAINTENANCE",
      start: makeDate(2026, 8, 10, 8),
      end: makeDate(2026, 8, 12, 12),
    });
    const scenarioE = await apiAvailability({
      vehicleType: type,
      pickupDate: "2026-08-10",
      pickupTime: "10:00",
      returnDate: "2026-08-12",
      returnTime: "10:00",
    });
    assertEqual("E availability API type status 200", scenarioE.status, 200);
    assertFalse("E type-level block blocks that category", scenarioE.body.isAvailable === true);
    assertFalse("G3 availability API unavailable false", scenarioE.body.isAvailable === true);

    // F
    await createBooking({
      vehicleId: vehicleF.id,
      vehicleType: type,
      status: "PENDING",
      start: makeDate(2026, 9, 1, 10),
      end: makeDate(2026, 9, 3, 10),
    });
    const conflictPayload = buildBookingPayload({
      vehicleId: vehicleF.id,
      vehicleType: type,
      start: makeDate(2026, 9, 1, 12),
      end: makeDate(2026, 9, 3, 12),
    });
    const bookingConflictResponse = await fetch(`${API_BASE}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(conflictPayload),
    });
    const conflictJson = await bookingConflictResponse.json();
    assertEqual("F booking API returns 409 conflict", bookingConflictResponse.status, 409);
    assertEqual(
      "F booking API conflict message",
      conflictJson.message,
      "Selected vehicle is not available for the chosen dates",
    );

    // H
    await createBookingViaApi({
      vehicleId: vehicleH.id,
      vehicleType: type,
      start: makeDate(2099, 1, 1, 10),
      end: makeDate(2099, 1, 3, 10),
    });
    const scenarioH = await apiAvailability({
      vehicleId: vehicleH.id,
      pickupDate: "2099-01-03",
      pickupTime: "10:00",
      returnDate: "2099-01-05",
      returnTime: "10:00",
    });
    assertTrue("H edge touch does not overlap", scenarioH.body.isAvailable === true);

    console.log("All DB-backed availability scenarios passed (A-H).");
  } finally {
    await cleanup();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("DB-backed availability scenarios failed:", error);
  process.exit(1);
});
