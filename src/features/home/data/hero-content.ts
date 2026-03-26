export const heroContent = {
  location: "Pietà, Malta",
  title: "Explore Malta Like Never Before.",
  description:
    "Motorcycle, ATV, and bicycle rentals from Pietà, plus guided tours—explore Malta by road, trail, or town at your own pace.",
  primaryAction: {
    href: "#booking-preview",
    label: "Book Your Ride",
  },
  secondaryAction: {
    href: "#fleet-preview",
    label: "View Fleet",
  },
  media: {
    poster: null,
    videoSrc: "/hero-section.mp4",
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
    value: "Pietà, Malta",
  },
  {
    label: "Pick-up date",
    value: "12 Jun 2026",
  },
  {
    label: "Time",
    value: "10:00 AM",
  },
  {
    label: "Return date",
    value: "19 Jun 2026",
  },
  {
    label: "Time",
    value: "2:00 PM",
  },
] as const;

export const heroBookingExtras = [
  {
    label: "Return elsewhere",
    active: false,
  },
  {
    label: "Need hotel delivery",
    active: true,
  },
] as const;
