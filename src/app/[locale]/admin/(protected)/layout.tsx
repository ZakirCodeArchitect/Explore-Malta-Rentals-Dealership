import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { requireAdminPage } from "@/lib/admin-auth/require-admin-page";

type AdminProtectedLayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: AdminProtectedLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function AdminProtectedLayout({ children, params }: AdminProtectedLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireAdminPage({
    locale,
    redirectTo: `/${locale}/admin`,
  });

  return (
    <AdminShell locale={locale} user={session}>
      {children}
    </AdminShell>
  );
}
