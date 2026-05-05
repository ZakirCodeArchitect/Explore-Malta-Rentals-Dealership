/**
 * Verifies server-side pricing for: 50cc motorbike, 2 billable days, office/office,
 * no extras, deposit in person → rental 36, subtotal 36, deposit 250, online 36, later 250.
 *
 * Also verifies invalid payloads are rejected (same rules as POST /api/bookings):
 * wrong license for 50cc, terms not accepted, delivery without address, ATV missing a helmet size.
 *
 * Run: npm run test:booking-pricing
 *
 * Optional: with dev server up, also smoke-test POST /api/bookings:
 *   set TEST_API_BASE=http://localhost:3000 && npm run test:booking-pricing
 */
import type { z } from "zod";

import { bookingSubmissionSchema } from "../src/lib/booking/bookingSubmissionSchema";
import { calculateBookingPrice, type BookingPricingInput } from "../src/lib/pricing/calculate-booking-price";

type BookingPayload = z.input<typeof bookingSubmissionSchema>;

const scenario50ccTwoDaysInPerson: BookingPricingInput = {
  rental: {
    vehicle: { type: "Scooter" },
    pickupDate: "2026-05-10",
    returnDate: "2026-05-12",
    pickupTime: "10:00",
    returnTime: "10:00",
  },
  delivery: {
    pickupOption: "office",
    dropoffOption: "office",
  },
  addons: {
    cdwOption: "no_cdw",
    additionalDriver: false,
    storageBox: false,
  },
  additionalDriver: { enabled: false },
  deposit: { method: "in_person" },
};

function assertApprox(name: string, actual: number, expected: number, tolerance = 0.001): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`);
  }
}

function runPricingAssertions(): void {
  const b = calculateBookingPrice(scenario50ccTwoDaysInPerson);
  if (!b) {
    throw new Error("calculateBookingPrice returned null");
  }

  assertApprox("rentalCost", b.rentalCost, 36);
  assertApprox("deliveryFee", b.deliveryFee, 0);
  assertApprox("deliveryTotal", b.deliveryTotal, 0);
  assertApprox("subtotal", b.subtotal, 36);
  assertApprox("depositAmount", b.depositAmount, 250);
  assertApprox("totalDueOnline", b.totalDueOnline, 36);
  assertApprox("totalDueLater", b.totalDueLater, 250);
  assertApprox("cdwCost", b.cdwCost, 0);
  assertApprox("billableDays (via rentalDays)", b.rentalDays, 2);

  console.log("Pricing assertions passed:", {
    rentalCost: b.rentalCost,
    deliveryFee: b.deliveryFee,
    subtotal: b.subtotal,
    depositAmount: b.depositAmount,
    totalDueOnline: b.totalDueOnline,
    totalDueLater: b.totalDueLater,
  });
}

function expectSchemaFailure(
  name: string,
  payload: BookingPayload,
  pathMatch: (path: string) => boolean,
): void {
  const parsed = bookingSubmissionSchema.safeParse(payload);
  if (parsed.success) {
    throw new Error(`${name}: expected schema failure, got success`);
  }
  const paths = parsed.error.issues.map((issue) => issue.path.map(String).join("."));
  if (!paths.some(pathMatch)) {
    throw new Error(`${name}: no matching issue path. Got:\n${paths.join("\n")}`);
  }
  console.log(`OK negative: ${name} (${parsed.error.issues.length} issue(s))`);
}

const bookingBody: BookingPayload = {
  rental: {
    vehicleType: "Scooter",
    pickupDate: "2026-05-10",
    returnDate: "2026-05-12",
    pickupTime: "10:00",
    returnTime: "10:00",
  },
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
    fullName: "Script Test User",
    phone: "+35677770001",
    email: "script-test@example.com",
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

function runNegativeValidationTests(): void {
  expectSchemaFailure(
    "wrong license (A1 on Scooter)",
    {
      ...bookingBody,
      customer: { ...bookingBody.customer, licenseCategory: "A1" },
    },
    (p) => p === "customer.licenseCategory",
  );

  expectSchemaFailure(
    "terms not accepted",
    {
      ...bookingBody,
      consent: { ...bookingBody.consent, termsAccepted: false },
    },
    (p) => p === "consent.termsAccepted",
  );

  expectSchemaFailure(
    "delivery without pickup address",
    {
      ...bookingBody,
      delivery: {
        ...bookingBody.delivery,
        pickupOption: "DELIVERY",
        pickupAddress: "",
      },
    },
    (p) => p === "delivery.pickupAddress",
  );

  expectSchemaFailure(
    "ATV with only one helmet size",
    {
      ...bookingBody,
      rental: { ...bookingBody.rental, vehicleType: "ATV" },
      addons: {
        ...bookingBody.addons,
        cdwOption: "NO_CDW",
        helmetSize1: "M",
        helmetSize2: null,
      },
    },
    (p) => p === "addons.helmetSize1" || p === "addons.helmetSize2",
  );
}

async function optionalApiSmokeTest(): Promise<void> {
  const base = process.env.TEST_API_BASE?.trim();
  if (!base) {
    console.log("Skip API smoke test (set TEST_API_BASE e.g. http://localhost:3000 to enable).");
    return;
  }

  const url = `${base.replace(/\/$/, "")}/api/bookings`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingBody),
  });
  const data = (await res.json()) as { success?: boolean; bookingReference?: string; message?: string };

  if (!res.ok) {
    throw new Error(`POST ${url} → ${res.status}: ${JSON.stringify(data)}`);
  }
  if (!data.success || !data.bookingReference) {
    throw new Error(`Unexpected response: ${JSON.stringify(data)}`);
  }

  console.log("API smoke test passed:", data.bookingReference);
}

async function main(): Promise<void> {
  runPricingAssertions();
  runNegativeValidationTests();
  await optionalApiSmokeTest();
  console.log("All checks OK.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
