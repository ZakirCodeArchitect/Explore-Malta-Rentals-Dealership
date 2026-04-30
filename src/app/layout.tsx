import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
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

const STRIP_FDPROCESSEDID_SCRIPT = `
(() => {
  const ATTRIBUTE_NAME = "fdprocessedid";

  const stripInjectedAttribute = (target) => {
    if (!(target instanceof Element)) {
      return;
    }
    if (target.hasAttribute(ATTRIBUTE_NAME)) {
      target.removeAttribute(ATTRIBUTE_NAME);
    }
  };

  document.querySelectorAll("[" + ATTRIBUTE_NAME + "]").forEach((element) => {
    element.removeAttribute(ATTRIBUTE_NAME);
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        stripInjectedAttribute(mutation.target);
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    attributes: true,
    attributeFilter: [ATTRIBUTE_NAME],
  });
})();
`;

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
        <Script
          id="strip-fdprocessedid"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: STRIP_FDPROCESSEDID_SCRIPT }}
        />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
