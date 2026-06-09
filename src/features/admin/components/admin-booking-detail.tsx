import type { ReactNode } from "react";

import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { AdminBookingPriceBuildup } from "@/features/admin/components/admin-booking-price-buildup";
import type { AdminBookingDetail } from "@/lib/admin/bookings/types";

type AdminBookingDetailViewProps = Readonly<{
  locale: string;
  booking: AdminBookingDetail;
}>;

function formatEur(amount: number | null): string {
  if (amount === null) return "—";
  return new Intl.NumberFormat("en-MT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${value}%`;
}

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function formatCoordinates(latitude: number | null, longitude: number | null): string {
  if (latitude === null || longitude === null) return "—";
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

function formatUploadPath(path: string | null): string {
  if (!path?.trim()) return "—";
  const segments = path.split(/[/\\]/);
  return segments[segments.length - 1] ?? path;
}

function statusBadgeClass(status: string): string {
  if (status === "CONFIRMED") return "bg-emerald-50 text-emerald-700";
  if (status === "PENDING") return "bg-amber-50 text-amber-800";
  if (status === "CANCELLED") return "bg-slate-100 text-slate-600";
  return "bg-red-50 text-red-700";
}

function DetailSection({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: Readonly<{ label: string; value: ReactNode }>) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-slate-100 py-2 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="max-w-[65%] text-right text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

export async function AdminBookingDetailView({ locale, booking }: AdminBookingDetailViewProps) {
  const t = await getTranslations({ locale, namespace: "Admin.bookings" });

  const formatYesNo = (value: boolean) => (value ? t("details.yes") : t("details.no"));

  return (
    <div className="space-y-5">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <a
            href={`/${locale}/admin/bookings`}
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-[#3a7ca5]"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("details.backToList")}
          </a>
          <h2 className="border-t border-slate-200/80 pt-4 text-lg font-bold text-slate-950">
            {t("details.title", { reference: booking.bookingReference })}
          </h2>
        </div>
        <span
          className={[
            "inline-flex rounded-full px-3 py-1 text-sm font-semibold",
            statusBadgeClass(booking.status),
          ].join(" ")}
        >
          {t(`status.${booking.status}` as "status.CONFIRMED")}
        </span>
      </section>

      <DetailSection title={t("details.sections.summary")}>
        <dl>
          <DetailRow label={t("details.fields.reference")} value={booking.bookingReference} />
          <DetailRow
            label={t("details.fields.status")}
            value={t(`status.${booking.status}` as "status.CONFIRMED")}
          />
          <DetailRow label={t("details.fields.createdAt")} value={formatDateTime(booking.createdAt)} />
          <DetailRow label={t("details.fields.updatedAt")} value={formatDateTime(booking.updatedAt)} />
          <DetailRow
            label={t("details.fields.securityDepositMethod")}
            value={t(`depositMethod.${booking.depositMethod}` as "depositMethod.ONLINE")}
          />
          <DetailRow
            label={t("details.fields.confirmationEmailStatus")}
            value={t(
              `confirmationEmailStatus.${booking.confirmationEmailStatus}` as "confirmationEmailStatus.SENT",
            )}
          />
          <DetailRow
            label={t("details.fields.confirmationEmailSentAt")}
            value={booking.confirmationEmailSentAt ? formatDateTime(booking.confirmationEmailSentAt) : "—"}
          />
        </dl>
      </DetailSection>

      <div className="grid gap-5 lg:grid-cols-2">
        <DetailSection title={t("details.sections.customer")}>
          <dl>
            <DetailRow label={t("details.fields.name")} value={booking.customerFullName} />
            <DetailRow label={t("details.fields.email")} value={booking.customerEmail} />
            <DetailRow label={t("details.fields.phone")} value={booking.customerPhone} />
            <DetailRow label={t("details.fields.nationality")} value={booking.customerNationality} />
            <DetailRow label={t("details.fields.dateOfBirth")} value={formatDate(booking.customerDateOfBirth)} />
            <DetailRow label={t("details.fields.licenseCategory")} value={booking.customerLicenseCategory} />
            <DetailRow
              label={t("details.fields.licenseUpload")}
              value={formatUploadPath(booking.customerLicenseUploadPath)}
            />
            <DetailRow
              label={t("details.fields.passportUpload")}
              value={formatUploadPath(booking.customerPassportUploadPath)}
            />
            <DetailRow
              label={t("details.fields.willPresentLicenseAtPickup")}
              value={formatYesNo(booking.customerWillPresentLicenseAtPickup)}
            />
            <DetailRow
              label={t("details.fields.willPresentIdAtPickup")}
              value={formatYesNo(booking.customerWillPresentIdAtPickup)}
            />
            <DetailRow
              label={t("details.fields.notes")}
              value={booking.customerSpecialNotes?.trim() ? booking.customerSpecialNotes : "—"}
            />
          </dl>
        </DetailSection>

        <DetailSection title={t("details.sections.vehicle")}>
          <dl>
            <DetailRow label={t("details.fields.vehicleName")} value={booking.vehicleName} />
            <DetailRow label={t("details.fields.licensePlate")} value={booking.vehicleLicensePlate ?? "—"} />
            <DetailRow label={t("details.fields.vehicleType")} value={booking.vehicleType} />
            <DetailRow
              label={t("details.fields.vehicleTypeSnapshot")}
              value={booking.vehicleTypeSnapshot ?? "—"}
            />
            <DetailRow label={t("details.fields.pickup")} value={formatDateTime(booking.pickupDateTime)} />
            <DetailRow label={t("details.fields.return")} value={formatDateTime(booking.returnDateTime)} />
            <DetailRow label={t("details.fields.billableDays")} value={booking.billableDays} />
            <DetailRow
              label={t("details.fields.actualDurationHours")}
              value={booking.actualDurationHours.toFixed(2)}
            />
          </dl>
        </DetailSection>
      </div>

      <DetailSection title={t("details.sections.pickupDropoff")}>
        <dl>
          <DetailRow label={t("details.fields.pickupOption")} value={booking.pickupOption} />
          <DetailRow label={t("details.fields.pickupAddress")} value={booking.pickupAddress?.trim() ? booking.pickupAddress : "—"} />
          <DetailRow
            label={t("details.fields.pickupCoordinates")}
            value={formatCoordinates(booking.pickupLatitude, booking.pickupLongitude)}
          />
          <DetailRow label={t("details.fields.dropoffOption")} value={booking.dropoffOption} />
          <DetailRow label={t("details.fields.dropoffAddress")} value={booking.dropoffAddress?.trim() ? booking.dropoffAddress : "—"} />
          <DetailRow
            label={t("details.fields.dropoffCoordinates")}
            value={formatCoordinates(booking.dropoffLatitude, booking.dropoffLongitude)}
          />
        </dl>
      </DetailSection>

      <DetailSection title={t("details.sections.addons")}>
        <dl>
          <DetailRow label={t("details.fields.cdwOption")} value={booking.cdwOption} />
          <DetailRow label={t("details.fields.cdwDailyRate")} value={formatEur(booking.cdwDailyRate)} />
          <DetailRow label={t("details.fields.helmetSize1")} value={booking.helmetSize1 ?? "—"} />
          <DetailRow label={t("details.fields.helmetSize2")} value={booking.helmetSize2 ?? "—"} />
          <DetailRow
            label={t("details.fields.storageBoxSelected")}
            value={formatYesNo(booking.storageBoxSelected)}
          />
          <DetailRow
            label={t("details.fields.storageBoxCost")}
            value={booking.storageBoxSelected ? formatEur(booking.storageBoxCost) : "—"}
          />
          <DetailRow
            label={t("details.fields.additionalDriverEnabled")}
            value={formatYesNo(booking.additionalDriverEnabled)}
          />
        </dl>
      </DetailSection>

      {booking.additionalDriverEnabled ? (
        <DetailSection title={t("details.sections.additionalDriver")}>
          <dl>
            <DetailRow label={t("details.fields.name")} value={booking.additionalDriverFullName ?? "—"} />
            <DetailRow label={t("details.fields.email")} value={booking.additionalDriverEmail ?? "—"} />
            <DetailRow label={t("details.fields.phone")} value={booking.additionalDriverPhone ?? "—"} />
            <DetailRow
              label={t("details.fields.nationality")}
              value={booking.additionalDriverNationality ?? "—"}
            />
            <DetailRow
              label={t("details.fields.dateOfBirth")}
              value={
                booking.additionalDriverDateOfBirth
                  ? formatDate(booking.additionalDriverDateOfBirth)
                  : "—"
              }
            />
            <DetailRow
              label={t("details.fields.licenseCategory")}
              value={booking.additionalDriverLicenseCategory ?? "—"}
            />
            <DetailRow
              label={t("details.fields.licenseUpload")}
              value={formatUploadPath(booking.additionalDriverLicenseUploadPath)}
            />
            <DetailRow
              label={t("details.fields.passportUpload")}
              value={formatUploadPath(booking.additionalDriverPassportUploadPath)}
            />
            <DetailRow
              label={t("details.fields.willPresentLicenseAtPickup")}
              value={formatYesNo(booking.additionalDriverWillPresentLicenseAtPickup)}
            />
            <DetailRow
              label={t("details.fields.willPresentIdAtPickup")}
              value={formatYesNo(booking.additionalDriverWillPresentIdAtPickup)}
            />
            <DetailRow
              label={t("details.fields.additionalDriverDailyRate")}
              value={formatEur(booking.additionalDriverDailyRate)}
            />
            <DetailRow
              label={t("details.fields.additionalDriverTotal")}
              value={formatEur(booking.additionalDriverTotal)}
            />
          </dl>
        </DetailSection>
      ) : null}

      <DetailSection title={t("details.sections.hotel")}>
        <dl>
          <DetailRow label={t("details.fields.hotelName")} value={booking.hotelName ?? "—"} />
          <DetailRow label={t("details.fields.hotelCode")} value={booking.hotelCode ?? "—"} />
          <DetailRow
            label={t("details.fields.hotelDiscountPercent")}
            value={formatPercent(booking.hotelDiscountPercentSnapshot)}
          />
          <DetailRow
            label={t("details.fields.hotelDiscountAmount")}
            value={formatEur(booking.hotelDiscountAmountSnapshot)}
          />
          <DetailRow
            label={t("details.fields.subtotalAfterHotelDiscountSnapshot")}
            value={formatEur(booking.subtotalAfterHotelDiscountSnapshot)}
          />
        </dl>
      </DetailSection>

      <AdminBookingPriceBuildup locale={locale} booking={booking} />

      <DetailSection title={t("details.sections.audit")}>
        <dl>
          <DetailRow label={t("details.fields.termsAccepted")} value={formatYesNo(booking.termsAccepted)} />
          <DetailRow
            label={t("details.fields.termsAcceptedAt")}
            value={booking.termsAcceptedAt ? formatDateTime(booking.termsAcceptedAt) : "—"}
          />
          <DetailRow label={t("details.fields.termsVersion")} value={booking.termsVersion ?? "—"} />
          <DetailRow label={t("details.fields.consentSource")} value={booking.consentSource ?? "—"} />
        </dl>

        {booking.statusHistory.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t("details.sections.history")}
            </p>
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="pb-2 pr-3 font-semibold">{t("details.history.date")}</th>
                  <th className="pb-2 pr-3 font-semibold">{t("details.history.from")}</th>
                  <th className="pb-2 pr-3 font-semibold">{t("details.history.to")}</th>
                  <th className="pb-2 pr-3 font-semibold">{t("details.history.admin")}</th>
                  <th className="pb-2 font-semibold">{t("details.history.note")}</th>
                </tr>
              </thead>
              <tbody>
                {booking.statusHistory.map((entry) => (
                  <tr key={entry.id} className="border-t border-slate-100">
                    <td className="py-2 pr-3 text-slate-700">{formatDateTime(entry.createdAt)}</td>
                    <td className="py-2 pr-3 text-slate-700">
                      {entry.oldStatus
                        ? t(`status.${entry.oldStatus}` as "status.CONFIRMED")
                        : "—"}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">
                      {t(`status.${entry.newStatus}` as "status.CONFIRMED")}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">{entry.changedByAdminName ?? "—"}</td>
                    <td className="py-2 text-slate-700">{entry.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </DetailSection>
    </div>
  );
}
