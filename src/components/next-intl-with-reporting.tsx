"use client";

import type { ReactNode } from "react";
import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { defaultTimeZone } from "@/i18n/routing";

type NextIntlWithReportingProps = Readonly<{
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}>;

/**
 * Client-only intl provider for the locale layout.
 * Do not pass `onError` (or other event handlers) into `NextIntlClientProvider` here:
 * with the App Router + RSC, that can trigger "Event handlers cannot be passed to Client Component props"
 * during serialization (e.g. `/es/vehicles` 500). Use `npm run validate:i18n` and server logs for missing keys.
 */
export function NextIntlWithReporting({ locale, messages, children }: NextIntlWithReportingProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={defaultTimeZone}>
      {children}
    </NextIntlClientProvider>
  );
}
