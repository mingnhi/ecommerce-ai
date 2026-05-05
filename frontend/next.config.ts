import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  allowedDevOrigins: ['localhost'],
  devIndicators: false,
  productionBrowserSourceMaps: false,
  serverExternalPackages: ["playwright"],
  turbopack: {},
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "localhost", port: "44389" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
