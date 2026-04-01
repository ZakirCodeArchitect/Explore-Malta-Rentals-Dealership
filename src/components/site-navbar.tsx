import Image from "next/image";
import Link from "next/link";
import {
  SITE_SHELL_OUTER,
  SITE_SHELL_CONTAINER,
  SITE_SHELL_INNER_PAD,
  SITE_SURFACE_RADIUS,
} from "@/components/site-shell";

const LOGO_SRC = "/explore%20malta%20rentals%20logo.png";

const navLinks = [
  { href: "/", label: "Home" },
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

export function SiteNavbar() {
  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 pt-2 sm:pt-3 ${SITE_SHELL_OUTER}`}
    >
      <div className={SITE_SHELL_CONTAINER}>
        <nav
          aria-label="Primary"
          className={joinClasses(
            "site-navbar pointer-events-auto w-full overflow-hidden border border-white/25 bg-white/50 text-[var(--foreground)] shadow-[0_4px_24px_-16px_rgba(15,23,42,0.18)] backdrop-blur-xl backdrop-saturate-150",
            SITE_SURFACE_RADIUS,
          )}
        >
          <div
            className={joinClasses(
              SITE_SHELL_INNER_PAD,
              "grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-stretch gap-x-3 gap-y-2 py-1.5 sm:min-h-14 sm:py-2",
              "md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-4",
            )}
          >
            <Link
              href="/"
              className={joinClasses(
                "relative flex min-w-0 max-w-[min(22rem,calc(100vw-9rem))] justify-self-start overflow-hidden rounded-l-lg sm:rounded-l-xl",
                "-ml-4 -mt-1.5 -mb-1.5 sm:-ml-6 sm:-mt-2 sm:-mb-2 lg:-ml-10",
              )}
            >
              <Image
                src={LOGO_SRC}
                alt="Explore Malta Rentals"
                width={320}
                height={56}
                className="h-[3rem] w-auto max-w-full object-contain object-left sm:h-[3.5rem]"
                priority
              />
            </Link>

            <ul
              className={joinClasses(
                "hidden list-none items-center justify-center justify-self-center gap-5 md:flex",
                "lg:gap-8",
              )}
            >
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm font-semibold tracking-[-0.02em] text-slate-800 transition-opacity hover:opacity-70"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex shrink-0 items-center justify-self-end gap-2">
              <details className="relative md:hidden">
                <summary
                  className={joinClasses(
                    "flex cursor-pointer list-none items-center justify-center rounded-lg border border-white/30 bg-white/60 px-2 py-1.5 text-sm font-semibold tracking-[-0.02em] text-slate-800 backdrop-blur-md",
                    "[&::-webkit-details-marker]:hidden",
                  )}
                >
                  Menu
                </summary>
                <div className="absolute right-0 top-full z-30 mt-2 w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-white/30 bg-white/85 py-2 shadow-lg backdrop-blur-xl">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-4 py-2.5 text-sm font-semibold tracking-[-0.02em] text-slate-800 hover:bg-slate-50"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </details>

              <Link
                href="/#booking-preview"
                className={joinClasses(
                  "inline-flex min-h-8 items-center justify-center rounded-full px-3.5 py-1.5 text-sm font-semibold tracking-[-0.03em] text-white sm:min-h-9 sm:px-4 sm:py-2",
                  "bg-[var(--brand-orange)] shadow-[0_10px_28px_-12px_rgba(255,147,15,0.85)] transition-colors",
                  "hover:bg-[var(--brand-orange-strong)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange-strong)] focus-visible:ring-offset-2",
                )}
              >
                book us
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
