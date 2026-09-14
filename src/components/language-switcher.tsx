"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { AppLocale } from "@/i18n/routing";
import {
  getVisibleLocaleButtons,
  localeList,
  localeMetadata,
} from "@/i18n/locales";
import { usePathname, useRouter } from "@/i18n/navigation";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LocalePill({
  loc,
  active,
  onSelect,
}: Readonly<{
  loc: AppLocale;
  active: boolean;
  onSelect: (loc: AppLocale) => void;
}>) {
  const { shortLabel } = localeMetadata[loc];
  return (
    <button
      type="button"
      onClick={() => onSelect(loc)}
      className={joinClasses(
        "min-h-7 min-w-8 cursor-pointer rounded-full px-2 py-1 sm:min-w-9",
        "transition-[background-color,color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease-standard)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)]",
        active
          ? "bg-[var(--orange-400)] text-[var(--ink-950)] shadow-[var(--elev-1)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--surface-sunken)] hover:text-[var(--ink-900)]",
      )}
      aria-current={active ? "true" : undefined}
      lang={loc}
    >
      {shortLabel}
    </button>
  );
}

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const query = searchParams.toString();
  const hrefSuffix = query ? `?${query}` : "";

  const switchLocale = useCallback(
    (loc: AppLocale) => {
      router.replace(`${pathname}${hrefSuffix}`, { locale: loc });
      setOpen(false);
    },
    [hrefSuffix, pathname, router],
  );

  const [primary, secondary] = getVisibleLocaleButtons(locale);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={t("language")}
      data-testid="language-switcher"
      className={joinClasses(
        "relative flex items-center gap-0.5 rounded-full bg-white/90 p-1 text-[0.65rem] font-bold tracking-wide sm:text-xs",
        "text-[var(--text-secondary)] shadow-[inset_0_0_0_1px_var(--line),var(--elev-1)] backdrop-blur-sm",
      )}
    >
      <LocalePill loc={primary} active={locale === primary} onSelect={switchLocale} />
      <LocalePill loc={secondary} active={locale === secondary} onSelect={switchLocale} />

      <div className="relative">
        <button
          type="button"
          id={`${menuId}-trigger`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${menuId}-listbox`}
          aria-label={t("selectLanguage")}
          onClick={() => setOpen((v) => !v)}
          className={joinClasses(
            "flex min-h-7 min-w-8 cursor-pointer items-center justify-center rounded-full px-1.5 py-1 sm:min-w-9",
            "text-[var(--text-muted)] transition-[background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-standard)]",
            "hover:bg-[var(--surface-sunken)] hover:text-[var(--ink-900)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)]",
            open ? "bg-[var(--surface-sunken)] text-[var(--ink-900)]" : undefined,
          )}
        >
          <GlobeIcon />
        </button>

        {open ? (
          <ul
            id={`${menuId}-listbox`}
            role="listbox"
            aria-labelledby={`${menuId}-trigger`}
            className={joinClasses(
              "language-switcher-dropdown absolute end-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(18rem,70vh)] min-w-[12rem] overflow-y-auto overscroll-contain sm:text-xs",
              "rounded-[var(--r-card)] bg-[var(--surface-card)] p-1 text-[0.7rem] font-semibold text-[var(--ink-900)]",
              "shadow-[inset_0_0_0_1px_var(--line-subtle),var(--elev-4)]",
            )}
          >
            {localeList.map(({ code, label, nativeLabel }) => {
              const active = code === locale;
              return (
                <li key={code} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    lang={code}
                    onClick={() => switchLocale(code)}
                    className={joinClasses(
                      "flex w-full cursor-pointer items-center justify-between gap-3 rounded-[var(--r-field)] px-3 py-2 text-start",
                      "transition-[background-color,color] duration-[var(--dur-fast)] ease-[var(--ease-standard)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)]",
                      active
                        ? "bg-[var(--orange-50)] text-[var(--orange-700)]"
                        : "hover:bg-[var(--surface-soft)]",
                    )}
                  >
                    <span>{label}</span>
                    <span className="text-[0.65rem] tracking-wide text-[var(--text-faint)]">
                      {nativeLabel}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
