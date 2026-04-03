import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SiteNavbar } from "@/components/site-navbar";
import { Footer } from "@/features/home/components/footer";
import { WhatsAppFloatingButton } from "@/features/home/components/whatsapp-floating-button";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const FAVICON_PATH = "/explore%20malta%20rentals%20logo%20favicon.png";

export const metadata: Metadata = {
  title: "Explore Malta Rentals | Motorcycle, ATV & Bicycle Hire",
  description:
    "Based in Pietà, Explore Malta Rentals offers motorcycle, ATV, and bicycle rentals plus guided tours, explore Malta safely and comfortably at your own pace.",
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
    <html lang="en" className={`${plusJakartaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] font-sans text-[var(--foreground)]">
        <SiteNavbar />
        {children}
        <Footer />
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
