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
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-[max(0px,env(safe-area-inset-top))]">
      <nav
        aria-label={t("primary")}
        className="site-navbar pointer-events-auto w-full max-w-full border-b border-white/20 bg-slate-600/40 text-white shadow-[0_8px_32px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl backdrop-saturate-150"
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
                  className="h-10 w-auto max-w-full object-contain object-left sm:h-11"
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
                  <Suspense fallback={<div className="h-8 w-[5.5rem] rounded-full border border-white/25 bg-white/15 backdrop-blur-sm" aria-hidden />}>
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
                      <Suspense fallback={<div className="h-8 w-full rounded-full border border-white/25 bg-white/15 backdrop-blur-sm" aria-hidden />}>
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
                    "inline-flex min-h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-semibold normal-case tracking-normal text-white sm:text-[11px]",
                    "bg-[var(--brand-orange)] shadow-[0_10px_28px_-12px_rgba(255,147,15,0.85)] transition-colors",
                    "hover:bg-[var(--brand-orange-strong)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2",
                  )}
                >
                  {t("bookNow")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {!bookingEnabled ? (
        <div
          role="status"
          className="pointer-events-auto w-full border-b border-black/10 bg-[var(--brand-orange-strong)] px-4 py-2.5 text-center text-sm font-semibold tracking-wide text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]"
        >
          {bookingDisabledMessage}
        </div>
      ) : null}
    </header>
  );
}
