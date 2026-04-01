import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { VehicleListingShell } from "@/features/vehicles/components/vehicle-listing-shell";
import { vehicles } from "@/features/vehicles/data/vehicles";

export const metadata: Metadata = {
  title: "Vehicle Rentals | Malta Rentals",
  description:
    "Browse scooters, motorcycles, ATVs, and bicycles in Malta with transparent daily pricing and flexible booking.",
};

const HERO_INTRO = {
  title: "Find your perfect Malta ride",
  description:
    "Compare curated rentals by price, type, and ride style. Built for quick decisions with premium clarity and zero clutter.",
} as const;

export default function VehiclesPage() {
  return (
    <main className="flex flex-1 flex-col bg-[var(--background)]">
      <Suspense
        fallback={
          <Container className="pb-16 pt-28 sm:pt-32">
            <div
              className="h-10 max-w-md animate-pulse rounded-md bg-slate-200/70"
              aria-hidden
            />
            <div
              className="mt-4 h-20 max-w-2xl animate-pulse rounded-md bg-slate-200/60"
              aria-hidden
            />
            <div
              className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-100/80"
              aria-hidden
            />
          </Container>
        }
      >
        <VehicleListingShell vehicles={vehicles} heroIntro={HERO_INTRO} />
      </Suspense>
    </main>
  );
}
