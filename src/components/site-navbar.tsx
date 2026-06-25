"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Suspense, startTransition, useCallback, useEffect, useId, useRef, useState } from "react";
import {
  SITE_SHELL_OUTER,
  SITE_SHELL_CONTAINER,
  SITE_SHELL_INNER_PAD,
  SITE_NAV_CONTROL_BORDER,
  SITE_NAV_CONTROL_RADIUS,
} from "@/components/site-shell";
import { LanguageSwitcher } from "@/components/language-switcher";

const LOGO_SRC = "/explore%20malta%20rentals%20logo.png";

function isBookingEnabled() {
  const raw = process.env.NEXT_PUBLIC_BOOKING_ENABLED?.trim().toLowerCase();
  if (!raw) return true;
  return raw !== "false" && raw !== "0" && raw !== "no";
}

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
  "text-[10px] font-medium normal-case tracking-normal transition-colors lg:text-[11px]";
const navLinkInactiveClass = `${navLinkBaseClass} text-white/90 hover:text-white`;
const navLinkActiveClass = `${navLinkBaseClass} text-[var(--brand-orange)] hover:text-[var(--brand-orange-strong)]`;

export function SiteNavbar() {
  const t = useTranslations("Nav");
  const tBanner = useTranslations("SiteBanner");
  const bookingEnabled = isBookingEnabled();
  const bookingDisabledMessage =
    process.env.NEXT_PUBLIC_BOOKING_DISABLED_MESSAGE?.trim() ||
    tBanner("onlineBookingUnavailable");
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
    document.documentElement.classList.toggle("booking-banner-hidden", bookingEnabled);
    return () => {
      document.documentElement.classList.remove("booking-banner-hidden");
    };
  }, [bookingEnabled]);

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
    <header
      className={joinClasses(
        "pointer-events-none fixed inset-x-0 top-0 z-50",
        SITE_SHELL_OUTER,
        "pt-[max(0.75rem,calc(env(safe-area-inset-top)+0.75rem))] sm:pt-[max(1rem,calc(env(safe-area-inset-top)+1rem))]",
      )}
    >
      <div className={SITE_SHELL_CONTAINER}>
        <div className={SITE_SHELL_INNER_PAD}>
          <div className="site-navbar-shell pointer-events-auto w-full">
            <nav aria-label={t("primary")} className="site-navbar w-full text-white">
            <div
              className={joinClasses(
                "grid min-h-10 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 py-1.5 pl-1.5 pr-3 sm:min-h-11 sm:gap-y-2 sm:py-1.5 sm:pl-1.5 sm:pr-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-4 md:pl-1.5 md:pr-5",
              )}
            >
              <Link
                href="/"
                className="site-navbar__logo relative inline-flex shrink-0 items-center self-center justify-self-start overflow-hidden rounded-sm"
              >
                <Image
                  src={LOGO_SRC}
                  alt={t("logoAlt")}
                  width={320}
                  height={56}
                  className="block h-9 w-auto max-w-none object-contain object-left sm:h-10"
                  style={{ width: "auto" }}
                  priority
                />
              </Link>

              <ul
                className={joinClasses(
                  "hidden list-none items-center justify-center justify-self-center gap-4 md:flex",
                  "lg:gap-6",
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
                <div className="hidden font-sans md:block">
                  <Suspense fallback={<div className="h-8 w-[5.5rem] rounded-md border border-white/25 bg-white/15 backdrop-blur-sm" aria-hidden />}>
                    <LanguageSwitcher />
                  </Suspense>
                </div>

                <div ref={mobileNavRef} className="relative z-[60] md:hidden">
                  <button
                    type="button"
                    id={`${mobileMenuId}-trigger`}
                    className={joinClasses(
                      "flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-md border border-white/25 bg-white/10 px-2.5 py-1.5 text-[10px] font-medium normal-case tracking-normal text-white backdrop-blur-sm hover:bg-white/20",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-blue)] focus-visible:ring-offset-2",
                      mobileNavOpen ? "border-white/35 bg-white/20" : undefined,
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
                      "absolute right-0 top-[calc(100%+0.5rem)] w-[min(18rem,calc(100vw-1.5rem))] origin-top-right rounded-xl border border-white/25 bg-slate-600/80 py-2 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.35)] backdrop-blur-xl",
                      mobileNavOpen ? undefined : "hidden",
                    )}
                  >
                    <div className="border-b border-white/15 px-4 py-3 font-sans">
                      <Suspense fallback={<div className="h-8 w-full rounded-md border border-white/25 bg-white/15 backdrop-blur-sm" aria-hidden />}>
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
                                "block px-4 py-2.5 text-[10px] font-medium normal-case tracking-normal transition-colors hover:bg-white/10 lg:text-[11px]",
                                active
                                  ? "text-[var(--brand-orange)] hover:text-[var(--brand-orange-strong)]"
                                  : "text-white/90",
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

                <Link
                  href="/booking"
                  className={joinClasses(
                    "group relative inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap px-3.5 py-1.5 text-[10px] font-bold normal-case tracking-[-0.01em] text-white sm:text-[11px]",
                    SITE_NAV_CONTROL_RADIUS,
                    SITE_NAV_CONTROL_BORDER,
                    "bg-gradient-to-br from-[#d97706] via-[#b45309] to-[#7c2d12] shadow-[0_12px_28px_-14px_rgba(124,45,18,0.98),0_5px_14px_-10px_rgba(15,23,42,0.75)]",
                    "transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:from-[#ea8a10] hover:via-[#c45f0a] hover:to-[#8a3510] hover:shadow-[0_15px_32px_-14px_rgba(124,45,18,1),0_9px_18px_-12px_rgba(15,23,42,0.75)]",
                    "active:translate-y-0 active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b45309] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                  )}
                >
                  <span
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.38)_48%,transparent_66%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <span className="relative z-10">{t("bookNow")}</span>
                  <span
                    className="relative z-10 inline-flex translate-x-0 transition-transform duration-300 group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    <svg
                      viewBox="0 0 16 16"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.5 8h8" />
                      <path d="m8.5 4 4 4-4 4" />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
            </nav>
          </div>
          {!bookingEnabled ? (
            <div
              role="status"
              className="pointer-events-auto mt-2 rounded-xl border border-black/10 bg-[var(--brand-orange-strong)] px-4 py-2.5 text-center text-sm font-semibold tracking-wide text-white shadow-[0_12px_32px_-16px_rgba(15,23,42,0.35),inset_0_-1px_0_rgba(0,0,0,0.08)]"
            >
              {bookingDisabledMessage}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
