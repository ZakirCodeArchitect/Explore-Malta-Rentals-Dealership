import { hasLocale } from "next-intl";
import type { IntlError } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { defaultTimeZone, routing } from "./routing";

const isDevOrTest =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

function onIntlError(error: IntlError): void {
  if (!isDevOrTest) return;
  const code = "code" in error ? String(error.code) : "INTL_ERROR";
  if (/MISSING_MESSAGE|MISSING_FORMAT|ENVIRONMENT_FALLBACK/i.test(code)) {
    console.warn(`[next-intl] ${code}:`, error.message);
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: defaultTimeZone,
    onError: onIntlError,
  };
});
