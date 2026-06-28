import { Container } from "@/components/ui/container";

export default function SiteLoading() {
  return (
    <main className="flex flex-1 flex-col bg-white">
      <Container className="pb-16 pt-28 sm:pt-32">
        <div
          className="h-10 max-w-md animate-pulse rounded-md bg-slate-200/70"
          aria-hidden
        />
        <div
          className="mt-4 h-20 max-w-2xl animate-pulse rounded-md bg-slate-200/60"
          aria-hidden
        />
        <div
          className="mt-8 h-72 animate-pulse rounded-2xl bg-slate-100/80"
          aria-hidden
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="h-48 animate-pulse rounded-xl bg-slate-200/75" />
              <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-slate-200/75" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-slate-200/65" />
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
