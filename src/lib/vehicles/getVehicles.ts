import type { Prisma } from "@/generated/prisma/index";
import { prisma } from "@/lib/prisma";

import type { GetVehiclesFilters, GetVehiclesResult, VehicleListItemDto } from "./types";

function mapVehicleListItem(
  vehicle: {
    id: string;
    name: string;
    slug: string;
    vehicleType: VehicleListItemDto["vehicleType"];
    brand: string | null;
    model: string | null;
    shortDescription: string | null;
    description: string | null;
    mainImageUrl: string | null;
    isActive: boolean;
    displayOrder: number;
    helmetIncludedCount: number;
    supportsStorageBox: boolean;
    images: Array<{ imageUrl: string }>;
  },
): VehicleListItemDto {
  return {
    id: vehicle.id,
    name: vehicle.name,
    slug: vehicle.slug,
    vehicleType: vehicle.vehicleType,
    brand: vehicle.brand,
    model: vehicle.model,
    shortDescription: vehicle.shortDescription,
    description: vehicle.description,
    mainImageUrl: vehicle.mainImageUrl ?? vehicle.images[0]?.imageUrl ?? null,
    isActive: vehicle.isActive,
    displayOrder: vehicle.displayOrder,
    helmetIncludedCount: vehicle.helmetIncludedCount,
    supportsStorageBox: vehicle.supportsStorageBox,
  };
}

export async function getVehicles(filters: GetVehiclesFilters = {}): Promise<GetVehiclesResult> {
  const where: Prisma.VehicleWhereInput = {
    isActive: filters.active ?? true,
  };

  if (filters.type) {
    where.vehicleType = filters.type;
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      vehicleType: true,
      brand: true,
      model: true,
      shortDescription: true,
      description: true,
      mainImageUrl: true,
      isActive: true,
      displayOrder: true,
      helmetIncludedCount: true,
      supportsStorageBox: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        take: 1,
        select: {
          imageUrl: true,
        },
      },
    },
  });

  return {
    vehicles: vehicles.map(mapVehicleListItem),
  };
}
