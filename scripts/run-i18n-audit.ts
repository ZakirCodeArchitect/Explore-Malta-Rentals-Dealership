/**
 * Master i18n audit — runs all checks in sequence.
 * Run: npm run audit:i18n
 */
import { spawnSync } from "node:child_process";
import * as path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const REPORTS = path.join(ROOT, "reports");

type Step = {
  name: string;
  command: string;
  args: string[];
  /** If true, failure does not fail the overall audit */
  warnOnly?: boolean;
};

const steps: Step[] = [
  { name: "validate:i18n", command: "npm", args: ["run", "validate:i18n"] },
  { name: "audit:i18n-content", command: "npm", args: ["run", "audit:i18n-content"], warnOnly: true },
  { name: "audit:hardcoded-text", command: "npm", args: ["run", "audit:hardcoded-text"], warnOnly: true },
  { name: "test:i18n-render", command: "npm", args: ["run", "test:i18n-render"] },
  { name: "audit:i18n-page-diff", command: "npm", args: ["run", "audit:i18n-page-diff"] },
];

type StepResult = {
  name: string;
  warnOnly: boolean;
  exitCode: number;
  ok: boolean;
};

function runStep(step: Step): StepResult {
  console.log(`\n▶ Running ${step.name}…\n`);
  const playwrightEnv =
    step.name === "test:i18n-render" || step.name === "audit:i18n-page-diff"
      ? {
          PLAYWRIGHT_SKIP_WEBSERVER: process.env.PLAYWRIGHT_SKIP_WEBSERVER ?? (process.env.CI ? "" : "1"),
          PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
        }
      : {};

  const result = spawnSync(step.command, step.args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, ...playwrightEnv },
  });
  const exitCode = result.status ?? 1;
  const ok = exitCode === 0 || !!step.warnOnly;
  return { name: step.name, warnOnly: !!step.warnOnly, exitCode, ok };
}

function main(): void {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Explore Malta Rentals — full i18n audit");
  console.log("═══════════════════════════════════════════════════════════");

  const outcomes: StepResult[] = [];
  for (const step of steps) {
    outcomes.push(runStep(step));
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  Step summary");
  console.log("═══════════════════════════════════════════════════════════\n");

  let hardFail = false;
  let warnCount = 0;

  for (const o of outcomes) {
    const label = o.exitCode === 0 ? "OK" : o.warnOnly ? "WARN" : "FAIL";
    if (o.exitCode !== 0 && o.warnOnly) warnCount++;
    if (o.exitCode !== 0 && !o.warnOnly) hardFail = true;
    console.log(`  [${label}] ${o.name}${o.warnOnly && o.exitCode !== 0 ? " (warning-only)" : ""}`);
  }

  console.log("\nReports:");
  console.log(`  ${path.join(REPORTS, "i18n-content-audit.md")}`);
  console.log(`  ${path.join(REPORTS, "hardcoded-text-audit.md")}`);
  console.log(`  ${path.join(REPORTS, "i18n-render-report.md")}`);
  console.log(`  ${path.join(REPORTS, "i18n-page-diff-report.md")}`);
  console.log(`  ${path.join(REPORTS, "i18n-screenshots")}/`);

  if (warnCount) {
    console.log(`\nNote: ${warnCount} warning-only step(s) reported issues — review markdown reports.`);
  }

  if (hardFail) {
    console.error("\n✗✗✗ I18N AUDIT FAILED ✗✗✗\n");
    process.exit(1);
  }

  console.log("\n✓✓✓ I18N AUDIT PASSED ✓✓✓\n");
  if (warnCount) {
    console.log("(With warnings in content/hardcoded reports — see docs/i18n-audit.md)");
  }
}

main();
