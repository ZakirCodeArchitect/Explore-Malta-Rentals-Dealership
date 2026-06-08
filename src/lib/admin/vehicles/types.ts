import type { VehicleCatalogStatus, VehicleType } from "@/generated/prisma/client";

export type AdminVehicleImageDto = {
  id?: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type AdminVehicleListItem = {
  id: string;
  name: string;
  slug: string;
  vehicleType: VehicleType;
  brand: string | null;
  model: string | null;
  mainImageUrl: string | null;
  catalogStatus: VehicleCatalogStatus;
  isActive: boolean;
  displayOrder: number;
  licensePlate: string;
  bookingCount: number;
  canDelete: boolean;
};

export type AdminVehicleDetail = AdminVehicleListItem & {
  shortDescription: string | null;
  description: string | null;
  helmetIncludedCount: number;
  supportsStorageBox: boolean;
  baseDailyRate: number;
  images: AdminVehicleImageDto[];
  createdAt: string;
  updatedAt: string;
};

export type AdminVehicleListFilters = {
  search?: string;
  vehicleType?: VehicleType;
  catalogStatus?: VehicleCatalogStatus;
};

export type AdminVehicleListResult = {
  vehicles: AdminVehicleListItem[];
  total: number;
};

export const VEHICLE_CATALOG_STATUSES: VehicleCatalogStatus[] = [
  "AVAILABLE",
  "BOOKED",
  "UNDER_PROCESS",
  "SOLD",
  "MAINTENANCE",
  "INACTIVE",
];

export const VEHICLE_TYPES: VehicleType[] = ["Scooter", "Motorcycle", "Bicycle", "ATV"];
