import type {
  Transmission,
  Vehicle,
  VehicleColor,
  VehicleSeatsFilter,
  VehicleType,
} from "@/features/vehicles/data/vehicles";
import {
  parseCcSearchParam,
  parseColorSearchParam,
  parseSeatsSearchParam,
  parseTransmissionSearchParam,
  parseVehicleTypeSearchParam,
  type EngineCcFilter,
} from "@/features/vehicles/lib/booking-search-params";

type FilterVehiclesInput = Readonly<{
  vehicles: readonly Vehicle[];
  type?: VehicleType | "All";
  transmission?: Transmission | "All";
  color?: VehicleColor | "All";
  seats?: VehicleSeatsFilter;
  cc?: EngineCcFilter;
}>;

export function filterVehicles({
  vehicles,
  type = "All",
  transmission = "All",
  color = "All",
  seats = "All",
  cc = "All",
}: FilterVehiclesInput): Vehicle[] {
  const typeFiltered =
    type === "All" ? vehicles : vehicles.filter((vehicle) => vehicle.type === type);
  const transmissionFiltered =
    transmission === "All"
      ? typeFiltered
      : typeFiltered.filter((vehicle) => vehicle.transmission === transmission);
  const colorFiltered =
    color === "All"
      ? transmissionFiltered
      : transmissionFiltered.filter((vehicle) => vehicle.color === color);
  const seatsFiltered =
    seats === "All"
      ? colorFiltered
      : colorFiltered.filter((vehicle) => vehicle.seats === seats);

  if (cc === "All") {
    return [...seatsFiltered];
  }

  return seatsFiltered.filter((vehicle) =>
    cc === "50" ? /\b50cc\b/i.test(vehicle.engine) : /\b125cc\b/i.test(vehicle.engine),
  );
}

export function filterVehiclesFromSearchParams(
  vehicles: readonly Vehicle[],
  searchParams: Record<string, string | string[] | undefined>,
): Vehicle[] {
  const typeParam = searchParams.type;
  const transmissionParam = searchParams.transmission;
  const colorParam = searchParams.color;
  const seatsParam = searchParams.seats;
  const ccParam = searchParams.cc;

  return filterVehicles({
    vehicles,
    type: parseVehicleTypeSearchParam(
      typeof typeParam === "string" ? typeParam : null,
    ),
    transmission: parseTransmissionSearchParam(
      typeof transmissionParam === "string" ? transmissionParam : null,
    ),
    color: parseColorSearchParam(typeof colorParam === "string" ? colorParam : null),
    seats: parseSeatsSearchParam(typeof seatsParam === "string" ? seatsParam : null),
    cc: parseCcSearchParam(typeof ccParam === "string" ? ccParam : null),
  });
}
