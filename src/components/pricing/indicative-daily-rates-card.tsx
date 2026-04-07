const MOTORCYCLE_SCOOTER_RATES = [
  { label: "1 day", price: "€25", suffix: "/ day" },
  { label: "2 days", price: "€18", suffix: "/ day" },
  { label: "3 days – 3 weeks", price: "€15", suffix: "/ day" },
  { label: "3 weeks or more", price: "€10", suffix: "/ day" },
] as const;

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type IndicativeDailyRatesCardProps = Readonly<{
  className?: string;
}>;

export function IndicativeDailyRatesCard({
  className,
}: IndicativeDailyRatesCardProps) {
  return (
    <div
      className={joinClasses(
        "overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-950/[0.04]",
        className,
      )}
    >
      <div className="flex flex-col gap-1 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-[#f0f7fc] px-6 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-7">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Indicative daily rates
          </h3>
          <p className="mt-0.5 text-base font-semibold tracking-tight text-slate-800">
            Motorcycles / scooters
          </p>
        </div>
        <p className="text-xs text-slate-500 sm:text-right">
          Per calendar day, before extras
        </p>
      </div>
      <dl className="grid gap-px bg-slate-200/80 sm:grid-cols-2">
        {MOTORCYCLE_SCOOTER_RATES.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-4 bg-white px-6 py-3.5 sm:px-7 sm:py-4"
          >
            <dt className="text-sm font-medium text-slate-800">{row.label}</dt>
            <dd className="shrink-0 text-right text-sm tabular-nums">
              <span className="font-semibold text-[var(--brand-blue)]">
                {row.price}
              </span>{" "}
              <span className="text-xs font-normal text-slate-500">
                {row.suffix}
              </span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 text-xs leading-relaxed text-slate-500 sm:px-7">
        Final price depends on vehicle, season, and availability — message us
        for a quote.
      </p>
    </div>
  );
}
