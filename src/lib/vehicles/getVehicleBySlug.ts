import { prisma } from "@/lib/prisma";

import type { GetVehicleBySlugResult, VehicleDetailDto } from "./types";

function mapVehicleDetail(vehicle: {
  id: string;
  name: string;
  slug: string;
  vehicleType: VehicleDetailDto["vehicleType"];
  brand: string | null;
  model: string | null;
  shortDescription: string | null;
  description: string | null;
  mainImageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  helmetIncludedCount: number;
  supportsStorageBox: boolean;
  images: VehicleDetailDto["images"];
}): VehicleDetailDto {
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
    images: vehicle.images.map((image) => ({
      imageUrl: image.imageUrl,
      altText: image.altText,
      sortOrder: image.sortOrder,
      isPrimary: image.isPrimary,
    })),
  };
}

export async function getVehicleBySlug(slug: string): Promise<GetVehicleBySlugResult> {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      slug,
      isActive: true,
    },
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
        select: {
          imageUrl: true,
          altText: true,
          sortOrder: true,
          isPrimary: true,
        },
      },
    },
  });

  if (!vehicle) {
    return { vehicle: null };
  }

  return {
    vehicle: mapVehicleDetail(vehicle),
  };
}
