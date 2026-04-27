"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatVehicleTypeLabel, type Vehicle } from "@/features/vehicles/data/vehicles";

type VehicleRelatedSliderProps = Readonly<{
  vehicles: readonly Vehicle[];
  currentSlug: string;
}>;

export function VehicleRelatedSlider({
  vehicles,
  currentSlug,
}: VehicleRelatedSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = el.querySelector("a")?.offsetWidth ?? 260;
    el.scrollBy({ left: dir === "right" ? cardW + 16 : -(cardW + 16), behavior: "smooth" });
  };

  const related = vehicles.filter((v) => v.slug !== currentSlug).slice(0, 10);
  if (related.length === 0) return null;

  return (
    <section aria-label="Similar vehicles" className="mt-16 border-t border-slate-200/70 pt-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.025em] text-slate-950">
            Similar vehicles
          </h2>
          <p className="mt-1 text-sm text-slate-500">Other rides you might like</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-4 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {related.map((vehicle) => {
          const img = vehicle.mainImageUrl ?? vehicle.images[0] ?? null;
          const typeLabel = formatVehicleTypeLabel(vehicle.apiVehicleType);
          return (
            <Link
              key={vehicle.slug}
              href={`/vehicles/${vehicle.slug}`}
              className="group shrink-0 w-[min(72vw,16rem)] snap-start overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_40px_-28px_rgba(15,23,42,0.3)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_-24px_rgba(15,23,42,0.35)]"
            >
              <div className="relative aspect-[4/3] bg-slate-100">
                {img ? (
                  <Image
                    src={img}
                    alt={vehicle.name}
                    fill
                    sizes="17rem"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    Image soon
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white/92 px-2.5 py-0.5 text-[0.65rem] font-semibold text-slate-800">
                  {typeLabel}
                </span>
              </div>
              <div className="p-3.5">
                <h3 className="text-sm font-semibold leading-tight text-slate-900 group-hover:text-[var(--brand-blue)]">
                  {vehicle.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                  {vehicle.shortDescription ?? vehicle.tagline}
                </p>
                <p className="mt-2.5 text-sm font-bold text-slate-950">
                  {vehicle.pricePerDay > 0 ? (
                    <>EUR {vehicle.pricePerDay}<span className="text-xs font-normal text-slate-500">/day</span></>
                  ) : (
                    <span className="text-xs font-medium text-slate-500">Price on request</span>
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
