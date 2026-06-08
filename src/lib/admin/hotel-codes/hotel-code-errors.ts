export const HOTEL_CODE_DELETE_ERROR_CODE = "HOTEL_CODE_HAS_HISTORY" as const;

export const HOTEL_CODE_DELETE_ERROR_MESSAGE =
  "This hotel code has booking history. Deactivate it instead to preserve reporting history.";

export const INACTIVE_HOTEL_FOR_ACTIVE_CODE = "INACTIVE_HOTEL_FOR_ACTIVE_CODE" as const;
