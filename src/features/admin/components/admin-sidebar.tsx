"use client";

import {
  BarChart3,
  Building2,
  CalendarCheck,
  Car,
  LayoutDashboard,
  LogOut,
  Percent,
  Settings,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { AdminSidebarBrand } from "@/features/admin/components/admin-header";

type AdminNavItem = {
  href: string;
  labelKey:
    | "overview"
    | "vehicles"
    | "bookings"
    | "hotels"
    | "hotelCodes"
    | "payments"
    | "reports";
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  disabled?: boolean;
};

const MAIN_NAV: AdminNavItem[] = [
  { href: "", labelKey: "overview", icon: LayoutDashboard },
  { href: "/vehicles", labelKey: "vehicles", icon: Car, disabled: true },
  { href: "/bookings", labelKey: "bookings", icon: CalendarCheck, disabled: true },
];

const MANAGEMENT_NAV: AdminNavItem[] = [
  { href: "/hotels", labelKey: "hotels", icon: Building2, disabled: true },
  { href: "/hotel-codes", labelKey: "hotelCodes", icon: Percent, disabled: true },
  { href: "/payments", labelKey: "payments", icon: Wallet, disabled: true },
  { href: "/reports", labelKey: "reports", icon: BarChart3, disabled: true },
];

type AdminSidebarProps = Readonly<{
  locale: string;
}>;

function joinPath(locale: string, suffix: string): string {
  return `/${locale}/admin${suffix}`;
}

function navItemIsActive(pathname: string, target: string): boolean {
  if (target.endsWith("/admin")) {
    return pathname === target || pathname === `${target}/`;
  }
  return pathname === target || pathname.startsWith(`${target}/`);
}

function NavSection({
  title,
  items,
  locale,
  pathname,
}: Readonly<{
  title?: string;
  items: AdminNavItem[];
  locale: string;
  pathname: string;
}>) {
  const t = useTranslations("Admin");

  return (
    <div>
      {title ? (
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {title}
        </p>
      ) : null}
      <ul className="space-y-1">
        {items.map(({ href, labelKey, icon: Icon, disabled }) => {
          const target = joinPath(locale, href);
          const active = navItemIsActive(pathname, target);

          if (disabled) {
            return (
              <li key={labelKey}>
                <span
                  aria-disabled="true"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400"
                  title={t("comingSoon")}
                >
                  <Icon className="size-[18px] shrink-0" aria-hidden />
                  {t(`nav.${labelKey}`)}
                </span>
              </li>
            );
          }

          return (
            <li key={labelKey}>
              <a
                href={target}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-[#3a7ca5]/12 text-[#3a7ca5]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                {t(`nav.${labelKey}`)}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AdminSidebar({ locale }: AdminSidebarProps) {
  const t = useTranslations("Admin");
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200/80 bg-white lg:w-[250px] lg:shrink-0">
      <AdminSidebarBrand />

      <nav aria-label={t("navLabel")} className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        <NavSection items={MAIN_NAV} locale={locale} pathname={pathname} />
        <NavSection
          title={t("navSectionManagement")}
          items={MANAGEMENT_NAV}
          locale={locale}
          pathname={pathname}
        />
      </nav>

      <div className="space-y-1 border-t border-slate-100 p-3">
        <span
          aria-disabled="true"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400"
        >
          <Settings className="size-[18px]" aria-hidden />
          {t("settings")}
        </span>
        <form action={`/api/admin/auth/logout?locale=${encodeURIComponent(locale)}`} method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut className="size-[18px]" aria-hidden />
            {t("signOut")}
          </button>
        </form>
      </div>
    </aside>
  );
}
