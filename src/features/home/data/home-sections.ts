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
      { file: "lex moto grey.png", whiteBg: true },
      "lex moto red.png",
    ],
  },
] satisfies readonly BikeCategory[];

export const aboutBusiness = {
  title: "About the Business",
  tagline:
    "Choose the right ride, get clear guidance, and explore Malta with confidence.",
  /** Shown as a pricing callout in the about section (matches entry fleet rates). */
  pricingFromLabel: "From €10 / day",
  pricingFromSupporting:
    "Straightforward daily rates on selected scooters and bikes — check each vehicle for full pricing, deposits, and add-ons.",
  /** Filename under `public/BikeImages/` */
  backgroundImage: "lex moto grey.png",
  paragraphs: [
    "We rent motorcycles, ATVs, and bikes from Pietà, Malta, so exploring the island feels straightforward, not stressful.",
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
    description:
      "A fast, organised handover — you’re on the road sooner, not stuck at the desk.",
  },
  {
    id: "helmets",
    title: "Helmets and phone holders included",
    description: "Safety-first kit bundled with your rental — no last-minute surprises.",
  },
  {
    id: "flexible",
    title: "Flexible rental periods",
    description: "Pick the days that fit your Malta plan — short stays or longer adventures.",
  },
  {
    id: "support",
    title: "Tourist-friendly support",
    description: "Clear answers, local tips, and quick help when you need it.",
  },
  {
    id: "hotel-delivery",
    title: "Hotel delivery / return",
    description: "Where it applies, we can help with convenient drop-off and collection.",
  },
] as const;

/**
 * Final homepage CTA (above footer). Copy tuned for emotion + conversion.
 *
 * Headline variants (A/B ideas):
 * - "The island is waiting — make it yours."
 * - "Your Malta story starts the moment you turn the key."
 * - "Coast, culture, open road — on your clock, not a tour bus’s."
 * - "Tomorrow’s memories start with today’s booking."
 *
 * Primary CTA label variants:
 * - "Start your journey" · "Book your ride" · "Explore rentals" · "Reserve your dates"
 *
 * Secondary: keep "Contact us" or "Chat on WhatsApp" if linking to WhatsApp.
 */
export const quickBookingCta = {
  kicker: "Your next chapter",
  title: "Malta is waiting — make it yours.",
  description:
    "Explore Malta Rentals — your go-to choice to experience Malta your way. From affordable self-drive options to guided tours, we are passionate about helping locals and visitors experience the beauty of Malta in the most free, flexible, and affordable way possible. It starts with one booking.",
  primaryCta: { href: "/booking", label: "Start your journey" },
  secondaryCta: { href: "#contact", label: "Contact us" },
} as const;

export const contactSection = {
  title: "Contact us",
  description:
    "Call, message, or visit — we’re here to help you choose the right ride. Your mobile number and map location are below.",
} as const;

