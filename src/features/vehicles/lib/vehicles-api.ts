import {
  isApiVehicleType,
  mapVehicleDetailItemToVehicle,
  mapVehicleListItemToVehicle,
  type Vehicle,
  type VehicleDetailApiItem,
  type VehicleListApiItem,
} from "@/features/vehicles/data/vehicles";

type VehiclesApiResponse = {
  success: boolean;
  vehicles?: VehicleListApiItem[];
  message?: string;
};

type VehicleApiResponse = {
  success: boolean;
  vehicle?: VehicleDetailApiItem;
  message?: string;
};

function isVehicleListItem(value: unknown): value is VehicleListApiItem {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.vehicleType === "string" &&
    isApiVehicleType(candidate.vehicleType) &&
    (candidate.brand === null || typeof candidate.brand === "string") &&
    (candidate.model === null || typeof candidate.model === "string") &&
    (candidate.shortDescription === null || typeof candidate.shortDescription === "string") &&
    (candidate.description === null || typeof candidate.description === "string") &&
    (candidate.mainImageUrl === null || typeof candidate.mainImageUrl === "string") &&
    typeof candidate.helmetIncludedCount === "number" &&
    typeof candidate.supportsStorageBox === "boolean"
  );
}

function isVehicleImage(value: unknown): value is VehicleDetailApiItem["images"][number] {
  if (!value || typeof value !== "object") return false;
  const image = value as Record<string, unknown>;
  return (
    typeof image.imageUrl === "string" &&
    (image.altText === null || typeof image.altText === "string") &&
    typeof image.sortOrder === "number" &&
    typeof image.isPrimary === "boolean"
  );
}

function isVehicleDetailItem(value: unknown): value is VehicleDetailApiItem {
  if (!isVehicleListItem(value)) return false;
  const candidate = value as Record<string, unknown>;
  if (!Array.isArray(candidate.images)) return false;
  return candidate.images.every((image) => isVehicleImage(image));
}

async function parseJsonBody<T>(response: Response): Promise<T | null> {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchVehicles(signal?: AbortSignal): Promise<Vehicle[]> {
  const response = await fetch("/api/vehicles", {
    method: "GET",
    cache: "no-store",
    signal,
  });
  const body = await parseJsonBody<VehiclesApiResponse>(response);

  if (!response.ok || !body?.success) {
    throw new Error(body?.message ?? "Unable to load vehicles right now.");
  }

  if (!Array.isArray(body.vehicles)) {
    throw new Error("Unexpected vehicles response shape.");
  }

  return body.vehicles.filter(isVehicleListItem).map(mapVehicleListItemToVehicle);
}

export async function fetchVehicleBySlug(slug: string, signal?: AbortSignal): Promise<Vehicle | null> {
  const safeSlug = slug.trim();
  if (!safeSlug) {
    return null;
  }

  const response = await fetch(`/api/vehicles/${encodeURIComponent(safeSlug)}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });
  const body = await parseJsonBody<VehicleApiResponse>(response);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok || !body?.success) {
    throw new Error(body?.message ?? "Unable to load vehicle right now.");
  }

  if (!body.vehicle || !isVehicleDetailItem(body.vehicle)) {
    throw new Error("Unexpected vehicle response shape.");
  }

  return mapVehicleDetailItemToVehicle(body.vehicle);
}
