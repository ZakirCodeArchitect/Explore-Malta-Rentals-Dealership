import type { AppLocale } from "./routing";

export type TextDirection = "ltr" | "rtl";

export type LocaleMeta = {
  code: AppLocale;
  label: string;
  nativeLabel: string;
  shortLabel: string;
  direction: TextDirection;
};

export const localeMetadata: Record<AppLocale, LocaleMeta> = {
  en: {
    code: "en",
    label: "English",
    nativeLabel: "English",
    shortLabel: "EN",
    direction: "ltr",
  },
  mt: {
    code: "mt",
    label: "Maltese",
    nativeLabel: "Malti",
    shortLabel: "MT",
    direction: "ltr",
  },
  es: {
    code: "es",
    label: "Spanish",
    nativeLabel: "Español",
    shortLabel: "ES",
    direction: "ltr",
  },
  de: {
    code: "de",
    label: "German",
    nativeLabel: "Deutsch",
    shortLabel: "DE",
    direction: "ltr",
  },
  ko: {
    code: "ko",
    label: "Korean",
    nativeLabel: "한국어",
    shortLabel: "KO",
    direction: "ltr",
  },
  tr: {
    code: "tr",
    label: "Turkish",
    nativeLabel: "Türkçe",
    shortLabel: "TR",
    direction: "ltr",
  },
  it: {
    code: "it",
    label: "Italian",
    nativeLabel: "Italiano",
    shortLabel: "IT",
    direction: "ltr",
  },
  vi: {
    code: "vi",
    label: "Vietnamese",
    nativeLabel: "Tiếng Việt",
    shortLabel: "VI",
    direction: "ltr",
  },
  id: {
    code: "id",
    label: "Indonesian",
    nativeLabel: "Bahasa Indonesia",
    shortLabel: "ID",
    direction: "ltr",
  },
  th: {
    code: "th",
    label: "Thai",
    nativeLabel: "ไทย",
    shortLabel: "TH",
    direction: "ltr",
  },
  pl: {
    code: "pl",
    label: "Polish",
    nativeLabel: "Polski",
    shortLabel: "PL",
    direction: "ltr",
  },
  nl: {
    code: "nl",
    label: "Dutch",
    nativeLabel: "Nederlands",
    shortLabel: "NL",
    direction: "ltr",
  },
  bn: {
    code: "bn",
    label: "Bengali",
    nativeLabel: "বাংলা",
    shortLabel: "BN",
    direction: "ltr",
  },
  ur: {
    code: "ur",
    label: "Urdu",
    nativeLabel: "اردو",
    shortLabel: "UR",
    direction: "rtl",
  },
  zh: {
    code: "zh",
    label: "Chinese",
    nativeLabel: "中文",
    shortLabel: "ZH",
    direction: "ltr",
  },
  hi: {
    code: "hi",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    shortLabel: "HI",
    direction: "ltr",
  },
  ar: {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    shortLabel: "AR",
    direction: "rtl",
  },
  fr: {
    code: "fr",
    label: "French",
    nativeLabel: "Français",
    shortLabel: "FR",
    direction: "ltr",
  },
  pt: {
    code: "pt",
    label: "Portuguese",
    nativeLabel: "Português",
    shortLabel: "PT",
    direction: "ltr",
  },
  ru: {
    code: "ru",
    label: "Russian",
    nativeLabel: "Русский",
    shortLabel: "RU",
    direction: "ltr",
  },
  ja: {
    code: "ja",
    label: "Japanese",
    nativeLabel: "日本語",
    shortLabel: "JA",
    direction: "ltr",
  },
};

export const localeList = Object.values(localeMetadata);

export function getLocaleDirection(locale: string): TextDirection {
  const meta = localeMetadata[locale as AppLocale];
  return meta?.direction ?? "ltr";
}

export function getVisibleLocaleButtons(current: AppLocale): [AppLocale, AppLocale] {
  if (current === "en") {
    return ["en", "mt"];
  }
  return [current, "en"];
}
