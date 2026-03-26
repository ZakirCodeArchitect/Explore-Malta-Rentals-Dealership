"use client";

import { useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { addDays, format } from "date-fns";
import dayjs, { type Dayjs } from "dayjs";
import AsyncSelect from "react-select/async";
import Select, { type StylesConfig } from "react-select";
import {
  type BookingOption,
} from "@/features/home/data/hero-booking-options";

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 text-slate-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

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
        className={`relative inline-flex h-6 w-11 items-center rounded-full p-1 transition ${
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

export function HeroBookingPanel() {
  const [isMounted, setIsMounted] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<BookingOption>({
    value: "pieta",
    label: "Pietà, Malta",
  });
  const [pickupTime, setPickupTime] = useState<Dayjs | null>(
    dayjs("2026-06-12T10:00:00"),
  );
  const [returnTime, setReturnTime] = useState<Dayjs | null>(
    dayjs("2026-06-19T14:00:00"),
  );
  const [pickupDate, setPickupDate] = useState<Date>(new Date(2026, 5, 12));
  const [returnDate, setReturnDate] = useState<Date>(new Date(2026, 5, 19));
  const [returnElsewhere, setReturnElsewhere] = useState(false);
  const [hotelDelivery, setHotelDelivery] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const selectStyles: StylesConfig<BookingOption, false> = {
    control: (base) => ({
      ...base,
      border: "none",
      boxShadow: "none",
      minHeight: 28,
      background: "transparent",
      cursor: "pointer",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: 0,
    }),
    singleValue: (base) => ({
      ...base,
      margin: 0,
      color: "#0f172a",
      fontWeight: 600,
      fontSize: "0.95rem",
      letterSpacing: "-0.01em",
    }),
    indicatorsContainer: (base) => ({
      ...base,
      gap: 2,
    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#64748b",
      padding: 2,
      ":hover": { color: "#334155" },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 12,
      border: "1px solid rgba(58,124,165,0.28)",
      boxShadow: "0 20px 44px -25px rgba(15, 23, 42, 0.45)",
      overflow: "hidden",
      zIndex: 9999,
      marginTop: 8,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: 220,
      paddingTop: 4,
      paddingBottom: 4,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.92rem",
      background: state.isFocused ? "rgba(58,124,165,0.1)" : "#ffffff",
      color: "#0f172a",
      cursor: "pointer",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const fieldClassName =
    "relative min-w-0 flex min-h-[5.4rem] flex-col justify-between rounded-xl bg-[var(--surface-soft)] px-4 py-3.5 text-left";

  const loadGlobalLocationOptions = async (
    inputValue: string,
  ): Promise<BookingOption[]> => {
    const query = inputValue.trim();

    if (query.length < 2) {
      return [];
    }

    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query,
        )}&count=8&language=en&format=json`,
      );

      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as {
        results?: Array<{
          id: number;
          name: string;
          admin1?: string;
          country?: string;
          latitude: number;
          longitude: number;
        }>;
      };

      return (payload.results ?? []).map((item) => ({
        value: String(item.id),
        label: [item.name, item.admin1, item.country].filter(Boolean).join(", "),
      }));
    } catch {
      return [];
    }
  };

  const onPickupDateChange = (value: Dayjs | null) => {
    if (!value) {
      return;
    }
    const nextPickupDate = value.toDate();
    setPickupDate(nextPickupDate);
    if (nextPickupDate > returnDate) {
      setReturnDate(addDays(nextPickupDate, 1));
    }
  };

  const onReturnDateChange = (value: Dayjs | null) => {
    if (!value) {
      return;
    }
    setReturnDate(value.toDate());
  };

  if (!isMounted) {
    return (
      <div
        id="booking-preview"
        className="rounded-[0.65rem] border border-[color:color-mix(in_srgb,var(--brand-blue)_20%,white)] bg-white/95 p-4 text-slate-950 shadow-[0_30px_90px_-45px_rgba(58,124,165,0.45)] backdrop-blur-md sm:p-5 lg:rounded-[0.75rem] lg:p-6"
      >
        <div className="grid gap-3 lg:grid-cols-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`booking-skeleton-${index}`}
              className={`min-h-[5.4rem] rounded-xl bg-[var(--surface-soft)] ${
                index === 0 ? "lg:col-span-2" : "lg:col-span-1"
              }`}
            />
          ))}
        </div>
        <div className="mt-4 min-h-11 border-t border-slate-200 pt-4" />
      </div>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div
        id="booking-preview"
        className="rounded-[0.65rem] border border-[color:color-mix(in_srgb,var(--brand-blue)_20%,white)] bg-white/95 p-4 text-slate-950 shadow-[0_30px_90px_-45px_rgba(58,124,165,0.45)] backdrop-blur-md sm:p-5 lg:rounded-[0.75rem] lg:p-6"
      >
      <div className="grid gap-3 lg:grid-cols-6">
        <div className={`${fieldClassName} lg:col-span-2`}>
          <span className="text-xs font-medium text-slate-500">Pick-up location</span>
          <AsyncSelect
            inputId="pickup-location"
            instanceId="pickup-location"
            value={pickupLocation}
            defaultOptions={false}
            loadOptions={loadGlobalLocationOptions}
            isSearchable
            onChange={(option) => option && setPickupLocation(option)}
            styles={selectStyles}
            menuPortalTarget={typeof window !== "undefined" ? document.body : null}
            menuPosition="fixed"
            placeholder="Search any city or location (min. 2 letters)"
            noOptionsMessage={({ inputValue }) =>
              inputValue.length < 2
                ? "Type at least 2 letters"
                : `No results for "${inputValue}"`
            }
            loadingMessage={() => "Searching locations..."}
            cacheOptions
            aria-label="Pick-up location"
          />
        </div>

        <div className={`${fieldClassName} lg:col-span-1`}>
          <span className="text-xs font-medium text-slate-500">Pick-up date</span>
          <DatePicker
            value={dayjs(pickupDate)}
            onChange={onPickupDateChange}
            minDate={dayjs("2026-06-01")}
            format="DD MMM YYYY"
            slotProps={{
              textField: {
                variant: "standard",
                InputProps: { disableUnderline: true },
                sx: {
                  "& .MuiInputBase-root": {
                    p: 0,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "#0f172a",
                  },
                  "& .MuiInputBase-input": {
                    p: 0,
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
                  borderRadius: "14px",
                  border: "1px solid rgba(58,124,165,0.32)",
                  boxShadow: "0 24px 48px -30px rgba(15,23,42,0.55)",
                },
              },
            }}
          />
        </div>

          <div className={`${fieldClassName} lg:col-span-1`}>
            <span className="text-xs font-medium text-slate-500">Time</span>
            <TimePicker
              value={pickupTime}
              onChange={setPickupTime}
              views={["hours", "minutes"]}
              slotProps={{
                textField: {
                  variant: "standard",
                  InputProps: { disableUnderline: true },
                  sx: {
                    "& .MuiInputBase-root": {
                      p: 0,
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "#0f172a",
                    },
                    "& .MuiInputBase-input": {
                      p: 0,
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
                    borderRadius: "14px",
                    border: "1px solid rgba(58,124,165,0.32)",
                    boxShadow: "0 24px 48px -30px rgba(15,23,42,0.55)",
                  },
                },
              }}
            />
          </div>

        <div className={`${fieldClassName} lg:col-span-1`}>
          <span className="text-xs font-medium text-slate-500">Return date</span>
          <DatePicker
            value={dayjs(returnDate)}
            onChange={onReturnDateChange}
            minDate={dayjs(addDays(pickupDate, 1))}
            format="DD MMM YYYY"
            slotProps={{
              textField: {
                variant: "standard",
                InputProps: { disableUnderline: true },
                sx: {
                  "& .MuiInputBase-root": {
                    p: 0,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: "#0f172a",
                  },
                  "& .MuiInputBase-input": {
                    p: 0,
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
                  borderRadius: "14px",
                  border: "1px solid rgba(58,124,165,0.32)",
                  boxShadow: "0 24px 48px -30px rgba(15,23,42,0.55)",
                },
              },
            }}
          />
        </div>

          <div className={`${fieldClassName} lg:col-span-1`}>
            <span className="text-xs font-medium text-slate-500">Time</span>
            <TimePicker
              value={returnTime}
              onChange={setReturnTime}
              views={["hours", "minutes"]}
              slotProps={{
                textField: {
                  variant: "standard",
                  InputProps: { disableUnderline: true },
                  sx: {
                    "& .MuiInputBase-root": {
                      p: 0,
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "#0f172a",
                    },
                    "& .MuiInputBase-input": {
                      p: 0,
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
                    borderRadius: "14px",
                    border: "1px solid rgba(58,124,165,0.32)",
                    boxShadow: "0 24px 48px -30px rgba(15,23,42,0.55)",
                  },
                },
              }}
            />
          </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-10">
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
          className="group relative inline-flex min-h-[2.75rem] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[var(--brand-orange)] to-[var(--brand-orange-strong)] px-7 text-sm font-semibold tracking-wide text-white shadow-[0_10px_28px_-8px_rgba(255,169,57,0.55),0_2px_8px_-2px_rgba(15,23,42,0.08)] ring-1 ring-white/15 transition-[box-shadow,transform,filter] duration-200 hover:shadow-[0_14px_36px_-8px_rgba(255,169,57,0.6),0_4px_14px_-4px_rgba(15,23,42,0.12)] hover:brightness-[1.04] active:scale-[0.98] active:brightness-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:min-w-[10rem]"
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
    </LocalizationProvider>
  );
}
