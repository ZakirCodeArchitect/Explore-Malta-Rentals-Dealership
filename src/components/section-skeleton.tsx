export function SectionSkeleton() {
  return (
    <div className="py-16" aria-hidden>
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-8 w-64 animate-pulse rounded-md bg-slate-200/70" />
        <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200/60" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-2xl bg-slate-100/80"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
