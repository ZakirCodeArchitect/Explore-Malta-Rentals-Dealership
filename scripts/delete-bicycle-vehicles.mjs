import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

async function main() {
  const result = await pool.query(
    'DELETE FROM "Vehicle" WHERE "vehicleType" = $1 RETURNING "id", "slug", "name";',
    ["BICYCLE"],
  );

  if (result.rowCount === 0) {
    console.log("No bicycle vehicles found to delete.");
    return;
  }

  console.log(`Deleted ${result.rowCount} bicycle vehicle(s):`);
  for (const vehicle of result.rows) {
    console.log(`- ${vehicle.slug} (${vehicle.id}) ${vehicle.name}`);
  }
}

try {
  await main();
} catch (error) {
  console.error("Failed to delete bicycle vehicles:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
