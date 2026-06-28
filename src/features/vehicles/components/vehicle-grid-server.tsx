import type { Vehicle } from "@/features/vehicles/data/vehicles";
import { VehicleCardServer } from "@/features/vehicles/components/vehicle-card-server";

type VehicleGridServerProps = Readonly<{
  vehicles: readonly Vehicle[];
  bookingHref?: string;
  detailsDateQuery?: string;
  tripDatesCommitted?: boolean;
  pickupDate?: string | null;
  returnDate?: string | null;
  pickupTime?: string | null;
  returnTime?: string | null;
}>;

export async function VehicleGridServer({
  vehicles,
  bookingHref = "/booking",
  detailsDateQuery = "",
  tripDatesCommitted = false,
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
}: VehicleGridServerProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle, index) => (
        <VehicleCardServer
          key={vehicle.slug}
          vehicle={vehicle}
          bookingHref={bookingHref}
          detailsHref={`/vehicles/${vehicle.slug}${detailsDateQuery}`}
          tripDatesCommitted={tripDatesCommitted}
          pickupDate={pickupDate}
          returnDate={returnDate}
          pickupTime={pickupTime}
          returnTime={returnTime}
          priorityImage={index < 2}
        />
      ))}
    </div>
  );
}
