export const LICENSE_CATEGORIES = ["B", "AM", "A", "A1", "A2"] as const;

export type LicenseCategory = (typeof LICENSE_CATEGORIES)[number];

const LICENSES_FOR_50CC: readonly LicenseCategory[] = ["B", "AM"];
const LICENSES_FOR_125CC: readonly LicenseCategory[] = ["A", "A1", "A2"];

export function getAllowedLicenseCategories(selectedVehicleId: string): readonly LicenseCategory[] {
  const normalized = selectedVehicleId.toLowerCase();
  if (normalized.includes("50cc")) {
    return LICENSES_FOR_50CC;
  }
  if (normalized.includes("125cc")) {
    return LICENSES_FOR_125CC;
  }
  return LICENSE_CATEGORIES;
}

export function isLicenseAllowedForVehicle(
  licenseCategory: string,
  selectedVehicleId: string,
): boolean {
  if (!licenseCategory) {
    return false;
  }
  return getAllowedLicenseCategories(selectedVehicleId).includes(
    licenseCategory as LicenseCategory,
  );
}

export function getLicenseCategoryHint(selectedVehicleId: string): string {
  void selectedVehicleId;
  return "50cc requires license B or AM. 125cc requires A, A1, or A2.";
}
