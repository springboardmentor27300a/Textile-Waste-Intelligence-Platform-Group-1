import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment (Milestone 4)
  output: "standalone",
  // Allow images from the backend uploads directory
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost",  port: "8000", pathname: "/uploads/**" },
      { protocol: "https", hostname: "**",                        pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
