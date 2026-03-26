import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/features/home/components/section-header";
import { aboutBusiness } from "@/features/home/data/home-sections";

const iconStroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function BadgeTouristIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[var(--brand-orange)]"
      {...iconStroke}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function BadgeSafetyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-[var(--brand-blue)]"
      {...iconStroke}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AboutHighlightIcon({ id }: { id: string }) {
  const common = "h-5 w-5 text-[var(--brand-blue)]";
  switch (id) {
    case "who-they-are":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} {...iconStroke}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "what-we-offer":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} {...iconStroke}>
          <circle cx="18.5" cy="17.5" r="3.5" />
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="15" cy="5" r="1" />
          <path d="M12 17.5V14l-3-3 4-3 2 3h2" />
        </svg>
      );
    case "why-tourists":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} {...iconStroke}>
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "malta-exploration":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} {...iconStroke}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} {...iconStroke}>
          <path d="M12 2v20M2 12h20" />
        </svg>
      );
  }
}

function HighlightCard({
  highlightId,
  label,
  value,
}: {
  highlightId: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.1)]">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold tracking-[0.08em] text-[var(--brand-orange)]">
          {label}
        </span>
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-soft)]"
        >
          <AboutHighlightIcon id={highlightId} />
        </span>
      </div>
      <p className="mt-3 text-base font-semibold tracking-[-0.02em] text-slate-950">
        {value}
      </p>
    </div>
  );
}

export function AboutBusinessSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-business-title"
      className="scroll-mt-28 border-t border-slate-200/70 bg-[#f8fafc] pt-10 pb-14 sm:pt-12 sm:pb-16"
    >
      <Container>
        <SectionHeader
          titleId="about-business-title"
          title={aboutBusiness.title}
          tone="light"
          description={
            <span className="block">
              Explore Malta the easy way: choose the right ride, get clear
              guidance, and start your adventure.
            </span>
          }
          align="center"
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_-35px_rgba(2,6,23,0.1)]">
              {aboutBusiness.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className={
                    idx === 0
                      ? "text-base leading-8 text-slate-800"
                      : "mt-4 text-base leading-8 text-slate-700"
                  }
                >
                  {p}
                </p>
              ))}
              <div className="mt-7 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
                  <BadgeTouristIcon />
                  Tourist-friendly
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
                  <BadgeSafetyIcon />
                  Safety-first
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {aboutBusiness.highlights.map((h) => (
                <HighlightCard
                  key={h.id}
                  highlightId={h.id}
                  label={h.label}
                  value={h.value}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

