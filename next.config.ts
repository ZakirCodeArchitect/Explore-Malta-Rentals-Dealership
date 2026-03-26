import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Maps server-only .env key to client so UI can read the number */
  env: {
    NEXT_PUBLIC_WHATSAPP_NUMBER:
      process.env.whatsapp_number ??
      process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
      "",
  },
};

export default nextConfig;
