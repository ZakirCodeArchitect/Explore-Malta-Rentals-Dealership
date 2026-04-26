import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/generated/prisma/index";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

/**
 * pg ≥8.16 warns when `sslmode` is prefer/require/verify-ca without opting into
 * future libpq semantics. Those values are currently treated like `verify-full`;
 * setting it explicitly silences the warning and keeps the same behavior until pg v9.
 * @see https://www.postgresql.org/docs/current/libpq-ssl.html
 */
function explicitPgSslMode(urlString: string): string {
  try {
    const url = new URL(urlString);
    const mode = url.searchParams.get("sslmode")?.toLowerCase();
    if (
      mode &&
      ["prefer", "require", "verify-ca"].includes(mode) &&
      url.searchParams.get("uselibpqcompat") !== "true"
    ) {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
  } catch {
    /* non-URL strings (e.g. socket paths) — use as-is */
  }
  return urlString;
}

const pool =
  globalForPrisma.pgPool ?? new Pool({ connectionString: explicitPgSslMode(connectionString) });
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pool;
}

const adapter = new PrismaPg(pool);

const hasVehicleDelegate = (client: PrismaClient | undefined): client is PrismaClient => {
  if (!client) {
    return false;
  }
  return typeof (client as PrismaClient & { vehicle?: unknown }).vehicle !== "undefined";
};

const prismaClient =
  hasVehicleDelegate(globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
