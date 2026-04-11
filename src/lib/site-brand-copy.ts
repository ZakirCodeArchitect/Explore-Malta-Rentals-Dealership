/**
 * Central marketing copy — footer, metadata, hero, and shared CTAs.
 * Update here to keep messaging consistent across pages.
 */
export const SITE_META = {
  title: "Explore Malta Rentals | Motorcycle, ATV & Bicycle Hire",
  description:
    "Rent a motorbike, ATV or bicycle with Explore Malta Rentals. Experience the island your way, at your own pace, or a guided custom tour around Malta. Quick booking and local advice, at the most affordable rates.",
} as const;

export const SITE_LOCATION_KICKER = "Pietà, Malta";

export const SITE_PRIMARY_TAGLINE = {
  headline: "Rent a motorbike, ATV or bicycle with Explore Malta Rentals.",
  body: "Experience the island your way, at your own pace, or a guided custom tour around Malta.",
  supporting: "Quick booking and local advice, at the most affordable rates.",
} as const;

export const HOME_HERO = {
  location: "Pietà, Malta",
  title: "Explore Malta Your Way",
  description: "Motorcycle, ATV, and bicycle rentals. Guided tours.",
} as const;

export const LOGO_PATH = "/explore%20malta%20rentals%20logo.png" as const;

/** Default contact details — override via env (`phone`, `NEXT_PUBLIC_PHONE`, `address`, `email`, etc.). */
export const SITE_CONTACT = {
  phone: "+356 77506799",
  email: "info@exploremaltarentals.com",
  address: "42, Triq il- Marina, Pieta, PTA 9046",
} as const;

/** Google Maps place link — used for “Open in Google Maps” and as the default guide `location` when env is unset. */
export const SITE_GOOGLE_MAPS_URL =
  "https://maps.app.goo.gl/saSz4cZPAsfKd1Qy7" as const;
