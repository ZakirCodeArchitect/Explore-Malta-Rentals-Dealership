/**
 * Ensures ICU plural branches use the literal keyword `other` (not translated).
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOCALES = ["ko", "tr", "it", "vi", "id", "th", "pl", "nl", "bn", "ur"];
const VALID = new Set(["zero", "one", "two", "few", "many", "other"]);

function fixPluralString(value) {
  if (!value.includes("plural")) return value;
  return value.replace(
    /(\{[^}]+\})\s+(\S+)\s+(\{#[^}]+\})/g,
    (match, oneBranch, keyword, otherBody) => {
      if (VALID.has(keyword)) return match;
      return `${oneBranch} other ${otherBody}`;
    },
  );
}

function walk(value) {
  if (typeof value === "string") return fixPluralString(value);
  if (Array.isArray(value)) return value.map(walk);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = walk(v);
    return out;
  }
  return value;
}

for (const locale of LOCALES) {
  const file = path.join(ROOT, "messages", `${locale}.json`);
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  fs.writeFileSync(file, `${JSON.stringify(walk(json), null, 2)}\n`, "utf8");
  console.log(`Fixed ${locale}`);
}
