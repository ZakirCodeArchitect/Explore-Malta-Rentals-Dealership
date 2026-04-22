import { differenceInHours, parse } from "date-fns";
import {
  BOOKING_FLOW_STEPS,
  type BookingFlowSectionId,
  type BookingFlowStepId,
} from "@/features/booking-flow/lib/steps";
import { isLicenseAllowedForVehicle } from "@/features/booking-flow/lib/license-categories";
import type { BookingFlowState } from "@/features/booking-flow/lib/types";

function parseDateTime(date: string, time: string) {
  if (!date || !time) {
    return null;
  }

  const parsed = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function asTrimmed(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateSection(
  sectionId: BookingFlowSectionId,
  state: BookingFlowState,
): string | null {
  const pickupDropoff = state.pickupDropoff;
  const addons = state.addons;
  const customer = state.customer;
  const additionalDriver = state.additionalDriver;

  switch (sectionId) {
    case "select_vehicle":
      return state.vehicle.selectedVehicleId ? null : "Please select a vehicle to continue.";
    case "rental_dates": {
      const pickup = parseDateTime(state.rentalDates.pickupDate, state.rentalDates.pickupTime);
      const dropoff = parseDateTime(state.rentalDates.returnDate, state.rentalDates.returnTime);

      if (!pickup || !dropoff) {
        return "Please choose both pickup and return date/time.";
      }

      const hours = differenceInHours(dropoff, pickup);
      if (hours <= 0) {
        return "Return date/time must be after pickup date/time.";
      }
      return null;
    }
    case "pricing":
      return state.pricing.acknowledged ? null : "Please confirm you reviewed pricing information.";
    case "pickup_dropoff":
      if (!pickupDropoff.pickupType || !pickupDropoff.dropoffType) {
        return "Please choose pickup and drop-off preferences.";
      }
      if (
        pickupDropoff.pickupType === "delivery" &&
        !asTrimmed(pickupDropoff.pickupAddress)
      ) {
        return "Pickup delivery requires a pickup address.";
      }
      if (
        pickupDropoff.dropoffType === "delivery" &&
        !asTrimmed(pickupDropoff.dropoffAddress)
      ) {
        return "Delivery drop-off requires a drop-off address.";
      }
      return null;
    case "addons":
      if (
        addons.helmet &&
        (!asTrimmed(addons.helmetSize1) || !asTrimmed(addons.helmetSize2))
      ) {
        return "Helmet selection requires both helmet sizes.";
      }
      if (addons.additionalDriver) {
        if (pickupDropoff.pickupType === "delivery") {
          if (!asTrimmed(additionalDriver.passportIdUploadName)) {
            return "Additional driver requires passport/ID upload for delivery pickup.";
          }
        } else if (!additionalDriver.officeIdConfirmed) {
          return "Confirm that additional driver ID will be shown in person at office pickup.";
        }
      }
      return null;
    case "customer_details":
      if (
        !asTrimmed(customer.fullName) ||
        !asTrimmed(customer.email) ||
        !asTrimmed(customer.phone) ||
        !asTrimmed(customer.nationality) ||
        !customer.dob ||
        !customer.licenseCategory
      ) {
        return "Please complete all required customer details.";
      }

      if (
        !isLicenseAllowedForVehicle(
          customer.licenseCategory,
          state.vehicle.selectedVehicleId,
        )
      ) {
        return "Selected license category does not match the selected vehicle.";
      }

      if (pickupDropoff.pickupType === "delivery") {
        if (!asTrimmed(customer.licenseUploadName) || !asTrimmed(customer.idUploadName)) {
          return "Delivery requires both license and ID uploads.";
        }
      } else if (
        !customer.officeLicenseConfirmed ||
        !customer.officeIdConfirmed
      ) {
        return "Office pickup requires both confirmation checkboxes.";
      }

      if (addons.additionalDriver) {
        if (
          !additionalDriver ||
          !asTrimmed(additionalDriver.fullName) ||
          !asTrimmed(additionalDriver.phone) ||
          !asTrimmed(additionalDriver.email) ||
          !asTrimmed(additionalDriver.nationality) ||
          !additionalDriver.dob ||
          !additionalDriver.licenseCategory
        ) {
          return "Please complete additional driver details.";
        }

        if (pickupDropoff.pickupType === "delivery") {
          if (!asTrimmed(additionalDriver.passportIdUploadName)) {
            return "Additional driver requires passport/ID upload for delivery.";
          }
        } else if (!additionalDriver.officeIdConfirmed) {
          return "Confirm that additional driver ID will be shown in person.";
        }
      }

      return null;
    case "security_deposit":
      return state.securityDeposit.method ? null : "Please choose a security deposit method.";
    case "booking_summary":
      return state.summary.reviewed ? null : "Please confirm that you reviewed the booking summary.";
    case "terms_conditions":
      return state.terms.accepted ? null : "Please accept terms and conditions before submitting.";
    default:
      return null;
  }
}

export function validateUserStep(stepId: BookingFlowStepId, state: BookingFlowState): string | null {
  const step = BOOKING_FLOW_STEPS.find((item) => item.id === stepId);
  if (!step) {
    return null;
  }

  for (const sectionId of step.sections) {
    const error = validateSection(sectionId, state);
    if (error) {
      return error;
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
    if (validateUserStep(priorStep.id, state)) {
      return false;
    }
  }

  return true;
}
