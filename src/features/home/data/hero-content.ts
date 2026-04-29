import { HOME_HERO } from "@/lib/site-brand-copy";

export const heroContent = {
  location: HOME_HERO.location,
  title: HOME_HERO.title,
  description: HOME_HERO.description,
  primaryAction: {
    href: "/booking",
    label: "Book Your Ride",
  },
  secondaryAction: {
    href: "#fleet-preview",
    label: "View Fleet",
  },
  media: {
    /**
     * Primary video source.
     * For best performance, compress this to ~3-5 MB with H.264 before deploy:
     *   ffmpeg -i Untitled-1.mp4 -c:v libx264 -crf 28 -preset slow \
     *          -movflags +faststart -an hero-optimized.mp4
     */
    videoSrc: "/Untitled-1.mp4",
    /**
     * Poster shown before the video loads (and on mobile / slow connections).
     * Must be a compressed JPEG/WebP for fast LCP — ideally < 80 KB.
     * Using a road/Malta scene that matches the video content.
     */
    posterSrc: "/empty-road-1.jpg",
  },
} as const;

export const heroTrustItems = [
  "Guided tours available",
  "Well-maintained vehicles",
  "Service-focused, safety-minded team",
] as const;

export const heroBookingFields = [
  {
    label: "Pick-up location",
    value: "enter your location",
  },
  {
    label: "Vehicle type",
    value: "All vehicles",
  },
  {
    label: "Pick-up date",
    value: "12 Jun 2026",
  },
] as const;
