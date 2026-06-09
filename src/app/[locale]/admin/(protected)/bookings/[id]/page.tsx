import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AdminBookingDetailView } from "@/features/admin/components/admin-booking-detail";
import { getAdminBookingById } from "@/lib/admin/bookings";

export const dynamic = "force-dynamic";

type AdminBookingDetailPageProps = Readonly<{
  params: Promise<{ locale: string; id: string }>;
}>;

export default async function AdminBookingDetailPage({ params }: AdminBookingDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const booking = await getAdminBookingById(id);
  if (!booking) {
    notFound();
  }

  return <AdminBookingDetailView locale={locale} booking={booking} />;
}
