import { Link } from "@/i18n/navigation";

type ButtonLinkProps = Readonly<{
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}>;

function joinClasses(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const variantClasses: Record<NonNullable<ButtonLinkProps["variant"]>, string> = {
  primary:
    "bg-[var(--brand-orange)] text-slate-950 shadow-[0_18px_45px_-20px_rgba(255,122,26,0.85)] hover:bg-[var(--brand-orange-strong)]",
  secondary:
    "border border-white/18 bg-white/8 text-white hover:border-white/28 hover:bg-white/12",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 text-sm font-semibold tracking-[-0.01em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:min-h-13 sm:px-7 sm:text-base",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
