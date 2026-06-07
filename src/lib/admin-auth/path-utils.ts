import { routing } from "@/i18n/routing";

const localePattern = routing.locales.join("|");

const ADMIN_ROOT_PATTERN = new RegExp(`^/(?:${localePattern})/admin/?$`);
const ADMIN_NESTED_PATTERN = new RegExp(`^/(?:${localePattern})/admin/(.+)$`);
const ADMIN_LOGIN_PATTERN = new RegExp(`^/(?:${localePattern})/admin/login/?$`);

export function isAdminRoutePath(pathname: string): boolean {
  return ADMIN_ROOT_PATTERN.test(pathname) || ADMIN_NESTED_PATTERN.test(pathname);
}

export function isAdminLoginPath(pathname: string): boolean {
  return ADMIN_LOGIN_PATTERN.test(pathname);
}

export function isAdminProtectedPath(pathname: string): boolean {
  return isAdminRoutePath(pathname) && !isAdminLoginPath(pathname);
}

export function extractLocaleFromPathname(pathname: string): string | null {
  const match = pathname.match(new RegExp(`^/(?:${localePattern})(?:/|$)`));
  if (!match) {
    return null;
  }
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && routing.locales.includes(segment as (typeof routing.locales)[number])
    ? segment
    : null;
}
