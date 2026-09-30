"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  SITE_SHELL_OUTER,
  SITE_SHELL_CONTAINER,
  SITE_SHELL_INNER_PAD,
} from "@/components/site-shell";
import { LanguageSwitcher, MobileLanguageList } from "@/components/language-switcher";

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

const navLinkClass = joinClasses(
  "group relative inline-flex items-center py-1.5 text-sm font-semibold tracking-[-0.02em]",
  "transition-colors duration-[var(--dur-fast)] ease-[var(--ease-standard)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent",
);

/**
 * Underline indicator. Scales in from the leading edge on hover and stays
 * pinned open for the current page — cheaper than a shared layout animation
 * and it works identically under `domAnimation`.
 */
const navUnderlineClass = joinClasses(
  "pointer-events-none absolute inset-x-0 -bottom-0.5 h-[2px] rounded-full bg-[var(--orange-400)]",
  "origin-left transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] motion-reduce:transition-none",
);

const switcherFallbackClass =
  "h-9 w-[6.5rem] rounded-full bg-[var(--surface-sunken)] shadow-[inset_0_0_0_1px_var(--line-subtle)]";

export function SiteNavbar() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [hash, setHash] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [languageListOpen, setLanguageListOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuId = useId();
  const [portalReady, setPortalReady] = useState(false);

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

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
    setLanguageListOpen(false);
  }, []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const sync = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 4);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  useEffect(() => {
    startTransition(() => {
      closeMobileNav();
    });
  }, [pathname, hash, closeMobileNav]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (languageListOpen) {
        setLanguageListOpen(false);
        return;
      }
      closeMobileNav();
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (mobileNavRef.current?.contains(target) || mobilePanelRef.current?.contains(target)) {
        return;
      }
      closeMobileNav();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [mobileNavOpen, languageListOpen, closeMobileNav]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) closeMobileNav();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [closeMobileNav]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 pt-[max(0px,env(safe-area-inset-top))]">
      <nav
        aria-label={t("primary")}
        data-scrolled={scrolled ? "true" : undefined}
        className={joinClasses(
          "site-navbar pointer-events-auto w-full max-w-full text-[var(--text-primary)]",
          "backdrop-blur-xl backdrop-saturate-150",
          "transition-[background-color,box-shadow] duration-[var(--dur-base)] ease-[var(--ease-standard)]",
          // The hairline is a box-shadow rather than a border so toggling it on
          // scroll never nudges the layout by a pixel.
          scrolled
            ? "bg-white/96 supports-[backdrop-filter:blur(0px)]:bg-white/86 shadow-[0_1px_0_0_var(--line),var(--elev-2)]"
            : "bg-white/94 supports-[backdrop-filter:blur(0px)]:bg-white/70 shadow-[0_1px_0_0_transparent]",
        )}
      >
        {/* Brand hairline: blue → orange, reads as an intentional accent rather
            than the leftover red artifact it replaces. */}
        <div
          className="h-0.5 w-full shrink-0 bg-[linear-gradient(90deg,var(--blue-600),var(--blue-400)_38%,var(--orange-400)_78%,var(--orange-500))]"
          aria-hidden
        />
        <div className={SITE_SHELL_OUTER}>
          <div className={SITE_SHELL_CONTAINER}>
            <div
              className={joinClasses(
                SITE_SHELL_INNER_PAD,
                "grid min-h-16 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 py-2 sm:gap-y-2",
                "md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-6",
              )}
            >
              <Link
                href="/"
                className={joinClasses(
                  "relative flex min-w-0 max-w-[min(22rem,calc(100vw-9rem))] justify-self-start overflow-hidden rounded-[var(--r-field)]",
                  "transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-standard)] hover:opacity-80",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-2",
                )}
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
                  "hidden list-none items-center justify-center justify-self-center gap-6 md:flex",
                  "lg:gap-8",
                )}
              >
                {navLinks.map(({ href, labelKey }) => {
                  const active = navLinkIsActive(href, pathname, hash);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={joinClasses(
                          navLinkClass,
                          active
                            ? "text-[var(--ink-950)]"
                            : "text-[var(--text-secondary)] hover:text-[var(--ink-950)]",
                        )}
                        aria-current={active ? "page" : undefined}
                      >
                        {t(labelKey)}
                        <span
                          aria-hidden
                          className={joinClasses(
                            navUnderlineClass,
                            active
                              ? "scale-x-100"
                              : "scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100",
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="flex shrink-0 items-center justify-self-end gap-2 sm:gap-2.5">
                <div className="hidden md:block">
                  <Suspense fallback={<div className={switcherFallbackClass} aria-hidden />}>
                    <LanguageSwitcher />
                  </Suspense>
                </div>

                <div ref={mobileNavRef} className="relative z-[60] md:hidden">
                  <button
                    type="button"
                    id={`${mobileMenuId}-trigger`}
                    className={joinClasses(
                      "flex min-h-9 min-w-9 cursor-pointer items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[-0.02em] sm:text-sm",
                      "bg-white text-[var(--ink-900)] shadow-[inset_0_0_0_1px_var(--line),var(--elev-1)]",
                      "transition-[background-color,box-shadow,transform] duration-[var(--dur-fast)] ease-[var(--ease-standard)]",
                      "hover:bg-[var(--surface-soft)] hover:shadow-[inset_0_0_0_1px_var(--line-strong),var(--elev-2)] active:scale-[0.97]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-2",
                      mobileNavOpen
                        ? "bg-[var(--surface-soft)] shadow-[inset_0_0_0_1px_var(--line-strong),var(--elev-2)]"
                        : undefined,
                    )}
                    aria-expanded={mobileNavOpen}
                    aria-controls={mobileMenuId}
                    onClick={() => setMobileNavOpen((open) => !open)}
                  >
                    {t("menu")}
                  </button>
                </div>
                {portalReady
                  ? createPortal(
                      <AnimatePresence initial={false}>
                        {mobileNavOpen ? (
                          <m.div
                            ref={mobilePanelRef}
                            id={mobileMenuId}
                            role="dialog"
                            aria-modal="true"
                            aria-label={t("primary")}
                            initial={reduceMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduceMotion ? 0.01 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="fixed inset-0 z-[80] flex flex-col bg-[#f6f1ea]/58 text-[var(--ink-950)] backdrop-blur-[28px] backdrop-saturate-150 supports-[not_((backdrop-filter:blur(1px)))]:bg-[#f6f1ea]/94"
                          >
                            <div className={SITE_SHELL_OUTER}>
                              <div className={SITE_SHELL_CONTAINER}>
                                <div
                                  className={joinClasses(
                                    SITE_SHELL_INNER_PAD,
                                    "flex items-center justify-between gap-4 pb-2 pt-[max(0.85rem,env(safe-area-inset-top))]",
                                  )}
                                >
                                  <Link
                                    href="/"
                                    onClick={closeMobileNav}
                                    className="relative flex min-w-0 max-w-[min(16rem,calc(100vw-6.5rem))] overflow-hidden rounded-[var(--r-field)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-2"
                                  >
                                    <Image
                                      src={LOGO_SRC}
                                      alt={t("logoAlt")}
                                      width={320}
                                      height={56}
                                      className="h-10 w-auto max-w-full object-contain object-left"
                                      style={{ width: "auto" }}
                                    />
                                  </Link>
                                  <button
                                    ref={closeButtonRef}
                                    type="button"
                                    onClick={closeMobileNav}
                                    aria-label={t("close")}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/55 text-[var(--ink-800)] shadow-[0_1px_2px_rgba(16,24,40,0.06)] backdrop-blur-md transition-colors hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-2"
                                  >
                                    <X className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                                  </button>
                                </div>
                              </div>
                            </div>

                            <ul className="m-0 min-h-0 flex-1 list-none overflow-y-auto px-7 pb-6 pt-8 sm:px-10">
                              {languageListOpen ? (
                                <Suspense fallback={null}>
                                  <MobileLanguageList onSelect={closeMobileNav} />
                                </Suspense>
                              ) : (
                                navLinks.map(({ href, labelKey }, index) => {
                                  const active = navLinkIsActive(href, pathname, hash);
                                  return (
                                    <m.li
                                      key={href}
                                      className="border-b border-black/10"
                                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: reduceMotion ? 0.01 : 0.35,
                                        delay: reduceMotion ? 0 : 0.04 + index * 0.035,
                                        ease: [0.16, 1, 0.3, 1],
                                      }}
                                    >
                                      <Link
                                        href={href}
                                        className="block py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue-500)] focus-visible:ring-offset-4 sm:py-4"
                                        aria-current={active ? "page" : undefined}
                                        onClick={closeMobileNav}
                                      >
                                        <span className="block text-[0.68rem] font-medium tabular-nums tracking-[0.08em] text-[var(--text-muted)]">
                                          {String(index + 1).padStart(2, "0")}
                                        </span>
                                        <span
                                          className={joinClasses(
                                            "mt-1 block text-[1.65rem] font-medium leading-none tracking-[-0.03em] sm:text-[1.85rem]",
                                            active ? "text-[var(--ink-950)]" : "text-[var(--ink-800)]",
                                          )}
                                        >
                                          {t(labelKey)}
                                        </span>
                                      </Link>
                                    </m.li>
                                  );
                                })
                              )}
                            </ul>

                            <div className="px-7 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-10">
                              <Suspense
                                fallback={
                                  <div className={joinClasses(switcherFallbackClass, "w-full")} aria-hidden />
                                }
                              >
                                <LanguageSwitcher
                                  languageListOpen={languageListOpen}
                                  onLanguageListToggle={() => setLanguageListOpen((open) => !open)}
                                />
                              </Suspense>
                            </div>
                          </m.div>
                        ) : null}
                      </AnimatePresence>,
                      document.body,
                    )
                  : null}

                <Link
                  href="/booking"
                  className={joinClasses(
                    "inline-flex min-h-9 min-w-[2.5rem] items-center justify-center rounded-full px-4 py-2 text-xs font-semibold tracking-[-0.02em] sm:min-h-10 sm:px-5 sm:text-sm",
                    "bg-[var(--orange-400)] text-[var(--ink-950)] shadow-[var(--elev-orange)]",
                    "transition-[transform,box-shadow,background-color] duration-[var(--dur-base)] ease-[var(--ease-out-expo)] motion-reduce:transition-none",
                    "hover:bg-[var(--orange-500)] hover:shadow-[var(--elev-orange-lift)] motion-safe:hover:-translate-y-0.5",
                    "active:translate-y-0 active:bg-[var(--orange-600)] active:shadow-[var(--elev-orange)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--orange-600)] focus-visible:ring-offset-2",
                  )}
                >
                  {t("bookNow")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
