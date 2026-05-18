"use client";

import type { ReactNode } from "react";
import type { AbstractIntlMessages } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import type { IntlError } from "next-intl";
import { defaultTimeZone } from "@/i18n/routing";

type NextIntlWithReportingProps = Readonly<{
  locale: string;
  messages: AbstractIntlMessages;
  children: ReactNode;
}>;

const isDevOrTest =
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

function reportIntlError(error: IntlError): void {
  if (!isDevOrTest) return;
  const code = "code" in error ? String(error.code) : "INTL_ERROR";
  console.warn(`[next-intl] ${code}:`, error.message);
}

/**
 * Client-only intl provider for the locale layout.
 * `onError` is defined inside this Client Component (not passed from a Server Component)
 * so App Router serialization stays safe. Production keeps next-intl defaults.
 */
export function NextIntlWithReporting({ locale, messages, children }: NextIntlWithReportingProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={defaultTimeZone}
      onError={isDevOrTest ? reportIntlError : undefined}
      getMessageFallback={
        isDevOrTest
          ? ({ namespace, key, error }) => {
              console.warn(
                `[next-intl] Could not resolve \`${namespace ? `${namespace}.` : ""}${key}\` (${locale}): ${error?.message ?? "missing"}`,
              );
              return `[missing: ${namespace ? `${namespace}.` : ""}${key}]`;
            }
          : undefined
      }
    >
      {children}
    </NextIntlClientProvider>
  );
}
