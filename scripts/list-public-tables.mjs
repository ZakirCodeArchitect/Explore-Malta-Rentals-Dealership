import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

const tables = await pool.query(
  `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
);

console.log("Public tables (" + tables.rows.length + "):");
for (const row of tables.rows) {
  console.log("  -", row.tablename);
}

const booking = await pool.query(`SELECT COUNT(*)::int AS n FROM "Booking"`);
console.log("Booking row count:", booking.rows[0].n);

await pool.end();
