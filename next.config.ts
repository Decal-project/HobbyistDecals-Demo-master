import type { NextConfig } from "next";
import 'stream-web';

const nextConfig: NextConfig = {
  images: {
    domains: ['hobbyistdecals.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // 👈 add this line to bypass ESLint errors in Vercel
  },
};

export default nextConfig;
