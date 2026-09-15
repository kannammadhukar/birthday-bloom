"use client";
import React, { useState, useEffect, useRef } from "react";
import { smoothAlign } from "@/lib/autoAlign";
import PhotoZoomModal from "@/components/PhotoZoomModal";

interface PhotoStarData {
  id: string;
  src: string;
  label: string;
  leftPct: number;
  topPct: number;
  size: number; // in pixels
  duration: number; // in seconds
  delay: number; // in seconds
  pulseScale: number;
  desktopOnly?: boolean;
}

// Curated 12 of Divija's finest photos scattered like glowing photo-stars
// around the hero perimeter, strictly avoiding the text & cake safe-zones
const PHOTO_STARS: PhotoStarData[] = [
  {
    id: "star_25",
    src: "/images/photo_25.jpg",
    label: "Royal Grace 👑",
    leftPct: 10,
    topPct: 5,
    size: 74,
    duration: 3.6,
    delay: -0.4,
    pulseScale: 1.08,
  },
  {
    id: "star_12",
    src: "/images/photo_12.jpg",
    label: "Traditional Diva 🌺",
    leftPct: 29,
    topPct: 4,
    size: 58,
    duration: 4.2,
    delay: -1.8,
    pulseScale: 1.07,
  },
  {
    id: "star_18",
    src: "/images/photo_18.jpg",
    label: "Pediatric Rounds 🩺",
    leftPct: 48,
    topPct: 8,
    size: 66,
    duration: 3.9,
    delay: -2.7,
    pulseScale: 1.09,
    desktopOnly: true,
  },
  {
    id: "star_24",
    src: "/images/photo_24.jpg",
    label: "Fairy Lights 💖",
    leftPct: 6.5,
    topPct: 38,
    size: 56,
    duration: 4.5,
    delay: -1.2,
    pulseScale: 1.06,
  },
  {
    id: "star_37",
    src: "/images/photo_37.jpg",
    label: "Golden Hour 🌅",
    leftPct: 7,
    topPct: 70,
    size: 60,
    duration: 4.0,
    delay: -3.1,
    pulseScale: 1.08,
    desktopOnly: true,
  },
  {
    id: "star_40",
    src: "/images/photo_40.jpg",
    label: "Garden Elegance 🌸",
    leftPct: 14,
    topPct: 90,
    size: 54,
    duration: 3.7,
    delay: -0.8,
    pulseScale: 1.07,
    desktopOnly: true,
  },
  {
    id: "star_27",
    src: "/images/photo_27.jpg",
    label: "Birthday Sparkler 🎂",
    leftPct: 33,
    topPct: 88,
    size: 64,
    duration: 4.3,
    delay: -2.3,
    pulseScale: 1.09,
    desktopOnly: true,
  },
  {
    id: "star_01",
    src: "/images/photo_01.jpg",
    label: "Sister Bond 👭",
    leftPct: 49,
    topPct: 83,
    size: 58,
    duration: 3.8,
    delay: -1.5,
    pulseScale: 1.08,
    desktopOnly: true,
  },
  {
    id: "star_32",
    src: "/images/photo_32.jpg",
    label: "Bestie Reunion 💛",
    leftPct: 70,
    topPct: 5,
    size: 62,
    duration: 4.4,
    delay: -3.5,
    pulseScale: 1.07,
    desktopOnly: true,
  },
  {
    id: "star_38",
    src: "/images/photo_38.jpg",
    label: "Lady Whistledown 🌹",
    leftPct: 89,
    topPct: 7,
    size: 56,
    duration: 4.1,
    delay: -0.9,
    pulseScale: 1.08,
  },
  {
    id: "star_19",
    src: "/images/photo_19.jpg",
    label: "Nature Trails 🌲",
    leftPct: 92.5,
    topPct: 45,
    size: 60,
    duration: 3.5,
    delay: -2.9,
    pulseScale: 1.06,
  },
  {
    id: "star_29",
    src: "/images/photo_29.jpg",
    label: "Canteen Vibes 🪔",
    leftPct: 82,
    topPct: 90,
    size: 58,
    duration: 4.6,
    delay: -1.7,
    pulseScale: 1.08,
    desktopOnly: true,
  },
];

export default function HeroPhotoStars() {
  const [activeStarId, setActiveStarId] = useState<string | null>(null);
  const [zoomStar, setZoomStar] = useState<PhotoStarData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close active star if tapped/clicked outside
  useEffect(() => {
    const handleGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".hero-photo-star-item")) {
        setActiveStarId(null);
      }
    };

    window.addEventListener("pointerdown", handleGlobalPointerDown);
    return () => window.removeEventListener("pointerdown", handleGlobalPointerDown);
  }, []);

  const handleStarClick = (e: React.MouseEvent, star: PhotoStarData) => {
    e.stopPropagation();
    smoothAlign(containerRef.current || ".hero-section");
    if (activeStarId === star.id) {
      setZoomStar(star);
    } else {
      setActiveStarId(star.id);
    }
  };

  return (
    <div
      ref={containerRef}
      className="hero-photo-stars-container"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        overflow: "hidden",
        contain: "layout style",
      }}
      aria-hidden="false"
    >
      {PHOTO_STARS.map((star) => {
        const isActive = activeStarId === star.id;

        return (
          <div
            key={star.id}
            className={`hero-photo-star-item ${isActive ? "active" : ""} ${star.desktopOnly ? "hero-star-desktop-only" : ""}`}
            onClick={(e) => handleStarClick(e, star)}
            style={{
              position: "absolute",
              left: `${star.leftPct}%`,
              top: `${star.topPct}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: "50%",
              transform: isActive
                ? "translate(-50%, -50%) scale(2.25)"
                : "translate(-50%, -50%) scale(1)",
              opacity: isActive ? 1 : 0.55,
              filter: isActive
                ? "blur(0px) brightness(1.12) contrast(1.05)"
                : "blur(0.5px) brightness(0.92)",
              border: isActive
                ? "2px solid #f6d896"
                : "1.5px solid rgba(212, 175, 55, 0.45)",
              // Matches exact Memory Reel luxury gold glow
              boxShadow: isActive
                ? "0 15px 40px rgba(0, 0, 0, 0.95), 0 0 35px rgba(212, 175, 55, 0.95), 0 0 15px rgba(246, 216, 150, 0.85)"
                : "0 0 12px rgba(212, 175, 55, 0.35), 0 0 4px rgba(246, 216, 150, 0.25)",
              zIndex: isActive ? 40 : 2,
              cursor: "pointer",
              pointerEvents: "auto",
              touchAction: "manipulation",
              willChange: "transform, opacity",
              transition:
                "transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, filter 0.3s ease, box-shadow 0.35s ease, border-color 0.25s ease",
              animation: isActive
                ? "none"
                : `heroStarTwinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
              ["--pulse-scale" as any]: star.pulseScale,
            }}
            title={star.label}
          >
            {/* Celestial Star halo circular frame */}
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                overflow: "hidden",
                background: "rgba(20, 6, 14, 0.9)",
                position: "relative",
              }}
            >
              <img
                src={star.src}
                alt={star.label}
                loading="lazy"
                decoding="async"
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center center",
                  display: "block",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'%3E%3Crect fill=\'%23220c18\' width=\'80\' height=\'80\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' fill=\'%23f6d896\' font-size=\'20\' text-anchor=\'middle\' dy=\'.35em\'%3E✨%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Sparkle pin point when active */}
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-4px",
                  fontSize: "0.85rem",
                  filter: "drop-shadow(0 0 8px #f6d896)",
                  pointerEvents: "none",
                  animation: "sparkleSpin 3s linear infinite",
                }}
              >
                ✨
              </span>
            )}

            {/* Micro Gold Floating Label under active photo-star */}
            {isActive && (
              <div
                style={{
                  position: "absolute",
                  top: "106%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(18, 5, 12, 0.95)",
                  border: "1px solid rgba(212, 175, 55, 0.75)",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                  color: "#fce8b2",
                  fontSize: "0.48rem",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  boxShadow:
                    "0 6px 18px rgba(0,0,0,0.85), 0 0 12px rgba(212, 175, 55, 0.4)",
                  pointerEvents: "none",
                  zIndex: 45,
                }}
              >
                {star.label}
              </div>
            )}
          </div>
        );
      })}

      <style>{`
        .hero-photo-star-item {
          --base-scale: 1;
        }

        @keyframes heroStarTwinkle {
          0%, 100% {
            transform: translate(-50%, -50%) scale(var(--base-scale, 1));
            opacity: 0.52;
            filter: blur(0.55px) brightness(0.9);
          }
          50% {
            transform: translate(-50%, -50%) scale(calc(var(--base-scale, 1) * var(--pulse-scale, 1.08)));
            opacity: 0.75;
            filter: blur(0.2px) brightness(1.08);
          }
        }

        @keyframes sparkleSpin {
          0% { transform: rotate(0deg) scale(0.95); }
          50% { transform: rotate(180deg) scale(1.15); }
          100% { transform: rotate(360deg) scale(0.95); }
        }

        @media (max-width: 900px) {
          .hero-photo-star-item {
            transform-origin: center center;
          }
          .hero-photo-star-item.active {
            transform: translate(-50%, -50%) scale(1.85) !important;
          }
        }

        @media (max-width: 768px) {
          .hero-star-desktop-only {
            display: none !important;
          }
          .hero-photo-star-item {
            --base-scale: 0.65;
            pointer-events: none !important;
          }
          .hero-photo-star-item.active {
            transform: translate(-50%, -50%) scale(1.6) !important;
          }
        }
      `}</style>

      {/* ── High-Definition Photo Zoom Modal for Hero Star ── */}
      <PhotoZoomModal
        isOpen={Boolean(zoomStar)}
        onClose={() => setZoomStar(null)}
        src={zoomStar?.src || ""}
        title={zoomStar?.label || "Celestial Star Photo"}
        subtitle="✦ Hero Starlight Memory · Touch & Drag to Pan ✦"
        caption={zoomStar?.label ? `✦ ${zoomStar.label} · Divija's 23rd Birthday Starlight Memory ✦` : ""}
      />
    </div>
  );
}
