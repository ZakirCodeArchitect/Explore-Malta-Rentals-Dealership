import Image from "next/image";
import Link from "next/link";
import { formatVehicleTypeLabel, type Vehicle } from "@/features/vehicles/data/vehicles";

type VehicleCardProps = Readonly<{
  vehicle: Vehicle;
}>;

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const mainImage = vehicle.mainImageUrl ?? vehicle.images[0] ?? null;
  const brandModel = [vehicle.brand, vehicle.model].filter(Boolean).join(" ");

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/85 bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-safe:hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={vehicle.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-500">
            Vehicle image coming soon
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-slate-900">
          {formatVehicleTypeLabel(vehicle.apiVehicleType)}
        </span>
      </div>

      <div className="p-5">
        <div>
          <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">{vehicle.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{vehicle.shortDescription ?? vehicle.tagline}</p>
          {brandModel ? <p className="mt-1 text-xs text-slate-500">{brandModel}</p> : null}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-slate-800">
            {vehicle.helmetIncludedCount} helmet{vehicle.helmetIncludedCount === 1 ? "" : "s"}
          </span>
          <p className="text-xs text-slate-600">
            {vehicle.supportsStorageBox ? "Storage box supported" : "No storage box"}
          </p>
        </div>

        <div className="mt-5 flex justify-end border-t border-slate-200 pt-3">
          <div className="flex items-center gap-2">
            <Link
              href={`/vehicles/${vehicle.slug}`}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 transition-colors duration-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
            >
              View details
            </Link>
            <Link
              href={`/booking?vehicle=${encodeURIComponent(vehicle.slug)}`}
              className="inline-flex items-center rounded-md bg-[var(--brand-orange)] px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors duration-300 hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2"
            >
              Book now
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
