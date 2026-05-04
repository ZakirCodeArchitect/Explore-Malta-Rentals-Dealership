"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Suspense, startTransition, useCallback, useEffect, useId, useRef, useState } from "react";
import {
  SITE_SHELL_OUTER,
  SITE_SHELL_CONTAINER,
  SITE_SHELL_INNER_PAD,
} from "@/components/site-shell";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BookingDisabledCtaContent } from "@/components/booking/booking-disabled-cta-content";
import { useBookingControl } from "@/components/booking/booking-control-provider";

const LOGO_SRC = "/explore%20malta%20rentals%20logo.png";

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function navLinkIsActive(href: string, pathname: string, hash: string): boolean {
  if (href === "/contact") {
    return pathname === "/contact" || (pathname === "/" && hash === "#contact");
  }
  if (href === "/#services") {
    return pathname === "/" && hash === "#services";
  }
  if (href === "/") {
    return pathname === "/" && hash !== "#contact" && hash !== "#services";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const navLinkBaseClass =
  "text-sm font-semibold tracking-[-0.02em] transition-colors";
const navLinkInactiveClass = `${navLinkBaseClass} text-slate-800 hover:opacity-70`;
const navLinkActiveClass = `${navLinkBaseClass} text-[var(--brand-orange)] hover:text-[var(--brand-orange-strong)]`;

export function SiteNavbar() {
  const t = useTranslations("Nav");
  const { enabled: bookingEnabled, disabledMessage } = useBookingControl();
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileMenuId = useId();

  const navLinks = [
    { href: "/" as const, labelKey: "home" as const },
    { href: "/booking" as const, labelKey: "booking" as const },
    { href: "/vehicles" as const, labelKey: "vehicles" as const },
    { href: "/about" as const, labelKey: "about" as const },
    { href: "/guide" as const, labelKey: "guide" as const },
    { href: "/tours" as const, labelKey: "tours" as const },
    { href: "/contact" as const, labelKey: "contact" as const },
    { href: "/#services" as const, labelKey: "services" as const },
  ] as const;

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    const sync = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  useEffect(() => {
    startTransition(() => {
      closeMobileNav();
    });
  }, [pathname, hash, closeMobileNav]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobileNav();
    };
    const onPointerDown = (e: PointerEvent) => {
      const root = mobileNavRef.current;
      if (root && !root.contains(e.target as Node)) {
        closeMobileNav();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [mobileNavOpen, closeMobileNav]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const link = mobilePanelRef.current?.querySelector<HTMLElement>("a[href]");
    requestAnimationFrame(() => link?.focus());
  }, [mobileNavOpen]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-[max(0px,env(safe-area-inset-top))]">
      <nav
        aria-label={t("primary")}
        className="site-navbar pointer-events-auto w-full max-w-full border-b border-slate-200/90 bg-slate-100 text-[var(--foreground)] shadow-[0_1px_0_rgba(15,23,42,0.04)]"
      >
        <div className="h-0.5 w-full shrink-0 bg-red-600" aria-hidden />
        <div className={SITE_SHELL_OUTER}>
          <div className={SITE_SHELL_CONTAINER}>
            <div
              className={joinClasses(
                SITE_SHELL_INNER_PAD,
                "grid min-h-10 w-full grid-cols-[minmax(0,1fr)_auto] items-stretch gap-x-3 gap-y-1.5 py-1 sm:min-h-11 sm:gap-y-2 sm:py-1",
                "md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-4",
              )}
            >
              <Link
                href="/"
                className="relative flex min-w-0 max-w-[min(22rem,calc(100vw-9rem))] justify-self-start overflow-hidden"
              >
                <Image
                  src={LOGO_SRC}
                  alt={t("logoAlt")}
                  width={320}
                  height={56}
                  className="h-10 w-auto max-w-full rounded-md object-contain object-left sm:h-11"
                  style={{ width: "auto" }}
                  priority
                />
              </Link>

              <ul
                className={joinClasses(
                  "hidden list-none items-center justify-center justify-self-center gap-5 md:flex",
                  "lg:gap-8",
                )}
              >
                {navLinks.map(({ href, labelKey }) => {
                  const active = navLinkIsActive(href, pathname, hash);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={active ? navLinkActiveClass : navLinkInactiveClass}
                        aria-current={active ? "page" : undefined}
                      >
                        {t(labelKey)}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="flex shrink-0 items-center justify-self-end gap-2">
                <div className="hidden md:block">
                  <Suspense fallback={<div className="h-8 w-[5.5rem] rounded-full border border-slate-200/80 bg-white/60" aria-hidden />}>
                    <LanguageSwitcher />
                  </Suspense>
                </div>

                <div ref={mobileNavRef} className="relative z-[60] md:hidden">
                  <button
                    type="button"
                    id={`${mobileMenuId}-trigger`}
                    className={joinClasses(
                      "flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-md border border-slate-300/90 bg-white px-2.5 py-1.5 text-xs font-semibold tracking-[-0.02em] text-slate-800 hover:bg-slate-50 sm:text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2",
                      mobileNavOpen ? "border-slate-400 bg-slate-50" : undefined,
                    )}
                    aria-expanded={mobileNavOpen}
                    aria-controls={mobileMenuId}
                    onClick={() => setMobileNavOpen((open) => !open)}
                  >
                    {mobileNavOpen ? t("close") : t("menu")}
                  </button>
                  <div
                    ref={mobilePanelRef}
                    id={mobileMenuId}
                    role="region"
                    aria-label={t("primary")}
                    className={joinClasses(
                      "absolute right-0 top-[calc(100%+0.5rem)] w-[min(18rem,calc(100vw-1.5rem))] origin-top-right rounded-xl border border-slate-200 bg-white py-2 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.22)]",
                      mobileNavOpen ? undefined : "hidden",
                    )}
                  >
                    <div className="border-b border-slate-100 px-4 py-3">
                      <Suspense fallback={<div className="h-8 w-full rounded-full border border-slate-200/80 bg-slate-50" aria-hidden />}>
                        <LanguageSwitcher />
                      </Suspense>
                    </div>
                    <ul className="m-0 list-none p-0">
                      {navLinks.map(({ href, labelKey }) => {
                        const active = navLinkIsActive(href, pathname, hash);
                        return (
                          <li key={href}>
                            <Link
                              href={href}
                              className={joinClasses(
                                "block px-4 py-2.5 text-sm font-semibold tracking-[-0.02em] transition-colors hover:bg-slate-50",
                                active
                                  ? "text-[var(--brand-orange)] hover:text-[var(--brand-orange-strong)]"
                                  : "text-slate-800",
                              )}
                              aria-current={active ? "page" : undefined}
                              onClick={closeMobileNav}
                            >
                              {t(labelKey)}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {!bookingEnabled ? (
                  <span
                    aria-disabled
                    className="inline-flex min-h-8 max-w-[min(100%,14rem)] items-center justify-center rounded-full bg-slate-300 px-2.5 py-1.5 text-center text-[0.65rem] font-semibold leading-tight tracking-tight text-slate-700 sm:max-w-[18rem] sm:px-3.5 sm:text-xs"
                  >
                    <BookingDisabledCtaContent
                      message={disabledMessage}
                      className="gap-1.5"
                      iconClassName="h-3 w-3 shrink-0 opacity-90 sm:h-3.5 sm:w-3.5"
                    />
                  </span>
                ) : (
                  <Link
                    href="/booking"
                    className={joinClasses(
                      "inline-flex min-h-8 min-w-[2.5rem] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold tracking-[-0.03em] text-white sm:min-h-8 sm:px-3.5 sm:py-2 sm:text-sm",
                      "bg-[var(--brand-orange)] shadow-[0_10px_28px_-12px_rgba(255,147,15,0.85)] transition-colors",
                      "hover:bg-[var(--brand-orange-strong)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2",
                    )}
                  >
                    {t("bookNow")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
