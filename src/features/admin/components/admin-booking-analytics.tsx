import { getTranslations } from "next-intl/server";

import type { AdminBookingMonthStat } from "@/lib/admin/getAdminDashboardOverview";

type AdminBookingAnalyticsProps = Readonly<{
  bookingMonths: AdminBookingMonthStat[];
  bookingsThisMonth: number;
  bookingsLastMonth: number;
  confirmedThisMonth: number;
  activeVehicles: number;
  inactiveVehicles: number;
  totalVehicles: number;
}>;

function MiniTrendBars({ values }: Readonly<{ values: number[] }>) {
  if (values.every((value) => value === 0)) {
    return (
      <div className="flex h-12 items-end justify-end gap-1" aria-hidden>
        {values.map((_, index) => (
          <span key={index} className="h-2 w-2 rounded-full bg-slate-200" />
        ))}
      </div>
    );
  }

  const max = Math.max(...values, 1);

  return (
    <div className="flex h-12 items-end justify-end gap-1" aria-hidden>
      {values.map((value, index) => (
        <span
          key={`${index}-${value}`}
          className="w-2 rounded-full bg-[#3a7ca5]/80"
          style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function trendLabel(current: number, previous: number): { text: string; positive: boolean } {
  const delta = current - previous;
  if (delta === 0) {
    return { text: "0", positive: true };
  }
  return {
    text: `${delta > 0 ? "+" : ""}${delta}`,
    positive: delta >= 0,
  };
}

export async function AdminBookingAnalytics({
  bookingMonths,
  bookingsThisMonth,
  bookingsLastMonth,
  confirmedThisMonth,
  activeVehicles,
  inactiveVehicles,
  totalVehicles,
}: AdminBookingAnalyticsProps) {
  const t = await getTranslations("Admin");
  const monthTotals = bookingMonths.map((entry) => entry.total);
  const monthConfirmed = bookingMonths.map((entry) => entry.confirmed);
  const monthTrend = trendLabel(bookingsThisMonth, bookingsLastMonth);

  const cards = [
    {
      title: t("analytics.bookingsThisMonth"),
      value: String(bookingsThisMonth),
      trend: t("analytics.fromLastMonth", { change: monthTrend.text }),
      positive: monthTrend.positive,
      sparkline: monthTotals,
    },
    {
      title: t("analytics.confirmedThisMonth"),
      value: String(confirmedThisMonth),
      trend: (() => {
        const confirmedLastMonth = monthConfirmed.at(-2) ?? 0;
        const confirmedTrend = trendLabel(confirmedThisMonth, confirmedLastMonth);
        return t("analytics.fromLastMonth", { change: confirmedTrend.text });
      })(),
      positive: confirmedThisMonth >= (monthConfirmed.at(-2) ?? 0),
      sparkline: monthConfirmed,
    },
    {
      title: t("analytics.activeFleet"),
      value: `${activeVehicles}/${totalVehicles}`,
      trend:
        inactiveVehicles > 0
          ? t("analytics.inactiveFleet", { count: inactiveVehicles })
          : t("analytics.allFleetActive"),
      positive: inactiveVehicles === 0,
      sparkline: null,
    },
  ];

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <article
          key={card.title}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">{card.title}</p>
              <p className="mt-1 text-2xl font-bold tracking-[-0.03em] text-slate-950">{card.value}</p>
              <p
                className={[
                  "mt-1 text-xs font-medium",
                  card.positive ? "text-[#3a7ca5]" : "text-rose-600",
                ].join(" ")}
              >
                {card.trend}
              </p>
            </div>
            {card.sparkline ? <MiniTrendBars values={card.sparkline} /> : null}
          </div>
        </article>
      ))}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-950">{t("analytics.monthlyBookings")}</h3>
        <p className="mt-0.5 text-xs text-slate-500">{t("analytics.monthlyBookingsHint")}</p>

        <ul className="mt-4 space-y-3">
          {bookingMonths.map((entry) => {
            const max = Math.max(...monthTotals, 1);
            const width = entry.total === 0 ? "0%" : `${Math.max(8, (entry.total / max) * 100)}%`;

            return (
              <li key={entry.monthKey}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{entry.monthLabel}</span>
                  <span className="font-semibold text-slate-900">{entry.total}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#3a7ca5] to-[#5b9cc7]"
                    style={{ width }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {t("analytics.monthBreakdown", {
                    confirmed: entry.confirmed,
                    cancelled: entry.cancelled,
                  })}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
