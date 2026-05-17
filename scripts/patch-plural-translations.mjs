/** Patch the four shared ICU plural strings per locale (helmet/day wording). */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const PATCHES = {
  ko: {
    "VehicleCard.helmetsInline": "{count, plural, one {# 헬멧} other {# 헬멧}}",
    "BookingSteps.selectVehicle.helmetsSummary":
      "{count, plural, one {# 헬멧 포함} other {# 헬멧 포함}}",
    "VehicleFilters.durationLine": "{count, plural, one {#일} other {#일}}",
    "BookingSearch.summaryLine":
      "{days, plural, one {#일} other {#일}} · 매장 픽업 Pietà{offPickup}{offDropoff}{offSite}",
  },
  tr: {
    "VehicleCard.helmetsInline": "{count, plural, one {# kask} other {# kask}}",
    "BookingSteps.selectVehicle.helmetsSummary":
      "{count, plural, one {# kask dahil} other {# kask dahil}}",
    "VehicleFilters.durationLine": "{count, plural, one {# gün} other {# gün}}",
    "BookingSearch.summaryLine":
      "{days, plural, one {# gün} other {# gün}} · Mağazadan teslim alma Pietà{offPickup}{offDropoff}{offSite}",
  },
  it: {
    "VehicleCard.helmetsInline": "{count, plural, one {# casco} other {# caschi}}",
    "BookingSteps.selectVehicle.helmetsSummary":
      "{count, plural, one {# casco incluso} other {# caschi inclusi}}",
    "VehicleFilters.durationLine": "{count, plural, one {# giorno} other {# giorni}}",
    "BookingSearch.summaryLine":
      "{days, plural, one {# giorno} other {# giorni}} · Ritiro in negozio Pietà{offPickup}{offDropoff}{offSite}",
  },
  vi: {
    "VehicleCard.helmetsInline": "{count, plural, one {# mũ bảo hiểm} other {# mũ bảo hiểm}}",
    "BookingSteps.selectVehicle.helmetsSummary":
      "{count, plural, one {# mũ bảo hiểm đi kèm} other {# mũ bảo hiểm đi kèm}}",
    "VehicleFilters.durationLine": "{count, plural, one {# ngày} other {# ngày}}",
    "BookingSearch.summaryLine":
      "{days, plural, one {# ngày} other {# ngày}} · Nhận hàng tại cửa hàng Pietà{offPickup}{offDropoff}{offSite}",
  },
  id: {
    "VehicleCard.helmetsInline": "{count, plural, one {# helm} other {# helm}}",
    "BookingSteps.selectVehicle.helmetsSummary":
      "{count, plural, one {# helm termasuk} other {# helm termasuk}}",
    "VehicleFilters.durationLine": "{count, plural, one {# hari} other {# hari}}",
    "BookingSearch.summaryLine":
      "{days, plural, one {# hari} other {# hari}} · Penjemputan di toko Pietà{offPickup}{offDropoff}{offSite}",
  },
  th: {
    "VehicleCard.helmetsInline": "{count, plural, one {# หมวกกันน็อค} other {# หมวกกันน็อค}}",
    "BookingSteps.selectVehicle.helmetsSummary":
      "{count, plural, one {# หมวกกันน็อครวม} other {# หมวกกันน็อครวม}}",
    "VehicleFilters.durationLine": "{count, plural, one {# วัน} other {# วัน}}",
    "BookingSearch.summaryLine":
      "{days, plural, one {# วัน} other {# วัน}} · รับที่ร้าน Pietà{offPickup}{offDropoff}{offSite}",
  },
  pl: {
    "VehicleCard.helmetsInline": "{count, plural, one {# kask} other {# kaski}}",
    "BookingSteps.selectVehicle.helmetsSummary":
      "{count, plural, one {# kask w zestawie} other {# kaski w zestawie}}",
    "VehicleFilters.durationLine": "{count, plural, one {# dzień} other {# dni}}",
    "BookingSearch.summaryLine":
      "{days, plural, one {# dzień} other {# dni}} · Odbiór w sklepie Pietà{offPickup}{offDropoff}{offSite}",
  },
  nl: {
    "VehicleCard.helmetsInline": "{count, plural, one {# helm} other {# helmen}}",
    "BookingSteps.selectVehicle.helmetsSummary":
      "{count, plural, one {# helm inbegrepen} other {# helmen inbegrepen}}",
    "VehicleFilters.durationLine": "{count, plural, one {# dag} other {# dagen}}",
    "BookingSearch.summaryLine":
      "{days, plural, one {# dag} other {# dagen}} · Winkelafhalen Pietà{offPickup}{offDropoff}{offSite}",
  },
  bn: {
    "VehicleCard.helmetsInline": "{count, plural, one {# হেলমেট} other {# হেলমেট}}",
    "BookingSteps.selectVehicle.helmetsSummary":
      "{count, plural, one {# হেলমেট অন্তর্ভুক্ত} other {# হেলমেট অন্তর্ভুক্ত}}",
    "VehicleFilters.durationLine": "{count, plural, one {# দিন} other {# দিন}}",
    "BookingSearch.summaryLine":
      "{days, plural, one {# দিন} other {# দিন}} · দোকান পিকআপ Pietà{offPickup}{offDropoff}{offSite}",
  },
  ur: {
    "VehicleCard.helmetsInline": "{count, plural, one {# ہیلمیٹ} other {# ہیلمیٹ}}",
    "BookingSteps.selectVehicle.helmetsSummary":
      "{count, plural, one {# ہیلمیٹ شامل} other {# ہیلمیٹ شامل}}",
    "VehicleFilters.durationLine": "{count, plural, one {# دن} other {# دن}}",
    "BookingSearch.summaryLine":
      "{days, plural, one {# دن} other {# دن}} · دکان سے اٹھانا Pietà{offPickup}{offDropoff}{offSite}",
  },
};

function setByPath(root, dotPath, value) {
  const parts = dotPath.split(".");
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

for (const [locale, patches] of Object.entries(PATCHES)) {
  const file = path.join(ROOT, "messages", `${locale}.json`);
  const json = JSON.parse(fs.readFileSync(file, "utf8"));
  for (const [dotPath, value] of Object.entries(patches)) {
    setByPath(json, dotPath, value);
  }
  fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  console.log(`Patched ${locale}`);
}
