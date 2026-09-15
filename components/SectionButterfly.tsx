"use client";
import { useState, useId } from "react";

interface SectionButterflyProps {
  id?: string;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  size?: number;
  theme?: "pink" | "gold" | "rose" | "violet";
  tilt?: number;
  zIndex?: number;
  floatDelay?: number;
}

export default function SectionButterfly({
  id,
  top,
  left,
  right,
  bottom,
  size = 44,
  theme = "pink",
  tilt = 0,
  zIndex = 12,
  floatDelay = 0,
}: SectionButterflyProps) {
  const [isExcited, setIsExcited] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const handleInteraction = () => {
    if (isExcited) return;
    setIsExcited(true);

    // Spawn 5 mini sparkles around butterfly
    const newSparkles = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 40,
      color: theme === "gold" ? "#ffd700" : "#ff69b4",
    }));
    setSparkles(newSparkles);

    setTimeout(() => {
      setSparkles([]);
    }, 900);

    setTimeout(() => {
      setIsExcited(false);
    }, 1200);
  };

  // Wing Colors based on theme
  let gradTop = "#ff2a7a";
  let gradMid = "#ff529a";
  let gradBottom = "#ffa0cd";
  let shadowGlow = "rgba(255, 42, 122, 0.65)";

  if (theme === "gold") {
    gradTop = "#d4af37";
    gradMid = "#fcd34d";
    gradBottom = "#fef08a";
    shadowGlow = "rgba(212, 175, 55, 0.75)";
  } else if (theme === "rose") {
    gradTop = "#e11d48";
    gradMid = "#f43f5e";
    gradBottom = "#fda4af";
    shadowGlow = "rgba(225, 29, 72, 0.65)";
  } else if (theme === "violet") {
    gradTop = "#a855f7";
    gradMid = "#c084fc";
    gradBottom = "#e9d5ff";
    shadowGlow = "rgba(168, 85, 247, 0.65)";
  }

  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const gradId = id ? `secWingGrad_${id}` : `secWingGrad_${theme}_${safeId}`;

  return (
    <div
      className="section-butterfly-anchor"
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        zIndex,
        pointerEvents: "auto",
        cursor: "pointer",
      }}
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
      title="Tap me to make me flutter! 🦋✨"
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `rotate(${tilt}deg)`,
          animationName: isExcited ? "butterflyPlayfulLoop" : "butterflyGentleHover",
          animationDuration: isExcited ? "1.1s" : "3.4s",
          animationTimingFunction: isExcited ? "cubic-bezier(0.25, 1, 0.5, 1)" : "ease-in-out",
          animationIterationCount: isExcited ? "1" : "infinite",
          animationDelay: `${floatDelay}s`,
          filter: `drop-shadow(0 0 12px ${shadowGlow})`,
          transition: "filter 0.3s ease",
        }}
      >
        {/* SVG Butterfly with 3D Flapping Wings */}
        <svg
          suppressHydrationWarning
          width={size}
          height={size}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            overflow: "visible",
            transformOrigin: "center center",
          }}
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%" suppressHydrationWarning>
              <stop offset="0%" stopColor={gradTop} />
              <stop offset="50%" stopColor={gradMid} />
              <stop offset="100%" stopColor={gradBottom} />
            </linearGradient>
          </defs>

          {/* Left Wings Group */}
          <g
            style={{
              transformOrigin: "24px 24px",
              animation: `${isExcited ? "leftWingFastFlap 0.16s infinite ease-in-out" : "leftWingFlap 0.32s infinite ease-in-out"}`,
            }}
          >
            {/* Top Forewing */}
            <path
              d="M24 22 C22 12, 8 4, 3 12 C-2 19, 5 30, 24 26 Z"
              fill={`url(#${gradId})`}
              opacity="0.96"
            />
            {/* Bottom Hindwing */}
            <path
              d="M24 26 C19 33, 9 39, 5 35 C1 30, 8 24, 24 24 Z"
              fill={gradBottom}
              opacity="0.88"
            />
            {/* Left wing jewel accent */}
            <circle cx="12" cy="18" r="1.5" fill="#ffffff" opacity="0.8" />
          </g>

          {/* Right Wings Group */}
          <g
            style={{
              transformOrigin: "24px 24px",
              animation: `${isExcited ? "rightWingFastFlap 0.16s infinite ease-in-out" : "rightWingFlap 0.32s infinite ease-in-out"}`,
            }}
          >
            {/* Top Forewing */}
            <path
              d="M24 22 C26 12, 40 4, 45 12 C50 19, 43 30, 24 26 Z"
              fill={`url(#${gradId})`}
              opacity="0.96"
            />
            {/* Bottom Hindwing */}
            <path
              d="M24 26 C29 33, 39 39, 43 35 C47 30, 40 24, 24 24 Z"
              fill={gradBottom}
              opacity="0.88"
            />
            {/* Right wing jewel accent */}
            <circle cx="36" cy="18" r="1.5" fill="#ffffff" opacity="0.8" />
          </g>

          {/* Golden Body */}
          <ellipse cx="24" cy="24" rx="2.2" ry="9" fill="#ffd700" />
          {/* Antennae */}
          <path d="M23 16 Q20 8 14 6" stroke="#ffd700" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="13.5" cy="5.5" r="1.5" fill="#ffffff" />
          <path d="M25 16 Q28 8 34 6" stroke="#ffd700" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="34.5" cy="5.5" r="1.5" fill="#ffffff" />
        </svg>

        {/* Ambient Soft Glow Circle */}
        <span
          style={{
            position: "absolute",
            width: `${size * 0.9}px`,
            height: `${size * 0.9}px`,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${shadowGlow} 0%, rgba(0,0,0,0) 70%)`,
            pointerEvents: "none",
            zIndex: -1,
            animation: "butterflyAuraPulse 2.4s infinite ease-in-out",
          }}
        />

        {/* Interactive Sparkles on click/hover */}
        {sparkles.map((sp) => (
          <span
            key={sp.id}
            style={{
              position: "absolute",
              left: `calc(50% + ${sp.x}px)`,
              top: `calc(50% + ${sp.y}px)`,
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: sp.color,
              boxShadow: `0 0 8px ${sp.color}`,
              pointerEvents: "none",
              animation: "butterflySparkleBurst 0.8s ease-out forwards",
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes leftWingFlap {
          0%, 100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(0.2);
          }
        }

        @keyframes rightWingFlap {
          0%, 100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(0.2);
          }
        }

        @keyframes leftWingFastFlap {
          0%, 100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(0.08);
          }
        }

        @keyframes rightWingFastFlap {
          0%, 100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(0.08);
          }
        }

        @keyframes butterflyGentleHover {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          33% {
            transform: translate3d(3px, -7px, 0) rotate(3deg);
          }
          66% {
            transform: translate3d(-3px, -4px, 0) rotate(-3deg);
          }
        }

        @keyframes butterflyPlayfulLoop {
          0% {
            transform: scale(1) rotate(0deg);
          }
          30% {
            transform: scale(1.25) translate3d(-10px, -20px, 0) rotate(-180deg);
          }
          65% {
            transform: scale(1.15) translate3d(10px, -26px, 0) rotate(-320deg);
          }
          100% {
            transform: scale(1) translate3d(0, 0, 0) rotate(-360deg);
          }
        }

        @keyframes butterflyAuraPulse {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.85;
          }
        }

        @media (max-width: 640px) {
          .section-butterfly-anchor {
            transform: scale(0.68);
            pointer-events: none !important; /* Never intercepts finger taps on mobile controls */
          }
        }
      `}</style>
    </div>
  );
}
