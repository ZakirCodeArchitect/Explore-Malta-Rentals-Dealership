const formShellClass =
  "relative z-10 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] sm:p-5 lg:p-6";

const fieldSkeletonClass = "h-12 animate-pulse rounded-lg bg-slate-100";

type BookingSearchFormSkeletonProps = Readonly<{
  tone?: "default" | "hero";
}>;

export function BookingSearchFormSkeleton({
  tone = "default",
}: BookingSearchFormSkeletonProps) {
  const quickFilterClass =
    tone === "hero"
      ? "inline-flex max-w-full flex-wrap items-center gap-2 rounded-md border-[3px] border-[var(--brand-orange-strong)] bg-white/95 p-2"
      : "inline-flex max-w-full flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white p-2";

  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className={quickFilterClass}>
        <div className="h-12 w-24 animate-pulse rounded-md bg-slate-100" />
        <div className="h-12 w-24 animate-pulse rounded-md bg-slate-100" />
        <div className="h-12 w-28 animate-pulse rounded-md bg-slate-100" />
      </div>

      <div className="relative isolate">
        <div className={formShellClass}>
          <div className="flex flex-col gap-5">
            <div className="h-24 animate-pulse rounded-lg bg-slate-50" />
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-20 animate-pulse rounded-xl bg-slate-50" />
              <div className="h-20 animate-pulse rounded-xl bg-slate-50" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={fieldSkeletonClass} />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={fieldSkeletonClass} />
              <div className={fieldSkeletonClass} />
            </div>
            <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-64 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="h-12 w-36 animate-pulse rounded-lg bg-[var(--brand-orange)]/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
