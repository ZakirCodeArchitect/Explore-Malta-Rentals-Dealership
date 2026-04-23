import "dotenv/config";
import { randomUUID } from "node:crypto";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

const vehicles = [
  {
    name: "Neco One 50cc",
    slug: "neco-one-50cc",
    vehicleType: "MOTORBIKE_50CC",
    brand: "Neco",
    model: "One 50cc",
    shortDescription: "Compact automatic 50cc scooter for city rides.",
    description:
      "A lightweight 50cc automatic scooter suitable for short trips around Malta and nearby local routes.",
    mainImageUrl: "/product-images/neco-one-50cc.png",
    displayOrder: 10,
    helmetIncludedCount: 2,
    supportsStorageBox: true,
  },
  {
    name: "Lexmoto Aura 125cc",
    slug: "lexmoto-aura-125cc",
    vehicleType: "MOTORBIKE_125CC",
    brand: "Lexmoto",
    model: "Aura 125",
    shortDescription: "Reliable 125cc automatic scooter for island touring.",
    description:
      "A practical 125cc scooter with balanced comfort and range, ideal for exploring Malta beyond city traffic.",
    mainImageUrl: "/product-images/lexmoto-aura-125cc.png",
    displayOrder: 20,
    helmetIncludedCount: 2,
    supportsStorageBox: true,
  },
  {
    name: "Giant Escape City Bike",
    slug: "giant-escape-city-bike",
    vehicleType: "BICYCLE",
    brand: "Giant",
    model: "Escape",
    shortDescription: "Comfort-focused bicycle for scenic daytime routes.",
    description:
      "A stable and comfortable city bicycle suitable for coastal rides, short commutes, and easy sightseeing.",
    mainImageUrl: "/product-images/giant-escape-city-bike.png",
    displayOrder: 30,
    helmetIncludedCount: 1,
    supportsStorageBox: false,
  },
  {
    name: "CFMOTO CForce ATV",
    slug: "cfmoto-cforce-atv",
    vehicleType: "ATV",
    brand: "CFMOTO",
    model: "CForce",
    shortDescription: "ATV with strong handling for off-main-road adventures.",
    description:
      "A capable ATV designed for riders looking for extra stability and power during guided or approved routes.",
    mainImageUrl: "/product-images/cfmoto-cforce-atv.png",
    displayOrder: 40,
    helmetIncludedCount: 2,
    supportsStorageBox: true,
  },
];

const upsertSql = `
  INSERT INTO "Vehicle" (
    "id",
    "name",
    "slug",
    "vehicleType",
    "brand",
    "model",
    "shortDescription",
    "description",
    "mainImageUrl",
    "isActive",
    "displayOrder",
    "helmetIncludedCount",
    "supportsStorageBox",
    "createdAt",
    "updatedAt"
  )
  VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, $11, $12, NOW(), NOW()
  )
  ON CONFLICT ("slug")
  DO UPDATE SET
    "name" = EXCLUDED."name",
    "vehicleType" = EXCLUDED."vehicleType",
    "brand" = EXCLUDED."brand",
    "model" = EXCLUDED."model",
    "shortDescription" = EXCLUDED."shortDescription",
    "description" = EXCLUDED."description",
    "mainImageUrl" = EXCLUDED."mainImageUrl",
    "isActive" = true,
    "displayOrder" = EXCLUDED."displayOrder",
    "helmetIncludedCount" = EXCLUDED."helmetIncludedCount",
    "supportsStorageBox" = EXCLUDED."supportsStorageBox",
    "updatedAt" = NOW()
  RETURNING "id", "slug";
`;

async function main() {
  console.log(`Seeding ${vehicles.length} vehicles...`);

  for (const vehicle of vehicles) {
    const result = await pool.query(upsertSql, [
      randomUUID(),
      vehicle.name,
      vehicle.slug,
      vehicle.vehicleType,
      vehicle.brand,
      vehicle.model,
      vehicle.shortDescription,
      vehicle.description,
      vehicle.mainImageUrl,
      vehicle.displayOrder,
      vehicle.helmetIncludedCount,
      vehicle.supportsStorageBox,
    ]);

    const row = result.rows[0];
    console.log(`Upserted vehicle: ${row.slug} (${row.id})`);
  }

  console.log("Vehicle seed complete.");
}

try {
  await main();
} catch (error) {
  console.error("Vehicle seed failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
