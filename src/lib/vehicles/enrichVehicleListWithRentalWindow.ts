import { combineDateAndTime } from "@/lib/booking/bookingSubmissionSchema";
import { checkVehicleAvailability } from "@/lib/availability";
import type { VehicleListItemDto, VehicleRentalWindowStatus } from "@/lib/vehicles/types";

function holdsOnlyConflict(
  result: Awaited<ReturnType<typeof checkVehicleAvailability>>,
): boolean {
  return (
    result.conflictingReservationHolds.length > 0 &&
    result.conflictingBookings.length === 0 &&
    result.conflictingBlocks.length === 0
  );
}

function classifyRentalWindow(
  result: Awaited<ReturnType<typeof checkVehicleAvailability>>,
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

  return Promise.all(
    vehicles.map(async (vehicle) => {
      const result = await checkVehicleAvailability({
        vehicleId: vehicle.id,
        vehicleType: vehicle.vehicleType,
        requestedStart,
        requestedEnd,
      });
      return {
        ...vehicle,
        rentalWindowStatus: classifyRentalWindow(result, viewerSessionKey),
      };
    }),
  );
}
