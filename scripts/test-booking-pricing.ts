/**
 * Verifies server-side pricing for duration discount rules + vehicle base daily rate.
 *
 * Run: npm run test:booking-pricing
 */
import type { z } from "zod";

import { bookingSubmissionSchema } from "../src/lib/booking/bookingSubmissionSchema";
import { calculateBookingPrice, type BookingPricingInput } from "../src/lib/pricing/calculate-booking-price";
import type { DurationPricingRuleDto } from "../src/lib/pricing/duration-pricing";

type BookingPayload = z.input<typeof bookingSubmissionSchema>;

const scooterDurationRules: DurationPricingRuleDto[] = [
  { vehicleType: "Scooter", minDays: 1, maxDays: 1, discountPercent: 0, displayOrder: 10 },
  { vehicleType: "Scooter", minDays: 2, maxDays: 2, discountPercent: 10, displayOrder: 20 },
  { vehicleType: "Scooter", minDays: 3, maxDays: 20, discountPercent: 20, displayOrder: 30 },
  { vehicleType: "Scooter", minDays: 21, maxDays: null, discountPercent: 40, displayOrder: 40 },
];

const basePricingInput = {
  rental: {
    vehicle: { type: "Scooter" },
    pickupDate: "2026-05-10",
    returnDate: "2026-05-12",
    pickupTime: "10:00",
    returnTime: "10:00",
  },
  delivery: {
    pickupOption: "office" as const,
    dropoffOption: "office" as const,
  },
  addons: {
    cdwOption: "no_cdw" as const,
    additionalDriver: false,
    storageBox: false,
  },
  additionalDriver: { enabled: false },
  deposit: { method: "in_person" as const },
  vehiclePricing: {
    baseDailyRate: 25,
    vehicleType: "Scooter" as const,
    durationRules: scooterDurationRules,
  },
} satisfies BookingPricingInput;

function assertApprox(name: string, actual: number, expected: number, tolerance = 0.001): void {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${name}: expected ${expected}, got ${actual}`);
  }
}

function runPricingAssertions(): void {
  const twoDayBooking = calculateBookingPrice(basePricingInput);
  if (!twoDayBooking) {
    throw new Error("2-day pricing returned null");
  }

  assertApprox("2-day applied rate", twoDayBooking.appliedDailyRate, 22.5);
  assertApprox("2-day rentalCost", twoDayBooking.rentalCost, 45);
  assertApprox("2-day discount percent", twoDayBooking.durationDiscountPercent, 10);

  const fiveDayBooking = calculateBookingPrice({
    ...basePricingInput,
    rental: {
      ...basePricingInput.rental,
      returnDate: "2026-05-15",
    },
  });
  if (!fiveDayBooking) {
    throw new Error("5-day pricing returned null");
  }
  assertApprox("5-day applied rate", fiveDayBooking.appliedDailyRate, 20);
  assertApprox("5-day rentalCost", fiveDayBooking.rentalCost, 100);

  const twentyOneDayBooking = calculateBookingPrice({
    ...basePricingInput,
    rental: {
      ...basePricingInput.rental,
      returnDate: "2026-05-31",
    },
  });
  if (!twentyOneDayBooking) {
    throw new Error("21-day pricing returned null");
  }
  assertApprox("21-day applied rate", twentyOneDayBooking.appliedDailyRate, 15);
  assertApprox("21-day rentalCost", twentyOneDayBooking.rentalCost, 315);

  console.log("Pricing assertions passed:", {
    twoDayRentalCost: twoDayBooking.rentalCost,
    fiveDayRentalCost: fiveDayBooking.rentalCost,
    twentyOneDayRentalCost: twentyOneDayBooking.rentalCost,
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

async function main(): Promise<void> {
  runPricingAssertions();
  runNegativeValidationTests();
  console.log("All checks OK.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
