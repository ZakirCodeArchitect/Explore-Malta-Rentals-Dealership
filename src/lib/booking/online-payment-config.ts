/** Whether Stripe/online checkout is active. Exposed to client via NEXT_PUBLIC_BOOKING_ENABLED. */
export function isOnlinePaymentEnabled(): boolean {
  const value =
    process.env.NEXT_PUBLIC_BOOKING_ENABLED?.trim() ??
    process.env.BOOKING_ENABLED?.trim();
  return value === "true";
}
