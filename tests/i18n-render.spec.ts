/**
 * Playwright: each locale × public route renders without intl errors.
 * Run: npm run test:i18n-render
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { test, expect } from "@playwright/test";

test.describe.configure({ retries: process.env.CI ? 2 : 1 });
import {
  ACTIVE_LOCALES,
  I18N_PUBLIC_ROUTES,
  attachIntlConsoleCollector,
  localePath,
} from "./i18n-helpers";

const REPORTS_DIR = path.join(process.cwd(), "reports");
const SCREENSHOTS_DIR = path.join(REPORTS_DIR, "i18n-screenshots");

type RouteResult = {
  locale: string;
  route: string;
  url: string;
  ok: boolean;
  status: number | null;
  intlErrors: string[];
  hasNavbar: boolean;
  hasLanguageSwitcher: boolean;
  hasVisibleContent: boolean;
  screenshotPath: string | null;
  error?: string;
};

const results: RouteResult[] = [];

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
});

for (const locale of ACTIVE_LOCALES) {
  for (const route of I18N_PUBLIC_ROUTES) {
    test(`${locale} — ${route.slug}`, async ({ page }) => {
      const url = localePath(locale, route.path);
      const intlErrors = attachIntlConsoleCollector(page);
      const screenshotRel = path.join("i18n-screenshots", locale, `${route.slug}.png`);
      const screenshotAbs = path.join(REPORTS_DIR, screenshotRel);

      let ok = true;
      let status: number | null = null;
      let error: string | undefined;
      let hasNavbar = false;
      let hasLanguageSwitcher = false;
      let hasVisibleContent = false;

      try {
        const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => undefined);
        status = response?.status() ?? null;
        if (status && status >= 400) {
          ok = false;
          error = `HTTP ${status}`;
        }

        await page.waitForLoadState("domcontentloaded");
        await expect(page.getByTestId("language-switcher").first()).toBeVisible({ timeout: 45_000 });
        await expect(page.locator("header").first()).toBeVisible({ timeout: 45_000 });

        const main = page.locator("main").first();
        if ((await main.count()) > 0) {
          await expect(main).toBeVisible({ timeout: 45_000 });
        }

        const is404 =
          (await page.locator("text=404").count()) > 0 &&
          (await page.locator("text=This page could not be found").count()) > 0;
        if (is404) {
          ok = false;
          error = "Next.js 404 page";
        }

        hasNavbar = (await page.locator("header nav, nav[aria-label], header a").count()) > 0;
        hasLanguageSwitcher = (await page.getByTestId("language-switcher").first().isVisible());

        let bodyText = "";
        if ((await page.locator("main").count()) > 0) {
          bodyText = await page.locator("main").first().innerText();
        } else {
          bodyText = await page.locator("body").innerText();
        }
        bodyText = bodyText.trim();
        hasVisibleContent = bodyText.length > 40;

        if (!hasNavbar) {
          ok = false;
          error = (error ? `${error}; ` : "") + "Navbar not detected";
        }
        if (!hasVisibleContent) {
          ok = false;
          error = (error ? `${error}; ` : "") + "Insufficient visible content";
        }
        if (intlErrors.length > 0) {
          ok = false;
          error = (error ? `${error}; ` : "") + `Intl console errors: ${intlErrors.join(" | ")}`;
        }

        fs.mkdirSync(path.dirname(screenshotAbs), { recursive: true });
        await page.screenshot({ path: screenshotAbs, fullPage: true });
      } catch (e) {
        ok = false;
        error = e instanceof Error ? e.message : String(e);
      }

      results.push({
        locale,
        route: route.slug,
        url,
        ok,
        status,
        intlErrors: [...intlErrors],
        hasNavbar,
        hasLanguageSwitcher,
        hasVisibleContent,
        screenshotPath: fs.existsSync(screenshotAbs) ? screenshotRel.replace(/\\/g, "/") : null,
        error,
      });

      expect(ok, error ?? "Page checks failed").toBe(true);
    });
  }
}

test.afterAll(() => {
  const passedCount = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  const summary = {
    generatedAt: new Date().toISOString(),
    total: results.length,
    passed: passedCount,
    failed: failed.length,
    results,
  };

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REPORTS_DIR, "i18n-render-report.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );

  const md: string[] = [
    "# i18n render report",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    `**Passed:** ${passedCount} / ${results.length}`,
    "",
  ];

  if (failed.length) {
    md.push("## Failures", "", "| Locale | Route | Error |", "|--------|-------|-------|");
    for (const f of failed) {
      md.push(`| ${f.locale} | ${f.route} | ${(f.error ?? "unknown").replace(/\|/g, "/")} |`);
    }
  } else {
    md.push("_All locale routes rendered successfully._");
  }

  md.push("", "## Screenshots", "", "See `reports/i18n-screenshots/{locale}/{route}.png`.", "");

  fs.writeFileSync(path.join(REPORTS_DIR, "i18n-render-report.md"), `${md.join("\n")}\n`);
});
