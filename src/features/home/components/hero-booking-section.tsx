import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { SiteShell } from "@/components/site-shell";
import { HeroBookingConsole } from "@/features/home/components/hero-booking-console";

const WAREHOUSE_BACKGROUND_PATH = path.join(
  process.cwd(),
  "public",
  "warehouse background.png",
);

function getWarehouseBackgroundSrc(): string {
  try {
    const { mtimeMs } = fs.statSync(WAREHOUSE_BACKGROUND_PATH);
    return `/warehouse background.png?v=${mtimeMs}`;
  } catch {
    return "/warehouse background.png";
  }
}

export function HeroBookingSection() {
  const backgroundSrc = getWarehouseBackgroundSrc();
  return (
    <section
      id="hero-booking"
      className="relative isolate w-full overflow-hidden scroll-mt-[var(--site-header-offset)]"
    >
      <div className="absolute inset-0" aria-hidden="true">
        <Image
          src={backgroundSrc}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/30 to-slate-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_45%,rgba(0,0,0,0.18),transparent)]" />
      </div>

      <SiteShell>
        <div className="relative z-10 py-10 sm:py-12 lg:py-14">
          <HeroBookingConsole />
        </div>
      </SiteShell>
    </section>
  );
}
