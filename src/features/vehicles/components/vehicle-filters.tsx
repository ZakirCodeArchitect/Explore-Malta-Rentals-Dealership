"use client";

import type { Transmission, VehicleType } from "@/features/vehicles/data/vehicles";

type SortOption = "recommended" | "price-low" | "price-high" | "rating";

type VehicleFiltersProps = Readonly<{
  selectedType: VehicleType | "All";
  selectedTransmission: Transmission | "All";
  sortBy: SortOption;
  onTypeChange: (value: VehicleType | "All") => void;
  onTransmissionChange: (value: Transmission | "All") => void;
  onSortChange: (value: SortOption) => void;
}>;

const selectClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)]/40";

export function VehicleFilters({
  selectedType,
  selectedTransmission,
  sortBy,
  onTypeChange,
  onTransmissionChange,
  onSortChange,
}: VehicleFiltersProps) {
  return (
    <section aria-label="Vehicle filters and sorting" className="sticky top-18 z-20 rounded-2xl border border-slate-200/75 bg-white/90 p-4 backdrop-blur-md md:p-5">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-sm font-semibold text-slate-700">
          Type
          <select
            value={selectedType}
            onChange={(event) => onTypeChange(event.target.value as VehicleType | "All")}
            className={`${selectClassName} mt-2`}
          >
            <option value="All">All vehicles</option>
            <option value="Scooter">Scooters</option>
            <option value="Motorcycle">Motorcycles</option>
            <option value="ATV">ATVs</option>
            <option value="Bicycle">Bicycles</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Transmission
          <select
            value={selectedTransmission}
            onChange={(event) => onTransmissionChange(event.target.value as Transmission | "All")}
            className={`${selectClassName} mt-2`}
          >
            <option value="All">All</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Sort by
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className={`${selectClassName} mt-2`}
          >
            <option value="recommended">Recommended</option>
            <option value="price-low">Price: Low to high</option>
            <option value="price-high">Price: High to low</option>
            <option value="rating">Top rated</option>
          </select>
        </label>
      </div>
    </section>
  );
}
