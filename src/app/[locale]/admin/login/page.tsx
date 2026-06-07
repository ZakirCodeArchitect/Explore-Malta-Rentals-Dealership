import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminLoginBackground } from "@/features/admin/components/admin-login-background";
import { AdminLoginForm } from "@/features/admin/components/admin-login-form";
import { redirectIfAdminAuthenticated } from "@/lib/admin-auth/require-admin-page";
import { SITE_CONTACT } from "@/lib/site-brand-copy";

type AdminLoginPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export async function generateMetadata({ params }: AdminLoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  return {
    title: t("loginHeading"),
    robots: { index: false, follow: false },
  };
}

function resolveContactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || SITE_CONTACT.email;
}

export default async function AdminLoginPage({ params }: AdminLoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await redirectIfAdminAuthenticated(locale);

  const contactEmail = resolveContactEmail();

  return (
    <AdminLoginBackground>
      <Suspense
        fallback={
          <div className="h-[540px] w-full max-w-[374px] animate-pulse rounded-[24px] bg-white/80 shadow-xl" />
        }
      >
        <AdminLoginForm locale={locale} contactEmail={contactEmail} />
      </Suspense>
    </AdminLoginBackground>
  );
}
