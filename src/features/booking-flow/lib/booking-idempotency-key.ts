/** Stable client idempotency key for a single booking submit attempt (UUID v4). */
export function createBookingIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  throw new Error("crypto.randomUUID is not available in this environment");
}
