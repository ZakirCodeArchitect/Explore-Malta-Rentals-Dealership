/**
 * Flags locale JSON values that are identical to English (likely untranslated).
 * Run: npm run audit:i18n-content
 *
 * Exit 0 always — findings are warnings in reports (used by audit:i18n with warn-only).
 */
import * as fs from "node:fs";
import * as path from "node:path";
import {
  ACTIVE_LOCALES,
  REFERENCE_LOCALE,
  loadLocaleMap,
  writeReportJson,
  writeReportMarkdown,
} from "./i18n-shared";

type Allowlist = {
  globalAllowedValues: string[];
  allowedKeys: string[];
};

type Finding = {
  locale: string;
  key: string;
  englishValue: string;
  translatedValue: string;
  reason: string;
};

const ALLOWLIST_PATH = path.join(__dirname, "i18n-allowlist.json");

function loadAllowlist(): Allowlist {
  const raw = fs.readFileSync(ALLOWLIST_PATH, "utf8");
  return JSON.parse(raw) as Allowlist;
}

const URL_RE = /^https?:\/\//i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+().-]{7,}$/;
const CURRENCY_RE = /^(EUR|USD|GBP|€|\$|£)$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

function isAllowedIdentical(key: string, value: string, allowlist: Allowlist): boolean {
  if (allowlist.allowedKeys.includes(key)) return true;
  if (allowlist.globalAllowedValues.some((v) => value === v || value.includes(v))) return true;
  if (URL_RE.test(value.trim())) return true;
  if (EMAIL_RE.test(value.trim())) return true;
  if (PHONE_RE.test(value.trim())) return true;
  if (CURRENCY_RE.test(value.trim())) return true;
  if (SLUG_RE.test(value.trim()) && value.length < 40) return true;
  if (/^\+?\d[\d\s().-]{6,}$/.test(value.trim())) return true;
  if (value.length <= 2) return true;
  if (/^\{[^}]+\}$/.test(value.trim())) return true;
  return false;
}

function main(): void {
  const allowlist = loadAllowlist();
  const enMap = loadLocaleMap(REFERENCE_LOCALE);
  const findings: Finding[] = [];
  const byLocale = new Map<string, Finding[]>();

  for (const locale of ACTIVE_LOCALES) {
    if (locale === REFERENCE_LOCALE) continue;

    const map = loadLocaleMap(locale);
    const localeFindings: Finding[] = [];

    for (const [key, enVal] of enMap) {
      const locVal = map.get(key);
      if (locVal === undefined) continue;
      if (enVal.trim() !== locVal.trim()) continue;
      if (isAllowedIdentical(key, enVal, allowlist)) continue;

      const finding: Finding = {
        locale,
        key,
        englishValue: enVal,
        translatedValue: locVal,
        reason: "Identical to English (likely untranslated)",
      };
      localeFindings.push(finding);
      findings.push(finding);
    }

    byLocale.set(locale, localeFindings);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    referenceLocale: REFERENCE_LOCALE,
    totalFindings: findings.length,
    localesAudited: ACTIVE_LOCALES.filter((l) => l !== REFERENCE_LOCALE).length,
    byLocaleCount: Object.fromEntries(
      [...byLocale.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([loc, f]) => [loc, f.length]),
    ),
    findings,
  };

  const jsonPath = writeReportJson("i18n-content-audit.json", summary);

  const mdLines = [
    "# i18n content audit (untranslated JSON values)",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    `**Total findings:** ${findings.length} (values identical to \`${REFERENCE_LOCALE}.json\` but not allowlisted)`,
    "",
    "> This check is **warning-only**. Identical strings may be intentional; review each finding.",
    "",
    "## Summary by locale",
    "",
    "| Locale | Identical-to-English count |",
    "|--------|---------------------------|",
  ];

  for (const locale of ACTIVE_LOCALES) {
    if (locale === REFERENCE_LOCALE) continue;
    const count = byLocale.get(locale)?.length ?? 0;
    mdLines.push(`| ${locale} | ${count} |`);
  }

  mdLines.push("", "## Findings (sample)", "");

  const sample = findings.slice(0, 200);
  if (sample.length === 0) {
    mdLines.push("_No suspicious identical values found._");
  } else {
    mdLines.push("| Locale | Key | English value | Reason |");
    mdLines.push("|--------|-----|---------------|--------|");
    for (const f of sample) {
      const val = f.englishValue.replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 80);
      mdLines.push(`| ${f.locale} | \`${f.key}\` | ${val} | ${f.reason} |`);
    }
    if (findings.length > 200) {
      mdLines.push("", `_… and ${findings.length - 200} more in \`reports/i18n-content-audit.json\`._`);
    }
  }

  const mdPath = writeReportMarkdown("i18n-content-audit.md", `${mdLines.join("\n")}\n`);

  console.log(`i18n content audit: ${findings.length} finding(s)`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  MD:   ${mdPath}`);
  console.log("(Warning-only — does not fail the build.)");
}

main();
