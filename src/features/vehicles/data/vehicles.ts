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
  pricePerDay?: number;
  priceOnce?: number;
}>;

export type Vehicle = Readonly<{
  slug: string;
  name: string;
  type: VehicleType;
  tagline: string;
  description: string;
  pricePerDay: number;
  /** Security deposit held for this model (EUR). Omit if not fixed per vehicle. */
  securityDepositEUR?: number;
  seats: number;
  transmission: Transmission;
  fuel: string;
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

const OPTIONAL_ADDONS: readonly VehicleAddOn[] = [
  { id: "storage-box", name: "Storage box", priceOnce: 10 },
  { id: "low-road-insurance", name: "Lowest Road Insurance", pricePerDay: 3 },
  { id: "full-coverage-insurance", name: "Full Coverage Insurance", pricePerDay: 8 },
];

const LEX_125_FEATURES = [
  "Automatic CVT (twist-and-go)",
  "Fuel injection",
  "Hydraulic disc brakes front & rear",
  "8L fuel tank (typical Aura 125)",
  "Under-seat storage",
  "LED lighting & digital dash (model-dependent trim)",
] as const;

const LEX_125_DESC_GREY =
  "The Aura 125 is a full-sized commuter scooter: fuel-injected 125cc single, CVT automatic, and hydraulic discs front and rear. This unit is the grey finish. Typical manufacturer figures include an 8L tank, ~134kg dry weight, and under-seat storage; ideal for two-up coastal runs when ridden within licence rules.";

const LEX_125_DESC_RED =
  "Mechanically the same Lexmoto Aura 125 as the grey bike: 125cc air-cooled single with CVT automatic and disc brakes both ends. The difference here is the red colourway. Suited to riders stepping up from smaller scooters who want stable motorway-capable performance where legally allowed.";

function lex125Grey(n: number): Vehicle {
  return {
    slug: `lex-moto-aura-125cc-grey-${n}`,
    name: `LEX MOTO AURA 125cc (Grey) #${n}`,
    type: "Scooter",
    tagline: "Lexmoto Aura 125 in matte grey — full-size automatic with twin discs.",
    description: LEX_125_DESC_GREY,
    pricePerDay: 10,
    securityDepositEUR: 350,
    seats: 2,
    transmission: "Automatic",
    fuel: "Petrol",
    color: "Gray",
    engine: "125cc (air-cooled single, fuel injected)",
    rating: 4.8,
    reviewCount: 18,
    location: "Pietà, Malta",
    images: ["/product-images/lex moto grey.png"],
    highlights: ["From EUR 10/day", "Deposit EUR 350", "Helmets & phone holders included"],
    features: [...LEX_125_FEATURES],
    addOns: [...OPTIONAL_ADDONS],
  };
}

function lex125Red(n: number): Vehicle {
  return {
    slug: `lex-moto-aura-125cc-red-${n}`,
    name: `LEX MOTO AURA 125cc (Red) #${n}`,
    type: "Scooter",
    tagline: "Same Aura 125 platform in red — 125cc automatic with confident braking.",
    description: LEX_125_DESC_RED,
    pricePerDay: 10,
    securityDepositEUR: 350,
    seats: 2,
    transmission: "Automatic",
    fuel: "Petrol",
    color: "Red",
    engine: "125cc (air-cooled single, fuel injected)",
    rating: 4.7,
    reviewCount: 12,
    location: "Pietà, Malta",
    images: ["/product-images/lex moto red.png"],
    highlights: ["From EUR 10/day", "Deposit EUR 350", "Helmets & phone holders included"],
    features: [...LEX_125_FEATURES],
    addOns: [...OPTIONAL_ADDONS],
  };
}

const NECO_50_FEATURES = [
  "Automatic CVT",
  "50cc air-cooled 4-stroke",
  "12″ wheels — easy in traffic",
  "CBS linked brakes on many One 12 builds",
  "EFI (typical current stock)",
  "Practical under-seat space for essentials",
] as const;

function necoOneBlack(n: number): Vehicle {
  return {
    slug: `neco-one-50cc-black-${n}`,
    name: `NECO ONE (50cc) #${n}`,
    type: "Scooter",
    tagline: "NECO One 12″ — lightweight 50cc commuter for Valletta loops.",
    description:
      "The standard NECO ONE is a modern urban scooter in the NECO One 12″ line: 50cc automatic, low weight, and simple ergonomics for filtering traffic. Figures published for this family often include ~5–5.5L fuel tanks, 12″ wheels, and EFI — exact trim may vary; ask at pickup if you need a specific feature.",
    pricePerDay: 10,
    securityDepositEUR: 350,
    seats: 2,
    transmission: "Automatic",
    fuel: "Petrol",
    color: "Black",
    engine: "50cc (air-cooled single, typical One 12″ class)",
    rating: 4.8,
    reviewCount: 11,
    location: "Pietà, Malta",
    images: ["/product-images/neco one.png"],
    highlights: ["From EUR 10/day", "Nimble 50cc automatic", "Helmets & phone holders included"],
    features: [...NECO_50_FEATURES],
    addOns: [...OPTIONAL_ADDONS],
  };
}

function necoRetroBlackYellow(n: number): Vehicle {
  return {
    slug: `neco-one-retro-50cc-${n}`,
    name: `NECO ONE RETRO (50cc) #${n}`,
    type: "Scooter",
    tagline: "Retro-styled NECO — black & yellow finish, compact automatic.",
    description:
      "The NECO ONE RETRO pairs vintage-inspired bodywork with a light, easy automatic package. Black and yellow colourway. In line with NECO’s One 12″–class urban scooters sold in Malta: 50cc four-stroke, CVT, and a small wheelbase suited to tight town streets. Check your licence category for 50cc use.",
    pricePerDay: 10,
    securityDepositEUR: 350,
    seats: 2,
    transmission: "Automatic",
    fuel: "Petrol",
    color: "Black",
    engine: "50cc (air-cooled single, typical One 12″ class)",
    rating: 4.7,
    reviewCount: 9,
    location: "Pietà, Malta",
    images: ["/product-images/neco one retro.png"],
    highlights: ["From EUR 10/day", "Light 50cc urban scooter", "Helmets & phone holders included"],
    features: [
      "Automatic CVT",
      "50cc air-cooled 4-stroke (One 12″ class)",
      "Compact 12″ wheel format",
      "Retro bodywork — black & yellow styling",
      "Linked / combined braking (CBS) typical on range",
      "Electronic fuel injection (typical current stock)",
    ],
    addOns: [...OPTIONAL_ADDONS],
  };
}

export const vehicles: readonly Vehicle[] = [
  ...[1, 2, 3, 4, 5].map((n) => lex125Grey(n)),
  ...[1, 2, 3, 4, 5].map((n) => lex125Red(n)),
  ...[1, 2, 3].map((n) => necoOneBlack(n)),
  ...[1, 2].map((n) => necoRetroBlackYellow(n)),
];

export function getVehicleBySlug(slug: string) {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}
