import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { VehicleListingShell } from "@/features/vehicles/components/vehicle-listing-shell";
import { vehicles } from "@/features/vehicles/data/vehicles";

export const metadata: Metadata = {
  title: "Vehicle Rentals | Malta Rentals",
  description:
    "Browse scooters, motorcycles, ATVs, and bicycles in Malta with transparent daily pricing and flexible booking.",
};

export default function VehiclesPage() {
  return (
    <main className="flex flex-1 flex-col bg-[var(--background)] pb-16 pt-28 sm:pt-32">
      <Container>
        <section aria-labelledby="vehicles-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange)]">Marketplace</p>
          <h1 id="vehicles-heading" className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Find your perfect Malta ride
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Compare curated rentals by price, type, and ride style. Built for quick decisions with premium clarity
            and zero clutter.
          </p>
        </section>

        <VehicleListingShell vehicles={vehicles} />
      </Container>
    </main>
  );
}
