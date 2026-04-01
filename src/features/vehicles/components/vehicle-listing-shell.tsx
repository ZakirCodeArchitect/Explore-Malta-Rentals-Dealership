"use client";

import { useEffect, useMemo, useState } from "react";
import { VehicleCard } from "@/features/vehicles/components/vehicle-card";
import { VehicleFilters } from "@/features/vehicles/components/vehicle-filters";
import type { Transmission, Vehicle, VehicleType } from "@/features/vehicles/data/vehicles";

type SortOption = "recommended" | "price-low" | "price-high" | "rating";

type VehicleListingShellProps = Readonly<{
  vehicles: readonly Vehicle[];
}>;

export function VehicleListingShell({ vehicles }: VehicleListingShellProps) {
  const [selectedType, setSelectedType] = useState<VehicleType | "All">("All");
  const [selectedTransmission, setSelectedTransmission] = useState<Transmission | "All">("All");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsRefreshing(true);
    const timer = window.setTimeout(() => setIsRefreshing(false), 220);
    return () => window.clearTimeout(timer);
  }, [selectedType, selectedTransmission, sortBy]);

  const filteredVehicles = useMemo(() => {
    const typeFiltered =
      selectedType === "All" ? vehicles : vehicles.filter((vehicle) => vehicle.type === selectedType);
    const transmissionFiltered =
      selectedTransmission === "All"
        ? typeFiltered
        : typeFiltered.filter((vehicle) => vehicle.transmission === selectedTransmission);

    const sorted = [...transmissionFiltered];
    if (sortBy === "price-low") sorted.sort((a, b) => a.pricePerDay - b.pricePerDay);
    if (sortBy === "price-high") sorted.sort((a, b) => b.pricePerDay - a.pricePerDay);
    if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  }, [vehicles, selectedType, selectedTransmission, sortBy]);

  return (
    <div className="mt-8 space-y-6">
      <VehicleFilters
        selectedType={selectedType}
        selectedTransmission={selectedTransmission}
        sortBy={sortBy}
        onTypeChange={setSelectedType}
        onTransmissionChange={setSelectedTransmission}
        onSortChange={setSortBy}
      />

      <p className="text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{filteredVehicles.length}</span> vehicles
      </p>

      {isRefreshing ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
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
          <h3 className="text-lg font-semibold text-slate-900">No exact match found</h3>
          <p className="mt-2 text-sm text-slate-600">Try another type, transmission, or sort option.</p>
        </div>
      )}
    </div>
  );
}
