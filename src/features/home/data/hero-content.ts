import { HOME_HERO } from "@/lib/site-brand-copy";

/** Shared full-bleed backdrop (home hero + vehicles listing header). File in `/public`. */
export const emptyParkingBackdropPath = "/empty-parking.jpg" as const;

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
    poster: null,
    videoSrc: "/hero-section.mp4",
    backgroundImage: emptyParkingBackdropPath,
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
