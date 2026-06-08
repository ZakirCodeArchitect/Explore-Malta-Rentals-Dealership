import "dotenv/config";

import { randomUUID } from "node:crypto";

import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

const DEFAULT_RULES = [
  { vehicleType: "Scooter", minDays: 1, maxDays: 1, discountPercent: 0, displayOrder: 10 },
  { vehicleType: "Scooter", minDays: 2, maxDays: 2, discountPercent: 10, displayOrder: 20 },
  { vehicleType: "Scooter", minDays: 3, maxDays: 20, discountPercent: 20, displayOrder: 30 },
  { vehicleType: "Scooter", minDays: 21, maxDays: null, discountPercent: 40, displayOrder: 40 },
  { vehicleType: "Motorcycle", minDays: 1, maxDays: 1, discountPercent: 0, displayOrder: 10 },
  { vehicleType: "Motorcycle", minDays: 2, maxDays: 2, discountPercent: 10, displayOrder: 20 },
  { vehicleType: "Motorcycle", minDays: 3, maxDays: 20, discountPercent: 20, displayOrder: 30 },
  { vehicleType: "Motorcycle", minDays: 21, maxDays: null, discountPercent: 40, displayOrder: 40 },
  { vehicleType: "Bicycle", minDays: 1, maxDays: 1, discountPercent: 0, displayOrder: 10 },
  { vehicleType: "Bicycle", minDays: 2, maxDays: 2, discountPercent: 10, displayOrder: 20 },
  { vehicleType: "Bicycle", minDays: 3, maxDays: 20, discountPercent: 20, displayOrder: 30 },
  { vehicleType: "Bicycle", minDays: 21, maxDays: null, discountPercent: 40, displayOrder: 40 },
  { vehicleType: "ATV", minDays: 1, maxDays: 1, discountPercent: 0, displayOrder: 10 },
  { vehicleType: "ATV", minDays: 2, maxDays: 2, discountPercent: 10, displayOrder: 20 },
  { vehicleType: "ATV", minDays: 3, maxDays: 20, discountPercent: 20, displayOrder: 30 },
  { vehicleType: "ATV", minDays: 21, maxDays: null, discountPercent: 40, displayOrder: 40 },
];

const upsertSql = `
  INSERT INTO "DurationPricingRule" (
    "id",
    "vehicleType",
    "minDays",
    "maxDays",
    "discountPercent",
    "isActive",
    "displayOrder",
    "createdAt",
    "updatedAt"
  )
  VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), NOW())
  ON CONFLICT DO NOTHING;
`;

const deleteTypeRulesSql = `
  DELETE FROM "DurationPricingRule"
  WHERE "vehicleType" = $1;
`;

const insertRuleSql = `
  INSERT INTO "DurationPricingRule" (
    "id",
    "vehicleType",
    "minDays",
    "maxDays",
    "discountPercent",
    "isActive",
    "displayOrder",
    "createdAt",
    "updatedAt"
  )
  VALUES ($1, $2, $3, $4, $5, true, $6, NOW(), NOW());
`;

async function main() {
  console.log(`Seeding ${DEFAULT_RULES.length} duration pricing rules...`);

  const vehicleTypes = [...new Set(DEFAULT_RULES.map((rule) => rule.vehicleType))];
  for (const vehicleType of vehicleTypes) {
    await pool.query(deleteTypeRulesSql, [vehicleType]);
  }

  for (const rule of DEFAULT_RULES) {
    await pool.query(insertRuleSql, [
      randomUUID(),
      rule.vehicleType,
      rule.minDays,
      rule.maxDays,
      rule.discountPercent,
      rule.displayOrder,
    ]);
    console.log(
      `Seeded ${rule.vehicleType}: ${rule.minDays}${rule.maxDays == null ? "+" : `–${rule.maxDays}`} days @ ${rule.discountPercent}% off`,
    );
  }

  console.log("Duration pricing rule seed complete.");
}

try {
  await main();
} catch (error) {
  console.error("Duration pricing rule seed failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
