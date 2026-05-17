import { defineRouting } from "next-intl/routing";

/** IANA zone for formatted dates/times (server + client); matches business location */
export const defaultTimeZone = "Europe/Malta";

export const routing = defineRouting({
  locales: [
    "en",
    "mt",
    "es",
    "de",
    "ko",
    "tr",
    "it",
    "vi",
    "id",
    "th",
    "pl",
    "nl",
    "bn",
    "ur",
  ],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
