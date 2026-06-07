export const ADMIN_SESSION_COOKIE = "emr_admin_session";

/** Default admin session lifetime (8 hours). */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export const ADMIN_ALLOWED_ROLES = ["ADMIN", "STAFF"] as const;

export type AdminAllowedRole = (typeof ADMIN_ALLOWED_ROLES)[number];
