export { checkVehicleAvailability } from "@/lib/availability/checkVehicleAvailability";
export { checkVehicleTypeAvailability } from "@/lib/availability/checkVehicleTypeAvailability";
export { findConflictingBlocks } from "@/lib/availability/findConflictingBlocks";
export { findConflictingBookings } from "@/lib/availability/findConflictingBookings";
export { BLOCKING_BOOKING_STATUSES } from "@/lib/availability/types";
export type {
  CheckVehicleAvailabilityInput,
} from "@/lib/availability/checkVehicleAvailability";
export type { CheckVehicleTypeAvailabilityInput } from "@/lib/availability/checkVehicleTypeAvailability";
export type { FindConflictingBlocksInput } from "@/lib/availability/findConflictingBlocks";
export type { FindConflictingBookingsInput } from "@/lib/availability/findConflictingBookings";
export type {
  AvailabilityDbClient,
  AvailabilityWindow,
  ConflictingAvailabilityBlock,
  ConflictingBooking,
  VehicleAvailabilityResult,
  VehicleTypeAvailabilityResult,
} from "@/lib/availability/types";
