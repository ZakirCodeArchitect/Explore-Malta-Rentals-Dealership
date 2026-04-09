type GoogleMapEmbedProps = Readonly<{
  className?: string;
  /** Override query (default: Pietà, Malta or NEXT_PUBLIC_GOOGLE_MAPS_QUERY) */
  query?: string;
}>;

/**
 * Embedded map — set `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` to a full embed URL from
 * Google Maps → Share → Embed for a precise pin; otherwise uses a search embed.
 */
export function GoogleMapEmbed({ className, query }: GoogleMapEmbedProps) {
  const embedUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL?.trim();
  const q =
    query ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_QUERY?.trim() ??
    "Pietà, Malta";
  const src =
    embedUrl ||
    `https://maps.google.com/maps?q=${encodeURIComponent(q)}&hl=en&z=14&output=embed`;

  return (
    <iframe
      title="Google Maps — Explore Malta Rentals area"
      src={src}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
