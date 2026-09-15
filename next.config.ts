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
          {
            // Prevent Vercel and browsers from serving stale cached HTML
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
