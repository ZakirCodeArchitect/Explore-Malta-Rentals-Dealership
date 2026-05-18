# i18n audit system

Explore Malta Rentals uses [next-intl](https://next-intl.dev/) with **21 locales** defined in `src/i18n/routing.ts`. This document describes the automated checks that keep translations complete and catch English leaking into localized pages.

## Quick start

```bash
# Full pipeline (strict steps + warning-only reports)
npm run audit:i18n

# Individual checks
npm run validate:i18n          # JSON structure & ICU (fails on error)
npm run audit:i18n-content     # identical-to-English values (warnings)
npm run audit:hardcoded-text   # JSX string heuristic (warnings)
npm run test:i18n-render       # Playwright render per locale/route (fails on error)
npm run audit:i18n-page-diff   # visible text vs English similarity (fails on error)
```

**Prerequisites for Playwright tests:** install browsers once:

```bash
npx playwright install chromium
```

Playwright starts `npm run dev` automatically in CI. Locally, if `npm run dev` is already running on port **3000**, set:

```bash
PLAYWRIGHT_SKIP_WEBSERVER=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:i18n-render
```

(`npm run audit:i18n` sets this automatically when `CI` is unset.) Use `PLAYWRIGHT_PORT=3099` only when no other Next dev instance is running in this project folder.

## What each command does

### `npm run validate:i18n`

Reads active locales from `src/i18n/routing.ts` (not a hardcoded list). Compares every `messages/{locale}.json` to `messages/en.json`:

| Check | Fails build? |
|-------|----------------|
| Locale file missing | Yes |
| Missing / extra keys | Yes |
| Empty string values | Yes |
| ICU `{placeholder}` mismatch | Yes |
| ICU `plural` / `select` structure mismatch | Yes |

### `npm run audit:i18n-content`

Flags keys where the translated value is **identical** to English. Uses `scripts/i18n-allowlist.json` for brand names, URLs, emails, etc.

**Warning-only** — does not fail `audit:i18n` by itself.

Reports:

- `reports/i18n-content-audit.json`
- `reports/i18n-content-audit.md`

### `npm run audit:hardcoded-text`

Scans `src/app`, `src/components`, `src/features`, `src/lib` for likely hardcoded UI strings in JSX (`>text<`, `placeholder`, `aria-label`, etc.). Ignores `t()`, imports, and class names.

**Warning-only** — expect false positives; use judgment.

Reports:

- `reports/hardcoded-text-audit.json`
- `reports/hardcoded-text-audit.md`

### `npm run test:i18n-render`

For each locale in `routing.locales` and each public route in `scripts/i18n-shared.ts` (`home`, `vehicles`, `booking`, `about`, `guide`, `tours`, `contact`):

- Loads `/{locale}/{route}`
- Asserts HTTP success, navbar, language switcher (`data-testid="language-switcher"`), visible content
- Fails on console messages matching `MISSING_MESSAGE`, `IntlError`, `missing message`, `Could not resolve`
- Saves screenshots to `reports/i18n-screenshots/{locale}/{route}.png`

Reports: `reports/i18n-render-report.json`, `reports/i18n-render-report.md`

### `npm run audit:i18n-page-diff`

For each non-English locale and route, compares visible text (nav + main) to English. If similarity ≥ **80%** (after ignoring brand tokens), the page is flagged as still mostly English.

Reports: `reports/i18n-page-diff-report.json`, `reports/i18n-page-diff-report.md`

### `npm run audit:i18n`

Runs all steps in order. Ends with:

- **I18N AUDIT PASSED** — strict steps green (warnings may still exist in content/hardcoded reports)
- **I18N AUDIT FAILED** — fix `validate:i18n`, Playwright render, or page-diff failures first

## Runtime missing-translation detection

In **development** and **test** only:

- `src/i18n/request.ts` — `onError` logs `MISSING_MESSAGE` and related codes on the server
- `src/components/next-intl-with-reporting.tsx` — client `onError` + `getMessageFallback` logs `Could not resolve …` and renders `[missing: Namespace.key]` so gaps are visible

Production behavior is unchanged (no extra console noise, no visible fallback markers).

## How to fix common issues

### Missing keys

1. Run `npm run validate:i18n`
2. Add missing keys to `messages/{locale}.json` (copy structure from `en.json`)
3. Translate values; keep ICU placeholders identical to English (`{count}`, `{slug}`, `{count, plural, …}`)

### Untranslated JSON values

1. Run `npm run audit:i18n-content`
2. Open `reports/i18n-content-audit.md`
3. Translate flagged keys, or add intentional same-as-English values to `scripts/i18n-allowlist.json` (`globalAllowedValues` or `allowedKeys`)

### Hardcoded UI text

1. Run `npm run audit:hardcoded-text`
2. Move strings to `messages/en.json`
3. Use `useTranslations` / `getTranslations` in components

### Page still looks English

1. Run `npm run audit:i18n-page-diff`
2. Check flagged locale/route pairs in the markdown report
3. Verify components use `t()` and that `messages/{locale}.json` has real translations (not copies of English)

### Screenshots

After `npm run test:i18n-render`, open `reports/i18n-screenshots/` and spot-check RTL locales (`ar`, `ur`) and CJK locales (`zh`, `ja`, `ko`).

## Adding a new language safely

1. Add locale code to `routing.locales` in `src/i18n/routing.ts`
2. Add metadata in `src/i18n/locales.ts` (`localeMetadata`)
3. Create `messages/{code}.json` with the same keys as `en.json`
4. Run `npm run audit:i18n`
5. Fix all **FAIL** items before deploying

## Configuration files

| File | Purpose |
|------|---------|
| `src/i18n/routing.ts` | Source of truth for locale list |
| `scripts/i18n-shared.ts` | Shared flatten/ICU helpers and test routes |
| `scripts/i18n-allowlist.json` | Same-as-English exceptions for content audit |
| `playwright.config.ts` | Playwright + dev server on port 3099 |

## CI suggestion

```yaml
- run: npx playwright install chromium
- run: npm run validate:i18n
- run: npm run test:i18n-render
- run: npm run audit:i18n-page-diff
```

Upload `reports/` as artifacts for human review.
