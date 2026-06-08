import { slugifyVehicleName } from "@/lib/admin/vehicles/slugify-name";
import { prisma } from "@/lib/prisma";

export { slugifyVehicleName } from "@/lib/admin/vehicles/slugify-name";

export async function ensureUniqueVehicleSlug(baseSlug: string, excludeId?: string): Promise<string> {
  const normalizedBase = slugifyVehicleName(baseSlug);
  if (!normalizedBase) {
    throw new Error("Unable to generate slug from vehicle name");
  }

  let candidate = normalizedBase;
  let suffix = 1;

  while (true) {
    const existing = await prisma.vehicle.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }

    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
}
