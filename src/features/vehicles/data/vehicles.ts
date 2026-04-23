export type ApiVehicleType = "MOTORBIKE_50CC" | "MOTORBIKE_125CC" | "BICYCLE" | "ATV";
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

export type VehicleListApiItem = Readonly<{
  id: string;
  name: string;
  slug: string;
  vehicleType: ApiVehicleType;
  brand: string | null;
  model: string | null;
  shortDescription: string | null;
  description: string | null;
  mainImageUrl: string | null;
  helmetIncludedCount: number;
  supportsStorageBox: boolean;
}>;

export type VehicleImageApiItem = Readonly<{
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
}>;

export type VehicleDetailApiItem = VehicleListApiItem & {
  images: VehicleImageApiItem[];
};

export type Vehicle = Readonly<{
  id: string;
  slug: string;
  name: string;
  type: VehicleType;
  apiVehicleType: ApiVehicleType;
  brand: string | null;
  model: string | null;
  shortDescription: string | null;
  tagline: string;
  description: string;
  mainImageUrl: string | null;
  images: readonly string[];
  helmetIncludedCount: number;
  supportsStorageBox: boolean;
  pricePerDay: number;
  securityDepositEUR?: number;
  seats: number;
  transmission: Transmission;
  fuel: string;
  color: VehicleColor;
  engine: string;
  rating: number;
  reviewCount: number;
  location: string;
  highlights: readonly string[];
  features: readonly string[];
  addOns: readonly VehicleAddOn[];
}>;

const PLACEHOLDER_ADDONS: readonly VehicleAddOn[] = [
  { id: "low-road-insurance", name: "Lowest Road Insurance", pricePerDay: 3 },
  { id: "full-coverage-insurance", name: "Full Coverage Insurance", pricePerDay: 8 },
];

function readableApiVehicleType(type: ApiVehicleType): string {
  switch (type) {
    case "MOTORBIKE_50CC":
      return "Motorbike 50cc";
    case "MOTORBIKE_125CC":
      return "Motorbike 125cc";
    case "BICYCLE":
      return "Bicycle";
    case "ATV":
      return "ATV";
    default:
      return "Vehicle";
  }
}

function mapApiTypeToListingType(type: ApiVehicleType): VehicleType {
  if (type === "ATV") return "ATV";
  if (type === "BICYCLE") return "Bicycle";
  return "Scooter";
}

function engineByApiType(type: ApiVehicleType): string {
  if (type === "MOTORBIKE_50CC") return "50cc";
  if (type === "MOTORBIKE_125CC") return "125cc";
  if (type === "ATV") return "ATV";
  return "Bicycle";
}

function supportsStorageFeatureLabel(supportsStorageBox: boolean): string {
  return supportsStorageBox ? "Storage box available" : "Storage box unavailable";
}

function toVehicleImageList(
  mainImageUrl: string | null,
  images: readonly VehicleImageApiItem[] | undefined,
): string[] {
  const imageUrls = (images ?? []).map((image) => image.imageUrl).filter(Boolean);
  if (mainImageUrl && !imageUrls.includes(mainImageUrl)) {
    return [mainImageUrl, ...imageUrls];
  }
  return mainImageUrl ? [mainImageUrl] : imageUrls;
}

function buildTagline(item: VehicleListApiItem): string {
  if (item.shortDescription?.trim()) return item.shortDescription;
  const parts = [item.brand, item.model].filter(Boolean);
  if (parts.length > 0) return `${parts.join(" ")} · ${readableApiVehicleType(item.vehicleType)}`;
  return readableApiVehicleType(item.vehicleType);
}

function buildDescription(item: VehicleListApiItem): string {
  if (item.description?.trim()) return item.description;
  if (item.shortDescription?.trim()) return item.shortDescription;
  return `${item.name} is available for booking in Malta.`;
}

export function mapVehicleListItemToVehicle(item: VehicleListApiItem): Vehicle {
  const inferredType = mapApiTypeToListingType(item.vehicleType);
  const supportsStorageBox = item.supportsStorageBox === true;

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    type: inferredType,
    apiVehicleType: item.vehicleType,
    brand: item.brand,
    model: item.model,
    shortDescription: item.shortDescription,
    tagline: buildTagline(item),
    description: buildDescription(item),
    mainImageUrl: item.mainImageUrl,
    images: item.mainImageUrl ? [item.mainImageUrl] : [],
    helmetIncludedCount: item.helmetIncludedCount,
    supportsStorageBox,
    pricePerDay: 0,
    seats: inferredType === "Bicycle" ? 1 : 2,
    transmission: inferredType === "Bicycle" ? "Manual" : "Automatic",
    fuel: inferredType === "Bicycle" ? "Human powered" : "Petrol",
    color: "Gray",
    engine: engineByApiType(item.vehicleType),
    rating: 0,
    reviewCount: 0,
    location: "Pieta, Malta",
    highlights: [
      item.helmetIncludedCount > 0 ? `${item.helmetIncludedCount} helmet(s) included` : "Helmet availability on request",
      supportsStorageFeatureLabel(supportsStorageBox),
    ],
    features: [
      item.brand || item.model ? `Model: ${[item.brand, item.model].filter(Boolean).join(" ")}` : readableApiVehicleType(item.vehicleType),
      `${item.helmetIncludedCount} helmet(s) included`,
      supportsStorageFeatureLabel(supportsStorageBox),
    ],
    addOns: supportsStorageBox
      ? [{ id: "storage-box", name: "Storage box", priceOnce: 10 }, ...PLACEHOLDER_ADDONS]
      : PLACEHOLDER_ADDONS,
  };
}

export function mapVehicleDetailItemToVehicle(item: VehicleDetailApiItem): Vehicle {
  const mapped = mapVehicleListItemToVehicle(item);
  return {
    ...mapped,
    images: toVehicleImageList(item.mainImageUrl, item.images),
  };
}

export function formatVehicleTypeLabel(type: ApiVehicleType): string {
  return readableApiVehicleType(type);
}

export function isApiVehicleType(value: string): value is ApiVehicleType {
  return (
    value === "MOTORBIKE_50CC" ||
    value === "MOTORBIKE_125CC" ||
    value === "BICYCLE" ||
    value === "ATV"
  );
}
