export const VEHICLE_DELETE_BLOCKED_REASONS = {
  HAS_BOOKINGS: "HAS_BOOKINGS",
  HAS_RESERVATION_HOLDS: "HAS_RESERVATION_HOLDS",
  HAS_AVAILABILITY_BLOCKS: "HAS_AVAILABILITY_BLOCKS",
} as const;

export type VehicleDeleteBlockedReason =
  (typeof VEHICLE_DELETE_BLOCKED_REASONS)[keyof typeof VEHICLE_DELETE_BLOCKED_REASONS];

export type VehicleRelationCounts = {
  bookings: number;
  reservationHolds: number;
  availabilityBlocks: number;
};

export function vehicleDeleteBlockedReasons(
  counts: VehicleRelationCounts,
): VehicleDeleteBlockedReason[] {
  const reasons: VehicleDeleteBlockedReason[] = [];

  if (counts.bookings > 0) {
    reasons.push(VEHICLE_DELETE_BLOCKED_REASONS.HAS_BOOKINGS);
  }
  if (counts.reservationHolds > 0) {
    reasons.push(VEHICLE_DELETE_BLOCKED_REASONS.HAS_RESERVATION_HOLDS);
  }
  if (counts.availabilityBlocks > 0) {
    reasons.push(VEHICLE_DELETE_BLOCKED_REASONS.HAS_AVAILABILITY_BLOCKS);
  }

  return reasons;
}

export function vehicleCanDelete(counts: VehicleRelationCounts): boolean {
  return vehicleDeleteBlockedReasons(counts).length === 0;
}
