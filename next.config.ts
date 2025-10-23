import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'fwosquhbfdyzylmyyfpr.supabase.co'],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://clienteresio.vercel.app',
  },
};

export default nextConfig;
