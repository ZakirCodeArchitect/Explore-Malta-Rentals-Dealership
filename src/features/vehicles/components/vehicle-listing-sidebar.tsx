"use client";

import Select, {
  components as selectComponents,
  type DropdownIndicatorProps,
  type StylesConfig,
} from "react-select";
import type { ReactNode } from "react";
import type { BookingOption } from "@/features/home/data/hero-booking-options";
import {
  VEHICLE_TYPES,
  type Transmission,
  type VehicleColor,
  type VehicleSeatsFilter,
  type VehicleType,
} from "@/features/vehicles/data/vehicles";

const VEHICLE_TYPE_OPTIONS: readonly (VehicleType | "All")[] = ["All", ...VEHICLE_TYPES];

const TRANSMISSIONS: readonly (Transmission | "All")[] = [
  "All",
  "Automatic",
  "Manual",
];

const SEAT_OPTIONS: readonly BookingOption[] = [
  { value: "All", label: "Any" },
  { value: "1", label: "1 seat" },
  { value: "2", label: "2 seats" },
  { value: "3", label: "3 seats" },
];

type VehicleListingSidebarProps = Readonly<{
  brandOptions: readonly string[];
  selectedBrand: string | "All";
  onBrandChange: (value: string | "All") => void;
  colorOptions: readonly (VehicleColor | "All")[];
  selectedType: VehicleType | "All";
  onTypeChange: (value: VehicleType | "All") => void;
  selectedTransmission: Transmission | "All";
  onTransmissionChange: (value: Transmission | "All") => void;
  selectedColor: VehicleColor | "All";
  onColorChange: (value: VehicleColor | "All") => void;
  selectedSeats: VehicleSeatsFilter;
  onSeatsChange: (value: VehicleSeatsFilter) => void;
  /** `rail`: flat panel for a full-height left column (e.g. Kayak-style). `card`: self-contained rounded box. */
  variant?: "rail" | "card";
  /** When set with `onToggleCollapsed`, desktop (`lg+`) sidebar can collapse to a narrow strip. Mobile always shows the full panel. */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  className?: string;
}>;

function ChevronLeftIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m12 6-4 4 4 4" />
    </svg>
  );
}

function CollapsedRailFilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 3H2l8 9.32V20l4 2v-7.68L22 3z" />
    </svg>
  );
}

function optionByValue(
  options: readonly BookingOption[],
  value: string,
): BookingOption {
  return options.find((o) => o.value === value) ?? options[0]!;
}

function SeatDropdownIndicator(
  props: DropdownIndicatorProps<BookingOption, false>,
) {
  return (
    <selectComponents.DropdownIndicator {...props}>
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4 text-[var(--ink-500)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m6 8 4 4 4-4" />
      </svg>
    </selectComponents.DropdownIndicator>
  );
}

const seatSelectComponents = {
  DropdownIndicator: SeatDropdownIndicator,
};

function FilterSection({
  title,
  children,
  sleek,
}: Readonly<{ title: string; children: ReactNode; sleek?: boolean }>) {
  return (
    <div>
      <h3
        className={joinClasses(
          "type-eyebrow",
          sleek ? "text-[var(--text-faint)]" : "text-[var(--text-muted)]",
        )}
      >
        {title}
      </h3>
      <div className={joinClasses("flex flex-col gap-1", sleek ? "mt-2.5" : "mt-3")}>
        {children}
      </div>
    </div>
  );
}

function RadioRow({
  name,
  id,
  label,
  checked,
  onChange,
  sleek,
}: Readonly<{
  name: string;
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  sleek?: boolean;
}>) {
  return (
    <label
      htmlFor={id}
      className={joinClasses(
        /* Hairline pill row: rest / hover / selected all read as distinct states. */
        "flex cursor-pointer select-none items-center gap-2.5 rounded-full border border-transparent leading-snug text-[var(--text-secondary)]",
        "transition-[background-color,border-color,color] duration-[var(--dur-fast)] ease-[var(--ease-standard)]",
        "hover:border-[var(--line-subtle)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink-900)]",
        "has-[:checked]:border-[color-mix(in_srgb,var(--orange-400)_46%,transparent)] has-[:checked]:bg-[color-mix(in_srgb,var(--orange-400)_11%,white)] has-[:checked]:font-semibold has-[:checked]:text-[var(--ink-900)]",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--blue-500)]",
        sleek ? "px-2.5 py-2 text-[13px] font-medium" : "px-3 py-2 text-sm font-medium",
      )}
    >
      <input
        id={id}
        name={name}
        type="radio"
        checked={checked}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden
        /* Ring + inset white core reads as a filled radio dot when selected. */
        className="size-[1.0625rem] shrink-0 rounded-full border border-[var(--line-strong)] bg-[var(--surface-card)] transition-[background-color,border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-standard)] peer-checked:border-[var(--orange-500)] peer-checked:bg-[var(--orange-400)] peer-checked:shadow-[inset_0_0_0_3px_var(--surface-card)]"
      />
      <span className="min-w-0">{label}</span>
    </label>
  );
}

function SeatsDropdown({
  value,
  onChange,
  sleek,
}: Readonly<{
  value: VehicleSeatsFilter;
  onChange: (v: VehicleSeatsFilter) => void;
  sleek?: boolean;
}>) {
  const styles: StylesConfig<BookingOption, false> = {
    container: (base) => ({
      ...base,
      width: "100%",
    }),
    control: (base, state) => ({
      ...base,
      minHeight: sleek ? 38 : 40,
      borderRadius: "var(--r-field)",
      borderColor: state.isFocused ? "var(--blue-500)" : "var(--line)",
      boxShadow: state.isFocused
        ? "0 0 0 3px color-mix(in srgb, var(--blue-500) 18%, transparent)"
        : "var(--elev-1)",
      backgroundColor: "var(--surface-card)",
      cursor: "pointer",
      paddingLeft: 4,
      paddingRight: 4,
      transition: "border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)",
      ":hover": {
        borderColor: "var(--line-strong)",
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 6px",
    }),
    singleValue: (base) => ({
      ...base,
      margin: 0,
      color: "var(--ink-900)",
      fontWeight: 600,
      fontSize: sleek ? 13 : 14,
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "var(--ink-500)",
      padding: 3,
      ":hover": { color: "var(--ink-800)" },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "var(--r-card)",
      border: "1px solid var(--line-subtle)",
      boxShadow: "var(--elev-4)",
      overflow: "hidden",
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      paddingTop: 6,
      paddingBottom: 6,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      backgroundColor: state.isSelected
        ? "var(--blue-500)"
        : state.isFocused
          ? "color-mix(in srgb, var(--blue-500) 10%, white)"
          : "var(--surface-card)",
      color: state.isSelected ? "#fff" : "var(--ink-800)",
      ":active": {
        backgroundColor: state.isSelected
          ? "var(--blue-600)"
          : "color-mix(in srgb, var(--blue-500) 16%, white)",
      },
    }),
  };

  return (
    <Select<BookingOption, false>
      inputId="vehicle-sidebar-seats"
      instanceId="vehicle-sidebar-seats"
      aria-label="Seats"
      value={optionByValue(SEAT_OPTIONS, value === "All" ? "All" : String(value))}
      onChange={(opt) => {
        if (!opt) return;
        if (opt.value === "All") onChange("All");
        else onChange(Number(opt.value) as 1 | 2 | 3);
      }}
      options={[...SEAT_OPTIONS]}
      isSearchable={false}
      styles={styles}
      components={seatSelectComponents}
      menuPortalTarget={typeof document !== "undefined" ? document.body : null}
      menuPosition="fixed"
      classNamePrefix="vehicle-sidebar-seats"
    />
  );
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function VehicleListingSidebar({
  brandOptions,
  selectedBrand,
  onBrandChange,
  colorOptions,
  selectedType,
  onTypeChange,
  selectedTransmission,
  onTransmissionChange,
  selectedColor,
  onColorChange,
  selectedSeats,
  onSeatsChange,
  variant = "card",
  collapsed = false,
  onToggleCollapsed,
  className,
}: VehicleListingSidebarProps) {
  const surfaceClass =
    variant === "rail"
      ? "border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
      : "surface-card p-4 lg:sticky lg:top-24 lg:self-start";

  const collapsibleRail = variant === "rail" && onToggleCollapsed;

  const filterPanelId = "vehicle-filters-panel";
  const sleekRail = variant === "rail";

  /* Fading hairline between filter groups — reads quieter than a full-bleed border. */
  const groupDivider = (
    <hr className={joinClasses("rule-fade", sleekRail ? "my-4" : "my-5")} />
  );

  const filterSections = (
    <div id={filterPanelId}>
      <FilterSection title="Brand" sleek={sleekRail}>
        <RadioRow
          name="brand"
          id="brand-all"
          label="All brands"
          checked={selectedBrand === "All"}
          onChange={() => onBrandChange("All")}
          sleek={sleekRail}
        />
        {brandOptions.map((brand) => (
          <RadioRow
            key={brand}
            name="brand"
            id={`brand-${brand.toLowerCase().replace(/\s+/g, "-")}`}
            label={brand}
            checked={selectedBrand === brand}
            onChange={() => onBrandChange(brand)}
            sleek={sleekRail}
          />
        ))}
      </FilterSection>

      {groupDivider}

      <FilterSection title="Vehicle type" sleek={sleekRail}>
        {VEHICLE_TYPE_OPTIONS.map((value) => (
          <RadioRow
            key={value}
            name="vehicle-type"
            id={`vehicle-type-${value === "All" ? "all" : value.toLowerCase()}`}
            label={value === "All" ? "All types" : value}
            checked={selectedType === value}
            onChange={() => onTypeChange(value)}
            sleek={sleekRail}
          />
        ))}
      </FilterSection>

      {groupDivider}

      <FilterSection title="Transmission" sleek={sleekRail}>
        {TRANSMISSIONS.map((value) => (
          <RadioRow
            key={value}
            name="transmission"
            id={`transmission-${value === "All" ? "all" : value.toLowerCase()}`}
            label={value === "All" ? "Any" : value}
            checked={selectedTransmission === value}
            onChange={() => onTransmissionChange(value)}
            sleek={sleekRail}
          />
        ))}
      </FilterSection>

      {groupDivider}

      <FilterSection title="Seats" sleek={sleekRail}>
        <SeatsDropdown
          value={selectedSeats}
          onChange={onSeatsChange}
          sleek={sleekRail}
        />
      </FilterSection>

      {groupDivider}

      <FilterSection title="Color" sleek={sleekRail}>
        {colorOptions.map((value) => (
          <RadioRow
            key={value}
            name="color"
            id={`color-${value === "All" ? "all" : value.toLowerCase()}`}
            label={value === "All" ? "Any color" : value}
            checked={selectedColor === value}
            onChange={() => onColorChange(value)}
            sleek={sleekRail}
          />
        ))}
      </FilterSection>
    </div>
  );

  const expandedHeader = collapsibleRail ? (
    <div className="mb-4 flex items-center justify-between gap-2">
      <p
        id="vehicle-filters-heading"
        className="type-eyebrow text-[var(--ink-800)]"
      >
        Filters
      </p>
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-expanded="true"
        aria-controls={filterPanelId}
        title="Hide filters"
        className="hidden size-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface-card)] text-[var(--text-muted)] shadow-sm transition-[color,box-shadow,background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-standard)] hover:border-[var(--line-strong)] hover:text-[var(--ink-900)] hover:shadow-md active:scale-95 lg:inline-flex"
      >
        <ChevronLeftIcon />
        <span className="sr-only">Hide filters</span>
      </button>
    </div>
  ) : (
    <p className="type-eyebrow mb-4 text-[var(--ink-800)]">Filters</p>
  );

  const expandedBody = (
    <>
      {expandedHeader}
      {filterSections}
    </>
  );

  const collapsedStrip = collapsibleRail && (
    <div
      className={joinClasses(
        "hidden flex-col items-center pt-1",
        collapsed ? "lg:flex" : "",
      )}
    >
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-expanded="false"
        aria-controls={filterPanelId}
        title="Show filters"
        className="flex shrink-0 cursor-pointer items-center justify-center rounded-[var(--r-field)] border-0 bg-transparent p-2 text-[var(--text-secondary)] transition-[color,background-color] duration-[var(--dur-fast)] ease-[var(--ease-standard)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink-900)]"
      >
        <CollapsedRailFilterIcon />
        <span className="sr-only">Show filters</span>
      </button>
    </div>
  );

  if (variant === "rail") {
    return (
      <div
        role="complementary"
        aria-label="Refine vehicle results"
        className={joinClasses(surfaceClass, className)}
      >
        {collapsedStrip}
        {collapsibleRail ? (
          <div
            className={joinClasses(
              collapsed ? "max-lg:block lg:hidden" : "",
            )}
          >
            {expandedBody}
          </div>
        ) : (
          expandedBody
        )}
      </div>
    );
  }

  return (
    <aside
      aria-label="Refine vehicle results"
      className={joinClasses(surfaceClass, className)}
    >
      {expandedBody}
    </aside>
  );
}
