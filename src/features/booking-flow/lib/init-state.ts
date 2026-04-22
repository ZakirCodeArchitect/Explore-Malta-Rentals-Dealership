import { getVehicleBySlug } from "@/features/vehicles/data/vehicles";
import {
  INITIAL_BOOKING_FLOW_STATE,
  type BookingFlowState,
} from "@/features/booking-flow/lib/types";

function cloneInitialState(): BookingFlowState {
  return {
    ...INITIAL_BOOKING_FLOW_STATE,
    vehicle: { ...INITIAL_BOOKING_FLOW_STATE.vehicle },
    rentalDates: { ...INITIAL_BOOKING_FLOW_STATE.rentalDates },
    pricing: { ...INITIAL_BOOKING_FLOW_STATE.pricing },
    pickupDropoff: { ...INITIAL_BOOKING_FLOW_STATE.pickupDropoff },
    addons: { ...INITIAL_BOOKING_FLOW_STATE.addons },
    customer: { ...INITIAL_BOOKING_FLOW_STATE.customer },
    additionalDriver: { ...INITIAL_BOOKING_FLOW_STATE.additionalDriver },
    securityDeposit: { ...INITIAL_BOOKING_FLOW_STATE.securityDeposit },
    summary: { ...INITIAL_BOOKING_FLOW_STATE.summary },
    terms: { ...INITIAL_BOOKING_FLOW_STATE.terms },
  };
}

export function buildBookingInitialState(selectedVehicleSlug?: string): BookingFlowState {
  const next = cloneInitialState();

  if (!selectedVehicleSlug) {
    return next;
  }

  const vehicle = getVehicleBySlug(selectedVehicleSlug);
  if (!vehicle) {
    return next;
  }

  next.vehicle.selectedVehicleId = vehicle.slug;
  next.vehicle.selectedVehicleSlug = vehicle.slug;
  next.vehicle.selectedVehicleName = vehicle.name;
  next.vehicle.selectedVehicleType = vehicle.type;
  return next;
}
