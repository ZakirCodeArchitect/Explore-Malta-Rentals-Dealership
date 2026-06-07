import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import {
  buildAdminSessionClearCookie,
  readAdminSessionTokenFromCookies,
  revokeAdminSessionByToken,
} from "@/lib/admin-auth";
import { routing } from "@/i18n/routing";

function resolveLocale(value: string | null): string {
  if (value && routing.locales.includes(value as (typeof routing.locales)[number])) {
    return value;
  }
  return routing.defaultLocale;
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = resolveLocale(searchParams.get("locale"));
  const token = await readAdminSessionTokenFromCookies();

  if (token) {
    await revokeAdminSessionByToken(token);
  }

  const cookieStore = await cookies();
  const clearCookie = buildAdminSessionClearCookie();
  cookieStore.set(clearCookie.name, clearCookie.value, {
    httpOnly: clearCookie.httpOnly,
    secure: clearCookie.secure,
    sameSite: clearCookie.sameSite,
    path: clearCookie.path,
    maxAge: clearCookie.maxAge,
  });

  return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url), 303);
}
