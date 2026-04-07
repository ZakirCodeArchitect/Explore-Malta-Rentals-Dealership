"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  SITE_SHELL_OUTER,
  SITE_SHELL_CONTAINER,
  SITE_SHELL_INNER_PAD,
} from "@/components/site-shell";

const LOGO_SRC = "/explore%20malta%20rentals%20logo.png";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/booking", label: "Booking" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/about", label: "About us" },
  { href: "/guide", label: "Guide" },
  { href: "/tours", label: "Tours" },
  { href: "/#contact", label: "Contact us" },
  { href: "/#services", label: "Services" },
] as const;

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function navLinkIsActive(href: string, pathname: string, hash: string): boolean {
  if (href === "/#contact") {
    return pathname === "/" && hash === "#contact";
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
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileMenuId = useId();

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  useEffect(() => {
    const sync = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  useEffect(() => {
    closeMobileNav();
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
        aria-label="Primary"
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
                  alt="Explore Malta Rentals"
                  width={320}
                  height={56}
                  className="h-10 w-auto max-w-full rounded-md object-contain object-left sm:h-11"
                  priority
                />
              </Link>

              <ul
                className={joinClasses(
                  "hidden list-none items-center justify-center justify-self-center gap-5 md:flex",
                  "lg:gap-8",
                )}
              >
                {navLinks.map(({ href, label }) => {
                  const active = navLinkIsActive(href, pathname, hash);
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        className={active ? navLinkActiveClass : navLinkInactiveClass}
                        aria-current={active ? "page" : undefined}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="flex shrink-0 items-center justify-self-end gap-2">
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
                    {mobileNavOpen ? "Close" : "Menu"}
                  </button>
                  <div
                    ref={mobilePanelRef}
                    id={mobileMenuId}
                    role="region"
                    aria-label="Site pages"
                    className={joinClasses(
                      "absolute right-0 top-[calc(100%+0.5rem)] w-[min(18rem,calc(100vw-1.5rem))] origin-top-right rounded-xl border border-slate-200 bg-white py-2 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.22)]",
                      mobileNavOpen ? undefined : "hidden",
                    )}
                  >
                    <ul className="m-0 list-none p-0">
                      {navLinks.map(({ href, label }) => {
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
                              {label}
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
                    "inline-flex min-h-8 min-w-[2.5rem] items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold tracking-[-0.03em] text-white sm:min-h-8 sm:px-3.5 sm:py-2 sm:text-sm",
                    "bg-[var(--brand-orange)] shadow-[0_10px_28px_-12px_rgba(255,147,15,0.85)] transition-colors",
                    "hover:bg-[var(--brand-orange-strong)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2",
                  )}
                >
                  book us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
