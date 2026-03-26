import Link from "next/link";
import {
  SITE_SHELL_OUTER,
  SITE_SHELL_CONTAINER,
  SITE_SHELL_INNER_PAD,
  SITE_SURFACE_RADIUS,
} from "@/components/site-shell";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About us" },
  { href: "/#contact", label: "contact us" },
  { href: "/#services", label: "Services" },
] as const;

function DiamondLogo() {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className="h-8 w-8 shrink-0 text-[var(--foreground)]"
      fill="none"
    >
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        d="M20 4 36 20 20 36 4 20 20 4z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.75"
        d="M20 12 28 20 20 28 12 20 20 12z"
      />
    </svg>
  );
}

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function SiteNavbar() {
  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4 ${SITE_SHELL_OUTER}`}
    >
      <div className={SITE_SHELL_CONTAINER}>
        <nav
          aria-label="Primary"
          className={joinClasses(
            "pointer-events-auto w-full overflow-hidden bg-white text-[var(--foreground)] shadow-[0_4px_24px_-16px_rgba(15,23,42,0.12)]",
            SITE_SURFACE_RADIUS,
          )}
        >
          <div
            className={joinClasses(
              SITE_SHELL_INNER_PAD,
              "grid min-h-14 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 py-2.5 sm:min-h-[4.25rem] sm:py-3",
              "md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-x-4",
            )}
          >
            <Link
              href="/"
              className="flex min-w-0 items-center justify-self-start gap-2.5 uppercase tracking-[0.06em]"
            >
              <DiamondLogo />
              <span className="truncate text-[0.95rem] font-bold tracking-[0.08em] sm:text-base">
                explore malta
              </span>
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
                    className="text-sm font-medium text-slate-800 transition-opacity hover:opacity-70"
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
                    "flex cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-medium text-slate-800",
                    "[&::-webkit-details-marker]:hidden",
                  )}
                >
                  Menu
                </summary>
                <div className="absolute right-0 top-full z-30 mt-2 w-[min(16rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="block px-4 py-2.5 text-sm text-slate-800 hover:bg-slate-50"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </details>

              <Link
                href="/#booking-preview"
                className={joinClasses(
                  "inline-flex min-h-9 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold tracking-[-0.02em] text-white sm:min-h-10 sm:px-5 sm:py-2.5",
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
