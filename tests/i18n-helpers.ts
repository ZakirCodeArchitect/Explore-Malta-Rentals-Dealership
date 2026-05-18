import type { Page } from "@playwright/test";
import { ACTIVE_LOCALES, I18N_PUBLIC_ROUTES, INTL_CONSOLE_ERROR_PATTERNS } from "../scripts/i18n-shared";

export { ACTIVE_LOCALES, I18N_PUBLIC_ROUTES, INTL_CONSOLE_ERROR_PATTERNS };

export function localePath(locale: string, routePath: string): string {
  const segment = routePath ? `/${routePath}` : "";
  return `/${locale}${segment}`;
}

export function attachIntlConsoleCollector(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error" && msg.type() !== "warning") return;
    const text = msg.text();
    if (INTL_CONSOLE_ERROR_PATTERNS.some((re) => re.test(text))) {
      errors.push(text);
    }
  });
  page.on("pageerror", (err) => {
    const text = err.message;
    if (INTL_CONSOLE_ERROR_PATTERNS.some((re) => re.test(text))) {
      errors.push(text);
    }
  });
  return errors;
}

/** Visible text from main + nav (normalized). */
export async function extractVisibleText(page: Page): Promise<string> {
  return page.evaluate(() => {
    const parts: string[] = [];
    const nav = document.querySelector("header, nav, [role='navigation']");
    const main = document.querySelector("main") ?? document.querySelector('[role="main"]') ?? document.body;
    for (const el of [nav, main]) {
      if (!el) continue;
      const t = (el as HTMLElement).innerText?.trim();
      if (t) parts.push(t);
    }
    return parts.join("\n").replace(/\s+/g, " ").trim();
  });
}

/** Jaccard-like word overlap; 1 = identical token sets. */
export function textSimilarity(a: string, b: string): number {
  const tokenize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1);

  const allow = new Set(
    [
      "explore",
      "malta",
      "rentals",
      "gozo",
      "comino",
      "whatsapp",
      "stripe",
      "paypal",
      "eur",
      "€",
      "emr",
      "pieta",
      "pietà",
      "atv",
      "suv",
      "cdw",
    ].map((w) => w.toLowerCase()),
  );

  const setA = new Set(tokenize(a).filter((w) => !allow.has(w)));
  const setB = new Set(tokenize(b).filter((w) => !allow.has(w)));
  if (setA.size === 0 && setB.size === 0) return 1;
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const w of setA) {
    if (setB.has(w)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

export const NON_EN_LOCALES = ACTIVE_LOCALES.filter((l) => l !== "en");
