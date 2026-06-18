import type { Prisma } from "@/generated/prisma/index";
import { deleteOccupancyForHold } from "@/lib/vehicle-unit-occupancy";
import { prisma } from "@/lib/prisma";

type ReleaseDb = typeof prisma | Prisma.TransactionClient;

/**
 * Deletes hold-linked occupancy rows whose holds are expired, released, or converted.
 * Safe inside transactions and idempotent. Does not touch booking occupancy.
 */
export async function releaseStaleHoldOccupancy(
  db: ReleaseDb = prisma,
  now: Date = new Date(),
): Promise<number> {
  const orphanRows = await db.$queryRaw<Array<{ reservationHoldId: string }>>`
    SELECT o."reservationHoldId"
    FROM "VehicleUnitOccupancy" o
    INNER JOIN "ReservationHold" h ON h.id = o."reservationHoldId"
    WHERE o."reservationHoldId" IS NOT NULL
      AND (
        h.status IN ('EXPIRED', 'RELEASED', 'CONVERTED')
        OR (h.status = 'ACTIVE' AND h."expiresAt" <= ${now})
      )
  `;

  let released = 0;
  for (const row of orphanRows) {
    if (!row.reservationHoldId) {
      continue;
    }

    await deleteOccupancyForHold(db, row.reservationHoldId);
    released += 1;
  }

  return released;
}
