import type { BookingSubmissionInput, VehicleType as ApiVehicleType } from "@/lib/booking/types";
import type { BookingFlowState } from "@/features/booking-flow/lib/types";
import { isApiVehicleType } from "@/features/vehicles/data/vehicles";

export function mapVehicleTypeToApiVehicleType(
  stateVehicleType: string,
  vehicleSlug: string,
): ApiVehicleType {
  if (isApiVehicleType(stateVehicleType)) {
    return stateVehicleType;
  }

  const slug = vehicleSlug.toLowerCase();
  const display = stateVehicleType.toLowerCase();
  if (display === "bicycle" || slug.includes("bicycle")) {
    return "BICYCLE";
  }
  if (display === "atv" || slug.includes("atv")) {
    return "ATV";
  }
  if (slug.includes("50cc")) {
    return "MOTORBIKE_50CC";
  }
  if (slug.includes("125cc")) {
    return "MOTORBIKE_125CC";
  }
  if (display === "scooter" || display === "motorcycle") {
    return "MOTORBIKE_125CC";
  }
  return "MOTORBIKE_125CC";
}

function isHelmetRequiredForApiVehicle(apiVehicle: ApiVehicleType): boolean {
  return apiVehicle === "MOTORBIKE_50CC" || apiVehicle === "MOTORBIKE_125CC" || apiVehicle === "ATV";
}

function toHelmetSize(value: string): "S" | "M" | "L" | null {
  const trimmed = value.trim();
  if (trimmed === "S" || trimmed === "M" || trimmed === "L") {
    return trimmed;
  }
  return null;
}

function mapCdwPlanToApi(
  plan: BookingFlowState["addons"]["cdwPlan"],
  apiVehicle: ApiVehicleType,
): BookingSubmissionInput["addons"]["cdwOption"] {
  if (plan === "none") {
    return "NO_CDW";
  }
  if (plan === "atv_full") {
    return "REDUCE_800_ATV";
  }
  if (plan === "scooter_full") {
    return "FULL_COVERAGE_50CC_125CC";
  }
  if (plan === "scooter_50") {
    return apiVehicle === "MOTORBIKE_50CC" ? "REDUCE_350_50CC" : "NO_CDW";
  }
  if (plan === "scooter_125") {
    return apiVehicle === "MOTORBIKE_125CC" ? "REDUCE_500_125CC" : "NO_CDW";
  }
  return "NO_CDW";
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function pathOrNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function mapBookingFlowStateToSubmission(state: BookingFlowState): BookingSubmissionInput {
  const apiVehicle = mapVehicleTypeToApiVehicleType(state.rental.vehicleType, state.rental.vehicleSlug);
  const helmetRequired = isHelmetRequiredForApiVehicle(apiVehicle);
  const pickupOption = state.delivery.pickupOption === "office" ? "OFFICE" : "DELIVERY";
  const dropoffOption = state.delivery.dropoffOption === "office" ? "OFFICE" : "DROPOFF";
  const depositMethod = state.deposit.depositMethod === "online" ? "ONLINE" : "IN_PERSON";
  const additionalEnabled = state.addons.additionalDriver === true;

  const licensePath = pathOrNull(state.customer.driverLicenseUpload);
  const passportPath = pathOrNull(state.customer.passportUpload);
  const officePickup = state.delivery.pickupOption === "office";

  const additionalPassportPath = pathOrNull(state.additionalDriver.passportIdUpload);

  return {
    rental: {
      vehicleId: state.rental.vehicleId ?? undefined,
      vehicleType: apiVehicle,
      pickupDate: state.rental.pickupDate.trim(),
      returnDate: state.rental.returnDate.trim(),
      pickupTime: state.rental.pickupTime.trim(),
      returnTime: state.rental.returnTime.trim(),
    },
    delivery: {
      pickupOption,
      pickupAddress: emptyToNull(state.delivery.pickupAddress),
      pickupLatitude: null,
      pickupLongitude: null,
      dropoffOption,
      dropoffAddress: emptyToNull(state.delivery.dropoffAddress),
      dropoffLatitude: null,
      dropoffLongitude: null,
    },
    addons: {
      cdwOption: mapCdwPlanToApi(state.addons.cdwPlan, apiVehicle),
      additionalDriverEnabled: additionalEnabled,
      helmetSize1: helmetRequired ? toHelmetSize(state.addons.helmetSize1) : null,
      helmetSize2: helmetRequired ? toHelmetSize(state.addons.helmetSize2) : null,
      storageBoxSelected: state.addons.storageBox === true,
    },
    customer: {
      fullName: state.customer.fullName.trim(),
      phone: state.customer.phone.trim(),
      email: state.customer.email.trim(),
      nationality: state.customer.nationality.trim(),
      dateOfBirth: state.customer.dateOfBirth.trim(),
      licenseCategory: state.customer.licenseCategory as BookingSubmissionInput["customer"]["licenseCategory"],
      specialNotes: emptyToNull(state.customer.specialNotes),
      licenseUploadPath: licensePath,
      passportUploadPath: passportPath,
      willPresentLicenseAtPickup: officePickup ? state.customer.licenseConfirmationCheckbox === true : false,
      willPresentIdAtPickup: officePickup ? state.customer.idConfirmationCheckbox === true : false,
    },
    additionalDriver: {
      fullName: additionalEnabled ? emptyToNull(state.additionalDriver.fullName) : null,
      phone: additionalEnabled ? emptyToNull(state.additionalDriver.phone) : null,
      email: additionalEnabled ? emptyToNull(state.additionalDriver.email) : null,
      nationality: additionalEnabled ? emptyToNull(state.additionalDriver.nationality) : null,
      dateOfBirth: additionalEnabled ? state.additionalDriver.dateOfBirth.trim() || null : null,
      licenseCategory: additionalEnabled
        ? ((state.additionalDriver.licenseCategory.trim() || null) as BookingSubmissionInput["additionalDriver"]["licenseCategory"])
        : null,
      licenseUploadPath: null,
      passportUploadPath: additionalEnabled ? additionalPassportPath : null,
      willPresentLicenseAtPickup: additionalEnabled && officePickup ? state.additionalDriver.officeIdConfirmed === true : false,
      willPresentIdAtPickup: additionalEnabled && officePickup ? state.additionalDriver.officeIdConfirmed === true : false,
    },
    deposit: {
      depositMethod,
    },
    consent: {
      termsAccepted: state.consent.termsAccepted === true,
      termsAcceptedAt: state.consent.termsAcceptedAt.trim().length > 0 ? state.consent.termsAcceptedAt.trim() : null,
    },
  };
}
