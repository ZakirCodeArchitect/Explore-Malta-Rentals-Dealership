import { getTranslations } from "next-intl/server";

import type { AdminReportsSummary } from "@/lib/admin/reports";

type AdminReportDashboardProps = Readonly<{
  summary: AdminReportsSummary;
}>;

function formatEur(amount: number): string {
  return new Intl.NumberFormat("en-MT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function StatCard({
  label,
  value,
  hint,
}: Readonly<{ label: string; value: string; hint?: string }>) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tracking-[-0.03em] text-slate-950">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-slate-500">{hint}</p> : null}
    </article>
  );
}

function HorizontalBars({
  items,
  labelKey,
  valueKey,
}: Readonly<{
  items: ReadonlyArray<Record<string, string | number>>;
  labelKey: string;
  valueKey: string;
}>) {
  const max = Math.max(...items.map((item) => Number(item[valueKey])), 1);

  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const value = Number(item[valueKey]);
        const width = value === 0 ? "0%" : `${Math.max(8, (value / max) * 100)}%`;
        return (
          <li key={String(item[labelKey])}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{String(item[labelKey])}</span>
              <span className="font-semibold text-slate-900">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#3a7ca5] to-[#5b9cc7]"
                style={{ width }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function statusBadgeClass(status: string): string {
  if (status === "CONFIRMED" || status === "PAID") return "bg-emerald-50 text-emerald-700";
  if (status === "VEHICLE_HANDED_OVER") return "bg-blue-50 text-blue-700";
  if (status === "RETURNED") return "bg-violet-50 text-violet-700";
  if (status === "COMPLETED") return "bg-slate-100 text-slate-700";
  if (status === "PARTIALLY_PAID") return "bg-amber-50 text-amber-800";
  if (status === "CANCELLED" || status === "DUE") return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
}

function Section({
  title,
  description,
  children,
}: Readonly<{ title: string; description?: string; children: React.ReactNode }>) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-950">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export async function AdminReportDashboard({ summary }: AdminReportDashboardProps) {
  const t = await getTranslations("Admin.reports");
  const { bookingSummary, vehicleSummary, hotelCodeSummary, hotelPaymentSummary, recentBookings } =
    summary;

  const vehicleTypeItems = vehicleSummary.byType.map((row) => ({
    label: t(`vehicleTypes.${row.vehicleType}` as "vehicleTypes.Scooter"),
    count: row.count,
  }));

  const vehicleStatusItems = vehicleSummary.byCatalogStatus.map((row) => ({
    label: t(`catalogStatus.${row.catalogStatus}` as "catalogStatus.AVAILABLE"),
    count: row.count,
  }));

  return (
    <div className="space-y-5">
      <Section title={t("sections.booking.title")} description={t("sections.booking.description")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("booking.totalBookings")} value={String(bookingSummary.totalBookings)} />
          <StatCard label={t("booking.confirmed")} value={String(bookingSummary.confirmedBookings)} />
          <StatCard label={t("booking.handedOver")} value={String(bookingSummary.handedOverBookings)} />
          <StatCard label={t("booking.returned")} value={String(bookingSummary.returnedBookings)} />
          <StatCard label={t("booking.completed")} value={String(bookingSummary.completedBookings)} />
          <StatCard label={t("booking.cancelled")} value={String(bookingSummary.cancelledBookings)} />
          <StatCard label={t("booking.thisMonth")} value={String(bookingSummary.bookingsThisMonth)} />
          <StatCard label={t("booking.lastMonth")} value={String(bookingSummary.bookingsLastMonth)} />
          <StatCard
            label={t("booking.totalValue")}
            value={formatEur(bookingSummary.totalBookingValue)}
            hint={t("booking.revenueHint")}
          />
          <StatCard
            label={t("booking.totalDiscount")}
            value={formatEur(bookingSummary.totalHotelDiscount)}
          />
        </div>
      </Section>

      <Section title={t("sections.vehicle.title")} description={t("sections.vehicle.description")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t("vehicle.total")} value={String(vehicleSummary.totalVehicles)} />
          <StatCard label={t("vehicle.active")} value={String(vehicleSummary.activeVehicles)} />
          <StatCard label={t("vehicle.available")} value={String(vehicleSummary.availableVehicles)} />
          <StatCard label={t("vehicle.booked")} value={String(vehicleSummary.bookedVehicles)} />
          <StatCard label={t("vehicle.underProcess")} value={String(vehicleSummary.underProcessVehicles)} />
          <StatCard label={t("vehicle.sold")} value={String(vehicleSummary.soldVehicles)} />
          <StatCard label={t("vehicle.maintenance")} value={String(vehicleSummary.maintenanceVehicles)} />
          <StatCard label={t("vehicle.inactive")} value={String(vehicleSummary.inactiveCatalogVehicles)} />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">{t("vehicle.byType")}</h4>
            {vehicleTypeItems.length === 0 ? (
              <p className="text-sm text-slate-500">{t("empty")}</p>
            ) : (
              <HorizontalBars items={vehicleTypeItems} labelKey="label" valueKey="count" />
            )}
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">{t("vehicle.byStatus")}</h4>
            {vehicleStatusItems.length === 0 ? (
              <p className="text-sm text-slate-500">{t("empty")}</p>
            ) : (
              <HorizontalBars items={vehicleStatusItems} labelKey="label" valueKey="count" />
            )}
          </div>
        </div>
      </Section>

      <Section title={t("sections.hotelCode.title")} description={t("sections.hotelCode.description")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label={t("hotelCode.totalHotels")} value={String(hotelCodeSummary.totalHotels)} />
          <StatCard label={t("hotelCode.activeHotels")} value={String(hotelCodeSummary.activeHotels)} />
          <StatCard label={t("hotelCode.totalCodes")} value={String(hotelCodeSummary.totalHotelCodes)} />
          <StatCard label={t("hotelCode.activeCodes")} value={String(hotelCodeSummary.activeHotelCodes)} />
          <StatCard
            label={t("hotelCode.bookingsViaCodes")}
            value={String(hotelCodeSummary.bookingsViaHotelCodes)}
          />
          <StatCard
            label={t("hotelCode.totalDiscount")}
            value={formatEur(hotelCodeSummary.totalHotelDiscountAmount)}
          />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">{t("hotelCode.topHotels")}</h4>
            {hotelCodeSummary.topHotelsByBookings.length === 0 ? (
              <p className="text-sm text-slate-500">{t("empty")}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">{t("table.hotel")}</th>
                      <th className="px-3 py-2.5 font-semibold">{t("table.bookings")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotelCodeSummary.topHotelsByBookings.map((row) => (
                      <tr key={row.hotelPartnerId} className="border-t border-slate-100">
                        <td className="px-3 py-2.5 font-medium text-slate-800">{row.hotelName}</td>
                        <td className="px-3 py-2.5 text-slate-700">{row.bookingCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-800">{t("hotelCode.topCodes")}</h4>
            {hotelCodeSummary.topHotelCodesByBookings.length === 0 ? (
              <p className="text-sm text-slate-500">{t("empty")}</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">{t("table.code")}</th>
                      <th className="px-3 py-2.5 font-semibold">{t("table.hotel")}</th>
                      <th className="px-3 py-2.5 font-semibold">{t("table.bookings")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotelCodeSummary.topHotelCodesByBookings.map((row) => (
                      <tr key={row.hotelCodeId} className="border-t border-slate-100">
                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-slate-800">{row.code}</td>
                        <td className="px-3 py-2.5 text-slate-700">{row.hotelName}</td>
                        <td className="px-3 py-2.5 text-slate-700">{row.bookingCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section title={t("sections.payments.title")} description={t("sections.payments.description")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label={t("payments.totalDue")}
            value={formatEur(hotelPaymentSummary.totalSettlementAmountDue)}
          />
          <StatCard label={t("payments.totalPaid")} value={formatEur(hotelPaymentSummary.totalAmountPaid)} />
          <StatCard
            label={t("payments.outstanding")}
            value={formatEur(hotelPaymentSummary.totalOutstanding)}
          />
          <StatCard label={t("payments.dueCount")} value={String(hotelPaymentSummary.dueCount)} />
          <StatCard label={t("payments.paidCount")} value={String(hotelPaymentSummary.paidCount)} />
          <StatCard
            label={t("payments.partialCount")}
            value={String(hotelPaymentSummary.partiallyPaidCount)}
          />
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2.5 font-semibold">{t("table.hotel")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.period")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.bookings")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.amountDue")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.amountPaid")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.outstanding")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.status")}</th>
              </tr>
            </thead>
            <tbody>
              {hotelPaymentSummary.monthlySettlements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    {t("payments.emptySettlements")}
                  </td>
                </tr>
              ) : (
                hotelPaymentSummary.monthlySettlements.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-3 py-2.5 font-medium text-slate-800">{row.hotelName}</td>
                    <td className="px-3 py-2.5 text-slate-700">
                      {t("periodLabel", { month: row.month, year: row.year })}
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{row.bookingCountSnapshot}</td>
                    <td className="px-3 py-2.5 text-slate-700">{formatEur(row.settlementAmountDue)}</td>
                    <td className="px-3 py-2.5 text-slate-700">{formatEur(row.amountPaid)}</td>
                    <td className="px-3 py-2.5 text-slate-700">{formatEur(row.outstanding)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                          statusBadgeClass(row.status),
                        ].join(" ")}
                      >
                        {t(`settlementStatus.${row.status}` as "settlementStatus.DUE")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t("sections.recent.title")} description={t("sections.recent.description")}>
        <div className="overflow-x-auto rounded-xl border border-slate-200/80">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2.5 font-semibold">{t("table.customer")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.vehicle")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.date")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.status")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.amount")}</th>
                <th className="px-3 py-2.5 font-semibold">{t("table.hotelCode")}</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    {t("recent.empty")}
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-t border-slate-100">
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-800">{booking.customerFullName}</div>
                      <div className="text-[11px] text-slate-500">{booking.bookingReference}</div>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{booking.vehicleName}</td>
                    <td className="px-3 py-2.5 text-slate-700">{formatDate(booking.createdAt)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
                          statusBadgeClass(booking.status),
                        ].join(" ")}
                      >
                        {t(`bookingStatus.${booking.status}` as "bookingStatus.CONFIRMED")}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{formatEur(booking.subtotal)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-600">
                      {booking.hotelCode ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
