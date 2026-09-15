import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // Explicitly allow camera and microphone access on all routes
            key: "Permissions-Policy",
            value: "camera=*, microphone=*, fullscreen=*",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
