import { getVehicleBySlug } from "@/features/vehicles/data/vehicles";
import {
  INITIAL_BOOKING_FLOW_STATE,
  type BookingFlowState,
} from "@/features/booking-flow/lib/types";

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

export function buildBookingInitialState(selectedVehicleSlug?: string): BookingFlowState {
  const next = cloneInitialState();

  if (!selectedVehicleSlug) {
    return next;
  }

  const vehicle = getVehicleBySlug(selectedVehicleSlug);
  if (!vehicle) {
    return next;
  }

  next.rental.vehicleId = vehicle.slug;
  next.rental.vehicleSlug = vehicle.slug;
  next.rental.vehicleName = vehicle.name;
  next.rental.vehicleType = vehicle.type;
  return next;
}
