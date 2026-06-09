import type { ValidationError } from "@/lib/booking/types";

export function validateStorageBoxSelection(
  supportsStorageBox: boolean,
  storageBoxSelected: boolean,
): ValidationError | null {
  if (storageBoxSelected && !supportsStorageBox) {
    return {
      path: "addons.storageBoxSelected",
      message: "Storage box is not available for the selected vehicle",
    };
  }

  return null;
}
