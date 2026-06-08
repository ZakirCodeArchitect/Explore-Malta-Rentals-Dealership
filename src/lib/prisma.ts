import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient, Prisma } from "@/generated/prisma/index";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
  prismaSchemaFingerprint?: string;
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

const hasCurrentPrismaDelegates = (client: PrismaClient | undefined): client is PrismaClient => {
  if (!client) {
    return false;
  }
  const delegateClient = client as PrismaClient & {
    vehicle?: unknown;
    adminSession?: unknown;
  };
  return (
    typeof delegateClient.vehicle !== "undefined" &&
    typeof delegateClient.adminSession !== "undefined"
  );
};

function getPrismaSchemaFingerprint(): string {
  return Object.values(Prisma.VehicleScalarFieldEnum).sort().join(",");
}

const prismaSchemaFingerprint = getPrismaSchemaFingerprint();

const prismaClient =
  hasCurrentPrismaDelegates(globalForPrisma.prisma) &&
  globalForPrisma.prismaSchemaFingerprint === prismaSchemaFingerprint
    ? globalForPrisma.prisma
    : new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaSchemaFingerprint = prismaSchemaFingerprint;
}
