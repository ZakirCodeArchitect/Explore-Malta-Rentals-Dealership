/** Plain filename, or file plus flag when the asset has a solid white box behind the bike */
export type BikeImageEntry =
  | string
  | { readonly file: string; readonly whiteBg?: boolean };

export function parseBikeImageEntry(entry: BikeImageEntry): {
  file: string;
  whiteBg: boolean;
} {
  if (typeof entry === "string") {
    return { file: entry, whiteBg: false };
  }
  return { file: entry.file, whiteBg: Boolean(entry.whiteBg) };
}

export type BikeCategory = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly bullets: readonly string[];
  readonly images: readonly BikeImageEntry[];
};

export const bikeCategories = [
  {
    id: "50cc",
    title: "50cc Bikes",
    description:
      "Easy to ride, perfect for cruising Malta's coast and city streets with confidence.",
    bullets: ["Beginner-friendly handling", "Comfort-focused setup"],
    images: ["neco one.png", "neco one retro.png"],
  },
  {
    id: "125cc",
    title: "125cc Bikes",
    description:
      "For riders who want a bit more power and smooth performance on longer routes.",
    bullets: ["Great for day trips", "Balanced comfort + control"],
    images: [
      { file: "lex moto blk.jpg", whiteBg: true },
      { file: "lex moto grey.jpg", whiteBg: true },
      "lex moto red.png",
    ],
  },
] satisfies readonly BikeCategory[];

export const aboutBusiness = {
  title: "About the Business",
  tagline:
    "Choose the right ride, get clear guidance, and explore Malta with confidence.",
  /** Filename under `public/BikeImages/` */
  backgroundImage: "lex moto grey.jpg",
  paragraphs: [
    "We rent motorcycles, ATVs, and bikes from Pietà, Malta—so exploring the island feels straightforward, not stressful.",
    "We help you pick the right vehicle and plan; our team is safety-minded, service-focused, and built for visitors.",
  ],
} as const;

export const testimonials = [
  {
    id: "t1",
    name: "Marta",
    location: "Tourist",
    rating: 5,
    date: "Jun 01, 2024",
    quote:
      "Pickup was smooth, the bike felt like new, and we had the best day exploring around Malta.",
  },
  {
    id: "t2",
    name: "Daniel",
    location: "Weekend rider",
    rating: 5,
    date: "Nov 09, 2024",
    quote:
      "Clear instructions, friendly support, and great recommendations for where to go. Highly recommend!",
  },
  {
    id: "t3",
    name: "Sofia",
    location: "Family trip",
    rating: 5,
    date: "Oct 17, 2024",
    quote:
      "Perfect for our Malta plan. Comfortable ride, quick communication, and a super easy process.",
  },
] as const;

export const servicesHighlights = [
  {
    id: "easy-pickup",
    title: "Easy pickup",
    description: "A fast, organised handover so you're riding sooner.",
  },
  {
    id: "helmets",
    title: "Helmets included",
    description: "Safety-first setup included with your rental.",
  },
  {
    id: "flexible",
    title: "Flexible rental periods",
    description: "Choose the days that match your Malta itinerary.",
  },
  {
    id: "support",
    title: "Tourist-friendly support",
    description: "We guide you with clear info, local tips, and quick help.",
  },
  {
    id: "hotel-delivery",
    title: "Hotel delivery / return",
    description: "If applicable, we can help with convenient drop-off options.",
  },
] as const;

export const quickBookingCta = {
  title: "Ready to explore Malta?",
  description:
    "Book your ride in minutes. Choose your pick-up, dates, and preferences - then set off on your island adventure.",
  primaryCta: { href: "#booking-preview", label: "Book your ride" },
  secondaryCta: { href: "#fleet-preview", label: "See bike categories" },
} as const;

export const contactSection = {
  title: "Contact us",
  description:
    "Questions or want help choosing the right ride? Send us a WhatsApp message and we'll respond quickly.",
} as const;

