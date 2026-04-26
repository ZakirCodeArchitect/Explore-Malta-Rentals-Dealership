import { differenceInHours, parse } from "date-fns";
import type { FieldPath } from "react-hook-form";
import { z } from "zod";
import { BOOKING_FLOW_STEPS, type BookingFlowStepId } from "@/features/booking-flow/lib/steps";
import { isLicenseAllowedForVehicle } from "@/features/booking-flow/lib/license-categories";
import type { BookingFlowState } from "@/features/booking-flow/lib/types";

export type BookingValidationMessages = Readonly<{
  vehicleTypeRequired: string;
  pickupOptionRequired: string;
  dropoffOptionRequired: string;
  fullNameRequired: string;
  phoneRequired: string;
  emailRequired: string;
  emailInvalid: string;
  nationalityRequired: string;
  dobRequired: string;
  pickupDateRequired: string;
  pickupTimeRequired: string;
  returnDateRequired: string;
  returnTimeRequired: string;
  minRental: string;
  maxRental: string;
  pickupAddressDelivery: string;
  dropoffAddressRequired: string;
  helmetSizesRequired: string;
  additionalDriverName: string;
  additionalDriverPhone: string;
  additionalDriverEmail: string;
  additionalDriverNationality: string;
  additionalDriverDob: string;
  additionalDriverLicense: string;
  additionalPassportDelivery: string;
  additionalOfficeConfirm: string;
  licenseCategoryRequired: string;
  licenseInvalidForVehicle: string;
  licenseUploadDelivery: string;
  passportUploadDelivery: string;
  confirmDocumentsPickup: string;
  depositMethodRequired: string;
  reviewFields: string;
}>;

function parseDateTime(date: string, time: string) {
  if (!date || !time) {
    return null;
  }

  const parsed = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hasText(value: string) {
  return value.trim().length > 0;
}

const requiredText = (message: string) => z.string().trim().min(1, message);

export function createBookingFlowSchema(m: BookingValidationMessages): z.ZodType<BookingFlowState> {
  const bookingBaseSchema: z.ZodType<BookingFlowState> = z.object({
    rental: z.object({
      vehicleId: z.string().nullable(),
      vehicleSlug: z.string(),
      vehicleName: z.string(),
      vehicleType: requiredText(m.vehicleTypeRequired),
      pickupDate: requiredText(m.pickupDateRequired),
      pickupTime: requiredText(m.pickupTimeRequired),
      returnDate: requiredText(m.returnDateRequired),
      returnTime: requiredText(m.returnTimeRequired),
      pricingAcknowledged: z.boolean(),
    }),
    delivery: z.object({
      pickupOption: z.enum(["office", "delivery"], {
        required_error: m.pickupOptionRequired,
      }),
      dropoffOption: z.enum(["office", "dropoff"], {
        required_error: m.dropoffOptionRequired,
      }),
      pickupAddress: z.string(),
      dropoffAddress: z.string(),
    }),
    addons: z.object({
      helmet: z.boolean(),
      helmetSize1: z.string(),
      helmetSize2: z.string(),
      additionalDriver: z.boolean(),
      storageBox: z.boolean(),
      cdw: z.boolean(),
      cdwPlan: z.enum(["none", "scooter_50", "scooter_125", "scooter_full", "atv_full"]),
    }),
    customer: z.object({
      fullName: requiredText(m.fullNameRequired),
      phone: requiredText(m.phoneRequired),
      email: z.string().trim().min(1, m.emailRequired).email(m.emailInvalid),
      nationality: requiredText(m.nationalityRequired),
      dateOfBirth: requiredText(m.dobRequired),
      licenseCategory: z.enum(["", "B", "AM", "A", "A1", "A2"]),
      driverLicenseUpload: z.string(),
      passportUpload: z.string(),
      licenseConfirmationCheckbox: z.boolean(),
      idConfirmationCheckbox: z.boolean(),
      specialNotes: z.string(),
    }),
    additionalDriver: z.object({
      fullName: z.string(),
      phone: z.string(),
      email: z.string(),
      nationality: z.string(),
      dateOfBirth: z.string(),
      licenseCategory: z.enum(["", "B", "AM", "A", "A1", "A2"]),
      passportIdUpload: z.string(),
      officeIdConfirmed: z.boolean(),
    }),
    deposit: z.object({
      depositMethod: z.enum(["", "online", "in_person"]),
    }),
    consent: z.object({
      summaryReviewed: z.boolean(),
      termsAccepted: z.boolean(),
      termsAcceptedAt: z.string(),
    }),
  });

  return bookingBaseSchema.superRefine((state, context) => {
    const pickup = parseDateTime(state.rental.pickupDate, state.rental.pickupTime);
    const dropoff = parseDateTime(state.rental.returnDate, state.rental.returnTime);

    if (pickup && dropoff) {
      const rentalHours = differenceInHours(dropoff, pickup);

      if (rentalHours < 24) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.minRental,
          path: ["rental", "returnTime"],
        });
      }

      if (rentalHours > 24 * 7 * 4) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.maxRental,
          path: ["rental", "returnDate"],
        });
      }
    }

    if (state.delivery.pickupOption === "delivery" && !hasText(state.delivery.pickupAddress)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: m.pickupAddressDelivery,
        path: ["delivery", "pickupAddress"],
      });
    }

    if (state.delivery.dropoffOption === "dropoff" && !hasText(state.delivery.dropoffAddress)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: m.dropoffAddressRequired,
        path: ["delivery", "dropoffAddress"],
      });
    }

    const selectedType = state.rental.vehicleType.trim().toLowerCase();
    const requiresHelmet =
      selectedType.includes("motorbike") ||
      selectedType.includes("atv") ||
      selectedType.includes("scooter") ||
      selectedType.includes("motorcycle");
    if (requiresHelmet && (!hasText(state.addons.helmetSize1) || !hasText(state.addons.helmetSize2))) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: m.helmetSizesRequired,
        path: ["addons", "helmetSize1"],
      });
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: m.helmetSizesRequired,
        path: ["addons", "helmetSize2"],
      });
    }

    if (state.addons.additionalDriver) {
      if (!hasText(state.additionalDriver.fullName)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.additionalDriverName,
          path: ["additionalDriver", "fullName"],
        });
      }
      if (!hasText(state.additionalDriver.phone)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.additionalDriverPhone,
          path: ["additionalDriver", "phone"],
        });
      }
      if (!hasText(state.additionalDriver.email)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.additionalDriverEmail,
          path: ["additionalDriver", "email"],
        });
      } else if (!z.string().email().safeParse(state.additionalDriver.email.trim()).success) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.emailInvalid,
          path: ["additionalDriver", "email"],
        });
      }
      if (!hasText(state.additionalDriver.nationality)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.additionalDriverNationality,
          path: ["additionalDriver", "nationality"],
        });
      }
      if (!hasText(state.additionalDriver.dateOfBirth)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.additionalDriverDob,
          path: ["additionalDriver", "dateOfBirth"],
        });
      }
      if (!hasText(state.additionalDriver.licenseCategory)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.additionalDriverLicense,
          path: ["additionalDriver", "licenseCategory"],
        });
      }
    }

    if (state.addons.additionalDriver && state.delivery.pickupOption === "delivery") {
      if (!hasText(state.additionalDriver.passportIdUpload)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.additionalPassportDelivery,
          path: ["additionalDriver", "passportIdUpload"],
        });
      }
    }

    if (state.addons.additionalDriver && state.delivery.pickupOption === "office" && !state.additionalDriver.officeIdConfirmed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: m.additionalOfficeConfirm,
        path: ["additionalDriver", "officeIdConfirmed"],
      });
    }

    if (!hasText(state.customer.licenseCategory)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: m.licenseCategoryRequired,
        path: ["customer", "licenseCategory"],
      });
    } else if (!isLicenseAllowedForVehicle(state.customer.licenseCategory, state.rental.vehicleType, state.rental.vehicleId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: m.licenseInvalidForVehicle,
        path: ["customer", "licenseCategory"],
      });
    }

    if (state.delivery.pickupOption === "delivery") {
      if (!hasText(state.customer.driverLicenseUpload)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.licenseUploadDelivery,
          path: ["customer", "driverLicenseUpload"],
        });
      }
      if (!hasText(state.customer.passportUpload)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: m.passportUploadDelivery,
          path: ["customer", "passportUpload"],
        });
      }
    } else if (!state.customer.licenseConfirmationCheckbox || !state.customer.idConfirmationCheckbox) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: m.confirmDocumentsPickup,
        path: ["customer", "licenseConfirmationCheckbox"],
      });
    }

    if (!hasText(state.deposit.depositMethod)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: m.depositMethodRequired,
        path: ["deposit", "depositMethod"],
      });
    }
  });
}

export const STEP_FIELD_PATHS: Record<BookingFlowStepId, FieldPath<BookingFlowState>[]> = {
  rental_details: [
    "rental.vehicleType",
    "rental.pickupDate",
    "rental.pickupTime",
    "rental.returnDate",
    "rental.returnTime",
  ],
  options_delivery: [
    "delivery.pickupOption",
    "delivery.dropoffOption",
    "delivery.pickupAddress",
    "delivery.dropoffAddress",
    "addons.helmetSize1",
    "addons.helmetSize2",
    "additionalDriver.fullName",
    "additionalDriver.phone",
    "additionalDriver.email",
    "additionalDriver.nationality",
    "additionalDriver.dateOfBirth",
    "additionalDriver.licenseCategory",
    "additionalDriver.passportIdUpload",
    "additionalDriver.officeIdConfirmed",
  ],
  your_information: [
    "customer.fullName",
    "customer.phone",
    "customer.email",
    "customer.nationality",
    "customer.dateOfBirth",
    "customer.licenseCategory",
    "customer.driverLicenseUpload",
    "customer.passportUpload",
    "customer.licenseConfirmationCheckbox",
    "customer.idConfirmationCheckbox",
  ],
  review_confirm: ["deposit.depositMethod"],
};

function issuePathToString(path: (string | number)[]) {
  return path.map((segment) => `${segment}`).join(".");
}

function includesPathPrefix(path: string, candidatePath: string) {
  return path === candidatePath || path.startsWith(`${candidatePath}.`);
}

export function getStepFirstError(
  schema: z.ZodType<BookingFlowState>,
  stepId: BookingFlowStepId,
  state: BookingFlowState,
): string | null {
  const result = schema.safeParse(state);
  if (result.success) {
    return null;
  }

  const trackedPaths = STEP_FIELD_PATHS[stepId];
  for (const issue of result.error.issues) {
    const issuePath = issuePathToString(issue.path);
    if (trackedPaths.some((path) => includesPathPrefix(issuePath, path))) {
      return issue.message;
    }
  }

  return null;
}

export function canAccessStep(
  schema: z.ZodType<BookingFlowState>,
  targetStepId: BookingFlowStepId,
  state: BookingFlowState,
): boolean {
  const targetIndex = BOOKING_FLOW_STEPS.findIndex((step) => step.id === targetStepId);
  if (targetIndex <= 0) {
    return true;
  }

  for (let index = 0; index < targetIndex; index += 1) {
    const priorStep = BOOKING_FLOW_STEPS[index];
    if (getStepFirstError(schema, priorStep.id, state)) {
      return false;
    }
  }

  return true;
}
