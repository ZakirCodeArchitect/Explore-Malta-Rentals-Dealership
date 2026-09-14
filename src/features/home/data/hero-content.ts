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
     * Poster shown before the video loads (and on mobile / reduced-motion /
     * slow connections, where `HeroVideoBackground` skips the video entirely).
     *
     * This is a still frame taken from `videoSrc` itself (t≈5s), so the poster
     * and the video are the same scene and there is no visual jump when the
     * video fades in. Re-cut it from the video if the footage ever changes.
     */
    posterSrc: "/hero-poster.jpg",
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
