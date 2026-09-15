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
      // ── 1. HTML pages — always fresh (no CDN cache) ───────────────────────
      {
        source: "/((?!_next/static|_next/image|images|audio|models|videos|wasm).*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*, fullscreen=*",
          },
          {
            // Only HTML pages are no-store so users always see the latest content
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
        ],
      },
      // ── 2. Next.js JS/CSS chunks — immutable (content-hashed filenames) ───
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*, fullscreen=*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ── 3. Public static assets — 7-day CDN cache ────────────────────────
      {
        source: "/(images|audio|models|videos|wasm)/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      // ── 4. Optimised images served by Next.js ────────────────────────────
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=3600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
