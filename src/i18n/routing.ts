import { defineRouting } from "next-intl/routing";

/** IANA zone for formatted dates/times (server + client); matches business location */
export const defaultTimeZone = "Europe/Malta";

export const routing = defineRouting({
  locales: ["en", "es", "de"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
