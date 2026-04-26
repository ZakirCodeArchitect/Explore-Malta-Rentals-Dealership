"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { addDays } from "date-fns";
import AsyncSelect from "react-select/async";
import { Car, MapPin } from "lucide-react";
import Select, {
  components as selectComponents,
  type DropdownIndicatorProps,
} from "react-select";
import {
  type BookingOption,
  locationOptions,
  vehicleTypeOptions,
} from "@/features/home/data/hero-booking-options";
import { SITE_SURFACE_RADIUS } from "@/components/site-shell";
import { TRIP_MIN_SPAN_DAYS } from "@/features/booking/lib/booking-schema";
import {
  vehicleFilterControlShellClass,
  vehicleFilterReactSelectStyles,
} from "@/features/vehicles/components/vehicle-pickup-fields";
import { TripDateSelector } from "@/features/vehicles/components/trip-date-selector";
import { formatPickupDateParam } from "@/features/vehicles/lib/booking-search-params";
import { loadMaltaLocationOptions } from "@/features/vehicles/lib/malta-pickup-location";

const DEFAULT_HERO_PICKUP_DATE = new Date(2026, 5, 12);

function Toggle({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className="inline-flex items-center gap-3 text-left text-sm font-medium text-slate-700"
    >
      <span>{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${
          active ? "bg-[var(--brand-orange)]" : "bg-slate-200"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function HeroFilterDropdownIndicator(
  props: DropdownIndicatorProps<BookingOption, false>,
) {
  return (
    <selectComponents.DropdownIndicator {...props}>
      <span className="shrink-0 text-xs font-semibold text-slate-500">
        Change
      </span>
    </selectComponents.DropdownIndicator>
  );
}

const heroSelectComponents = {
  DropdownIndicator: HeroFilterDropdownIndicator,
};

export function HeroBookingPanel() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<BookingOption | null>(
    null,
  );
  const [vehicleType, setVehicleType] = useState<BookingOption>(
    vehicleTypeOptions[0]!,
  );
  const [pickupDate, setPickupDate] = useState<Date>(DEFAULT_HERO_PICKUP_DATE);
  const [returnDate, setReturnDate] = useState<Date>(() =>
    addDays(DEFAULT_HERO_PICKUP_DATE, TRIP_MIN_SPAN_DAYS),
  );
  const [returnElsewhere, setReturnElsewhere] = useState(false);
  const [hotelDelivery, setHotelDelivery] = useState(true);

  useEffect(() => {
    startTransition(() => {
      setIsMounted(true);
    });
  }, []);

  const fieldClassName =
    "relative min-w-0 flex min-h-[5.25rem] flex-col justify-between rounded-lg bg-[var(--hero-field-bg)] px-4 py-3.5 text-left ring-1 ring-slate-200/40 sm:min-h-[5.4rem]";

  const maltaDefaultLocationOptions = useMemo(
    () => [...locationOptions],
    [],
  );

  const handleTripDatesChange = useCallback((start: Date, end: Date) => {
    setPickupDate(start);
    setReturnDate(end);
  }, []);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    params.set("type", vehicleType.value);
    if (pickupLocation?.label) {
      params.set("location", pickupLocation.label);
    }
    params.set("date", formatPickupDateParam(pickupDate));
    params.set("returnDate", formatPickupDateParam(returnDate));
    params.set("returnElsewhere", returnElsewhere ? "1" : "0");
    params.set("hotelDelivery", hotelDelivery ? "1" : "0");
    router.push(`/vehicles?${params.toString()}`);
  }, [
    hotelDelivery,
    pickupDate,
    returnDate,
    pickupLocation,
    returnElsewhere,
    router,
    vehicleType.value,
  ]);

  const panelShellClass = [
    "overflow-hidden border border-slate-200/70 bg-[var(--surface-card)] p-5 text-slate-950 shadow-[0_28px_70px_-48px_rgba(15,34,53,0.45)] sm:p-6 lg:p-8",
    SITE_SURFACE_RADIUS,
  ].join(" ");

  if (!isMounted) {
    return (
      <div id="booking-preview" className={panelShellClass}>
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="min-h-[5.25rem] rounded-lg bg-[var(--hero-field-bg)] ring-1 ring-slate-200/40 sm:min-h-[5.4rem] lg:col-span-2" />
          <div className="min-h-[5.25rem] rounded-lg bg-[var(--hero-field-bg)] ring-1 ring-slate-200/40 sm:min-h-[5.4rem] lg:col-span-1" />
          <div className="min-h-[5.25rem] rounded-lg bg-[var(--hero-field-bg)] ring-1 ring-slate-200/40 sm:min-h-[5.4rem] lg:col-span-1" />
        </div>
        <div className="mt-5 min-h-11 border-t border-slate-200/80 pt-5" />
      </div>
    );
  }

  return (
    <div id="booking-preview" className={panelShellClass}>
      <div className="grid gap-3 sm:gap-3.5 lg:grid-cols-4">
        <div className={`${fieldClassName} lg:col-span-2`}>
          <span className="text-xs font-semibold text-slate-500">
            Pick-up location
          </span>
          <div className={vehicleFilterControlShellClass}>
            <MapPin
              className="h-4 w-4 shrink-0 text-slate-600"
              aria-hidden
            />
            <AsyncSelect
              inputId="pickup-location"
              instanceId="pickup-location"
              className="min-w-0 flex-1"
              value={pickupLocation}
              defaultOptions={maltaDefaultLocationOptions}
              loadOptions={loadMaltaLocationOptions}
              isSearchable
              onChange={(option) => setPickupLocation(option)}
              styles={vehicleFilterReactSelectStyles}
              components={heroSelectComponents}
              menuPortalTarget={
                typeof window !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
              placeholder="enter your location"
              noOptionsMessage={({ inputValue }) => {
                const q = inputValue.trim();
                if (!q) return null;
                return `No locations match "${q}"`;
              }}
              loadingMessage={() => "Searching locations..."}
              cacheOptions
              aria-label="Pick-up location"
            />
          </div>
        </div>

        <div className={`${fieldClassName} lg:col-span-1`}>
          <span className="text-xs font-semibold text-slate-500">
            Vehicle type
          </span>
          <div className={vehicleFilterControlShellClass}>
            <Car
              className="h-4 w-4 shrink-0 text-slate-600"
              aria-hidden
            />
            <Select<BookingOption, false>
              inputId="vehicle-type"
              instanceId="vehicle-type"
              className="min-w-0 flex-1"
              value={vehicleType}
              onChange={(option) => option && setVehicleType(option)}
              options={[...vehicleTypeOptions]}
              isSearchable={false}
              styles={vehicleFilterReactSelectStyles}
              components={heroSelectComponents}
              menuPortalTarget={
                typeof window !== "undefined" ? document.body : null
              }
              menuPosition="fixed"
              aria-label="Vehicle type"
            />
          </div>
        </div>

        <div className={`${fieldClassName} lg:col-span-1`}>
          <TripDateSelector
            tripStart={pickupDate}
            tripEnd={returnDate}
            onRangeChange={handleTripDatesChange}
            className="flex min-h-0 flex-1 flex-col justify-between"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-10">
          <Toggle
            label="Return elsewhere"
            active={returnElsewhere}
            onToggle={() => setReturnElsewhere((previous) => !previous)}
          />
          <Toggle
            label="Need hotel delivery"
            active={hotelDelivery}
            onToggle={() => setHotelDelivery((previous) => !previous)}
          />
        </div>

        <button
          type="button"
          onClick={handleSearch}
          className="group relative inline-flex min-h-[2.75rem] shrink-0 items-center justify-center gap-2 self-end rounded-lg bg-[var(--brand-orange)] px-5 text-sm font-semibold tracking-[-0.02em] text-white shadow-[0_10px_28px_-10px_rgba(255,147,15,0.65)] transition-[box-shadow,transform,background-color] duration-200 hover:bg-[var(--brand-orange-strong)] hover:shadow-[0_14px_36px_-12px_rgba(255,147,15,0.55)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:min-h-[3rem] sm:min-w-[10.5rem] sm:self-auto sm:px-7 sm:text-base"
        >
          Search
          <span
            aria-hidden="true"
            className="inline-flex transition-transform duration-200 ease-out group-hover:translate-x-0.5"
          >
            <svg
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}
