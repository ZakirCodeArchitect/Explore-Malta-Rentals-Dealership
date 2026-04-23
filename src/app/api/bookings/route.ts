import { randomBytes } from "node:crypto";
import { format } from "date-fns";
import { NextResponse } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { validateBookingPayload, type BookingSubmissionInput, type NormalizedBookingPayload } from "@/lib/booking";
import { prisma } from "@/lib/prisma";
import {
  calculateBookingPrice,
  pricingConfig,
  type BookingPricingInput,
  type BookingPriceBreakdown,
  type PricingCdwOption,
} from "@/lib/pricing/calculate-booking-price";

const BOOKING_REFERENCE_PREFIX = "EMR";
const BOOKING_REFERENCE_RETRY_LIMIT = 5;

type PricingComputation = {
  breakdown: BookingPriceBreakdown;
  cdwDailyRate: number;
  additionalDriverDailyRate: number;
  resolvedCdwOption: NormalizedBookingPayload["addons"]["cdwOption"];
};

function generateBookingReference(now = new Date()): string {
  const datePart = format(now, "yyyyMMdd");
  const randomPart = randomBytes(2).toString("hex").toUpperCase();
  return `${BOOKING_REFERENCE_PREFIX}-${datePart}-${randomPart}`;
}

function mapPickupOptionForPricing(option: NormalizedBookingPayload["pickupOption"]): "office" | "delivery" {
  return option === "DELIVERY" ? "delivery" : "office";
}

function mapDropoffOptionForPricing(option: NormalizedBookingPayload["dropoffOption"]): "office" | "dropoff" {
  return option === "DROPOFF" ? "dropoff" : "office";
}

function mapDepositMethodForPricing(
  method: NormalizedBookingPayload["deposit"]["depositMethod"],
): "online" | "in_person" {
  return method === "ONLINE" ? "online" : "in_person";
}

function mapCdwOptionForPricing(option: NormalizedBookingPayload["addons"]["cdwOption"]): PricingCdwOption {
  switch (option) {
    case "REDUCE_350_50CC":
      return "cdw_50cc_reduced_350";
    case "REDUCE_500_125CC":
      return "cdw_125cc_reduced_500";
    case "FULL_COVERAGE_50CC_125CC":
      return "cdw_full_50cc_125cc";
    case "REDUCE_800_ATV":
      return "cdw_atv_reduced_800";
    default:
      return "no_cdw";
  }
}

function mapCdwOptionFromPricing(option: PricingCdwOption): NormalizedBookingPayload["addons"]["cdwOption"] {
  switch (option) {
    case "cdw_50cc_reduced_350":
      return "REDUCE_350_50CC";
    case "cdw_125cc_reduced_500":
      return "REDUCE_500_125CC";
    case "cdw_full_50cc_125cc":
      return "FULL_COVERAGE_50CC_125CC";
    case "cdw_atv_reduced_800":
      return "REDUCE_800_ATV";
    default:
      return "NO_CDW";
  }
}

function toPricingInput(payload: NormalizedBookingPayload): BookingPricingInput {
  return {
    rental: {
      vehicle: {
        type: payload.vehicleType,
      },
      pickupDate: format(payload.pickupDateTime, "yyyy-MM-dd"),
      pickupTime: format(payload.pickupDateTime, "HH:mm"),
      returnDate: format(payload.returnDateTime, "yyyy-MM-dd"),
      returnTime: format(payload.returnDateTime, "HH:mm"),
    },
    delivery: {
      pickupOption: mapPickupOptionForPricing(payload.pickupOption),
      pickupAddress: payload.pickupAddress ?? undefined,
      dropoffOption: mapDropoffOptionForPricing(payload.dropoffOption),
      dropoffAddress: payload.dropoffAddress ?? undefined,
    },
    addons: {
      cdwOption: mapCdwOptionForPricing(payload.addons.cdwOption),
      additionalDriver: payload.additionalDriver.enabled,
      storageBox: payload.addons.storageBoxSelected,
      helmetSize1: payload.addons.helmetSize1 ?? undefined,
      helmetSize2: payload.addons.helmetSize2 ?? undefined,
    },
    additionalDriver: {
      enabled: payload.additionalDriver.enabled,
    },
    deposit: {
      method: mapDepositMethodForPricing(payload.deposit.depositMethod),
    },
  };
}

function computePricing(payload: NormalizedBookingPayload): PricingComputation | null {
  const breakdown = calculateBookingPrice(toPricingInput(payload));
  if (!breakdown) {
    return null;
  }

  return {
    breakdown,
    cdwDailyRate: pricingConfig.cdwPerDay[breakdown.cdwOptionApplied],
    additionalDriverDailyRate: payload.additionalDriver.enabled
      ? pricingConfig.addons.additionalDriverPerDay
      : 0,
    resolvedCdwOption: mapCdwOptionFromPricing(breakdown.cdwOptionApplied),
  };
}

function isBookingReferenceUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.includes("bookingReference");
  }

  if (typeof target === "string") {
    return target.includes("bookingReference");
  }

  return false;
}

async function createBookingWithUniqueReference(
  payload: NormalizedBookingPayload,
  pricing: PricingComputation,
) {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < BOOKING_REFERENCE_RETRY_LIMIT; attempt += 1) {
    const bookingReference = generateBookingReference();

    try {
      return await prisma.booking.create({
        data: {
          bookingReference,
          status: "PENDING",
          vehicleType: payload.vehicleType,
          pickupDateTime: payload.pickupDateTime,
          returnDateTime: payload.returnDateTime,
          actualDurationHours: payload.actualDurationHours,
          billableDays: payload.billableDays,
          pickupOption: payload.pickupOption,
          pickupAddress: payload.pickupAddress,
          pickupLatitude: payload.pickupLatitude,
          pickupLongitude: payload.pickupLongitude,
          dropoffOption: payload.dropoffOption,
          dropoffAddress: payload.dropoffAddress,
          dropoffLatitude: payload.dropoffLatitude,
          dropoffLongitude: payload.dropoffLongitude,
          customerFullName: payload.customer.fullName,
          customerPhone: payload.customer.phone,
          customerEmail: payload.customer.email,
          customerNationality: payload.customer.nationality,
          customerDateOfBirth: payload.customer.dateOfBirth,
          customerLicenseCategory: payload.customer.licenseCategory,
          customerSpecialNotes: payload.customer.specialNotes,
          customerLicenseUploadPath: payload.customer.licenseUploadPath,
          customerPassportUploadPath: payload.customer.passportUploadPath,
          customerWillPresentLicenseAtPickup: payload.customer.willPresentLicenseAtPickup,
          customerWillPresentIdAtPickup: payload.customer.willPresentIdAtPickup,
          additionalDriverEnabled: payload.additionalDriver.enabled,
          additionalDriverFullName: payload.additionalDriver.fullName,
          additionalDriverPhone: payload.additionalDriver.phone,
          additionalDriverEmail: payload.additionalDriver.email,
          additionalDriverNationality: payload.additionalDriver.nationality,
          additionalDriverDateOfBirth: payload.additionalDriver.dateOfBirth,
          additionalDriverLicenseCategory: payload.additionalDriver.licenseCategory,
          additionalDriverLicenseUploadPath: payload.additionalDriver.licenseUploadPath,
          additionalDriverPassportUploadPath: payload.additionalDriver.passportUploadPath,
          additionalDriverWillPresentLicenseAtPickup:
            payload.additionalDriver.willPresentLicenseAtPickup,
          additionalDriverWillPresentIdAtPickup: payload.additionalDriver.willPresentIdAtPickup,
          cdwOption: pricing.resolvedCdwOption,
          cdwDailyRate: pricing.cdwDailyRate,
          cdwTotal: pricing.breakdown.cdwCost,
          additionalDriverDailyRate: pricing.additionalDriverDailyRate,
          additionalDriverTotal: pricing.breakdown.additionalDriverCost,
          helmetSize1: payload.addons.helmetSize1,
          helmetSize2: payload.addons.helmetSize2,
          storageBoxSelected: payload.addons.storageBoxSelected,
          storageBoxCost: pricing.breakdown.storageBoxCost,
          rentalCost: pricing.breakdown.rentalCost,
          deliveryFee: pricing.breakdown.deliveryFee,
          dropoffFee: pricing.breakdown.dropoffFee,
          deliveryTotal: pricing.breakdown.deliveryTotal,
          subtotal: pricing.breakdown.subtotal,
          depositAmount: pricing.breakdown.depositAmount,
          depositMethod: payload.deposit.depositMethod,
          totalDueOnline: pricing.breakdown.totalDueOnline,
          totalDueLater: pricing.breakdown.totalDueLater,
          termsAccepted: payload.consent.termsAccepted,
          termsAcceptedAt: payload.consent.termsAcceptedAt,
        },
      });
    } catch (error) {
      if (!isBookingReferenceUniqueConstraintError(error)) {
        throw error;
      }
      lastError = error;
    }
  }

  throw lastError ?? new Error("Failed to generate a unique booking reference");
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false as const,
        errors: [{ path: "$", message: "Invalid JSON payload" }],
      },
      { status: 400 },
    );
  }

  const validation = validateBookingPayload(payload as BookingSubmissionInput);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false as const,
        errors: validation.errors,
      },
      { status: 400 },
    );
  }

  const pricing = computePricing(validation.data);
  if (!pricing) {
    return NextResponse.json(
      {
        success: false as const,
        errors: [{ path: "pricing", message: "Unable to calculate booking price" }],
      },
      { status: 400 },
    );
  }

  try {
    const booking = await createBookingWithUniqueReference(validation.data, pricing);

    return NextResponse.json({
      success: true as const,
      bookingReference: booking.bookingReference,
      message: "Booking submitted successfully",
    });
  } catch (error) {
    console.error("[bookings] Failed to submit booking", error);
    return NextResponse.json(
      {
        success: false as const,
        message: "Unable to submit booking right now. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
