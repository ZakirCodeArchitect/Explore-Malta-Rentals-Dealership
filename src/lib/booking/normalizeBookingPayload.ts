import { differenceInMilliseconds, parse } from "date-fns";
import type { BookingSubmission, NormalizedBookingPayload } from "@/lib/booking/types";
import { combineDateAndTime } from "@/lib/booking/bookingSubmissionSchema";

function normalizeText(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDateOnly(dateValue: string): Date {
  const parsed = parse(dateValue, "yyyy-MM-dd", new Date());
  return parsed;
}

export function normalizeBookingPayload(payload: BookingSubmission): NormalizedBookingPayload {
  const pickupDateTime = combineDateAndTime(payload.rental.pickupDate, payload.rental.pickupTime);
  const returnDateTime = combineDateAndTime(payload.rental.returnDate, payload.rental.returnTime);
  const vehicleId = payload.rental.vehicleId ?? payload.vehicleId ?? null;

  if (!pickupDateTime || !returnDateTime) {
    throw new Error("Cannot normalize invalid rental date/time");
  }

  const durationHoursRaw =
    differenceInMilliseconds(returnDateTime, pickupDateTime) / (60 * 60 * 1000);
  const actualDurationHours = Number(durationHoursRaw.toFixed(2));
  const billableDays = Math.max(1, Math.ceil(actualDurationHours / 24));

  return {
    holdReference: payload.holdReference ?? null,
    vehicleId,
    vehicleType: payload.rental.vehicleType,
    pickupDateTime,
    returnDateTime,
    actualDurationHours,
    billableDays,
    pickupOption: payload.delivery.pickupOption,
    pickupAddress: normalizeText(payload.delivery.pickupAddress),
    pickupLatitude: payload.delivery.pickupLatitude,
    pickupLongitude: payload.delivery.pickupLongitude,
    dropoffOption: payload.delivery.dropoffOption,
    dropoffAddress: normalizeText(payload.delivery.dropoffAddress),
    dropoffLatitude: payload.delivery.dropoffLatitude,
    dropoffLongitude: payload.delivery.dropoffLongitude,
    customer: {
      fullName: payload.customer.fullName.trim(),
      phone: payload.customer.phone.trim(),
      email: payload.customer.email.trim().toLowerCase(),
      nationality: payload.customer.nationality.trim(),
      dateOfBirth: parseDateOnly(payload.customer.dateOfBirth),
      licenseCategory: payload.customer.licenseCategory,
      specialNotes: normalizeText(payload.customer.specialNotes),
      licenseUploadPath: normalizeText(payload.customer.licenseUploadPath),
      passportUploadPath: normalizeText(payload.customer.passportUploadPath),
      willPresentLicenseAtPickup: payload.customer.willPresentLicenseAtPickup === true,
      willPresentIdAtPickup: payload.customer.willPresentIdAtPickup === true,
    },
    additionalDriver: {
      enabled: payload.addons.additionalDriverEnabled === true,
      fullName: normalizeText(payload.additionalDriver.fullName),
      phone: normalizeText(payload.additionalDriver.phone),
      email: payload.additionalDriver.email ? payload.additionalDriver.email.trim().toLowerCase() : null,
      nationality: normalizeText(payload.additionalDriver.nationality),
      dateOfBirth: payload.additionalDriver.dateOfBirth
        ? parseDateOnly(payload.additionalDriver.dateOfBirth)
        : null,
      licenseCategory: payload.additionalDriver.licenseCategory,
      licenseUploadPath: normalizeText(payload.additionalDriver.licenseUploadPath),
      passportUploadPath: normalizeText(payload.additionalDriver.passportUploadPath),
      willPresentLicenseAtPickup: payload.additionalDriver.willPresentLicenseAtPickup === true,
      willPresentIdAtPickup: payload.additionalDriver.willPresentIdAtPickup === true,
    },
    addons: {
      cdwOption: payload.addons.cdwOption,
      helmetSize1: payload.addons.helmetSize1,
      helmetSize2: payload.addons.helmetSize2,
      storageBoxSelected: payload.addons.storageBoxSelected === true,
    },
    deposit: {
      depositMethod: payload.deposit.depositMethod,
    },
    consent: {
      termsAccepted: payload.consent.termsAccepted === true,
      termsAcceptedAt: payload.consent.termsAcceptedAt
        ? new Date(payload.consent.termsAcceptedAt)
        : null,
    },
  };
}
