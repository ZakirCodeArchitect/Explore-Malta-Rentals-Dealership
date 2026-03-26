import type { ReactNode } from "react";

/** Primary white surfaces (navbar, booking panel) — keep in sync. */
export const SITE_SURFACE_RADIUS = "rounded-lg sm:rounded-xl";

/** Horizontal layout shared by `SiteNavbar` and hero so edges line up. */
export const SITE_SHELL_OUTER = "px-3 sm:px-5";
export const SITE_SHELL_CONTAINER = "mx-auto w-full max-w-[90rem]";
export const SITE_SHELL_INNER_PAD = "px-4 sm:px-6 lg:px-10";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className={SITE_SHELL_OUTER}>
      <div className={SITE_SHELL_CONTAINER}>
        <div className={SITE_SHELL_INNER_PAD}>{children}</div>
      </div>
    </div>
  );
}
