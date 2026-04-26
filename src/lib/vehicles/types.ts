import type { VehicleType } from "@/generated/prisma/client";

/** When listing is scoped to a rental window + optional viewer session (holds). */
export type VehicleRentalWindowStatus = "available" | "unavailable" | "reserved_other" | "reserved_you";

const RENTAL_WINDOW_STATUSES: readonly VehicleRentalWindowStatus[] = [
  "available",
  "unavailable",
  "reserved_other",
  "reserved_you",
];

export function isVehicleRentalWindowStatus(value: string): value is VehicleRentalWindowStatus {
  return (RENTAL_WINDOW_STATUSES as readonly string[]).includes(value);
}

export type VehicleImageDto = {
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type VehicleListItemDto = {
  id: string;
  name: string;
  slug: string;
  vehicleType: VehicleType;
  brand: string | null;
  model: string | null;
  shortDescription: string | null;
  description: string | null;
  mainImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  helmetIncludedCount: number;
  supportsStorageBox: boolean;
  rentalWindowStatus?: VehicleRentalWindowStatus;
};

export type VehicleDetailDto = VehicleListItemDto & {
  images: VehicleImageDto[];
};

export type GetVehiclesFilters = {
  type?: VehicleType;
  active?: boolean;
};

export type GetVehiclesResult = {
  vehicles: VehicleListItemDto[];
};

export type GetVehicleBySlugResult = {
  vehicle: VehicleDetailDto | null;
};
