import { defineConfig, devices } from "@playwright/test";

/** Default 3000 matches `npm run dev`; set PLAYWRIGHT_PORT=3099 for an isolated audit server. */
const PORT = process.env.PLAYWRIGHT_PORT ?? "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["json", { outputFile: "reports/playwright-results.json" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "off",
    video: "off",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: `npm run dev -- --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
