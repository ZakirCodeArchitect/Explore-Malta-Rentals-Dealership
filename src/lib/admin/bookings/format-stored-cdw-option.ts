export function formatStoredCdwOptionLabel(cdwOption: string): string {
  switch (cdwOption) {
    case "REDUCE_350_50CC":
      return "50cc reduced liability (EUR 350)";
    case "REDUCE_500_125CC":
      return "125cc reduced liability (EUR 500)";
    case "FULL_COVERAGE_50CC_125CC":
      return "Full coverage (50cc/125cc)";
    case "REDUCE_800_ATV":
      return "ATV reduced liability (EUR 800)";
    case "NO_CDW":
    default:
      return "No CDW";
  }
}
