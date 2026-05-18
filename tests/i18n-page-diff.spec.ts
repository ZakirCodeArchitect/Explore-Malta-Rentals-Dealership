/**
 * Compares visible text on non-English pages vs English (>80% similar = suspicious).
 * Run: npm run audit:i18n-page-diff
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { test, expect } from "@playwright/test";

test.describe.configure({ retries: process.env.CI ? 2 : 1 });
import {
  I18N_PUBLIC_ROUTES,
  NON_EN_LOCALES,
  extractVisibleText,
  localePath,
  textSimilarity,
} from "./i18n-helpers";

const REPORTS_DIR = path.join(process.cwd(), "reports");
const SIMILARITY_THRESHOLD = 0.8;

type DiffResult = {
  locale: string;
  route: string;
  similarity: number;
  suspicious: boolean;
  enTextLength: number;
  localeTextLength: number;
};

const results: DiffResult[] = [];

for (const route of I18N_PUBLIC_ROUTES) {
  test.describe(`page diff — ${route.slug}`, () => {
    let enText = "";

    test.beforeAll(async ({ browser }) => {
      const page = await browser.newPage();
      await page.goto(localePath("en", route.path), { waitUntil: "domcontentloaded", timeout: 60_000 });
      await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => undefined);
      enText = await extractVisibleText(page);
      await page.close();
    });

    for (const locale of NON_EN_LOCALES) {
      test(`${locale} vs en`, async ({ page }) => {
        await page.goto(localePath(locale, route.path), { waitUntil: "domcontentloaded", timeout: 60_000 });
        await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => undefined);
        const locText = await extractVisibleText(page);
        const similarity = textSimilarity(enText, locText);
        const suspicious = similarity >= SIMILARITY_THRESHOLD;

        results.push({
          locale,
          route: route.slug,
          similarity: Math.round(similarity * 1000) / 1000,
          suspicious,
          enTextLength: enText.length,
          localeTextLength: locText.length,
        });

        expect(
          suspicious,
          `${locale}/${route.slug} is ${(similarity * 100).toFixed(0)}% similar to English (threshold ${SIMILARITY_THRESHOLD * 100}%)`,
        ).toBe(false);
      });
    }
  });
}

test.afterAll(() => {
  const suspicious = results.filter((r) => r.suspicious);
  const summary = {
    generatedAt: new Date().toISOString(),
    threshold: SIMILARITY_THRESHOLD,
    totalComparisons: results.length,
    suspiciousCount: suspicious.length,
    results,
  };

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REPORTS_DIR, "i18n-page-diff-report.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );

  const md: string[] = [
    "# i18n page text diff report",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    `Pages flagged when visible text is ≥${SIMILARITY_THRESHOLD * 100}% similar to English (brand tokens excluded).`,
    "",
    `**Suspicious:** ${suspicious.length} / ${results.length}`,
    "",
  ];

  if (suspicious.length) {
    md.push("| Locale | Route | Similarity |", "|--------|-------|------------|");
    for (const r of suspicious.sort((a, b) => b.similarity - a.similarity)) {
      md.push(`| ${r.locale} | ${r.route} | ${(r.similarity * 100).toFixed(1)}% |`);
    }
  } else {
    md.push("_No suspicious English-heavy pages detected._");
  }

  fs.writeFileSync(path.join(REPORTS_DIR, "i18n-page-diff-report.md"), `${md.join("\n")}\n`);
});
