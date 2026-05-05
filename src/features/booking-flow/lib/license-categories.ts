export const LICENSE_CATEGORIES = ["B", "AM", "A", "A1", "A2"] as const;

export type LicenseCategory = (typeof LICENSE_CATEGORIES)[number];

const LICENSES_FOR_50CC: readonly LicenseCategory[] = ["B", "AM"];
const LICENSES_FOR_125CC: readonly LicenseCategory[] = ["A", "A1", "A2"];
const LICENSES_FOR_ATV: readonly LicenseCategory[] = ["B"];

export function getAllowedLicenseCategories(
  selectedVehicleType: string,
  selectedVehicleId?: string | null,
): readonly LicenseCategory[] {
  const normalizedType = selectedVehicleType.toLowerCase();
  const normalizedId = (selectedVehicleId ?? "").toLowerCase();
  if (normalizedType === "atv" || normalizedId.includes("atv")) {
    return LICENSES_FOR_ATV;
  }
  if (normalizedType === "scooter" || normalizedId.includes("50cc")) {
    return LICENSES_FOR_50CC;
  }
  if (normalizedType === "motorcycle" || normalizedId.includes("125cc")) {
    return LICENSES_FOR_125CC;
  }
  return LICENSE_CATEGORIES;
}

export function isLicenseAllowedForVehicle(
  licenseCategory: string,
  selectedVehicleType: string,
  selectedVehicleId?: string | null,
): boolean {
  if (!licenseCategory) {
    return false;
  }
  return getAllowedLicenseCategories(selectedVehicleType, selectedVehicleId).includes(
    licenseCategory as LicenseCategory,
  );
}

export function getLicenseCategoryHint(selectedVehicleType: string): string {
  if (selectedVehicleType.toLowerCase().includes("atv")) {
    return "ATV requires license B.";
  }
  return "50cc requires license B or AM. 125cc requires A, A1, or A2.";
}
