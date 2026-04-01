"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/container";
import type { BookingOption } from "@/features/home/data/hero-booking-options";
import { emptyParkingBackdropPath } from "@/features/home/data/hero-content";
import { VehicleCard } from "@/features/vehicles/components/vehicle-card";
import { VehicleFilters } from "@/features/vehicles/components/vehicle-filters";
import type { Transmission, Vehicle, VehicleType } from "@/features/vehicles/data/vehicles";
import {
  formatPickupDateParam,
  parsePickupDateParam,
  parseVehicleTypeSearchParam,
  vehicleFilterTypeToUrlParam,
} from "@/features/vehicles/lib/booking-search-params";

type VehicleListingShellProps = Readonly<{
  vehicles: readonly Vehicle[];
  /** When set, title + filters sit in a bounded band with backdrop; grid sits on page background below. */
  heroIntro?: Readonly<{
    title: string;
    description: string;
  }>;
}>;

export function VehicleListingShell({
  vehicles,
  heroIntro,
}: VehicleListingShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const locationParam = searchParams.get("location");
  const dateParam = searchParams.get("date");
  const hotelDeliveryParam = searchParams.get("hotelDelivery");

  const initialType = parseVehicleTypeSearchParam(typeParam);
  const initialDate = parsePickupDateParam(dateParam) ?? new Date(2026, 5, 12);
  const initialLocation: BookingOption | null = locationParam
    ? { value: `url:${locationParam}`, label: locationParam }
    : null;

  const [pickupLocation, setPickupLocation] = useState<BookingOption | null>(
    initialLocation,
  );
  const [pickupDate, setPickupDate] = useState<Date>(initialDate);
  const [selectedType, setSelectedType] =
    useState<VehicleType | "All">(initialType);
  const [selectedTransmission, setSelectedTransmission] =
    useState<Transmission | "All">("All");

  const [appliedType, setAppliedType] =
    useState<VehicleType | "All">(initialType);
  const [appliedTransmission, setAppliedTransmission] =
    useState<Transmission | "All">("All");

  const [hotelDelivery, setHotelDelivery] = useState(
    hotelDeliveryParam === "1",
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const replaceQuery = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString());
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const t = parseVehicleTypeSearchParam(typeParam);
    setSelectedType(t);
    setAppliedType(t);
  }, [typeParam]);

  useEffect(() => {
    if (locationParam) {
      const loc = {
        value: `url:${locationParam}`,
        label: locationParam,
      };
      setPickupLocation(loc);
    } else {
      setPickupLocation(null);
    }
  }, [locationParam]);

  useEffect(() => {
    const parsed = parsePickupDateParam(dateParam);
    if (parsed) {
      setPickupDate(parsed);
    }
  }, [dateParam]);

  useEffect(() => {
    setHotelDelivery(hotelDeliveryParam === "1");
  }, [hotelDeliveryParam]);

  const handlePickupLocationChange = useCallback(
    (option: BookingOption | null) => {
      setPickupLocation(option);
    },
    [],
  );

  const handlePickupDateChange = useCallback((date: Date) => {
    setPickupDate(date);
  }, []);

  const handleTypeChange = useCallback((value: VehicleType | "All") => {
    setSelectedType(value);
  }, []);

  const handleTransmissionChange = useCallback(
    (value: Transmission | "All") => {
      setSelectedTransmission(value);
    },
    [],
  );

  const handleSearchResults = useCallback(() => {
    setAppliedType(selectedType);
    setAppliedTransmission(selectedTransmission);
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 220);
    replaceQuery((p) => {
      p.set("type", vehicleFilterTypeToUrlParam(selectedType));
      if (pickupLocation?.label) {
        p.set("location", pickupLocation.label);
      } else {
        p.delete("location");
      }
      p.set("date", formatPickupDateParam(pickupDate));
      p.delete("returnElsewhere");
      if (hotelDelivery) {
        p.set("hotelDelivery", "1");
      } else {
        p.delete("hotelDelivery");
      }
    });
    requestAnimationFrame(() => {
      document
        .getElementById("vehicle-listing-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [hotelDelivery, pickupDate, pickupLocation, replaceQuery, selectedTransmission, selectedType]);

  const filteredVehicles = useMemo(() => {
    const typeFiltered =
      appliedType === "All"
        ? vehicles
        : vehicles.filter((vehicle) => vehicle.type === appliedType);
    const transmissionFiltered =
      appliedTransmission === "All"
        ? typeFiltered
        : typeFiltered.filter(
            (vehicle) => vehicle.transmission === appliedTransmission,
          );

    return [...transmissionFiltered];
  }, [vehicles, appliedType, appliedTransmission]);

  const filters = (
    <VehicleFilters
      pickupLocation={pickupLocation}
      onPickupLocationChange={handlePickupLocationChange}
      pickupDate={pickupDate}
      onPickupDateChange={handlePickupDateChange}
      selectedType={selectedType}
      selectedTransmission={selectedTransmission}
      onTypeChange={handleTypeChange}
      onTransmissionChange={handleTransmissionChange}
      hotelDelivery={hotelDelivery}
      onHotelDeliveryChange={setHotelDelivery}
      onSearch={handleSearchResults}
    />
  );

  const results = (
    <div id="vehicle-listing-results" className="space-y-6 scroll-mt-28">
      <p className="text-sm text-slate-600">
        Showing{" "}
        <span className="font-semibold text-slate-900">
          {filteredVehicles.length}
        </span>{" "}
        vehicles
      </p>

      {isRefreshing ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="h-48 animate-pulse rounded-xl bg-slate-200/75" />
              <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-slate-200/75" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200/65" />
              <div className="mt-5 h-9 w-1/2 animate-pulse rounded-full bg-slate-200/75" />
            </div>
          ))}
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No exact match found
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Try another type or transmission.
          </p>
        </div>
      )}
    </div>
  );

  if (heroIntro) {
    return (
      <>
        <section
          aria-labelledby="vehicles-heading"
          className="relative isolate overflow-hidden pb-12 pt-28 sm:pb-14 sm:pt-32"
        >
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
            <div
              className="absolute inset-0 bg-cover bg-[center_40%] bg-no-repeat"
              style={{
                backgroundImage: `url("${emptyParkingBackdropPath}")`,
              }}
            />
            <div className="absolute inset-0 bg-slate-950/35" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.72)_0%,rgba(15,23,42,0.38)_55%,rgba(15,23,42,0.12)_100%)]" />
          </div>
          <Container className="relative z-10">
            <h1
              id="vehicles-heading"
              className="text-4xl font-semibold tracking-[-0.04em] text-white drop-shadow-[0_1px_24px_rgba(15,23,42,0.35)] sm:text-5xl"
            >
              {heroIntro.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/90 sm:text-lg">
              {heroIntro.description}
            </p>
            <div className="mt-8">{filters}</div>
          </Container>
        </section>
        <Container className="pb-16 pt-8">{results}</Container>
      </>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {filters}
      {results}
    </div>
  );
}
