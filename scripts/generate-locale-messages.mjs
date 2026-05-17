/**
 * Generates translated message JSON files from messages/en.json.
 * Usage: node scripts/generate-locale-messages.mjs ko tr it vi id th pl nl bn ur
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EN_PATH = path.join(ROOT, "messages", "en.json");
const CONCURRENCY = 12;

const TARGET_LANG = {
  ko: "ko",
  tr: "tr",
  it: "it",
  vi: "vi",
  id: "id",
  th: "th",
  pl: "pl",
  nl: "nl",
  bn: "bn",
  ur: "ur",
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function flattenStrings(obj, prefix = "", out = []) {
  if (typeof obj === "string") {
    out.push({ path: prefix, value: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((item, i) => flattenStrings(item, `${prefix}.${i}`, out));
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      const next = prefix ? `${prefix}.${k}` : k;
      flattenStrings(v, next, out);
    }
  }
  return out;
}

function setByPath(root, path, value) {
  const parts = path.split(".");
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextKey = parts[i + 1];
    const isIndex = /^\d+$/.test(nextKey);
    if (cur[key] === undefined) {
      cur[key] = isIndex ? [] : {};
    }
    cur = cur[key];
  }
  cur[parts[parts.length - 1]] = value;
}

function protectIcu(text) {
  const tokens = [];
  const protectedText = text.replace(/\{[^}]+\}/g, (match) => {
    const id = `⟦ICU${tokens.length}⟧`;
    tokens.push(match);
    return id;
  });
  return { protectedText, tokens };
}

function restoreIcu(text, tokens) {
  let out = text;
  for (let i = 0; i < tokens.length; i++) {
    out = out.split(`⟦ICU${i}⟧`).join(tokens[i]);
  }
  return out;
}

async function translateGoogle(text, targetLang) {
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", targetLang);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const parts = data?.[0];
  if (!Array.isArray(parts)) throw new Error("Unexpected response");
  return parts.map((p) => p[0]).join("");
}

async function translateOne(text, targetLang) {
  const { protectedText, tokens } = protectIcu(text);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const translated = await translateGoogle(protectedText, targetLang);
      return restoreIcu(translated, tokens);
    } catch {
      await sleep(400 * (attempt + 1));
    }
  }
  return text;
}

async function mapPool(items, concurrency, mapper) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await mapper(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return results;
}

async function generateLocale(locale) {
  const targetLang = TARGET_LANG[locale];
  if (!targetLang) {
    console.error(`Unknown locale: ${locale}`);
    process.exit(1);
  }

  const en = JSON.parse(fs.readFileSync(EN_PATH, "utf8"));
  const entries = flattenStrings(en);
  const cachePath = path.join(ROOT, "scripts", `.cache-i18n-${locale}.json`);
  let cache = {};
  if (fs.existsSync(cachePath)) {
    cache = JSON.parse(fs.readFileSync(cachePath, "utf8"));
  }

  console.log(`[${locale}] Translating ${entries.length} strings (concurrency ${CONCURRENCY})...`);

  let done = 0;
  const translated = await mapPool(entries, CONCURRENCY, async (entry) => {
    const cacheKey = `${targetLang}::${entry.value}`;
    let value = cache[cacheKey];
    if (!value) {
      value = await translateOne(entry.value, targetLang);
      cache[cacheKey] = value;
      if (++done % 50 === 0) {
        fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
        console.log(`[${locale}] ${done}/${entries.length}`);
      }
    }
    return { path: entry.path, value };
  });

  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));

  const out = JSON.parse(JSON.stringify(en));
  for (const { path: p, value } of translated) {
    setByPath(out, p, value);
  }

  const outPath = path.join(ROOT, "messages", `${locale}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
  console.log(`[${locale}] Wrote ${outPath}`);
}

const locales = process.argv.slice(2);
if (locales.length === 0) {
  console.error("Pass locale codes: ko tr it vi id th pl nl bn ur");
  process.exit(1);
}

for (const locale of locales) {
  await generateLocale(locale);
}
