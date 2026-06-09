import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AdminBookingDetailHeader, AdminBookingDetailView } from "@/features/admin/components/admin-booking-detail";
import { AdminBookingLifecycleActions } from "@/features/admin/components/admin-booking-lifecycle-actions";
import { getAdminBookingById } from "@/lib/admin/bookings";
import { listAdminVehicleUnits } from "@/lib/admin/vehicle-units/listAdminVehicleUnits";

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

  const vehicleUnits = booking.vehicleId ? await listAdminVehicleUnits(booking.vehicleId) : [];

  return (
    <div className="space-y-5">
      <AdminBookingDetailHeader locale={locale} booking={booking} />
      <AdminBookingLifecycleActions booking={booking} vehicleUnits={vehicleUnits} />
      <AdminBookingDetailView locale={locale} booking={booking} />
    </div>
  );
}
