import { combineDateAndTime } from "@/lib/booking/bookingSubmissionSchema";
import { batchCheckVehicleAvailabilityForList } from "@/lib/availability/batchCheckVehicleAvailabilityForList";
import type { VehicleAvailabilityResult } from "@/lib/availability/types";
import type { VehicleListItemDto, VehicleRentalWindowStatus } from "@/lib/vehicles/types";

function holdsOnlyConflict(result: VehicleAvailabilityResult): boolean {
  return (
    result.conflictingReservationHolds.length > 0 &&
    result.conflictingBookings.length === 0 &&
    result.conflictingBlocks.length === 0
  );
}

function classifyRentalWindow(
  result: VehicleAvailabilityResult,
  viewerSessionKey: string | undefined,
): VehicleRentalWindowStatus {
  if (result.isAvailable) {
    return "available";
  }
  if (!holdsOnlyConflict(result)) {
    return "unavailable";
  }
  if (
    viewerSessionKey &&
    result.conflictingReservationHolds.length > 0 &&
    result.conflictingReservationHolds.every((h) => h.sessionKey === viewerSessionKey)
  ) {
    return "reserved_you";
  }
  return "reserved_other";
}

export type EnrichVehicleListRentalWindowInput = {
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  viewerSessionKey?: string | null;
};

export async function enrichVehicleListWithRentalWindow(
  vehicles: VehicleListItemDto[],
  input: EnrichVehicleListRentalWindowInput,
): Promise<VehicleListItemDto[]> {
  const pickupDate = input.pickupDate.trim();
  const pickupTime = input.pickupTime.trim();
  const returnDate = input.returnDate.trim();
  const returnTime = input.returnTime.trim();

  const requestedStart = combineDateAndTime(pickupDate, pickupTime);
  const requestedEnd = combineDateAndTime(returnDate, returnTime);
  if (!requestedStart || !requestedEnd || requestedStart >= requestedEnd) {
    return vehicles;
  }

  const viewerSessionKey = input.viewerSessionKey?.trim() || undefined;

  const availabilityById = await batchCheckVehicleAvailabilityForList(
    vehicles,
    requestedStart,
    requestedEnd,
  );

  return vehicles.map((vehicle) => {
    const result = availabilityById.get(vehicle.id) ?? {
      isAvailable: false,
      conflictingBookings: [],
      conflictingBlocks: [],
      conflictingReservationHolds: [],
      reason: "Selected vehicle does not exist",
    };
    return {
      ...vehicle,
      rentalWindowStatus: classifyRentalWindow(result, viewerSessionKey),
    };
  });
}
