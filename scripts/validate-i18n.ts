/**
 * Validates locale message files against en.json (structure, ICU, empties).
 * Run: npm run validate:i18n
 */
import * as fs from "node:fs";
import * as path from "node:path";
import {
  ACTIVE_LOCALES,
  MESSAGES_DIR,
  REFERENCE_LOCALE,
  extractIcuRichTypes,
  extractPlaceholders,
  loadLocaleMap,
  type ActiveLocale,
} from "./i18n-shared";

type LocaleReport = {
  locale: string;
  fileExists: boolean;
  missingKeys: string[];
  extraKeys: string[];
  emptyStrings: string[];
  placeholderMismatches: Array<{
    key: string;
    missingInLocale: string[];
    extraInLocale: string[];
  }>;
  icuStructureMismatches: Array<{
    key: string;
    expected: string[];
    actual: string[];
  }>;
  translatedStringCount: number;
  pass: boolean;
};

function validateLocale(locale: ActiveLocale, enKeys: Set<string>, enMap: Map<string, string>): LocaleReport {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  const fileExists = fs.existsSync(file);

  const report: LocaleReport = {
    locale,
    fileExists,
    missingKeys: [],
    extraKeys: [],
    emptyStrings: [],
    placeholderMismatches: [],
    icuStructureMismatches: [],
    translatedStringCount: 0,
    pass: fileExists,
  };

  if (!fileExists) {
    report.pass = false;
    return report;
  }

  const map = loadLocaleMap(locale);
  report.translatedStringCount = map.size;

  if (locale !== REFERENCE_LOCALE) {
    report.missingKeys = [...enKeys].filter((k) => !map.has(k)).sort();
    report.extraKeys = [...map.keys()].filter((k) => !enKeys.has(k)).sort();
  }

  for (const key of enKeys) {
    const v = map.get(key);
    if (v === undefined) continue;
    if (v.trim() === "") {
      report.emptyStrings.push(key);
    }
  }

  for (const key of enKeys) {
    const enVal = enMap.get(key)!;
    const val = map.get(key);
    if (val === undefined) continue;

    if (locale !== REFERENCE_LOCALE) {
      const enPh = extractPlaceholders(enVal);
      const locPh = extractPlaceholders(val);
      const missingInLocale = [...enPh].filter((p) => !locPh.has(p)).sort();
      const extraInLocale = [...locPh].filter((p) => !enPh.has(p)).sort();
      if (missingInLocale.length || extraInLocale.length) {
        report.placeholderMismatches.push({
          key,
          missingInLocale,
          extraInLocale,
        });
      }

      const enIcu = extractIcuRichTypes(enVal);
      const locIcu = extractIcuRichTypes(val);
      if (enIcu.join("|") !== locIcu.join("|")) {
        report.icuStructureMismatches.push({
          key,
          expected: enIcu,
          actual: locIcu,
        });
      }
    }
  }

  report.pass =
    fileExists &&
    report.missingKeys.length === 0 &&
    report.extraKeys.length === 0 &&
    report.emptyStrings.length === 0 &&
    report.placeholderMismatches.length === 0 &&
    report.icuStructureMismatches.length === 0;

  return report;
}

function printReport(reports: LocaleReport[]): void {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  i18n JSON validation report");
  console.log(`  Reference: ${REFERENCE_LOCALE}.json | Locales: ${ACTIVE_LOCALES.length}`);
  console.log("═══════════════════════════════════════════════════════════\n");

  for (const r of reports) {
    const status = r.pass ? "PASS" : "FAIL";
    console.log(`── ${r.locale} [${status}] ──`);
    console.log(`  File exists:        ${r.fileExists ? "yes" : "NO"}`);
    console.log(`  Translated strings: ${r.translatedStringCount}`);
    console.log(`  Missing keys:       ${r.missingKeys.length}`);
    console.log(`  Extra keys:         ${r.extraKeys.length}`);
    console.log(`  Empty strings:      ${r.emptyStrings.length}`);
    console.log(`  ICU placeholders:   ${r.placeholderMismatches.length} mismatch(es)`);
    console.log(`  ICU structures:     ${r.icuStructureMismatches.length} mismatch(es)`);

    if (r.missingKeys.length) {
      console.log("  Missing keys (sample):");
      r.missingKeys.slice(0, 15).forEach((k) => console.log(`    - ${k}`));
      if (r.missingKeys.length > 15) console.log(`    ... +${r.missingKeys.length - 15} more`);
    }
    if (r.extraKeys.length) {
      console.log("  Extra keys (sample):");
      r.extraKeys.slice(0, 15).forEach((k) => console.log(`    + ${k}`));
      if (r.extraKeys.length > 15) console.log(`    ... +${r.extraKeys.length - 15} more`);
    }
    if (r.emptyStrings.length) {
      console.log("  Empty strings (sample):");
      r.emptyStrings.slice(0, 10).forEach((k) => console.log(`    ! ${k}`));
    }
    if (r.placeholderMismatches.length) {
      console.log("  Placeholder mismatches (sample):");
      r.placeholderMismatches.slice(0, 5).forEach((m) => {
        console.log(`    ${m.key}: missing=[${m.missingInLocale.join(", ")}] extra=[${m.extraInLocale.join(", ")}]`);
      });
    }
    if (r.icuStructureMismatches.length) {
      console.log("  ICU structure mismatches (sample):");
      r.icuStructureMismatches.slice(0, 5).forEach((m) => {
        console.log(`    ${m.key}: expected [${m.expected.join(", ")}] got [${m.actual.join(", ")}]`);
      });
    }
    console.log("");
  }
}

function main(): void {
  let loadError: string | null = null;
  let enMap: Map<string, string>;

  try {
    enMap = loadLocaleMap(REFERENCE_LOCALE);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  }

  const enKeys = new Set(enMap.keys());
  const reports: LocaleReport[] = [];

  for (const locale of ACTIVE_LOCALES) {
    try {
      reports.push(validateLocale(locale, enKeys, enMap));
    } catch (e) {
      loadError = e instanceof Error ? e.message : String(e);
      reports.push({
        locale,
        fileExists: false,
        missingKeys: [],
        extraKeys: [],
        emptyStrings: [],
        placeholderMismatches: [],
        icuStructureMismatches: [],
        translatedStringCount: 0,
        pass: false,
      });
    }
  }

  printReport(reports);

  const allPass = !loadError && reports.every((r) => r.pass);
  if (loadError) console.error(`Load error: ${loadError}`);

  if (allPass) {
    console.log(
      `\n✓ i18n validation OK: all ${ACTIVE_LOCALES.length} locales match ${REFERENCE_LOCALE}.json structure.`,
    );
    process.exit(0);
  }

  console.error("\n✗ i18n validation FAILED. Fix issues above before release.");
  process.exit(1);
}

main();
