import { getAdminSession } from "@/lib/admin-auth/get-admin-session";
import { AdminUnauthorizedError } from "@/lib/admin-auth/errors";
import type { AdminSessionRecord } from "@/lib/admin-auth/types";

export async function requireAdminApi(): Promise<AdminSessionRecord> {
  const session = await getAdminSession();
  if (!session) {
    throw new AdminUnauthorizedError();
  }
  return session;
}
