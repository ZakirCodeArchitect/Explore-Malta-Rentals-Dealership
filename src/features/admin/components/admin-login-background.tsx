import type { ReactNode } from "react";

export function AdminLoginBackground({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#eef2f7]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#dbeafe]/70 blur-3xl" />
        <div className="absolute -right-20 top-32 h-80 w-80 rounded-full bg-[#c4dff0]/80 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-[120%] -translate-x-1/4 rounded-[100%] bg-white/50" />
        <svg
          className="absolute bottom-0 left-0 w-full text-white/40"
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0,128L48,122.7C96,117,192,107,288,117.3C384,128,480,160,576,165.3C672,171,768,149,864,138.7C960,128,1056,128,1152,133.3C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-4">
        {children}
      </div>
    </div>
  );
}
