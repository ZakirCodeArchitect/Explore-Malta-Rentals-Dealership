import type { PropsWithChildren, ReactNode } from "react";

type StepShellProps = PropsWithChildren<{
  title: string;
  description: string;
  footer?: ReactNode;
}>;

export function StepShell({ title, description, footer, children }: StepShellProps) {
  return (
    <section className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.55)] sm:p-6">
      <header>
        <h2 className="text-xl font-bold tracking-[-0.02em] text-slate-950 sm:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </header>

      <div className="mt-5">{children}</div>

      {footer ? <div className="mt-5">{footer}</div> : null}
    </section>
  );
}
