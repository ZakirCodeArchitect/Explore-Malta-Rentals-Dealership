import { randomBytes } from "node:crypto";
import { format } from "date-fns";

import { Prisma, type VehicleType } from "@/generated/prisma/index";
import {
  checkVehicleAvailability,
  checkVehicleTypeAvailability,
  type AvailabilityDbClient,
} from "@/lib/availability";
import { sendBookingConfirmation } from "@/lib/email/sendBookingConfirmation";
import { prisma } from "@/lib/prisma";
import {
  calculateBookingPrice,
  pricingConfig,
  type BookingPriceBreakdown,
  type BookingPricingInput,
  type PricingCdwOption,
} from "@/lib/pricing/calculate-booking-price";

import { validateBookingPayload } from "./validateBookingPayload";
import type { BookingSubmissionInput, NormalizedBookingPayload, ValidationError } from "./types";

const BOOKING_REFERENCE_PREFIX = "EMR";
const BOOKING_REFERENCE_RETRY_LIMIT = 5;
/** Heartbeat updates the same hold row outside this tx; Serializable + Turso/SQLite often returns P2034. */
const TRANSACTION_WRITE_CONFLICT_RETRY_LIMIT = 10;

type PricingComputation = {
  breakdown: BookingPriceBreakdown;
  cdwDailyRate: number;
  additionalDriverDailyRate: number;
  resolvedCdwOption: NormalizedBookingPayload["addons"]["cdwOption"];
};

type ResolvedBookingVehicle = {
  vehicleId: string | null;
  vehicleNameSnapshot: string | null;
  vehicleType: VehicleType;
  vehicleTypeSnapshot: VehicleType;
};

type SubmitBookingResponse = {
  bookingReference: string;
};

type AvailabilityConflictContext = {
  vehicleId: string | null;
  vehicleType: VehicleType;
  requestedStart: Date;
  requestedEnd: Date;
};

type HoldAvailabilityContext = {
  excludeHoldReference?: string;
  excludeSessionKey?: string;
};

type HoldForFinalization = {
  id: string;
  holdReference: string;
  sessionKey: string;
};

export class SubmitBookingValidationError extends Error {
  readonly errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    super("Booking payload validation failed");
    this.name = "SubmitBookingValidationError";
    this.errors = errors;
  }
}

export class AvailabilityConflictError extends Error {
  readonly context: AvailabilityConflictContext;

  constructor(message: string, context: AvailabilityConflictContext) {
    super(message);
    this.name = "AvailabilityConflictError";
    this.context = context;
  }
}

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

function toPricingInput(
  payload: NormalizedBookingPayload,
  vehicle: ResolvedBookingVehicle,
): BookingPricingInput {
  return {
    rental: {
      vehicle: {
        id: vehicle.vehicleId ?? undefined,
        name: vehicle.vehicleNameSnapshot ?? undefined,
        type: vehicle.vehicleType,
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

function computePricing(
  payload: NormalizedBookingPayload,
  vehicle: ResolvedBookingVehicle,
): PricingComputation | null {
  const breakdown = calculateBookingPrice(toPricingInput(payload, vehicle));
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

function isTransactionWriteConflictError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

function transactionConflictBackoffMs(attemptIndex: number): number {
  const jitter = 20 + Math.floor(Math.random() * 60);
  return jitter + attemptIndex * 40;
}

async function resolveBookingVehicle(payload: NormalizedBookingPayload): Promise<ResolvedBookingVehicle> {
  if (!payload.vehicleId) {
    return {
      vehicleId: null,
      vehicleNameSnapshot: null,
      vehicleType: payload.vehicleType,
      vehicleTypeSnapshot: payload.vehicleType,
    };
  }

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: payload.vehicleId },
    select: {
      id: true,
      name: true,
      vehicleType: true,
      isActive: true,
    },
  });

  if (!vehicle) {
    throw new SubmitBookingValidationError([
      { path: "rental.vehicleId", message: "Selected vehicle not found" },
    ]);
  }

  if (!vehicle.isActive) {
    throw new SubmitBookingValidationError([
      { path: "rental.vehicleId", message: "Selected vehicle is not active" },
    ]);
  }

  if (vehicle.vehicleType !== payload.vehicleType) {
    throw new SubmitBookingValidationError([
      { path: "rental.vehicleType", message: "Vehicle type does not match selected vehicle" },
    ]);
  }

  return {
    vehicleId: vehicle.id,
    vehicleNameSnapshot: vehicle.name,
    vehicleType: vehicle.vehicleType,
    vehicleTypeSnapshot: vehicle.vehicleType,
  };
}

async function getActiveTermsVersionId(): Promise<string | null> {
  const activeTerms = await prisma.termsVersion.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  return activeTerms?.id ?? null;
}

async function assertBookingStillAvailable(
  payload: NormalizedBookingPayload,
  vehicle: ResolvedBookingVehicle,
  db: AvailabilityDbClient,
  holdContext?: HoldAvailabilityContext,
): Promise<void> {
  if (vehicle.vehicleId) {
    const availability = await checkVehicleAvailability(
      {
        vehicleId: vehicle.vehicleId,
        vehicleType: vehicle.vehicleType,
        requestedStart: payload.pickupDateTime,
        requestedEnd: payload.returnDateTime,
        excludeHoldReference: holdContext?.excludeHoldReference,
        excludeSessionKey: holdContext?.excludeSessionKey,
      },
      db,
    );

    if (!availability.isAvailable) {
      throw new AvailabilityConflictError(
        "Selected vehicle is not available for the chosen dates",
        {
          vehicleId: vehicle.vehicleId,
          vehicleType: vehicle.vehicleType,
          requestedStart: payload.pickupDateTime,
          requestedEnd: payload.returnDateTime,
        },
      );
    }
    return;
  }

  const availability = await checkVehicleTypeAvailability(
    {
      vehicleType: vehicle.vehicleType,
      requestedStart: payload.pickupDateTime,
      requestedEnd: payload.returnDateTime,
      excludeHoldReference: holdContext?.excludeHoldReference,
      excludeSessionKey: holdContext?.excludeSessionKey,
    },
    db,
  );

  if (!availability.isAvailable) {
    throw new AvailabilityConflictError(
      "No vehicles of this type are available for the chosen dates",
      {
        vehicleId: null,
        vehicleType: vehicle.vehicleType,
        requestedStart: payload.pickupDateTime,
        requestedEnd: payload.returnDateTime,
      },
    );
  }
}

function mapBookingCreateData(
  bookingReference: string,
  payload: NormalizedBookingPayload,
  pricing: PricingComputation,
  vehicle: ResolvedBookingVehicle,
  termsVersionId: string | null,
): Prisma.BookingUncheckedCreateInput {
  return {
    bookingReference,
    status: "PENDING",
    vehicleId: vehicle.vehicleId,
    vehicleNameSnapshot: vehicle.vehicleNameSnapshot,
    vehicleTypeSnapshot: vehicle.vehicleTypeSnapshot,
    termsVersionId,
    vehicleType: vehicle.vehicleType,
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
    additionalDriverWillPresentLicenseAtPickup: payload.additionalDriver.willPresentLicenseAtPickup,
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
  };
}

async function validateHoldForBooking(
  payload: NormalizedBookingPayload,
  vehicle: ResolvedBookingVehicle,
  tx: Prisma.TransactionClient,
): Promise<HoldForFinalization> {
  if (!payload.holdReference) {
    throw new SubmitBookingValidationError([
      {
        path: "holdReference",
        message: "A hold reference is required for this booking flow",
      },
    ]);
  }

  const hold = await tx.reservationHold.findUnique({
    where: { holdReference: payload.holdReference },
    select: {
      id: true,
      holdReference: true,
      sessionKey: true,
      vehicleId: true,
      vehicleType: true,
      pickupDateTime: true,
      returnDateTime: true,
      status: true,
      expiresAt: true,
    },
  });

  if (!hold) {
    throw new AvailabilityConflictError("Reservation hold is invalid or unavailable", {
      vehicleId: vehicle.vehicleId,
      vehicleType: vehicle.vehicleType,
      requestedStart: payload.pickupDateTime,
      requestedEnd: payload.returnDateTime,
    });
  }

  if (hold.status === "ACTIVE" && hold.expiresAt <= new Date()) {
    await tx.reservationHold.update({
      where: { id: hold.id },
      data: { status: "EXPIRED" },
    });
    throw new AvailabilityConflictError("Reservation hold has expired", {
      vehicleId: vehicle.vehicleId,
      vehicleType: vehicle.vehicleType,
      requestedStart: payload.pickupDateTime,
      requestedEnd: payload.returnDateTime,
    });
  }

  if (hold.status !== "ACTIVE") {
    throw new AvailabilityConflictError("Reservation hold is no longer active", {
      vehicleId: vehicle.vehicleId,
      vehicleType: vehicle.vehicleType,
      requestedStart: payload.pickupDateTime,
      requestedEnd: payload.returnDateTime,
    });
  }

  if (!vehicle.vehicleId || hold.vehicleId !== vehicle.vehicleId) {
    throw new SubmitBookingValidationError([
      {
        path: "rental.vehicleId",
        message: "Booking vehicle does not match the held vehicle",
      },
    ]);
  }

  if (hold.vehicleType !== vehicle.vehicleType) {
    throw new SubmitBookingValidationError([
      {
        path: "rental.vehicleType",
        message: "Booking vehicle type does not match the held vehicle",
      },
    ]);
  }

  if (
    hold.pickupDateTime.getTime() !== payload.pickupDateTime.getTime() ||
    hold.returnDateTime.getTime() !== payload.returnDateTime.getTime()
  ) {
    throw new SubmitBookingValidationError([
      {
        path: "rental.pickupDate",
        message: "Booking date range must match the held reservation window",
      },
    ]);
  }

  return {
    id: hold.id,
    holdReference: hold.holdReference,
    sessionKey: hold.sessionKey,
  };
}

async function createBookingWithUniqueReference(
  payload: NormalizedBookingPayload,
  pricing: PricingComputation,
  vehicle: ResolvedBookingVehicle,
  termsVersionId: string | null,
  requireHoldReference: boolean,
) {
  let lastError: unknown = null;

  referenceAttempt: for (let attempt = 0; attempt < BOOKING_REFERENCE_RETRY_LIMIT; attempt += 1) {
    const bookingReference = generateBookingReference();
    const bookingCreateData = mapBookingCreateData(
      bookingReference,
      payload,
      pricing,
      vehicle,
      termsVersionId,
    );

    for (
      let conflictAttempt = 0;
      conflictAttempt < TRANSACTION_WRITE_CONFLICT_RETRY_LIMIT;
      conflictAttempt += 1
    ) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            let holdForFinalization: HoldForFinalization | null = null;
            if (requireHoldReference) {
              holdForFinalization = await validateHoldForBooking(payload, vehicle, tx);
            }

            await assertBookingStillAvailable(
              payload,
              vehicle,
              tx as unknown as AvailabilityDbClient,
              holdForFinalization
                ? {
                    excludeHoldReference: holdForFinalization.holdReference,
                    excludeSessionKey: holdForFinalization.sessionKey,
                  }
                : undefined,
            );

            const booking = await tx.booking.create({
              data: bookingCreateData,
            });

            if (holdForFinalization) {
              await tx.reservationHold.update({
                where: { id: holdForFinalization.id },
                data: {
                  status: "CONVERTED",
                  bookingId: booking.id,
                  lastHeartbeatAt: new Date(),
                },
              });
            }

            return booking;
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (error instanceof AvailabilityConflictError) {
          throw error;
        }
        if (isTransactionWriteConflictError(error)) {
          if (conflictAttempt + 1 >= TRANSACTION_WRITE_CONFLICT_RETRY_LIMIT) {
            throw error;
          }
          await new Promise((resolve) => {
            setTimeout(resolve, transactionConflictBackoffMs(conflictAttempt));
          });
          continue;
        }
        if (!isBookingReferenceUniqueConstraintError(error)) {
          throw error;
        }
        lastError = error;
        continue referenceAttempt;
      }
    }
  }

  throw lastError ?? new Error("Failed to generate a unique booking reference");
}

async function updateEmailStatus(bookingId: string, wasSent: boolean) {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: wasSent
        ? {
            confirmationEmailStatus: "SENT",
            confirmationEmailSentAt: new Date(),
          }
        : {
            confirmationEmailStatus: "FAILED",
            confirmationEmailSentAt: null,
          },
    });
  } catch (statusError) {
    console.error("[bookings] Failed to persist confirmation email status", {
      bookingId,
      status: wasSent ? "SENT" : "FAILED",
      error: statusError,
    });
  }
}

export async function submitBooking(payload: BookingSubmissionInput): Promise<SubmitBookingResponse> {
  const validation = validateBookingPayload(payload);
  if (!validation.success) {
    throw new SubmitBookingValidationError(validation.errors);
  }

  const resolvedVehicle = await resolveBookingVehicle(validation.data);
  const requireHoldReference = Boolean(validation.data.holdReference);
  if (!requireHoldReference) {
    await assertBookingStillAvailable(
      validation.data,
      resolvedVehicle,
      prisma as unknown as AvailabilityDbClient,
    );
  }
  const pricing = computePricing(validation.data, resolvedVehicle);
  if (!pricing) {
    throw new SubmitBookingValidationError([
      { path: "pricing", message: "Unable to calculate booking price" },
    ]);
  }

  const activeTermsVersionId = await getActiveTermsVersionId();
  const booking = await createBookingWithUniqueReference(
    validation.data,
    pricing,
    resolvedVehicle,
    activeTermsVersionId,
    requireHoldReference,
  );

  const emailResult = await sendBookingConfirmation(booking);
  if (emailResult.success) {
    await updateEmailStatus(booking.id, true);
  } else {
    console.error("[bookings] Confirmation email was not sent", {
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      reason: emailResult.reason,
    });
    await updateEmailStatus(booking.id, false);
  }

  return {
    bookingReference: booking.bookingReference,
  };
}
