/**
 * Merges new BookingFlow + Common map keys from en.json into all locale files.
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const MESSAGES = path.join(ROOT, "messages");

const KEYS_FROM_EN = {
  BookingFlow: [
    "holdExpiredTitle",
    "reservationBannerTitle",
    "reservationBannerExpires",
    "documentUploadHint",
    "documentUploadAttaching",
    "documentUploadSuccess",
    "documentUploadFailed",
    "documentUploadOneFile",
    "documentUploadAttached",
    "noVehicleChooseLater",
    "noVehicleDismiss",
    "termsConsentKicker",
    "termsConsentReviewLead",
    "termsConsentOpenFull",
    "termsConsentAgreeCheckbox",
    "termsConsentSubmitting",
    "termsConsentCancel",
  ],
  Common: ["mapEmbedTitle", "mapOpenAria", "mapViewOnMaps"],
};

const LOCALES = fs.readdirSync(MESSAGES).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));

const en = JSON.parse(fs.readFileSync(path.join(MESSAGES, "en.json"), "utf8"));

for (const locale of LOCALES) {
  if (locale === "en") continue;
  const file = path.join(MESSAGES, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [ns, keys] of Object.entries(KEYS_FROM_EN)) {
    if (!data[ns]) data[ns] = {};
    for (const key of keys) {
      if (data[ns][key] === undefined && en[ns]?.[key] !== undefined) {
        data[ns][key] = en[ns][key];
      }
    }
  }
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

console.log(`Merged BookingFlow/Common keys into ${LOCALES.length - 1} locale files (missing keys only).`);
