import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { fleetMarqueeItems } from "@/features/home/data/home-sections";

function MarqueeCard({
  label,
  image,
  exploreLabel,
}: Readonly<{ label: string; image: string; exploreLabel: string }>) {
  return (
    <Link
      href="/vehicles"
      className="group flex w-[15rem] shrink-0 items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-4 shadow-[0_18px_50px_-38px_rgba(2,6,23,0.4)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[var(--brand-orange)]/40 hover:shadow-[0_26px_60px_-34px_rgba(2,6,23,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 sm:w-[16.5rem]"
    >
      <span className="relative flex h-14 w-16 shrink-0 items-center justify-center">
        <Image
          src={image}
          alt=""
          width={96}
          height={72}
          aria-hidden
          className="h-12 w-16 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold tracking-[-0.01em] text-slate-950 sm:text-base">
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--brand-orange-strong)]">
          {exploreLabel}
        </span>
      </span>
    </Link>
  );
}

export async function FleetMarquee() {
  const t = await getTranslations("Home.fleetMarquee");
  const tDynamic = t as unknown as (key: string) => string;
  const exploreLabel = tDynamic("explore");

  const items = fleetMarqueeItems.map((item) => ({
    id: item.id,
    image: item.image,
    label: tDynamic(item.id),
  }));

  // Two identical halves so the -50% translate loops seamlessly.
  const track = [...items, ...items];

  return (
    <section
      aria-label={tDynamic("aria")}
      className="border-y border-slate-200/70 bg-gradient-to-b from-white to-[var(--surface-card)] py-6 sm:py-8"
    >
      <div
        className="group/marquee relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        <ul className="fleet-marquee-track m-0 flex w-max list-none items-stretch gap-4 p-0 pl-4 sm:gap-5">
          {track.map((item, index) => (
            <li key={`${item.id}-${index}`} aria-hidden={index >= items.length}>
              <MarqueeCard
                label={item.label}
                image={item.image}
                exploreLabel={exploreLabel}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
