import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

export type FooterNavItem = Readonly<{
  href: string;
  label: string;
}>;

type FooterColumnProps = Readonly<{
  id: string;
  title: string;
  links: readonly FooterNavItem[];
}>;

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function FooterColumn({ id, title, links }: FooterColumnProps) {
  return (
    <nav className="min-w-0" aria-labelledby={id}>
      <p id={id} className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
        {title}
      </p>
      <ul className="mt-4 list-none space-y-2.5 p-0">
        {links.map(({ href, label }) => (
          <li key={href + label}>
            <Link
              href={href}
              className={joinClasses(
                "text-sm text-white/80 transition-colors duration-200",
                "hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1628] rounded-sm",
              )}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type FooterTrustItemProps = Readonly<{
  icon: ReactNode;
  title: string;
  description: string;
}>;

export function FooterTrustItem({ icon, title, description }: FooterTrustItemProps) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 backdrop-blur-sm transition-colors duration-200 hover:border-white/15 hover:bg-white/[0.06]">
      <div className="mt-0.5 shrink-0 text-[var(--brand-orange)]" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs leading-relaxed text-white/60">{description}</p>
      </div>
    </div>
  );
}
