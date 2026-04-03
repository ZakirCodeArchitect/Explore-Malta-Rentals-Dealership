"use client";

import { useMemo } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import AsyncSelect from "react-select/async";
import type { GroupBase, StylesConfig } from "react-select";
import {
  type BookingOption,
  locationOptions,
} from "@/features/home/data/hero-booking-options";
import { loadMaltaLocationOptions } from "@/features/vehicles/lib/malta-pickup-location";

/** Shared shell for all vehicle filter controls so boxes match size and alignment. */
export const vehicleFilterControlShellClass =
  "mt-2 flex w-full min-w-0 min-h-[2.625rem] items-center rounded-sm border border-slate-200 bg-white px-3 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.25)]";

const fieldWrapClass = vehicleFilterControlShellClass;

/** react-select menu + options — same look for location, type, and transmission. */
export const vehicleFilterReactSelectStyles: StylesConfig<
  BookingOption,
  false,
  GroupBase<BookingOption>
> = {
  container: (base) => ({
    ...base,
    width: "100%",
  }),
  control: (base) => ({
    ...base,
    border: "none",
    boxShadow: "none",
    minHeight: 36,
    minWidth: 0,
    width: "100%",
    alignItems: "center",
    background: "transparent",
    cursor: "pointer",
  }),
  valueContainer: (base) => ({ ...base, padding: 0 }),
  singleValue: (base) => ({
    ...base,
    margin: 0,
    color: "#0f172a",
    fontWeight: 600,
    fontSize: "0.875rem",
    lineHeight: 1.25,
  }),
  placeholder: (base) => ({
    ...base,
    margin: 0,
    color: "#64748b",
    fontWeight: 600,
    fontSize: "0.875rem",
    lineHeight: 1.25,
  }),
  indicatorsContainer: (base) => ({ ...base, gap: 2 }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#64748b",
    padding: 2,
    ":hover": { color: "#334155" },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 4,
    border: "1px solid rgba(58,124,165,0.28)",
    boxShadow: "0 20px 44px -25px rgba(15, 23, 42, 0.45)",
    overflow: "hidden",
    zIndex: 9999,
    marginTop: 8,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: 280,
    paddingTop: 4,
    paddingBottom: 4,
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "var(--brand-blue)"
      : state.isFocused
        ? "rgba(58, 124, 165, 0.12)"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#0f172a",
    ":active": {
      ...base[":active"],
      backgroundColor: state.isSelected
        ? "var(--brand-blue-strong)"
        : "rgba(58, 124, 165, 0.18)",
    },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

type VehiclePickupLocationFieldProps = Readonly<{
  pickupLocation: BookingOption | null;
  onPickupLocationChange: (option: BookingOption | null) => void;
}>;

export function VehiclePickupLocationField({
  pickupLocation,
  onPickupLocationChange,
}: VehiclePickupLocationFieldProps) {
  const defaultLocationOptions = useMemo(() => [...locationOptions], []);

  return (
    <label className="flex min-w-0 w-full flex-col text-sm font-semibold text-slate-700">
      Pick-up location
      <div className={fieldWrapClass}>
        <AsyncSelect
          className="w-full min-w-0"
          inputId="vehicles-pickup-location"
          instanceId="vehicles-pickup-location"
          value={pickupLocation}
          defaultOptions={defaultLocationOptions}
          loadOptions={loadMaltaLocationOptions}
          isSearchable
          onChange={(option) => onPickupLocationChange(option)}
          styles={vehicleFilterReactSelectStyles}
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
    </label>
  );
}

type VehiclePickupDateFieldProps = Readonly<{
  pickupDate: Date;
  onPickupDateChange: (date: Date) => void;
}>;

export function VehiclePickupDateField({
  pickupDate,
  onPickupDateChange,
}: VehiclePickupDateFieldProps) {
  const onDateChange = (value: Dayjs | null) => {
    if (!value) {
      return;
    }
    onPickupDateChange(value.toDate());
  };

  return (
    <label className="flex min-w-0 w-full flex-col text-sm font-semibold text-slate-700">
      Pick-up date
      <div className={fieldWrapClass}>
        <DatePicker
          value={dayjs(pickupDate)}
          onChange={onDateChange}
          minDate={dayjs("2026-06-01")}
          format="DD MMM YYYY"
          slotProps={{
            textField: {
              variant: "standard",
              InputProps: { disableUnderline: true },
              sx: {
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                "& .MuiInputBase-root": {
                  p: 0,
                  minHeight: 36,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#0f172a",
                  alignItems: "center",
                },
                "& .MuiInputBase-input": {
                  p: 0,
                  py: 0,
                  cursor: "pointer",
                },
                "& .MuiIconButton-root": {
                  color: "#64748b",
                  p: 0,
                },
                "& .MuiSvgIcon-root": {
                  fontSize: "1.1rem",
                },
              },
            },
            desktopPaper: {
              sx: {
                borderRadius: "4px",
                border: "1px solid rgba(58,124,165,0.32)",
                boxShadow: "0 24px 48px -30px rgba(15,23,42,0.55)",
              },
            },
          }}
        />
      </div>
    </label>
  );
}
