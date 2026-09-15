import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Next.js image optimisation: auto WebP/AVIF conversion, lazy loading,
  // size hints — dramatically reduces image payload on mobile & desktop.
  images: {
    formats: ["image/webp"],
    deviceSizes: [375, 430, 768, 1080, 1280, 1920],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 86400, // 1 day minimum CDN cache for optimised images
  },
  async headers() {
    return [
      // ── Permissions Policy for Camera & Audio ─────────────────────────────
      {
        source: "/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*, fullscreen=*",
          },
        ],
      },
      // ── Public Static Media — 1 Year Immutable Edge & Browser Cache ────────
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/audio/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/wasm/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
