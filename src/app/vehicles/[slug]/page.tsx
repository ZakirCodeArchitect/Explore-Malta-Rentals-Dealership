import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { VehicleBookingCard } from "@/features/vehicles/components/vehicle-booking-card";
import { VehicleGallery } from "@/features/vehicles/components/vehicle-gallery";
import { getVehicleBySlug, vehicles } from "@/features/vehicles/data/vehicles";

type VehicleDetailsPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export async function generateStaticParams() {
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: VehicleDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) return {};

  return {
    title: `${vehicle.name} | Malta Rentals`,
    description: `${vehicle.tagline} Book ${vehicle.name} in Malta from EUR ${vehicle.pricePerDay}/day.`,
  };
}

export default async function VehicleDetailsPage({ params }: VehicleDetailsPageProps) {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);

  if (!vehicle) notFound();

  return (
    <main className="flex flex-1 flex-col bg-[var(--background)] pb-16 pt-28 sm:pt-32">
      <Container>
        <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
          <Link href="/vehicles" className="hover:text-slate-900">
            Vehicles
          </Link>{" "}
          / <span className="font-medium text-slate-900">{vehicle.name}</span>
        </nav>

        <header className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--brand-orange)]">{vehicle.type}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">{vehicle.name}</h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">{vehicle.tagline}</p>
          <p className="mt-3 text-sm text-slate-500">
            {vehicle.location} · {vehicle.rating.toFixed(1)} stars ({vehicle.reviewCount} reviews)
          </p>
        </header>

        <div className="mt-8">
          <VehicleGallery name={vehicle.name} images={vehicle.images} />
        </div>

        <section className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">About this vehicle</h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">{vehicle.description}</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">Specifications</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Transmission</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{vehicle.transmission}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Engine</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{vehicle.engine}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Seats</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{vehicle.seats}</dd>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Location</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{vehicle.location}</dd>
                </div>
              </dl>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-38px_rgba(15,23,42,0.3)]">
              <h2 className="text-2xl font-semibold tracking-[-0.02em] text-slate-950">Features and benefits</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {vehicle.features.map((feature) => (
                  <li key={feature} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                    {feature}
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className="lg:col-span-5">
            <VehicleBookingCard vehicle={vehicle} />
          </div>
        </section>
      </Container>
    </main>
  );
}
