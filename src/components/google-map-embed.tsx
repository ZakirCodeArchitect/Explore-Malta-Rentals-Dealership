import { SITE_GOOGLE_MAPS_URL } from "@/lib/site-brand-copy";

type GoogleMapEmbedProps = Readonly<{
  className?: string;
  /** Override query (default: business name + coordinates) */
  query?: string;
}>;

/**
 * Embedded map — set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` to a full embed URL from
 * Google Maps → Share → Embed for a precise pin; otherwise uses a coordinates-based
 * embed that pins the exact shop location.
 * The "Open in Google Maps" link inside the iframe AND the page-level text links
 * both resolve to the correct Explore Malta Rentals place.
 */
export function GoogleMapEmbed({ className }: GoogleMapEmbedProps) {
  // Prefer an explicit embed URL from env (Google Maps → Share → Embed a map).
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL?.trim();

  // Fallback: pin the shop using exact coordinates so the iframe's own
  // "Open in Google Maps" button resolves to the correct business.
  const src =
    embedUrl ||
    `https://maps.google.com/maps?q=Explore+Malta+Rentals,+Pieta,+Malta&ll=35.8930132,14.4967482&z=16&hl=en&output=embed`;

  return (
    <div className={`relative flex flex-col overflow-hidden ${className ?? ""}`}>
      <iframe
        title="Google Maps — Explore Malta Rentals, Pietà"
        src={src}
        className="h-full w-full flex-1 border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {/* Explicit "View on Google Maps" overlay link that always uses the correct place URL */}
      <a
        href={SITE_GOOGLE_MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-end gap-1.5 bg-white/90 px-3 py-1.5 text-[0.7rem] font-semibold text-[#1a73e8] hover:underline"
        aria-label="Open Explore Malta Rentals in Google Maps"
      >
        <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 fill-current" aria-hidden>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        View on Google Maps
      </a>
    </div>
  );
}
