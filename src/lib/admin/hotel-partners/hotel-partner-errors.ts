export const HOTEL_DELETE_ERROR_CODES = {
  HAS_CODES: "HOTEL_HAS_CODES",
  HAS_HISTORY: "HOTEL_HAS_HISTORY",
} as const;

export type HotelDeleteBlockedReason = keyof typeof HOTEL_DELETE_ERROR_CODES;

export const HOTEL_DELETE_ERROR_MESSAGES: Record<HotelDeleteBlockedReason, string> = {
  HAS_CODES:
    "This hotel has linked hotel codes. Delete unused codes or deactivate used codes first.",
  HAS_HISTORY:
    "This hotel has booking or payment history. Deactivate it instead to preserve reporting history.",
};

export function hotelDeleteBlockedReason(
  hotelCodeCount: number,
  bookingCount: number,
): HotelDeleteBlockedReason | null {
  if (hotelCodeCount > 0) {
    return "HAS_CODES";
  }
  if (bookingCount > 0) {
    return "HAS_HISTORY";
  }
  return null;
}
