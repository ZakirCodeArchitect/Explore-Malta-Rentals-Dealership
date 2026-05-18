/**
 * Shared helpers for i18n validation and audit scripts.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { routing } from "../src/i18n/routing";

export const ROOT = path.resolve(__dirname, "..");
export const MESSAGES_DIR = path.join(ROOT, "messages");
export const REPORTS_DIR = path.join(ROOT, "reports");
export const REFERENCE_LOCALE = routing.defaultLocale;
export const ACTIVE_LOCALES = [...routing.locales] as const;
export type ActiveLocale = (typeof ACTIVE_LOCALES)[number];

export type JsonValue = null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue };

export function isPlainObject(v: unknown): v is Record<string, JsonValue> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function flattenKeys(obj: JsonValue, prefix = ""): Map<string, string> {
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

/** ICU variables at `{name` boundaries (covers `{n}`, `{slug}`, `{count, plural, ...}`). */
export function extractPlaceholders(message: string): Set<string> {
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

/** ICU plural/select/other rich constructs: `{var, plural, ...}` → `var:plural` */
export function extractIcuRichTypes(message: string): string[] {
  const types: string[] = [];
  const re = /\{([a-zA-Z_][a-zA-Z0-9_]*),\s*(plural|select|selectordinal|number|date|time)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(message)) !== null) {
    types.push(`${m[1]}:${m[2]!.toLowerCase()}`);
  }
  return types.sort();
}

export function loadLocaleJson(locale: string): JsonValue {
  const file = path.join(MESSAGES_DIR, `${locale}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing locale file: ${file}`);
  }
  const raw = fs.readFileSync(file, "utf8");
  try {
    return JSON.parse(raw) as JsonValue;
  } catch (e) {
    throw new Error(`Invalid JSON in ${file}: ${e instanceof Error ? e.message : String(e)}`);
  }
}

export function loadLocaleMap(locale: string): Map<string, string> {
  return flattenKeys(loadLocaleJson(locale));
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeReportJson(filename: string, data: unknown): string {
  ensureDir(REPORTS_DIR);
  const filePath = path.join(REPORTS_DIR, filename);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return filePath;
}

export function writeReportMarkdown(filename: string, content: string): string {
  ensureDir(REPORTS_DIR);
  const filePath = path.join(REPORTS_DIR, filename);
  fs.writeFileSync(filePath, content, "utf8");
  return filePath;
}

/** Public routes under /[locale] used by Playwright i18n tests. */
export const I18N_PUBLIC_ROUTES = [
  { slug: "home", path: "" },
  { slug: "vehicles", path: "vehicles" },
  { slug: "booking", path: "booking" },
  { slug: "about", path: "about" },
  { slug: "guide", path: "guide" },
  { slug: "tours", path: "tours" },
  { slug: "contact", path: "contact" },
] as const;

export const INTL_CONSOLE_ERROR_PATTERNS = [
  /MISSING_MESSAGE/i,
  /IntlError/i,
  /missing message/i,
  /Could not resolve/i,
] as const;

export function isIntlConsoleError(text: string): boolean {
  return INTL_CONSOLE_ERROR_PATTERNS.some((re) => re.test(text));
}
