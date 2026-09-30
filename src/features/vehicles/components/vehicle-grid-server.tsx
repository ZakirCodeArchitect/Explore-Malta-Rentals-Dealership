import { Stagger, StaggerItem } from "@/components/motion/stagger";
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
    <Stagger
      className="grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3"
      step={0.06}
    >
      {vehicles.map((vehicle, index) => (
        <StaggerItem key={vehicle.slug} className="h-full" y={18}>
          <VehicleCardServer
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
        </StaggerItem>
      ))}
    </Stagger>
  );
}
