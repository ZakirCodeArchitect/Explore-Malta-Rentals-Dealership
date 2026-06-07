import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth/get-admin-session";
import type { AdminSessionRecord } from "@/lib/admin-auth/types";

type RequireAdminPageOptions = {
  locale: string;
  redirectTo?: string;
};

export async function requireAdminPage(
  options: RequireAdminPageOptions,
): Promise<AdminSessionRecord> {
  const session = await getAdminSession();
  if (!session) {
    const loginPath = `/${options.locale}/admin/login`;
    const requestedPath = options.redirectTo ?? loginPath;
    if (requestedPath !== loginPath) {
      redirect(`${loginPath}?redirect=${encodeURIComponent(requestedPath)}`);
    }
    redirect(loginPath);
  }

  return session;
}

export async function redirectIfAdminAuthenticated(locale: string): Promise<void> {
  const session = await getAdminSession();
  if (session) {
    redirect(`/${locale}/admin`);
  }
}
