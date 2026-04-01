import Image from "next/image";
import Link from "next/link";
import type { Vehicle } from "@/features/vehicles/data/vehicles";

type VehicleCardProps = Readonly<{
  vehicle: Vehicle;
}>;

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/85 bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.35)] transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] motion-safe:hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={vehicle.images[0]}
          alt={vehicle.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.05]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-transparent" />
        <span className="absolute left-3 top-3 rounded-full bg-white/92 px-3 py-1 text-xs font-semibold text-slate-900">
          {vehicle.type}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-slate-950">{vehicle.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{vehicle.tagline}</p>
          </div>
          <p className="text-sm font-semibold text-slate-800">{vehicle.rating.toFixed(1)}★</p>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {vehicle.highlights.slice(0, 2).map((item) => (
            <li key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {item}
            </li>
          ))}
          <li className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-medium text-[var(--brand-blue-strong)]">
            {vehicle.transmission}
          </li>
        </ul>

        <div className="mt-5 flex items-end justify-between">
          <p className="text-sm text-slate-600">
            From <span className="text-xl font-semibold text-slate-950">EUR {vehicle.pricePerDay}</span> / day
          </p>
          <Link
            href={`/vehicles/${vehicle.slug}`}
            className="inline-flex items-center rounded-full bg-[var(--brand-orange)] px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-300 hover:bg-[var(--brand-orange-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
