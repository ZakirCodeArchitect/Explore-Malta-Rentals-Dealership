"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

const LABELS: Record<(typeof routing.locales)[number], string> = {
  en: "EN",
  es: "ES",
  de: "DE",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.toString();
  const hrefSuffix = query ? `?${query}` : "";

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="flex items-center gap-0.5 rounded-full border border-slate-300/90 bg-white/90 p-0.5 text-[0.65rem] font-bold tracking-wide text-slate-700 shadow-sm sm:text-xs"
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => {
              router.replace(`${pathname}${hrefSuffix}`, { locale: loc });
            }}
            className={
              active
                ? "min-h-7 min-w-8 rounded-full bg-[var(--brand-orange)] px-2 py-1 text-white sm:min-w-9"
                : "min-h-7 min-w-8 rounded-full px-2 py-1 text-slate-600 transition hover:bg-slate-100 sm:min-w-9"
            }
            aria-current={active ? "true" : undefined}
            lang={loc}
          >
            {LABELS[loc]}
          </button>
        );
      })}
    </div>
  );
}
