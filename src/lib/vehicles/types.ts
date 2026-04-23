import type { VehicleType } from "@/generated/prisma/client";

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
