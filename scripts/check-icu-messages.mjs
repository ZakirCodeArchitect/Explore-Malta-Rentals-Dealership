import * as fs from "node:fs";
import * as path from "node:path";
import IntlMessageFormat from "intl-messageformat";

const ROOT = path.resolve(import.meta.dirname, "..");
const LOCALES = ["en", "mt", "es", "de", "ko", "tr", "it", "vi", "id", "th", "pl", "nl", "bn", "ur"];

function flatten(obj, prefix = "", out = []) {
  if (typeof obj === "string") {
    out.push({ key: prefix, value: obj });
    return out;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => flatten(v, `${prefix}.${i}`, out));
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
  }
  return out;
}

let failed = false;
for (const locale of LOCALES) {
  const file = path.join(ROOT, "messages", `${locale}.json`);
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const { key, value } of flatten(json)) {
    if (!value.includes("{")) continue;
    try {
      new IntlMessageFormat(value, locale);
      // smoke format for plural keys
      if (value.includes("plural")) {
        new IntlMessageFormat(value, locale).format({ count: 1, days: 1, n: 1, slug: "x", rating: 5, year: 2026, brand: "X", current: 1, total: 3, tripEur: 10, dailyEur: 5, dayLabel: "d", openTime: "09:00", closeTime: "19:00", fee: 5, total: 10, legs: 2, perLeg: 5, discount: "", amount: 5, min: 1, max: 14, offPickup: "", offDropoff: "", offSite: "", pickup: 0, dropoff: 0, label: "x", value: "x", hours: 24, name: "x", title: "x", line: "x", companyName: "X", query: "x" });
      }
    } catch (e) {
      failed = true;
      console.error(`[${locale}] ${key}: ${e.message}`);
      console.error(`  ${value.slice(0, 120)}`);
    }
  }
}
process.exit(failed ? 1 : 0);
