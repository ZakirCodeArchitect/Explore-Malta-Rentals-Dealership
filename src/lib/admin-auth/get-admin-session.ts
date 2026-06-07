import { readAdminSessionTokenFromCookies } from "@/lib/admin-auth/session-cookie";
import { getAdminSessionByToken } from "@/lib/admin-auth/session-service";
import type { AdminSessionRecord } from "@/lib/admin-auth/types";

export async function getAdminSession(): Promise<AdminSessionRecord | null> {
  const token = await readAdminSessionTokenFromCookies();
  if (!token) {
    return null;
  }

  return getAdminSessionByToken(token);
}
