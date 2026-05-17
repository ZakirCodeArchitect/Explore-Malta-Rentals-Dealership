"use client";

import { useEffect } from "react";
import { getLocaleDirection } from "@/i18n/locales";

export function DocumentLang({ locale }: Readonly<{ locale: string }>) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getLocaleDirection(locale);
  }, [locale]);
  return null;
}
