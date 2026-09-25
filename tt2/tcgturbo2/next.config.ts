import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  allowedDevOrigins: ['127.0.0.1', 'localhost', '192.168.1.166'],
};

export default nextConfig;
