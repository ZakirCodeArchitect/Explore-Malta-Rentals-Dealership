export const ADMIN_SESSION_COOKIE = "emr_admin_session";

/** Default admin session lifetime (8 hours). */
export const ADMIN_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export const ADMIN_ALLOWED_ROLES = ["ADMIN", "STAFF"] as const;

export type AdminAllowedRole = (typeof ADMIN_ALLOWED_ROLES)[number];

/** Max failed login attempts per email/IP before lockout. */
export const ADMIN_LOGIN_FAILURE_MAX_ATTEMPTS = 5;

/** Rolling window for counting failed login attempts. */
export const ADMIN_LOGIN_FAILURE_WINDOW_MS = 15 * 60 * 1000;

/** Duration of login lockout after the failure threshold is reached. */
export const ADMIN_LOGIN_LOCKOUT_DURATION_MS = 15 * 60 * 1000;

/** Delete stale lockout rows older than this during login checks. */
export const ADMIN_LOGIN_ATTEMPT_STALE_MS = 24 * 60 * 60 * 1000;

export const ADMIN_LOGIN_GENERIC_ERROR =
  "Invalid credentials or too many attempts. Please try again later.";
