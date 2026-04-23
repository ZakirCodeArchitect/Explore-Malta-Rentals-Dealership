"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { addDays } from "date-fns";
import { TRIP_MIN_SPAN_DAYS } from "@/features/booking/lib/booking-schema";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IndicativeDailyRatesCard } from "@/components/pricing/indicative-daily-rates-card";
import { Container } from "@/components/ui/container";
import type { BookingOption } from "@/features/home/data/hero-booking-options";
import { LOGO_PATH } from "@/lib/site-brand-copy";
import { VehicleCard } from "@/features/vehicles/components/vehicle-card";
import { VehicleFilters } from "@/features/vehicles/components/vehicle-filters";
import { VehicleListingSidebar } from "@/features/vehicles/components/vehicle-listing-sidebar";
import { useVehicles } from "@/features/vehicles/lib/use-vehicles";
import type {
  Transmission,
  Vehicle,
  VehicleColor,
  VehicleSeatsFilter,
  VehicleType,
} from "@/features/vehicles/data/vehicles";
import {
  clampTripEndDate,
  formatPickupDateParam,
  parseCcSearchParam,
  parseColorSearchParam,
  parsePickupDateParam,
  parseSeatsSearchParam,
  parseTransmissionSearchParam,
  parseVehicleTypeSearchParam,
  seatsFilterToUrlParam,
  transmissionToUrlParam,
  vehicleColorToUrlParam,
  vehicleFilterTypeToUrlParam,
  type EngineCcFilter,
} from "@/features/vehicles/lib/booking-search-params";

/** Tailwind `lg` — sidebar rail visible; hero omits seats/color there. */
const LG_MIN_PX = 1024;
const DEFAULT_PICKUP_DATE = new Date(2026, 5, 12);
const DEFAULT_RETURN_DATE = addDays(DEFAULT_PICKUP_DATE, TRIP_MIN_SPAN_DAYS);

function subscribeMinWidthLg(onChange: () => void) {
  const mq = window.matchMedia(`(min-width: ${LG_MIN_PX}px)`);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMinWidthLgSnapshot() {
  return window.matchMedia(`(min-width: ${LG_MIN_PX}px)`).matches;
}

function useIsLgViewport() {
  return useSyncExternalStore(
    subscribeMinWidthLg,
    getMinWidthLgSnapshot,
    () => false,
  );
}

type VehicleListingShellProps = Readonly<{
  vehicles?: readonly Vehicle[];
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
  const shouldFetchFromApi = !vehicles;
  const {
    vehicles: apiVehicles,
    isLoading: isVehiclesLoading,
    error: vehiclesError,
  } = useVehicles({ enabled: shouldFetchFromApi });
  const vehicleDataset = vehicles ?? apiVehicles;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const transmissionParam = searchParams.get("transmission");
  const colorParam = searchParams.get("color");
  const seatsParam = searchParams.get("seats");
  const locationParam = searchParams.get("location");
  const dateParam = searchParams.get("date");
  const returnDateParam = searchParams.get("returnDate");
  /** From booking form `buildVehiclesSearchUrl` — fallback when `date` / `returnDate` absent. */
  const pickupDateParam = searchParams.get("pickupDate");
  const dropoffDateParam = searchParams.get("dropoffDate");
  const hotelDeliveryParam = searchParams.get("hotelDelivery");
  const ccParam = searchParams.get("cc");

  const initialType = parseVehicleTypeSearchParam(typeParam);
  const initialTransmission =
    parseTransmissionSearchParam(transmissionParam);
  const initialColor = parseColorSearchParam(colorParam);
  const initialSeats = parseSeatsSearchParam(seatsParam);
  const initialPickup =
    parsePickupDateParam(dateParam) ??
    parsePickupDateParam(pickupDateParam) ??
    DEFAULT_PICKUP_DATE;
  const parsedReturn =
    parsePickupDateParam(returnDateParam) ??
    parsePickupDateParam(dropoffDateParam);
  const initialReturn = parsedReturn
    ? clampTripEndDate(initialPickup, parsedReturn)
    : addDays(initialPickup, TRIP_MIN_SPAN_DAYS);
  const initialLocation: BookingOption | null = locationParam
    ? { value: `url:${locationParam}`, label: locationParam }
    : null;

  const [pickupLocation, setPickupLocation] = useState<BookingOption | null>(
    initialLocation,
  );
  const [pickupDate, setPickupDate] = useState<Date>(initialPickup);
  const [returnDate, setReturnDate] = useState<Date>(initialReturn);
  const [selectedType, setSelectedType] =
    useState<VehicleType | "All">(initialType);
  const [selectedTransmission, setSelectedTransmission] =
    useState<Transmission | "All">(initialTransmission);
  const [selectedColor, setSelectedColor] = useState<VehicleColor | "All">(
    initialColor,
  );
  const [selectedSeats, setSelectedSeats] =
    useState<VehicleSeatsFilter>(initialSeats);

  const [appliedType, setAppliedType] =
    useState<VehicleType | "All">(initialType);
  const [appliedTransmission, setAppliedTransmission] =
    useState<Transmission | "All">(initialTransmission);
  const [appliedColor, setAppliedColor] =
    useState<VehicleColor | "All">(initialColor);
  const [appliedSeats, setAppliedSeats] =
    useState<VehicleSeatsFilter>(initialSeats);
  const [appliedCc, setAppliedCc] = useState<EngineCcFilter>(() =>
    parseCcSearchParam(ccParam),
  );

  const [hotelDelivery, setHotelDelivery] = useState(
    hotelDeliveryParam === "1",
  );

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

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
    const tr = parseTransmissionSearchParam(transmissionParam);
    setSelectedTransmission(tr);
    setAppliedTransmission(tr);
  }, [transmissionParam]);

  useEffect(() => {
    const c = parseColorSearchParam(colorParam);
    setSelectedColor(c);
    setAppliedColor(c);
  }, [colorParam]);

  useEffect(() => {
    const s = parseSeatsSearchParam(seatsParam);
    setSelectedSeats(s);
    setAppliedSeats(s);
  }, [seatsParam]);

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
    const pu =
      parsePickupDateParam(dateParam) ??
      parsePickupDateParam(pickupDateParam);
    const ret =
      parsePickupDateParam(returnDateParam) ??
      parsePickupDateParam(dropoffDateParam);
    if (pu) {
      setPickupDate(pu);
      setReturnDate(
        ret ? clampTripEndDate(pu, ret) : addDays(pu, TRIP_MIN_SPAN_DAYS),
      );
    }
  }, [
    dateParam,
    returnDateParam,
    pickupDateParam,
    dropoffDateParam,
  ]);

  useEffect(() => {
    setHotelDelivery(hotelDeliveryParam === "1");
  }, [hotelDeliveryParam]);

  useEffect(() => {
    setAppliedCc(parseCcSearchParam(ccParam));
  }, [ccParam]);

  const handlePickupLocationChange = useCallback(
    (option: BookingOption | null) => {
      setPickupLocation(option);
    },
    [],
  );

  const handleTripDatesChange = useCallback((start: Date, end: Date) => {
    setPickupDate(start);
    setReturnDate(end);
  }, []);

  const persistListingFilters = useCallback(
    (next: {
      type?: VehicleType | "All";
      transmission?: Transmission | "All";
      color?: VehicleColor | "All";
      seats?: VehicleSeatsFilter;
    }) => {
      const t = next.type ?? selectedType;
      const tr = next.transmission ?? selectedTransmission;
      const c = next.color ?? selectedColor;
      const s = next.seats ?? selectedSeats;
      setSelectedType(t);
      setAppliedType(t);
      setSelectedTransmission(tr);
      setAppliedTransmission(tr);
      setSelectedColor(c);
      setAppliedColor(c);
      setSelectedSeats(s);
      setAppliedSeats(s);
      replaceQuery((p) => {
        p.set("type", vehicleFilterTypeToUrlParam(t));
        p.set("transmission", transmissionToUrlParam(tr));
        p.set("color", vehicleColorToUrlParam(c));
        p.set("seats", seatsFilterToUrlParam(s));
      });
    },
    [replaceQuery, selectedColor, selectedSeats, selectedTransmission, selectedType],
  );

  const handleSearchResults = useCallback(() => {
    setAppliedType(selectedType);
    setAppliedTransmission(selectedTransmission);
    setAppliedColor(selectedColor);
    setAppliedSeats(selectedSeats);
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 220);
    replaceQuery((p) => {
      p.set("type", vehicleFilterTypeToUrlParam(selectedType));
      p.set("transmission", transmissionToUrlParam(selectedTransmission));
      p.set("color", vehicleColorToUrlParam(selectedColor));
      p.set("seats", seatsFilterToUrlParam(selectedSeats));
      if (pickupLocation?.label) {
        p.set("location", pickupLocation.label);
      } else {
        p.delete("location");
      }
      p.set("date", formatPickupDateParam(pickupDate));
      p.set("returnDate", formatPickupDateParam(returnDate));
      p.delete("pickupDate");
      p.delete("dropoffDate");
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
  }, [
    hotelDelivery,
    pickupDate,
    returnDate,
    pickupLocation,
    replaceQuery,
    selectedColor,
    selectedSeats,
    selectedTransmission,
    selectedType,
  ]);

  const handleClearFilters = useCallback(() => {
    setPickupLocation(null);
    setPickupDate(DEFAULT_PICKUP_DATE);
    setReturnDate(DEFAULT_RETURN_DATE);
    setHotelDelivery(false);
    setSelectedType("All");
    setAppliedType("All");
    setSelectedTransmission("All");
    setAppliedTransmission("All");
    setSelectedColor("All");
    setAppliedColor("All");
    setSelectedSeats("All");
    setAppliedSeats("All");
    setAppliedCc("All");
    setIsRefreshing(false);
    replaceQuery((p) => {
      p.set("type", vehicleFilterTypeToUrlParam("All"));
      p.set("transmission", transmissionToUrlParam("All"));
      p.set("color", vehicleColorToUrlParam("All"));
      p.set("seats", seatsFilterToUrlParam("All"));
      p.delete("location");
      p.delete("date");
      p.delete("returnDate");
      p.delete("pickupDate");
      p.delete("dropoffDate");
      p.delete("hotelDelivery");
      p.delete("returnElsewhere");
      p.delete("cc");
    });
  }, [replaceQuery]);

  const vehicleListingColorOptions = useMemo(() => {
    const unique = new Set<VehicleColor>();
    for (const v of vehicleDataset) {
      unique.add(v.color);
    }
    const sorted = [...unique].sort((a, b) => a.localeCompare(b));
    return ["All" as const, ...sorted];
  }, [vehicleDataset]);

  const filteredVehicles = useMemo(() => {
    const typeFiltered =
      appliedType === "All"
        ? vehicleDataset
        : vehicleDataset.filter((vehicle) => vehicle.type === appliedType);
    const transmissionFiltered =
      appliedTransmission === "All"
        ? typeFiltered
        : typeFiltered.filter(
            (vehicle) => vehicle.transmission === appliedTransmission,
          );
    const colorFiltered =
      appliedColor === "All"
        ? transmissionFiltered
        : transmissionFiltered.filter(
            (vehicle) => vehicle.color === appliedColor,
          );
    const seatsFiltered =
      appliedSeats === "All"
        ? colorFiltered
        : colorFiltered.filter((vehicle) => vehicle.seats === appliedSeats);

    const ccFiltered =
      appliedCc === "All"
        ? seatsFiltered
        : seatsFiltered.filter((vehicle) =>
            appliedCc === "50"
              ? /\b50cc\b/i.test(vehicle.engine)
              : /\b125cc\b/i.test(vehicle.engine),
          );

    return [...ccFiltered];
  }, [
    vehicleDataset,
    appliedCc,
    appliedColor,
    appliedSeats,
    appliedType,
    appliedTransmission,
  ]);

  const showListingSidebar = pathname === "/vehicles";
  const isLg = useIsLgViewport();
  const hideSeatsInHero = showListingSidebar && isLg;
  const showListingExtrasInHero = showListingSidebar && !isLg;

  const filters = (
    <VehicleFilters
      pickupLocation={pickupLocation}
      onPickupLocationChange={handlePickupLocationChange}
      tripStart={pickupDate}
      tripEnd={returnDate}
      onTripDatesChange={handleTripDatesChange}
      selectedType={selectedType}
      selectedTransmission={selectedTransmission}
      onTypeChange={(v) => persistListingFilters({ type: v })}
      onTransmissionChange={(v) => persistListingFilters({ transmission: v })}
      selectedSeats={selectedSeats}
      onSeatsChange={(v) => persistListingFilters({ seats: v })}
      hideSeatsFilter={hideSeatsInHero}
      colorFilterOptions={
        showListingExtrasInHero ? vehicleListingColorOptions : undefined
      }
      selectedColor={showListingExtrasInHero ? selectedColor : undefined}
      onColorChange={
        showListingExtrasInHero
          ? (v: VehicleColor | "All") => persistListingFilters({ color: v })
          : undefined
      }
      hotelDelivery={hotelDelivery}
      onHotelDeliveryChange={setHotelDelivery}
      onClearFilters={handleClearFilters}
      onSearch={handleSearchResults}
    />
  );

  const listingSidebar = showListingSidebar ? (
    <VehicleListingSidebar
      variant="rail"
      collapsed={filtersCollapsed}
      onToggleCollapsed={() => setFiltersCollapsed((c) => !c)}
      colorOptions={vehicleListingColorOptions}
      selectedType={selectedType}
      onTypeChange={(v) => persistListingFilters({ type: v })}
      selectedTransmission={selectedTransmission}
      onTransmissionChange={(v) => persistListingFilters({ transmission: v })}
      selectedColor={selectedColor}
      onColorChange={(v) => persistListingFilters({ color: v })}
      selectedSeats={selectedSeats}
      onSeatsChange={(v) => persistListingFilters({ seats: v })}
    />
  ) : null;

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
      ) : shouldFetchFromApi && isVehiclesLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="h-48 animate-pulse rounded-xl bg-slate-200/75" />
              <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-slate-200/75" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200/65" />
              <div className="mt-5 h-9 w-1/2 animate-pulse rounded-full bg-slate-200/75" />
            </div>
          ))}
        </div>
      ) : shouldFetchFromApi && vehiclesError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-rose-900">Unable to load vehicles</h3>
          <p className="mt-2 text-sm text-rose-800">{vehiclesError}</p>
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard key={vehicle.slug} vehicle={vehicle} />
          ))}
        </div>
      ) : vehicleDataset.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No vehicles available right now</h3>
          <p className="mt-2 text-sm text-slate-600">Please check back shortly for newly listed rentals.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">
            No exact match found
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Try another type, transmission, seats, or color.
          </p>
        </div>
      )}
    </div>
  );

  if (heroIntro) {
    const heroSection = (
      <section
        aria-labelledby="vehicles-heading"
        className="relative isolate overflow-hidden pb-12 pt-28 sm:pb-14 sm:pt-32"
      >
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b1624]">
            <Image
              src={LOGO_PATH}
              alt=""
              width={480}
              height={96}
              className="h-auto w-[min(88%,26rem)] max-w-full object-contain opacity-[0.38]"
              style={{ height: "auto" }}
              priority={false}
            />
          </div>
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
    );

    const resultsBlock = (
      <Container className="pb-16 pt-8">
        {results}
        <div className="mt-10 w-full border-t border-slate-200/80 pt-10">
          <section aria-label="Indicative daily rates">
            <p className="max-w-2xl text-base leading-relaxed text-slate-600">
              Ballpark per-calendar-day amounts for motorcycles and scooters before
              extras, use these as a guide while you search.
            </p>
            <div className="mt-8 w-full">
              <IndicativeDailyRatesCard />
            </div>
          </section>
        </div>
      </Container>
    );

    if (listingSidebar) {
      return (
        <div className="flex w-full flex-col lg:flex-row lg:items-stretch">
          <aside
            aria-label="Vehicle filters"
            className={[
              "vehicle-filters-rail order-2 hidden w-full shrink-0 flex-col border-t border-slate-200/80 bg-gradient-to-b from-white to-[#f7fbfe] transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex lg:order-1 lg:border-t-0 lg:border-r lg:border-slate-200/50 lg:shadow-[inset_-1px_0_0_rgba(15,23,42,0.04)] lg:backdrop-blur-sm",
              filtersCollapsed
                ? "lg:w-12 lg:max-w-12 lg:min-w-12"
                : "lg:w-[min(15.5rem,calc(100vw-1rem))] lg:max-w-[15.5rem]",
            ].join(" ")}
          >
            <div
              className={[
                "px-4 py-6 sm:px-4 sm:py-6 lg:sticky lg:top-[var(--site-header-offset)] lg:z-[1] lg:max-h-[calc(100dvh-var(--site-header-offset))] lg:overflow-y-auto lg:overscroll-contain",
                filtersCollapsed
                  ? "lg:px-2 lg:pt-3 lg:pb-5"
                  : "lg:px-4 lg:pt-4 lg:pb-7",
              ].join(" ")}
            >
              {listingSidebar}
            </div>
          </aside>
          <div className="order-1 flex min-w-0 flex-1 flex-col lg:order-2">
            {heroSection}
            {resultsBlock}
          </div>
        </div>
      );
    }

    return (
      <>
        {heroSection}
        {resultsBlock}
      </>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {listingSidebar ? (
        <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-0">
          <aside
            aria-label="Vehicle filters"
            className={[
              "vehicle-filters-rail order-2 hidden w-full shrink-0 flex-col border-t border-slate-200/80 bg-gradient-to-b from-white to-[#f7fbfe] transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex lg:order-1 lg:border-t-0 lg:border-r lg:border-slate-200/50 lg:shadow-[inset_-1px_0_0_rgba(15,23,42,0.04)] lg:backdrop-blur-sm",
              filtersCollapsed
                ? "lg:w-12 lg:max-w-12 lg:min-w-12"
                : "lg:w-[min(15.5rem,calc(100vw-1rem))] lg:max-w-[15.5rem]",
            ].join(" ")}
          >
            <div
              className={[
                "px-4 py-6 sm:px-4 sm:py-6 lg:sticky lg:top-[var(--site-header-offset)] lg:z-[1] lg:max-h-[calc(100dvh-var(--site-header-offset))] lg:overflow-y-auto lg:overscroll-contain",
                filtersCollapsed
                  ? "lg:px-2 lg:pt-3 lg:pb-5"
                  : "lg:px-4 lg:pt-4 lg:pb-7",
              ].join(" ")}
            >
              {listingSidebar}
            </div>
          </aside>
          <div className="order-1 flex min-w-0 flex-1 flex-col gap-6 lg:order-2">
            {filters}
            {results}
          </div>
        </div>
      ) : (
        <>
          {filters}
          {results}
        </>
      )}
    </div>
  );
}
