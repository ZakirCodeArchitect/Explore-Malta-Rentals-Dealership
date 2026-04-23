import {
  INITIAL_BOOKING_FLOW_STATE,
  type BookingFlowState,
} from "@/features/booking-flow/lib/types";

type InitialRentalState = {
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
};

function cloneInitialState(): BookingFlowState {
  return {
    ...INITIAL_BOOKING_FLOW_STATE,
    rental: { ...INITIAL_BOOKING_FLOW_STATE.rental },
    delivery: { ...INITIAL_BOOKING_FLOW_STATE.delivery },
    addons: { ...INITIAL_BOOKING_FLOW_STATE.addons },
    customer: { ...INITIAL_BOOKING_FLOW_STATE.customer },
    additionalDriver: { ...INITIAL_BOOKING_FLOW_STATE.additionalDriver },
    deposit: { ...INITIAL_BOOKING_FLOW_STATE.deposit },
    consent: { ...INITIAL_BOOKING_FLOW_STATE.consent },
  };
}

export function buildBookingInitialState(
  selectedVehicleSlug?: string,
  initialRental?: InitialRentalState,
): BookingFlowState {
  const next = cloneInitialState();

  if (!selectedVehicleSlug) {
    if (initialRental) {
      next.rental.pickupDate = initialRental.pickupDate ?? "";
      next.rental.pickupTime = initialRental.pickupTime ?? "";
      next.rental.returnDate = initialRental.returnDate ?? "";
      next.rental.returnTime = initialRental.returnTime ?? "";
    }
    return next;
  }

  next.rental.vehicleSlug = selectedVehicleSlug;
  if (initialRental) {
    next.rental.pickupDate = initialRental.pickupDate ?? "";
    next.rental.pickupTime = initialRental.pickupTime ?? "";
    next.rental.returnDate = initialRental.returnDate ?? "";
    next.rental.returnTime = initialRental.returnTime ?? "";
  }
  return next;
}
