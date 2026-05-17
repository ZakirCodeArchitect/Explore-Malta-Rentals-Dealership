import { defineRouting } from "next-intl/routing";

/** IANA zone for formatted dates/times (server + client); matches business location */
export const defaultTimeZone = "Europe/Malta";

export const routing = defineRouting({
  locales: [
    "en", "mt", "es", "de", "it", "nl", "pl", "tr",
    "ko", "vi", "id", "th", "bn", "ur",
    "zh", "hi", "ar", "fr", "pt", "ru", "ja",
  ],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
