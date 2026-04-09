import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold text-[var(--brand-orange)]">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
        Privacy policy
      </h1>
      <p className="mt-4 text-base leading-relaxed text-slate-600">
        This page is a placeholder. Add how you collect, store, and process personal data (including
        newsletter sign-ups) to meet GDPR and your hosting region&apos;s requirements.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex text-sm font-semibold text-slate-900 underline decoration-[var(--brand-orange)]/45 underline-offset-4 transition-colors hover:text-[var(--brand-orange-strong)] hover:underline hover:decoration-[var(--brand-orange)]"
      >
        Back to home
      </Link>
    </main>
  );
}
