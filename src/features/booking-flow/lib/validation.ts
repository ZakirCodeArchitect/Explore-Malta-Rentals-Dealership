import { differenceInHours, parse } from "date-fns";
import type { FieldPath } from "react-hook-form";
import { z } from "zod";
import { BOOKING_FLOW_STEPS, type BookingFlowStepId } from "@/features/booking-flow/lib/steps";
import { isLicenseAllowedForVehicle } from "@/features/booking-flow/lib/license-categories";
import type { BookingFlowState } from "@/features/booking-flow/lib/types";

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

const bookingBaseSchema: z.ZodType<BookingFlowState> = z.object({
  rental: z.object({
    vehicleId: z.string().nullable(),
    vehicleSlug: z.string(),
    vehicleName: z.string(),
    vehicleType: requiredText("Vehicle type is required"),
    pickupDate: requiredText("Pickup date is required"),
    pickupTime: requiredText("Pickup time is required"),
    returnDate: requiredText("Return date is required"),
    returnTime: requiredText("Return time is required"),
    pricingAcknowledged: z.boolean(),
  }),
  delivery: z.object({
    pickupOption: z.enum(["office", "delivery"], {
      required_error: "Pickup option is required",
    }),
    dropoffOption: z.enum(["office", "dropoff"], {
      required_error: "Drop-off option is required",
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
    fullName: requiredText("Full name is required"),
    phone: requiredText("Phone is required"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
    nationality: requiredText("Nationality is required"),
    dateOfBirth: requiredText("Date of birth is required"),
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

export const bookingFlowSchema = bookingBaseSchema.superRefine((state, context) => {
  const pickup = parseDateTime(state.rental.pickupDate, state.rental.pickupTime);
  const dropoff = parseDateTime(state.rental.returnDate, state.rental.returnTime);

  if (pickup && dropoff) {
    const rentalHours = differenceInHours(dropoff, pickup);

    if (rentalHours < 24) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum rental is 24 hours",
        path: ["rental", "returnTime"],
      });
    }

    if (rentalHours > 24 * 7 * 4) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum rental is 4 weeks",
        path: ["rental", "returnDate"],
      });
    }
  }

  if (state.delivery.pickupOption === "delivery" && !hasText(state.delivery.pickupAddress)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pickup address is required for delivery",
      path: ["delivery", "pickupAddress"],
    });
  }

  if (state.delivery.dropoffOption === "dropoff" && !hasText(state.delivery.dropoffAddress)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Drop-off address is required",
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
      message: "Helmet sizes are required",
      path: ["addons", "helmetSize1"],
    });
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Helmet sizes are required",
      path: ["addons", "helmetSize2"],
    });
  }

  if (state.addons.additionalDriver) {
    if (!hasText(state.additionalDriver.fullName)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Full name is required",
        path: ["additionalDriver", "fullName"],
      });
    }
    if (!hasText(state.additionalDriver.phone)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Phone is required",
        path: ["additionalDriver", "phone"],
      });
    }
    if (!hasText(state.additionalDriver.email)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Email is required",
        path: ["additionalDriver", "email"],
      });
    } else if (!z.string().email().safeParse(state.additionalDriver.email.trim()).success) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid email",
        path: ["additionalDriver", "email"],
      });
    }
    if (!hasText(state.additionalDriver.nationality)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Nationality is required",
        path: ["additionalDriver", "nationality"],
      });
    }
    if (!hasText(state.additionalDriver.dateOfBirth)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date of birth is required",
        path: ["additionalDriver", "dateOfBirth"],
      });
    }
    if (!hasText(state.additionalDriver.licenseCategory)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "License category is required",
        path: ["additionalDriver", "licenseCategory"],
      });
    }
  }

  if (state.addons.additionalDriver && state.delivery.pickupOption === "delivery") {
    if (!hasText(state.additionalDriver.passportIdUpload)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passport/ID upload is required for the additional driver when delivery is selected",
        path: ["additionalDriver", "passportIdUpload"],
      });
    }
  }

  if (state.addons.additionalDriver && state.delivery.pickupOption === "office" && !state.additionalDriver.officeIdConfirmed) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please confirm the additional driver will present ID and licence at pickup",
      path: ["additionalDriver", "officeIdConfirmed"],
    });
  }

  if (!hasText(state.customer.licenseCategory)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "License category is required",
      path: ["customer", "licenseCategory"],
    });
  } else if (!isLicenseAllowedForVehicle(state.customer.licenseCategory, state.rental.vehicleType, state.rental.vehicleId)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid license for selected vehicle",
      path: ["customer", "licenseCategory"],
    });
  }

  if (state.delivery.pickupOption === "delivery") {
    if (!hasText(state.customer.driverLicenseUpload)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "License upload required for delivery",
        path: ["customer", "driverLicenseUpload"],
      });
    }
    if (!hasText(state.customer.passportUpload)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passport/ID upload required for delivery",
        path: ["customer", "passportUpload"],
      });
    }
  } else if (!state.customer.licenseConfirmationCheckbox || !state.customer.idConfirmationCheckbox) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please confirm you will present documents at pickup",
      path: ["customer", "licenseConfirmationCheckbox"],
    });
  }

  if (!hasText(state.deposit.depositMethod)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Deposit method is required",
      path: ["deposit", "depositMethod"],
    });
  }

});

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

export function getStepFirstError(stepId: BookingFlowStepId, state: BookingFlowState): string | null {
  const result = bookingFlowSchema.safeParse(state);
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

export function canAccessStep(targetStepId: BookingFlowStepId, state: BookingFlowState): boolean {
  const targetIndex = BOOKING_FLOW_STEPS.findIndex((step) => step.id === targetStepId);
  if (targetIndex <= 0) {
    return true;
  }

  for (let index = 0; index < targetIndex; index += 1) {
    const priorStep = BOOKING_FLOW_STEPS[index];
    if (getStepFirstError(priorStep.id, state)) {
      return false;
    }
  }

  return true;
}
