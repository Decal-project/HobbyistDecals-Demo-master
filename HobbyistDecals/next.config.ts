import type { NextConfig } from "next";
import 'stream-web';

const nextConfig: NextConfig = {
  images: {
    domains: ['hobbyistdecals.com'], // ✅ use actual image host
  },
};

export default nextConfig;
