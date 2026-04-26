"use client";

import { useMemo } from "react";
import { differenceInCalendarDays, startOfDay } from "date-fns";
import { Car, Gauge, Palette, Users } from "lucide-react";
import Select, {
  components as selectComponents,
  type DropdownIndicatorProps,
} from "react-select";
import type { BookingOption } from "@/features/home/data/hero-booking-options";
import type {
  Transmission,
  VehicleColor,
  VehicleSeatsFilter,
  VehicleType,
} from "@/features/vehicles/data/vehicles";
import {
  VehiclePickupLocationField,
  vehicleFilterControlShellClass,
  vehicleFilterReactSelectStyles,
} from "@/features/vehicles/components/vehicle-pickup-fields";
import { TripDateSelector } from "@/features/vehicles/components/trip-date-selector";
import {
  getIndicativeMotorcycleScooterDailyRateEur,
  getIndicativeMotorcycleScooterTripTotalEur,
} from "@/features/booking/lib/indicative-motorcycle-scooter-rates";

type VehicleFiltersProps = Readonly<{
  pickupLocation: BookingOption | null;
  onPickupLocationChange: (value: BookingOption | null) => void;
  tripStart: Date;
  tripEnd: Date;
  onTripDatesChange: (start: Date, end: Date) => void;
  selectedType: VehicleType | "All";
  selectedTransmission: Transmission | "All";
  onTypeChange: (value: VehicleType | "All") => void;
  onTransmissionChange: (value: Transmission | "All") => void;
  selectedSeats: VehicleSeatsFilter;
  onSeatsChange: (value: VehicleSeatsFilter) => void;
  /** When true, seats are only in the sidebar (e.g. vehicles page rail). */
  hideSeatsFilter?: boolean;
  /** Below-lg vehicles listing: color filter in the card (with heading). */
  colorFilterOptions?: readonly (VehicleColor | "All")[];
  selectedColor?: VehicleColor | "All";
  onColorChange?: (value: VehicleColor | "All") => void;
  hotelDelivery: boolean;
  onHotelDeliveryChange: (value: boolean) => void;
  onClearFilters?: () => void;
  onSearch: () => void;
}>;

const TYPE_FILTER_OPTIONS: readonly BookingOption[] = [
  { value: "All", label: "All vehicles" },
  { value: "Scooter", label: "Scooters" },
  { value: "Motorcycle", label: "Motorcycles" },
  { value: "ATV", label: "ATVs" },
  { value: "Bicycle", label: "Bicycles" },
];

const TRANSMISSION_FILTER_OPTIONS: readonly BookingOption[] = [
  { value: "All", label: "All" },
  { value: "Automatic", label: "Automatic" },
  { value: "Manual", label: "Manual" },
];

const SEATS_FILTER_OPTIONS: readonly BookingOption[] = [
  { value: "All", label: "Any" },
  { value: "1", label: "1 seat" },
  { value: "2", label: "2 seats" },
  { value: "3", label: "3 seats" },
];

function optionByValue(
  options: readonly BookingOption[],
  value: string,
): BookingOption {
  return options.find((o) => o.value === value) ?? options[0]!;
}

function FilterDropdownIndicator(
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

const filterSelectComponents = {
  DropdownIndicator: FilterDropdownIndicator,
};

const filterCellClass =
  "flex min-w-0 w-full flex-col text-xs font-semibold text-slate-500";

const filterShellClass = vehicleFilterControlShellClass;

function VehicleFilterToggle({
  label,
  checked,
  onCheckedChange,
  switchId,
}: Readonly<{
  label: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  switchId: string;
}>) {
  return (
    <label
      htmlFor={switchId}
      className="inline-flex cursor-pointer items-center gap-3 select-none whitespace-nowrap"
    >
      <span className="text-sm font-semibold leading-none text-slate-700">
        {label}
      </span>
      <span
        className={[
          "relative box-border inline-block h-7 w-12 shrink-0 self-center rounded-full p-0.5 align-middle transition-colors duration-200",
          "focus-within:ring-2 focus-within:ring-[var(--brand-orange)] focus-within:ring-offset-2 focus-within:ring-offset-white",
          checked ? "bg-[var(--brand-orange)]" : "bg-slate-300/85",
        ].join(" ")}
      >
        <input
          id={switchId}
          type="checkbox"
          role="switch"
          checked={checked}
          aria-checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
          className="absolute inset-0 z-10 m-0 cursor-pointer opacity-0"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-0.5 top-1/2 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.2)]"
          style={{
            transform: checked
              ? "translate(1.5rem, -50%)"
              : "translate(0, -50%)",
            transition: "transform 200ms ease-out",
          }}
        />
      </span>
    </label>
  );
}

export function VehicleFilters({
  pickupLocation,
  onPickupLocationChange,
  tripStart,
  tripEnd,
  onTripDatesChange,
  selectedType,
  selectedTransmission,
  onTypeChange,
  onTransmissionChange,
  selectedSeats,
  onSeatsChange,
  hideSeatsFilter = false,
  colorFilterOptions,
  selectedColor,
  onColorChange,
  hotelDelivery,
  onHotelDeliveryChange,
  onClearFilters,
  onSearch,
}: VehicleFiltersProps) {
  const hasColorFilter =
    colorFilterOptions != null &&
    colorFilterOptions.length > 0 &&
    onColorChange != null &&
    selectedColor !== undefined;

  const colorSelectOptions = useMemo((): BookingOption[] => {
    if (!colorFilterOptions?.length) return [];
    return colorFilterOptions.map((c) =>
      c === "All"
        ? { value: "All", label: "Any color" }
        : { value: c, label: c },
    );
  }, [colorFilterOptions]);

  const mainGridClass = (() => {
    const n =
      4 +
      (hideSeatsFilter ? 0 : 1) +
      (hasColorFilter ? 1 : 0);
    if (n === 6) {
      return "grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3";
    }
    if (n === 5) {
      return "grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5";
    }
    return "grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";
  })();

  const durationDays = useMemo(
    () =>
      Math.max(
        1,
        differenceInCalendarDays(
          startOfDay(tripEnd),
          startOfDay(tripStart),
        ),
      ),
    [tripStart, tripEnd],
  );

  const indicativeDailyEur =
    getIndicativeMotorcycleScooterDailyRateEur(durationDays);
  const indicativeTripTotalEur =
    getIndicativeMotorcycleScooterTripTotalEur(durationDays);

  return (
    <section
      id="vehicle-trip-search"
      aria-label="Vehicle search"
      className="sticky top-18 z-20 scroll-mt-28 rounded-md border border-slate-200/75 bg-white/90 p-4 backdrop-blur-md md:p-5"
    >
      <div className={mainGridClass}>
        <div className="min-w-0">
          <VehiclePickupLocationField
            pickupLocation={pickupLocation}
            onPickupLocationChange={onPickupLocationChange}
          />
        </div>
        <div className="min-w-0">
          <TripDateSelector
            tripStart={tripStart}
            tripEnd={tripEnd}
            onRangeChange={onTripDatesChange}
          />
        </div>
          <label className={filterCellClass} htmlFor="vehicles-filter-type">
            Type
            <div className={filterShellClass}>
              <Car
                className="h-4 w-4 shrink-0 text-slate-600"
                aria-hidden
              />
              <Select<BookingOption, false>
                inputId="vehicles-filter-type"
                instanceId="vehicles-filter-type"
                aria-label="Vehicle type"
                value={optionByValue(TYPE_FILTER_OPTIONS, selectedType)}
                onChange={(opt) =>
                  opt && onTypeChange(opt.value as VehicleType | "All")
                }
                options={[...TYPE_FILTER_OPTIONS]}
                isSearchable={false}
                styles={vehicleFilterReactSelectStyles}
                components={filterSelectComponents}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
                className="min-w-0 flex-1"
                classNamePrefix="vehicle-filter-type"
              />
            </div>
          </label>

          <label
            className={filterCellClass}
            htmlFor="vehicles-filter-transmission"
          >
            Transmission
            <div className={filterShellClass}>
              <Gauge
                className="h-4 w-4 shrink-0 text-slate-600"
                aria-hidden
              />
              <Select<BookingOption, false>
                inputId="vehicles-filter-transmission"
                instanceId="vehicles-filter-transmission"
                aria-label="Transmission"
                value={optionByValue(
                  TRANSMISSION_FILTER_OPTIONS,
                  selectedTransmission,
                )}
                onChange={(opt) =>
                  opt &&
                  onTransmissionChange(opt.value as Transmission | "All")
                }
                options={[...TRANSMISSION_FILTER_OPTIONS]}
                isSearchable={false}
                styles={vehicleFilterReactSelectStyles}
                components={filterSelectComponents}
                menuPortalTarget={
                  typeof document !== "undefined" ? document.body : null
                }
                menuPosition="fixed"
                className="min-w-0 flex-1"
                classNamePrefix="vehicle-filter-transmission"
              />
            </div>
          </label>

          {!hideSeatsFilter ? (
            <label className={filterCellClass} htmlFor="vehicles-filter-seats">
              Seats
              <div className={filterShellClass}>
                <Users
                  className="h-4 w-4 shrink-0 text-slate-600"
                  aria-hidden
                />
                <Select<BookingOption, false>
                  inputId="vehicles-filter-seats"
                  instanceId="vehicles-filter-seats"
                  aria-label="Seats"
                  value={optionByValue(
                    SEATS_FILTER_OPTIONS,
                    selectedSeats === "All" ? "All" : String(selectedSeats),
                  )}
                  onChange={(opt) => {
                    if (!opt || typeof onSeatsChange !== "function") return;
                    const v = opt.value;
                    if (v === "All") onSeatsChange("All");
                    else onSeatsChange(Number(v) as 1 | 2 | 3);
                  }}
                  options={[...SEATS_FILTER_OPTIONS]}
                  isSearchable={false}
                  styles={vehicleFilterReactSelectStyles}
                  components={filterSelectComponents}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                  className="min-w-0 flex-1"
                  classNamePrefix="vehicle-filter-seats"
                />
              </div>
            </label>
          ) : null}

          {hasColorFilter ? (
            <label className={filterCellClass} htmlFor="vehicles-filter-color">
              Color
              <div className={filterShellClass}>
                <Palette
                  className="h-4 w-4 shrink-0 text-slate-600"
                  aria-hidden
                />
                <Select<BookingOption, false>
                  inputId="vehicles-filter-color"
                  instanceId="vehicles-filter-color"
                  aria-label="Color"
                  value={optionByValue(
                    colorSelectOptions,
                    selectedColor === "All" ? "All" : selectedColor,
                  )}
                  onChange={(opt) => {
                    if (!opt || !onColorChange) return;
                    onColorChange(opt.value as VehicleColor | "All");
                  }}
                  options={colorSelectOptions}
                  isSearchable={false}
                  styles={vehicleFilterReactSelectStyles}
                  components={filterSelectComponents}
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPosition="fixed"
                  className="min-w-0 flex-1"
                  classNamePrefix="vehicle-filter-color"
                />
              </div>
            </label>
          ) : null}
        </div>

        <div className="mt-4 border-t border-slate-200/80 pt-4">
          <div className="mb-3 min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {durationDays} day{durationDays === 1 ? "" : "s"}
              {pickupLocation?.label ? ` · Pickup: ${pickupLocation.label}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
              Indicative motorcycles/scooters total ~€{indicativeTripTotalEur}{" "}
              (€{indicativeDailyEur}/day × {durationDays}{" "}
              {durationDays === 1 ? "day" : "days"}) · Final price depends on
              vehicle and add-ons.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="group" aria-label="Booking options" className="min-w-0">
              <VehicleFilterToggle
                label="Need hotel delivery"
                switchId="vehicles-filter-hotel-delivery"
                checked={hotelDelivery}
                onCheckedChange={onHotelDeliveryChange}
              />
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              {onClearFilters ? (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="mr-1 text-sm font-semibold text-slate-600 underline-offset-4 transition-colors hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/35 sm:mr-2"
                >
                  Clear filters
                </button>
              ) : null}
              <button
                type="button"
                onClick={onSearch}
                className="group relative inline-flex min-h-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-md bg-[var(--brand-orange)] px-5 text-sm font-semibold tracking-[-0.02em] text-white shadow-[0_10px_28px_-10px_rgba(255,147,15,0.65)] transition-[box-shadow,transform,background-color] duration-200 hover:bg-[var(--brand-orange-strong)] hover:shadow-[0_14px_36px_-12px_rgba(255,147,15,0.55)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:min-h-[3rem] sm:min-w-[10.5rem] sm:px-7 sm:text-base"
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
        </div>
    </section>
  );
}
