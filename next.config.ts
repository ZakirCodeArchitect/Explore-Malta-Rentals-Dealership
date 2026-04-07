import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/explore%20malta%20rentals%20logo%20favicon.png",
      },
    ];
  },
  /* Maps server-only .env key to client so UI can read the number */
  env: {
    NEXT_PUBLIC_WHATSAPP_NUMBER:
      process.env.whatsapp_number ??
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
      "",
  },
  images: {
    /* Default in Next 16 is [75]; `quality={80}` in components must be listed here */
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
