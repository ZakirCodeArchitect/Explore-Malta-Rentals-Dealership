/**
 * Validates that locale message files match structure and ICU-style placeholders.
 * Run: npm run validate:i18n
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const REFERENCE_LOCALE = "en";
const LOCALES = [
  "en",
  "mt",
  "es",
  "de",
  "ko",
  "tr",
  "it",
  "vi",
  "id",
  "th",
  "pl",
  "nl",
  "bn",
  "ur",
] as const;

type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

function isPlainObject(v: unknown): v is Record<string, JsonValue> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function flattenKeys(obj: JsonValue, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  if (obj === null || typeof obj !== "object") {
    if (prefix) out.set(prefix, typeof obj === "string" ? obj : JSON.stringify(obj));
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      const next = prefix ? `${prefix}.${i}` : String(i);
      for (const [k, v] of flattenKeys(item, next)) out.set(k, v);
    });
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v) || Array.isArray(v)) {
      for (const [ik, iv] of flattenKeys(v, next)) out.set(ik, iv);
    } else {
      const str = typeof v === "string" ? v : JSON.stringify(v);
      out.set(next, str);
    }
  }
  return out;
}

/** ICU-style variables at `{name` boundaries (covers `{n}`, `{slug}`, `{count, plural, ...`). */
function extractPlaceholders(message: string): Set<string> {
  const found = new Set<string>();
  const reCommaForm = /\{([a-zA-Z_][a-zA-Z0-9_]*),/g;
  let m: RegExpExecArray | null;
  while ((m = reCommaForm.exec(message)) !== null) {
    found.add(m[1]!);
  }
  const reSimple = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
  while ((m = reSimple.exec(message)) !== null) {
    found.add(m[1]!);
  }
  return found;
}

function loadLocaleMap(locale: string): Map<string, string> {
  const file = path.join(ROOT, "messages", `${locale}.json`);
  if (!fs.existsSync(file)) {
    console.error(`Missing file: ${file}`);
    process.exit(1);
  }
  const raw = fs.readFileSync(file, "utf8");
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(raw) as JsonValue;
  } catch (e) {
    console.error(`Invalid JSON: ${file}`, e);
    process.exit(1);
  }
  return flattenKeys(parsed);
}

function main() {
  const maps = new Map<string, Map<string, string>>();
  for (const locale of LOCALES) {
    maps.set(locale, loadLocaleMap(locale));
  }

  const enMap = maps.get(REFERENCE_LOCALE)!;
  const enKeys = new Set(enMap.keys());
  let failed = false;

  const reportMissing = (locale: string, missing: string[]) => {
    if (missing.length) {
      failed = true;
      console.error(`[${locale}] Missing ${missing.length} key(s) (vs ${REFERENCE_LOCALE}):`);
      missing.slice(0, 40).forEach((k) => console.error(`  - ${k}`));
      if (missing.length > 40) console.error(`  ... and ${missing.length - 40} more`);
    }
  };

  const reportExtra = (locale: string, extra: string[]) => {
    if (extra.length) {
      failed = true;
      console.error(`[${locale}] Extra ${extra.length} key(s) (not in ${REFERENCE_LOCALE}):`);
      extra.slice(0, 40).forEach((k) => console.error(`  + ${k}`));
      if (extra.length > 40) console.error(`  ... and ${extra.length - 40} more`);
    }
  };

  for (const locale of LOCALES) {
    if (locale === REFERENCE_LOCALE) continue;
    const map = maps.get(locale)!;
    const missing = [...enKeys].filter((k) => !map.has(k)).sort();
    const extra = [...map.keys()].filter((k) => !enKeys.has(k)).sort();
    reportMissing(locale, missing);
    reportExtra(locale, extra);
  }

  for (const key of [...enKeys].sort()) {
    for (const locale of LOCALES) {
      const map = maps.get(locale)!;
      const v = map.get(key);
      if (v === undefined) continue;
      if (v.trim() === "") {
        failed = true;
        console.error(`[${locale}] Empty value: ${key}`);
      }
    }
  }

  for (const key of [...enKeys].sort()) {
    const enVal = enMap.get(key)!;
    const enPh = extractPlaceholders(enVal);
    for (const locale of LOCALES) {
      if (locale === REFERENCE_LOCALE) continue;
      const map = maps.get(locale)!;
      const oVal = map.get(key);
      if (oVal === undefined) continue;
      const oPh = extractPlaceholders(oVal);
      const missingPh = [...enPh].filter((p) => !oPh.has(p)).sort();
      const extraPh = [...oPh].filter((p) => !enPh.has(p)).sort();
      if (missingPh.length || extraPh.length) {
        failed = true;
        console.error(`Placeholder mismatch for "${key}" (${locale} vs ${REFERENCE_LOCALE}):`);
        if (missingPh.length) console.error(`  missing in ${locale}: ${missingPh.join(", ")}`);
        if (extraPh.length) console.error(`  extra in ${locale}: ${extraPh.join(", ")}`);
      }
    }
  }

  if (failed) {
    console.error("\ni18n validation failed.");
    process.exit(1);
  }
  console.log(
    `i18n validation OK: ${LOCALES.join(", ")} share the same keys with no empty values or placeholder mismatches.`,
  );
}

main();
