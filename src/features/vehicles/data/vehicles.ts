export type VehicleType = "Scooter" | "Motorcycle" | "ATV" | "Bicycle";
export type Transmission = "Automatic" | "Manual";

/** Listing filter: exact seat count (1–3 only). */
export type VehicleSeatsFilter = 1 | 2 | 3 | "All";

/** Exterior / finish color used for listing filters. */
export type VehicleColor =
  | "Black"
  | "White"
  | "Gray"
  | "Red"
  | "Blue"
  | "Silver"
  | "Orange";

export type VehicleAddOn = Readonly<{
  id: string;
  name: string;
  pricePerDay: number;
}>;

export type Vehicle = Readonly<{
  slug: string;
  name: string;
  type: VehicleType;
  tagline: string;
  description: string;
  pricePerDay: number;
  seats: number;
  transmission: Transmission;
  color: VehicleColor;
  engine: string;
  rating: number;
  reviewCount: number;
  location: string;
  images: readonly string[];
  highlights: readonly string[];
  features: readonly string[];
  addOns: readonly VehicleAddOn[];
}>;

export const vehicles: readonly Vehicle[] = [
  {
    slug: "yamaha-nmax-125",
    name: "Yamaha NMAX 125",
    type: "Scooter",
    tagline: "Smooth city cruising with premium comfort.",
    description:
      "A top choice for first-time Malta riders and couples. Light handling, stable braking, and plenty of comfort for coast and town loops.",
    pricePerDay: 39,
    seats: 2,
    transmission: "Automatic",
    color: "Gray",
    engine: "125cc",
    rating: 4.9,
    reviewCount: 118,
    location: "Pieta, Malta",
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1400&q=80",
    ],
    highlights: ["Great for city + coast", "Beginner-friendly", "Phone mount included"],
    features: ["USB charging", "Under-seat storage", "Dual-disc brakes", "Fuel efficient"],
    addOns: [
      { id: "extra-helmet", name: "Extra helmet", pricePerDay: 4 },
      { id: "phone-holder", name: "Premium phone holder", pricePerDay: 2 },
      { id: "full-insurance", name: "Full coverage upgrade", pricePerDay: 12 },
    ],
  },
  {
    slug: "kymco-agility-50",
    name: "Kymco Agility 50",
    type: "Scooter",
    tagline: "Simple, agile, and easy for short Malta routes.",
    description:
      "Affordable and efficient for urban routes and short scenic rides. Ideal if you want a relaxed way to explore Valletta and nearby spots.",
    pricePerDay: 29,
    seats: 2,
    transmission: "Automatic",
    color: "White",
    engine: "50cc",
    rating: 4.7,
    reviewCount: 86,
    location: "Pieta, Malta",
    images: [
      "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517846693594-1567da72af75?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1400&q=80",
    ],
    highlights: ["Budget-friendly", "Easy automatic ride", "Quick pickup"],
    features: ["Top box option", "Low fuel usage", "Compact parking"],
    addOns: [
      { id: "extra-helmet", name: "Extra helmet", pricePerDay: 4 },
      { id: "rain-poncho", name: "Rain poncho set", pricePerDay: 3 },
    ],
  },
  {
    slug: "cfmoto-cforce-450",
    name: "CFMOTO CForce 450",
    type: "ATV",
    tagline: "Power and stability for adventurous routes.",
    description:
      "Designed for riders who want stronger road presence and confidence on mixed terrain. Great for west-coast viewpoints and longer day trips.",
    pricePerDay: 89,
    seats: 2,
    transmission: "Automatic",
    color: "Orange",
    engine: "450cc",
    rating: 4.9,
    reviewCount: 64,
    location: "Pieta, Malta",
    images: [
      "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1400&q=80",
    ],
    highlights: ["Strong uphill performance", "Stable ride feel", "Best for day adventures"],
    features: ["LED lighting", "Heavy-duty suspension", "Digital dash"],
    addOns: [
      { id: "full-insurance", name: "Full coverage upgrade", pricePerDay: 15 },
      { id: "action-cam", name: "Action camera mount kit", pricePerDay: 5 },
    ],
  },
  {
    slug: "honda-cb125r",
    name: "Honda CB125R",
    type: "Motorcycle",
    tagline: "Sporty style with everyday comfort.",
    description:
      "A balanced choice for riders who want sharper handling and extra punch while still keeping city navigation easy.",
    pricePerDay: 54,
    seats: 2,
    transmission: "Manual",
    color: "Red",
    engine: "125cc",
    rating: 4.8,
    reviewCount: 73,
    location: "Pieta, Malta",
    images: [
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1558981285-6f0c94958bb6?auto=format&fit=crop&w=1400&q=80",
    ],
    highlights: ["Sport-inspired ride", "Manual control", "Premium look"],
    features: ["ABS braking", "LED headlamp", "Comfort seat"],
    addOns: [
      { id: "extra-helmet", name: "Extra helmet", pricePerDay: 4 },
      { id: "full-insurance", name: "Full coverage upgrade", pricePerDay: 12 },
    ],
  },
  {
    slug: "trek-fx-2",
    name: "Trek FX 2 Hybrid",
    type: "Bicycle",
    tagline: "Light, fast, and perfect for harbor rides.",
    description:
      "Great for scenic cycling in Sliema, Valletta, and coastal promenades. Comfortable geometry with dependable braking for daily exploring.",
    pricePerDay: 21,
    seats: 1,
    transmission: "Manual",
    color: "Blue",
    engine: "N/A",
    rating: 4.8,
    reviewCount: 95,
    location: "Pieta, Malta",
    images: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80",
    ],
    highlights: ["Lightweight frame", "Best for town routes", "Low daily price"],
    features: ["Multi-speed gearing", "Disc brakes", "Comfort grips"],
    addOns: [
      { id: "helmet", name: "Helmet", pricePerDay: 2 },
      { id: "child-seat", name: "Child seat", pricePerDay: 5 },
    ],
  },
];

export function getVehicleBySlug(slug: string) {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}
