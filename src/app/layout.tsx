import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { StripFdprocessedId } from "@/components/strip-fdprocessedid";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const FAVICON_PATH = "/explore%20malta%20rentals%20logo%20favicon.png";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  icons: {
    icon: {
      url: FAVICON_PATH,
      type: "image/png",
      sizes: "any",
    },
    apple: { url: FAVICON_PATH, type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body
        className="flex min-h-dvh flex-col overflow-x-clip bg-[var(--background)] pb-[env(safe-area-inset-bottom)] font-sans text-[var(--foreground)]"
        suppressHydrationWarning
      >
        <StripFdprocessedId />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
