import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

import { AdminHeader } from "@/features/admin/components/admin-header";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import type { AdminSessionUser } from "@/lib/admin-auth/types";

type AdminShellProps = Readonly<{
  locale: string;
  user: AdminSessionUser;
  children: ReactNode;
}>;

export async function AdminShell({ locale, user, children }: AdminShellProps) {
  const t = await getTranslations("Admin");

  return (
    <div className="flex min-h-dvh bg-[#f4f7fb] lg:flex-row">
      <div className="lg:sticky lg:top-0 lg:h-dvh lg:overflow-hidden">
        <AdminSidebar locale={locale} />
      </div>
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <AdminHeader locale={locale} user={user} title={t("dashboardOverviewTitle")} />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
