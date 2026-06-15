/**
 * Sweeps expired reservation holds and releases orphaned hold occupancy rows.
 *
 * Run: npm run cleanup:expired-holds
 */
import "dotenv/config";

import { cleanupExpiredHolds } from "../src/lib/reservation-holds/cleanupExpiredHolds";

async function main(): Promise<void> {
  const result = await cleanupExpiredHolds();

  console.log("Expired holds cleanup summary:");
  console.log(`  Expired holds found: ${result.expiredHoldsFound}`);
  console.log(`  Holds marked expired: ${result.holdsExpired}`);
  console.log(`  Hold occupancy rows released: ${result.occupancyRowsReleased}`);
  console.log(`  Orphan hold occupancy rows released: ${result.orphanOccupancyReleased}`);

  if (result.errors.length > 0) {
    console.error(`  Errors: ${result.errors.length}`);
    for (const error of result.errors) {
      console.error(`    - hold=${error.holdId ?? "unknown"}: ${error.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("Cleanup completed successfully.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exitCode = 1;
});
