import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/features/home/components/section-header";
import { servicesHighlights } from "@/features/home/data/home-sections";

function ServiceIcon({ id }: { id: string }) {
  const common = "h-6 w-6";
  switch (id) {
    case "easy-pickup":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common}>
          <path
            d="M20 7h-6V3H10v4H4v10h16V7Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 17v-6m6 6v-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      );
    case "helmets":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common}>
          <path
            d="M4 13a8 8 0 0 1 16 0v4H4v-4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 17v-2a5 5 0 0 1 10 0v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      );
    case "flexible":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common}>
          <path
            d="M7 3v6H1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 10a9 9 0 1 0 2-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 7v6l4 2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "support":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common}>
          <path
            d="M4 4h16v12H5l-1 4V4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 9h8M8 12h5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      );
    case "hotel-delivery":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common}>
          <path
            d="M3 7h18v10H3V7Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 17v3m10-3v3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M7 7l2-3h6l2 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common}>
          <path
            d="M12 2v20M2 12h20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function HighlightedServicesSection() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-white py-16"
    >
      <Container>
        <SectionHeader
          title="Services & benefits"
          tone="light"
          description="Everything you need for a smooth ride across Malta."
          align="center"
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {servicesHighlights.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.1)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-h-10 min-w-10 rounded-2xl bg-white/70 p-2.5">
                  <span className="inline-flex text-[var(--brand-blue)]">
                    <ServiceIcon id={s.id} />
                  </span>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5 text-[var(--brand-orange)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2Z" />
                  </svg>
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold tracking-[-0.02em] text-slate-950">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

