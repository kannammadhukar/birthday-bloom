"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { smoothAlign } from "@/lib/autoAlign";
import milestonesData, { MilestoneEntry } from "@/content/timeline";
import PhotoZoomModal from "@/components/PhotoZoomModal";

const STAGES: MilestoneEntry[] = milestonesData;

const TOTAL_PAGES = 7; // Page 0 = Cover, Pages 1..6 = Chapters 1..6

// ─── 3D Puffy Pink Heart Pin (Matching User Reference Exactly!) ───
function PuffyHeartPin({
  size = 28,
  rotate = 12,
  style = {},
  onClick,
}: {
  size?: number;
  rotate?: number;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const [isSquished, setIsSquished] = useState(false);

  return (
    <div
      className="puffy-heart-pin"
      onClick={(e) => {
        setIsSquished(true);
        setTimeout(() => setIsSquished(false), 240);
        onClick?.(e);
      }}
      style={{
        position: "absolute",
        width: size,
        height: size,
        transform: isSquished
          ? `scale(1.28, 0.78) rotate(${rotate}deg)`
          : `scale(1) rotate(${rotate}deg)`,
        filter: isSquished
          ? "drop-shadow(0 6px 12px rgba(255, 30, 90, 0.75)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))"
          : "drop-shadow(0 4px 7px rgba(235, 30, 90, 0.48)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.35))",
        zIndex: 10,
        cursor: "pointer",
        pointerEvents: "auto",
        transition: "transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.18s ease",
        ...style,
      }}
      title="Puffy 3D Heart (Click to squish!)"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="puffyHeartGrad" cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor="#ff8ea8" />
            <stop offset="22%" stopColor="#ff4d79" />
            <stop offset="70%" stopColor="#e81358" />
            <stop offset="100%" stopColor="#ab0039" />
          </radialGradient>
          <linearGradient id="heartSpecularGrad" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.88" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* 3D Puffy Heart Base */}
        <path
          d="M 50 88 C 22 68 6 52 6 32 C 6 16 18 6 34 6 C 42 6 47 11 50 16 C 53 11 58 6 66 6 C 82 6 94 16 94 32 C 94 52 78 68 50 88 Z"
          fill="url(#puffyHeartGrad)"
        />
        {/* Soft bottom rim shadow */}
        <path
          d="M 50 88 C 22 68 6 52 6 32 C 12 36 28 44 50 68 C 72 44 88 36 94 32 C 94 52 78 68 50 88 Z"
          fill="rgba(80, 0, 25, 0.22)"
        />
        {/* Main curved gloss highlight on left lobe */}
        <ellipse
          cx="30"
          cy="22"
          rx="13"
          ry="7"
          transform="rotate(-30 30 22)"
          fill="url(#heartSpecularGrad)"
        />
        {/* Secondary mini gloss on right lobe */}
        <ellipse
          cx="68"
          cy="20"
          rx="8"
          ry="4.5"
          transform="rotate(22 68 20)"
          fill="rgba(255, 255, 255, 0.55)"
        />
        {/* Pinpoint specular shine */}
        <circle cx="27" cy="18" r="2.2" fill="#ffffff" opacity="0.95" />
      </svg>
    </div>
  );
}

// ─── Vintage Pressed Flower Accent (Delicate Botanical Keepsakes) ───
function PressedFlower({
  type = "daisy",
  size = 28,
  rotate = 0,
  style = {},
}: {
  type?: "daisy" | "rose" | "cherry" | "lavender";
  size?: number;
  rotate?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="pressed-flower-accent"
      style={{
        position: "absolute",
        width: size,
        height: size,
        transform: `rotate(${rotate}deg)`,
        filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.3))",
        pointerEvents: "none",
        zIndex: 14,
        ...style,
      }}
    >
      {type === "cherry" && (
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <g fill="#fda4af" stroke="#f43f5e" strokeWidth="1.5">
            <ellipse cx="50" cy="28" rx="14" ry="20" />
            <ellipse cx="71" cy="43" rx="14" ry="20" transform="rotate(72 71 43)" />
            <ellipse cx="63" cy="68" rx="14" ry="20" transform="rotate(144 63 68)" />
            <ellipse cx="37" cy="68" rx="14" ry="20" transform="rotate(216 37 68)" />
            <ellipse cx="29" cy="43" rx="14" ry="20" transform="rotate(288 29 43)" />
          </g>
          <circle cx="50" cy="50" r="10" fill="#fef08a" stroke="#d97706" strokeWidth="1" />
          <circle cx="50" cy="50" r="4" fill="#fbbf24" />
        </svg>
      )}
      {type === "daisy" && (
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <g fill="#fffdfa" stroke="#e2e8f0" strokeWidth="1.2">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <ellipse key={deg} cx="50" cy="24" rx="8" ry="18" transform={`rotate(${deg} 50 50)`} />
            ))}
          </g>
          <circle cx="50" cy="50" r="12" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="6" fill="#fef08a" />
        </svg>
      )}
      {type === "rose" && (
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path d="M 50 82 Q 44 64 50 50" stroke="#15803d" strokeWidth="3" fill="none" />
          <path d="M 46 68 Q 32 64 36 56 Q 44 60 48 66" fill="#22c55e" />
          <circle cx="50" cy="42" r="22" fill="#f43f5e" stroke="#be123c" strokeWidth="1.5" />
          <path d="M 38 42 C 38 32, 62 32, 62 42 C 62 52, 38 52, 38 42 Z" fill="#e11d48" />
          <circle cx="50" cy="42" r="10" fill="#fb7185" />
        </svg>
      )}
      {type === "lavender" && (
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path d="M 50 88 L 50 20" stroke="#15803d" strokeWidth="2.5" />
          {[30, 42, 54, 66].map((y, i) => (
            <g key={i}>
              <ellipse cx="44" cy={y} rx="6" ry="10" fill="#a855f7" stroke="#7e22ce" strokeWidth="0.8" transform={`rotate(-35 44 ${y})`} />
              <ellipse cx="56" cy={y} rx="6" ry="10" fill="#c084fc" stroke="#7e22ce" strokeWidth="0.8" transform={`rotate(35 56 ${y})`} />
            </g>
          ))}
          <circle cx="50" cy="18" r="5" fill="#e9d5ff" />
        </svg>
      )}
    </div>
  );
}

// ─── Floating Flower Petals Drifting Softly Across the Stage ───
function FloatingFloralPetals() {
  const petals = [
    { left: "7%", delay: "0s", dur: "14s", icon: "🌸", size: "18px" },
    { left: "21%", delay: "3.5s", dur: "16s", icon: "🌼", size: "16px" },
    { left: "37%", delay: "1.2s", dur: "15s", icon: "🌸", size: "20px" },
    { left: "53%", delay: "5s", dur: "17s", icon: "✨", size: "14px" },
    { left: "69%", delay: "2.8s", dur: "13s", icon: "🌸", size: "18px" },
    { left: "81%", delay: "4.2s", dur: "16s", icon: "🌺", size: "17px" },
    { left: "93%", delay: "1.8s", dur: "15s", icon: "🌸", size: "16px" },
    { left: "15%", delay: "7s", dur: "18s", icon: "🍃", size: "14px" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 3 }}>
      {petals.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: -24,
            left: p.left,
            fontSize: p.size,
            animation: `petalDrift ${p.dur} linear infinite`,
            animationDelay: p.delay,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
            opacity: 0.85,
          }}
        >
          {p.icon}
        </div>
      ))}
    </div>
  );
}

// ─── 3D Translucent Fluttering Butterfly (Realistic Wing Flap & Organic Flight) ───
function FlutteringButterfly({
  idPrefix,
  color = "#86efac",
  glowColor = "rgba(134, 239, 172, 0.45)",
  size = 38,
  flapSpeed = "0.26s",
  flightAnimation,
  isPerching = false,
  style = {},
}: {
  idPrefix: string;
  color?: string;
  glowColor?: string;
  size?: number;
  flapSpeed?: string;
  flightAnimation: string;
  isPerching?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="butterfly-flight-node"
      data-butterfly-node="true"
      style={{
        position: "absolute",
        width: size,
        height: size,
        pointerEvents: "none",
        zIndex: 25,
        animation: flightAnimation,
        ...style,
      }}
    >
      {/* Soft Translucent Ground Elevation Shadow */}
      <div
        style={{
          position: "absolute",
          bottom: -10,
          left: "12%",
          width: "76%",
          height: 6,
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.45) 0%, transparent 72%)",
          filter: "blur(2.5px)",
          pointerEvents: "none",
        }}
      />
      <div
        className="butterfly-bob-wrapper"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          perspective: 600,
          transformStyle: "preserve-3d",
          animation: isPerching
            ? "butterflyPerchBob 18s ease-in-out infinite"
            : `butterflyBob ${flapSpeed} infinite alternate ease-in-out`,
        }}
      >
        {/* Left Wing with 3D Flap */}
        <div
          className="butterfly-wing-left"
          style={{
            position: "absolute",
            right: "48%",
            top: "8%",
            width: "52%",
            height: "82%",
            transformOrigin: "right center",
            animation: isPerching
              ? "butterflyPerchWingLeft 18s ease-in-out infinite"
              : `butterflyWingFlapLeft ${flapSpeed} ease-in-out infinite alternate`,
          }}
        >
          <svg viewBox="0 0 50 65" width="100%" height="100%" style={{ overflow: "visible", filter: `drop-shadow(0 2px 6px ${glowColor})` }}>
            <defs>
              <linearGradient id={`wingL_${idPrefix}`} x1="100%" y1="50%" x2="0%" y2="50%">
                <stop offset="0%" stopColor={color} stopOpacity="0.88" />
                <stop offset="45%" stopColor={color} stopOpacity="0.65" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            {/* Forewing */}
            <path
              d="M 48 32 C 45 18 35 4 18 1 C 4 -1 0 10 2 24 C 4 34 18 38 48 33 Z"
              fill={`url(#wingL_${idPrefix})`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.8"
            />
            {/* Hindwing */}
            <path
              d="M 48 34 C 40 40 28 58 16 62 C 6 64 2 54 8 44 C 14 36 28 35 48 34 Z"
              fill={`url(#wingL_${idPrefix})`}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="0.7"
            />
            {/* Veins */}
            <path d="M 48 32 Q 26 20 12 12" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" fill="none" />
            <path d="M 48 33 Q 30 28 15 28" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" fill="none" />
            <path d="M 48 35 Q 28 46 16 54" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" fill="none" />
          </svg>
        </div>

        {/* Right Wing with 3D Flap */}
        <div
          className="butterfly-wing-right"
          style={{
            position: "absolute",
            left: "48%",
            top: "8%",
            width: "52%",
            height: "82%",
            transformOrigin: "left center",
            animation: isPerching
              ? "butterflyPerchWingRight 18s ease-in-out infinite"
              : `butterflyWingFlapRight ${flapSpeed} ease-in-out infinite alternate`,
          }}
        >
          <svg viewBox="0 0 50 65" width="100%" height="100%" style={{ overflow: "visible", filter: `drop-shadow(0 2px 6px ${glowColor})` }}>
            <defs>
              <linearGradient id={`wingR_${idPrefix}`} x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor={color} stopOpacity="0.88" />
                <stop offset="45%" stopColor={color} stopOpacity="0.65" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.45" />
              </linearGradient>
            </defs>
            {/* Forewing */}
            <path
              d="M 2 32 C 5 18 15 4 32 1 C 46 -1 50 10 48 24 C 46 34 32 38 2 33 Z"
              fill={`url(#wingR_${idPrefix})`}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.8"
            />
            {/* Hindwing */}
            <path
              d="M 2 34 C 10 40 22 58 34 62 C 44 64 48 54 42 44 C 36 36 22 35 2 34 Z"
              fill={`url(#wingR_${idPrefix})`}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="0.7"
            />
            {/* Veins */}
            <path d="M 2 32 Q 24 20 38 12" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" fill="none" />
            <path d="M 2 33 Q 20 28 35 28" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" fill="none" />
            <path d="M 2 35 Q 22 46 34 54" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" fill="none" />
          </svg>
        </div>

        {/* Slender Body & Antennae */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "14%",
            transform: "translateX(-50%)",
            width: 4,
            height: "65%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          {/* Antennae */}
          <div style={{ width: 14, height: 10, marginTop: -4 }}>
            <svg viewBox="0 0 20 15" width="100%" height="100%">
              <path d="M 10 14 Q 7 5 3 2" stroke="rgba(40,25,30,0.75)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
              <circle cx="3" cy="2" r="1" fill="rgba(40,25,30,0.8)" />
              <path d="M 10 14 Q 13 5 17 2" stroke="rgba(40,25,30,0.75)" strokeWidth="0.9" fill="none" strokeLinecap="round" />
              <circle cx="17" cy="2" r="1" fill="rgba(40,25,30,0.8)" />
            </svg>
          </div>
          {/* Thorax & Abdomen */}
          <div
            style={{
              width: 3.5,
              height: "55%",
              borderRadius: 2,
              background: "linear-gradient(180deg, #3d2731 0%, #1f1218 100%)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Authentic Floating Polaroids Orbiting the Central Sketchbook (Matching User Reference!)
const FLOATING_BG_PHOTOS = [
  {
    src: "/images/photo_25.jpg",
    label: "Cutie 🥹",
    alt: "Divija Cutie",
    style: { top: "1%", left: "1%", width: "128px", height: "162px", rotate: "-7deg", delay: "0s" },
    heartCorner: "right" as const,
    heartRotate: 14,
    washiTape: { corner: "left" as const, color: "linear-gradient(90deg, rgba(245,158,11,0.7), rgba(254,240,138,0.85), rgba(245,158,11,0.7))", rotate: -15 },
    flower: { type: "cherry" as const, corner: "left" as const, rotate: -20 },
  },
  {
    src: "/images/photo_12.jpg",
    label: "My Love 💖",
    alt: "Divija My Love",
    style: { top: "33%", left: "2%", width: "126px", height: "160px", rotate: "6deg", delay: "1.2s" },
    heartCorner: "left" as const,
    heartRotate: -12,
    flower: { type: "rose" as const, corner: "right" as const, rotate: 25 },
  },
  {
    src: "/images/photo_19.jpg",
    label: "Dream Girl 💫",
    alt: "Divija Dream Girl",
    style: { bottom: "2%", left: "4%", width: "128px", height: "162px", rotate: "-5deg", delay: "2.4s" },
    heartCorner: "right" as const,
    heartRotate: 16,
    washiTape: { corner: "left" as const, color: "linear-gradient(90deg, rgba(236,72,153,0.7), rgba(251,207,232,0.85), rgba(236,72,153,0.7))", rotate: 12 },
    flower: { type: "lavender" as const, corner: "left" as const, rotate: -15 },
  },
  {
    src: "/images/photo_24.jpg",
    label: "Sunshine 🍊",
    alt: "Divija Sunshine",
    style: { bottom: "-12px", left: "25%", width: "122px", height: "154px", rotate: "4deg", delay: "0.8s" },
    heartCorner: "right" as const,
    heartRotate: 12,
    flower: { type: "daisy" as const, corner: "left" as const, rotate: 18 },
  },
  {
    src: "/images/photo_30.jpg",
    label: "Pure Joy ✨",
    alt: "Divija Pure Joy",
    style: { bottom: "-12px", right: "25%", width: "122px", height: "154px", rotate: "-6deg", delay: "1.8s" },
    heartCorner: "left" as const,
    heartRotate: -14,
    flower: { type: "cherry" as const, corner: "right" as const, rotate: -18 },
  },
  {
    src: "/images/photo_37.jpg",
    label: "Queen 👑",
    alt: "Divija Queen",
    style: { bottom: "2%", right: "4%", width: "128px", height: "162px", rotate: "6deg", delay: "2.8s" },
    heartCorner: "left" as const,
    heartRotate: -10,
    washiTape: { corner: "right" as const, color: "linear-gradient(90deg, rgba(212,175,55,0.75), rgba(253,230,138,0.9), rgba(212,175,55,0.75))", rotate: 15 },
    flower: { type: "rose" as const, corner: "right" as const, rotate: 15 },
  },
  {
    src: "/images/photo_40.jpg",
    label: "Baddie 😎",
    alt: "Divija Baddie",
    style: { top: "33%", right: "2%", width: "126px", height: "160px", rotate: "-6deg", delay: "1.5s" },
    heartCorner: "right" as const,
    heartRotate: 15,
    flower: { type: "daisy" as const, corner: "left" as const, rotate: -22 },
  },
  {
    src: "/images/photo_18.jpg",
    label: "Medico Divija 🩺",
    alt: "Medico Divija",
    style: { top: "1%", right: "1%", width: "128px", height: "162px", rotate: "5deg", delay: "3.2s" },
    heartCorner: "left" as const,
    heartRotate: -12,
    washiTape: { corner: "right" as const, color: "linear-gradient(90deg, rgba(59,130,246,0.7), rgba(191,219,254,0.85), rgba(59,130,246,0.7))", rotate: -14 },
    flower: { type: "lavender" as const, corner: "left" as const, rotate: 20 },
  },
];

// Nostalgic Keepsake Polaroids: From Childhood Cartoons to Iconic Heroines (Filling Bottom Empty Spaces!)
interface NostalgicScreenMemory {
  id: string;
  era: string;
  age: string;
  title: string;
  characterBadge: string;
  quote: string;
  icon: string;
  colorScheme: {
    bg: string;
    border: string;
    tape: string;
    accent: string;
  };
  style: {
    bottom: string;
    left?: string;
    right?: string;
    width: string;
    height: string;
    rotate: string;
    delay: string;
  };
  flower: "daisy" | "rose" | "cherry" | "lavender";
}

const NOSTALGIC_CARTOONS_TO_HEROINES: NostalgicScreenMemory[] = [];

// Rich scrapbook ephemera matching the user's reference images for each chapter
const CHAPTER_EPHEMERA = [
  {
    theme: "Childhood Smiles & Diwali Diyas",
    dateTag: "2003 · Telangana",
    leftSticker: "🦋",
    rightSticker: "🌕",
    petSticker: "🐱",
    cuteNote: "“That dimpled smile since day one — lighting up the whole house!” 💛",
    tapeColor: "rgba(239, 68, 68, 0.75)",
  },
  {
    theme: "SR Prime School Days",
    dateTag: "2017 · Karimnagar",
    leftSticker: "🎒",
    rightSticker: "🌕",
    petSticker: "🌸",
    cuteNote: "“Backbench giggles, lunchbox trades, and the medical dream beginning...” ✨",
    tapeColor: "rgba(59, 130, 246, 0.75)",
  },
  {
    theme: "Intermediate Botany & Zoology",
    dateTag: "2019 · Junior College",
    leftSticker: "🔬",
    rightSticker: "🌕",
    petSticker: "🍃",
    cuteNote: "“Record diagrams, pastel highlighters, and endless biology revisions.” 🧬",
    tapeColor: "rgba(16, 185, 129, 0.75)",
  },
  {
    theme: "The Long Term Grind",
    dateTag: "2020 · Day & Night",
    leftSticker: "☕",
    rightSticker: "🌕",
    petSticker: "🌙",
    cuteNote: "“Midnight chai, Telugu melodies on repeat, and unshakeable resilience.” 🎧",
    tapeColor: "rgba(245, 158, 11, 0.75)",
  },
  {
    theme: "Entering KMC Warangal",
    dateTag: "2021 · White Coat Ceremony",
    leftSticker: "🏛️",
    rightSticker: "🌕",
    petSticker: "🌺",
    cuteNote: "“Walking through KMC gates in that white apron — a dream turning real!” 🩺",
    tapeColor: "rgba(168, 85, 247, 0.75)",
  },
  {
    theme: "4th Year MBBS · Medico Divija",
    dateTag: "TODAY · Kakatiya Medical College",
    leftSticker: "🩺",
    rightSticker: "🌕",
    petSticker: "👑",
    cuteNote: "“Not just conquering medicine, but staying the sweetest soul on earth.” 💛",
    tapeColor: "rgba(244, 63, 94, 0.75)",
  },
];

export default function JourneySection() {
  const [currentPage, setCurrentPage] = useState<number>(0); // 0 = Cover, 1..6 = Chapters 1..6
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ src: string; caption: string } | null>(null);
  const [selectedNostalgia, setSelectedNostalgia] = useState<NostalgicScreenMemory | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [mobileSubPage, setMobileSubPage] = useState<"left" | "right" | "both">("left");

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 860);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keyboard accessibility: ESC key closes enlarged photo or nostalgia spotlight
  useEffect(() => {
    if (!selectedPhoto && !selectedNostalgia) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPhoto(null);
        setSelectedNostalgia(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, selectedNostalgia]);

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const stardustCanvasRef = useRef<HTMLCanvasElement>(null);

  /* ── Golden Fairytale Stardust Trail (Emitted behind flying butterflies) ── */
  useEffect(() => {
    const canvas = stardustCanvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: { x: number; y: number; size: number; alpha: number; vx: number; vy: number }[] = [];
    let frame = 0;

    const resize = () => {
      if (stage && canvas) {
        canvas.width = stage.clientWidth;
        canvas.height = stage.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn stardust every 3 animation frames from active butterfly nodes
      if (frame % 3 === 0) {
        const butterflyNodes = stage.querySelectorAll<HTMLElement>('[data-butterfly-node="true"]');
        const stageRect = stage.getBoundingClientRect();
        butterflyNodes.forEach((node) => {
          const rect = node.getBoundingClientRect();
          if (rect.width > 0) {
            const bx = rect.left - stageRect.left + rect.width / 2;
            const by = rect.top - stageRect.top + rect.height / 2;
            particles.push({
              x: bx + (Math.random() - 0.5) * 8,
              y: by + (Math.random() - 0.5) * 8,
              size: Math.random() * 2.2 + 1.2,
              alpha: 0.85,
              vx: (Math.random() - 0.5) * 0.5,
              vy: Math.random() * 0.4 + 0.1,
            });
          }
        });
      }

      // Update and draw existing stardust particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.022;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = "#fde047";
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (particles.length > 90) {
        particles = particles.slice(-90);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ── Realistic Paper Turning Sound (Web Audio API) ───────────── */
  const playPageTurnSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") ctx.resume();

      const bufferSize = Math.floor(ctx.sampleRate * 0.28);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.38));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1100, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.28);
      filter.Q.value = 1.9;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      setTimeout(() => { ctx.close().catch(() => {}); }, 320);
    } catch {}
  }, [soundEnabled]);

  const [targetPage, setTargetPage] = useState<number>(0);

  /* ── Direction-Aware 3D Page Turn Transition ─────────────────── */
  const flipToPage = (newPage: number) => {
    if (newPage === currentPage || isFlipping || newPage < 0 || newPage >= TOTAL_PAGES) return;
    smoothAlign("#journey-section");
    const dir = newPage > currentPage ? "next" : "prev";
    setFlipDirection(dir);
    setTargetPage(newPage);
    setIsFlipping(true);
    playPageTurnSound();

    // Settle 3D physical page flip smoothly at 750ms
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsFlipping(false);
    }, 750);
  };

  const handleNext = () => {
    if (isMobile && currentPage > 0 && mobileSubPage !== "both") {
      if (mobileSubPage === "left") {
        setMobileSubPage("right");
        playPageTurnSound();
        return;
      }
      if (mobileSubPage === "right") {
        if (currentPage < TOTAL_PAGES - 1) {
          flipToPage(currentPage + 1);
          setMobileSubPage("left");
        }
        return;
      }
    }
    if (currentPage < TOTAL_PAGES - 1) {
      flipToPage(currentPage + 1);
      setMobileSubPage("left");
    }
  };

  const handlePrev = () => {
    if (isMobile && currentPage > 0 && mobileSubPage !== "both") {
      if (mobileSubPage === "right") {
        setMobileSubPage("left");
        playPageTurnSound();
        return;
      }
      if (mobileSubPage === "left") {
        if (currentPage > 0) {
          flipToPage(currentPage - 1);
          setMobileSubPage(currentPage === 1 ? "left" : "right");
        }
        return;
      }
    }
    if (currentPage > 0) {
      flipToPage(currentPage - 1);
      setMobileSubPage(currentPage === 1 ? "left" : "right");
    }
  };

  /* ── Auto-Turn All Pages Loop (Repeats through all chapters sequentially) ── */
  useEffect(() => {
    if (!isAutoPlaying || isFlipping || selectedPhoto || selectedNostalgia) return;

    const timer = setTimeout(() => {
      if (currentPage < TOTAL_PAGES - 1) {
        flipToPage(currentPage + 1);
      } else {
        // Continuous repeat: loop back to Cover to replay the whole story
        flipToPage(0);
      }
    }, 4200);

    return () => clearTimeout(timer);
  }, [isAutoPlaying, currentPage, isFlipping, selectedPhoto, selectedNostalgia]);

  /* ── Keyboard Controls ───────────────────────────────────────── */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (selectedPhoto) {
        if (e.key === "Escape") setSelectedPhoto(null);
        return;
      }
      if (selectedNostalgia) {
        if (e.key === "Escape") setSelectedNostalgia(null);
        return;
      }
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const curChapter = currentPage > 0 ? STAGES[currentPage - 1] : null;
  const curEphemera = currentPage > 0 ? CHAPTER_EPHEMERA[currentPage - 1] : null;

  /* ── Wire Spiral Spine Helper ─────────────────────────────────── */
  const renderWireSpiral = () => (
    <div
      className="sketchbook-center-spiral"
      style={{
        background: "linear-gradient(90deg, #18050e 0%, #290a1a 50%, #18050e 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        alignItems: "center",
        padding: "8px 0",
        zIndex: 30,
        boxShadow: "inset 0 0 8px rgba(0,0,0,0.7)",
        height: "100%",
        width: "100%",
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ position: "relative", width: "100%", height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", left: 2, width: 7, height: 9, borderRadius: 3, background: "#060104", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9)" }} />
          <div style={{ position: "absolute", right: 2, width: 7, height: 9, borderRadius: 3, background: "#060104", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.9)" }} />
          <div style={{
            width: "clamp(24px, 3.6vw, 32px)",
            height: 10,
            border: "1.8px solid #d4af37",
            borderRadius: "12px / 5px",
            background: "linear-gradient(180deg, #ffffff 0%, #d4af37 45%, #785207 100%)",
            transform: "rotate(-5deg)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.6)",
            zIndex: 2,
          }} />
        </div>
      ))}
    </div>
  );

  /* ── Left Page Component (Chapter Scrapbook & Main Photo) ─────── */
  const renderLeftPage = (chapterIndex: number) => {
    if (chapterIndex < 0 || chapterIndex >= STAGES.length) return null;
    const chapter = STAGES[chapterIndex];
    const ephemera = CHAPTER_EPHEMERA[chapterIndex];

    return (
      <div
        className="sketchbook-page-left"
        onClick={!isMobile ? handlePrev : undefined}
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #fffdf8 0%, #f6efe2 70%, #ebdcc5 100%)",
          padding: "clamp(16px, 2.2vw, 24px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          boxSizing: "border-box",
          cursor: !isMobile ? "pointer" : "default",
        }}
      >
        {/* Top Washi Tape & Date Tag */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
          <div style={{
            background: ephemera.tapeColor,
            padding: "3px 12px",
            borderRadius: 3,
            transform: "rotate(-2deg)",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          }}>
            <span style={{ fontFamily: "'Caveat', cursive", fontSize: "0.95rem", fontWeight: 700, color: "#ffffff" }}>
              ✦ {ephemera.dateTag} ✦
            </span>
          </div>
          <div style={{ fontSize: "1.3rem" }}>{ephemera.leftSticker}</div>
        </div>

        {/* Main Tilted Photo of Divija */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPhoto({ src: chapter.images[0].src, caption: chapter.images[0].caption });
          }}
          title="Click to enlarge photo 🔍"
          style={{
            background: "#ffffff",
            padding: "7px 7px 15px",
            borderRadius: 6,
            boxShadow: "0 12px 28px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.06)",
            transform: "rotate(-2deg)",
            position: "relative",
            cursor: "zoom-in",
            margin: isMobile ? "6px 0" : "auto 0",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease",
            width: "100%",
            boxSizing: "border-box",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "rotate(-2deg) scale(1.04)";
            e.currentTarget.style.boxShadow = "0 18px 36px rgba(0,0,0,0.22), 0 0 20px rgba(212,175,55,0.35)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "rotate(-2deg) scale(1)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.06)";
          }}
        >
          {/* Glossy 3D Puffy Pink Heart Pin */}
          <PuffyHeartPin size={26} rotate={14} style={{ top: -9, right: -7 }} />

          {/* Washi Tape Strip on Top */}
          <div style={{
            position: "absolute",
            top: -8,
            left: "24%",
            width: "44%",
            height: 16,
            background: "linear-gradient(90deg, #d4af37 0%, #fde68a 50%, #d4af37 100%)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.16)",
            borderRadius: 2,
            transform: "rotate(-2deg)",
            zIndex: 10,
          }} />

          <div
            className="main-chapter-photo-frame"
            style={{
              position: "relative",
              width: "100%",
              height: "clamp(160px, 24vh, 210px)",
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              background: "#f7f3ea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={chapter.images[0].src}
              alt={chapter.images[0].alt}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />

            {/* Subtle Floating Zoom Pill */}
            <div
              style={{
                position: "absolute",
                bottom: 6,
                right: 6,
                background: "rgba(20, 5, 12, 0.82)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(212, 175, 55, 0.65)",
                borderRadius: "12px",
                padding: "2px 8px",
                color: "#fce8b2",
                fontSize: "0.68rem",
                fontWeight: 700,
                letterSpacing: "0.04em",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.45)",
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              <span>🔍</span>
              <span>Tap to Enlarge</span>
            </div>
          </div>

          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(0.88rem, 1.6vw, 1.02rem)",
            fontWeight: 700,
            color: "#37111b",
            margin: "6px 0 0",
            textAlign: "center",
            lineHeight: 1.15,
          }}>
            {chapter.images[0].caption}
          </p>
        </div>

        {/* Handwritten Epigraph Quote & Cute Pet Sticker */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          paddingTop: "0.4rem",
          borderTop: "1px dashed rgba(139,101,8,0.22)",
        }}>
          <div style={{ maxWidth: "84%" }}>
            <p style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(0.76rem, 1.35vw, 0.86rem)",
              color: "#6b1428",
              lineHeight: 1.38,
              margin: 0,
            }}>
              {chapter.epigraph}
            </p>
          </div>
          <div style={{
            fontSize: "1.5rem",
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
            transform: "rotate(6deg)",
          }}>
            {ephemera.petSticker}
          </div>
        </div>

        {/* Clean Page Footer Marker */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "0.25rem",
          marginTop: "0.2rem",
        }}>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "0.68rem",
            color: "#8b6508",
            letterSpacing: "0.06em",
            fontWeight: 700,
          }}>
            ‹ Flip to turn back
          </span>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.7rem", color: "#8b6508", fontWeight: 700 }}>
            Page {chapterIndex * 2 + 1}
          </span>
        </div>
      </div>
    );
  };

  /* ── Right Page Component (Spacious Story Prose & Photo Accent) ─── */
  const renderRightPage = (chapterIndex: number) => {
    if (chapterIndex < 0 || chapterIndex >= STAGES.length) return null;
    const chapter = STAGES[chapterIndex];
    const ephemera = CHAPTER_EPHEMERA[chapterIndex];

    return (
      <div
        className="sketchbook-page-right"
        onClick={!isMobile ? handleNext : undefined}
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #fffdf8 0%, #f6efe2 70%, #ebdcc5 100%)",
          padding: "clamp(16px, 2.2vw, 24px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          boxSizing: "border-box",
          cursor: !isMobile ? "pointer" : "default",
        }}
      >
        {/* Chapter Header */}
        <div style={{ position: "relative", zIndex: 5, marginBottom: "0.4rem" }}>
          <div style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "0.74rem",
            color: "#8b6508",
            letterSpacing: "0.18em",
            fontWeight: 800,
            textTransform: "uppercase",
            marginBottom: "0.2rem",
          }}>
            ✦ {chapter.chapter} · {chapter.era} ✦
          </div>
          <h3 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(1.15rem, 2.2vw, 1.45rem)",
            color: "#28071e",
            fontWeight: 800,
            lineHeight: 1.2,
            margin: 0,
          }}>
            {chapter.title}
          </h3>
        </div>

        {/* Spacious Story Prose & Floating Companion Polaroid */}
        <div style={{ position: "relative", margin: isMobile ? "6px 0" : "auto 0" }}>
          {/* Secondary Chapter Photo - Sleek Polaroid Floated to Top-Right */}
          <div
            className="secondary-chapter-photo-frame"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto({ src: chapter.images[1].src, caption: chapter.images[1].caption });
            }}
            title="Click to enlarge photo 🔍"
            style={{
              float: "right",
              width: "clamp(100px, 14vw, 126px)",
              margin: "0 0 8px 14px",
              background: "#ffffff",
              padding: "5px 5px 12px",
              borderRadius: 5,
              boxShadow: "0 10px 22px rgba(0,0,0,0.14), 0 2px 4px rgba(0,0,0,0.06)",
              transform: "rotate(2.5deg)",
              cursor: "zoom-in",
              position: "relative",
              transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotate(2.5deg) scale(1.06)";
              e.currentTarget.style.boxShadow = "0 16px 30px rgba(0,0,0,0.22), 0 0 16px rgba(212,175,55,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "rotate(2.5deg) scale(1)";
              e.currentTarget.style.boxShadow = "0 10px 22px rgba(0,0,0,0.14), 0 2px 4px rgba(0,0,0,0.06)";
            }}
          >
            <PuffyHeartPin size={22} rotate={-12} style={{ top: -7, left: -6 }} />
            <div style={{ position: "absolute", top: -6, right: -6, fontSize: "1.1rem", zIndex: 10 }}>
              🎀
            </div>
            <div style={{ aspectRatio: "4 / 3", maxHeight: "105px", overflow: "hidden", borderRadius: 3, background: "#f5eee4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <img
                src={chapter.images[1].src}
                alt={chapter.images[1].alt}
                style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 3,
                  right: 3,
                  background: "rgba(20, 5, 12, 0.8)",
                  borderRadius: "8px",
                  padding: "1px 5px",
                  color: "#ffd700",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  pointerEvents: "none",
                }}
              >
                <span>🔍</span>
              </div>
            </div>
            <p style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "0.76rem",
              fontWeight: 700,
              color: "#37111b",
              margin: "3px 0 0",
              textAlign: "center",
              lineHeight: 1.1,
            }}>
              {chapter.images[1].caption}
            </p>
          </div>

          {/* Story Prose Paragraphs with Relaxed Leading & Open Spacing */}
          <div style={{
            color: "#28071e",
            fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
            lineHeight: 1.62,
            letterSpacing: "0.01em",
          }}>
            <p style={{ margin: "0 0 0.55rem" }}>
              {chapter.storyParagraphs[0]}
            </p>
            {chapter.storyParagraphs[1] && (
              <p style={{ margin: 0, opacity: 0.95 }}>
                {chapter.storyParagraphs[1]}
              </p>
            )}
          </div>
          <div style={{ clear: "both" }} />
        </div>

        {/* Handwritten Note / Inside Joke Sticker */}
        <div style={{
          background: "#fff9db",
          border: "1px solid #fde68a",
          borderRadius: 6,
          padding: "0.45rem 0.85rem",
          boxShadow: "0 3px 8px rgba(0,0,0,0.06)",
          transform: "rotate(-1deg)",
          position: "relative",
          marginTop: "0.4rem",
        }}>
          <span style={{ position: "absolute", top: -5, left: 8, fontSize: "0.82rem" }}>📌</span>
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "clamp(0.86rem, 1.5vw, 0.98rem)",
            fontWeight: 700,
            color: "#78350f",
            margin: 0,
            lineHeight: 1.3,
          }}>
            {ephemera.cuteNote}
          </p>
        </div>

        {/* Clean, Elegant Bottom Page Marker (Zero Clutter) */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "0.35rem",
          marginTop: "0.3rem",
          borderTop: "1px dashed rgba(139,101,8,0.22)",
        }}>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.7rem", color: "#8b6508", fontWeight: 700 }}>
            Ch {chapterIndex + 1} of 6
          </span>
          <span style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "0.68rem",
            color: "#8b6508",
            letterSpacing: "0.06em",
            fontWeight: 700,
          }}>
            Page {chapterIndex * 2 + 2} ➔
          </span>
        </div>
      </div>
    );
  };

  return (
    <div id="journey-section" className="sketchbook-galaxy-section" style={{
      position: "relative",
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 45%, #240d1c 0%, #140610 55%, #080206 100%)",
      overflow: "hidden",
      padding: "2.5vh 1.5vw 3.5vh",
      fontFamily: "'Outfit', -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>

      {/* ── SECTION COMPACT HEADER & TABS (Fits comfortably on laptop) ── */}
      <div style={{ position: "relative", zIndex: 15, textAlign: "center", maxWidth: 680, margin: "0 auto 1.5vh" }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.25rem 0.9rem",
          borderRadius: 100,
          background: "rgba(212,175,55,0.15)",
          border: "1px solid rgba(212,175,55,0.4)",
          marginBottom: "0.4rem",
          backdropFilter: "blur(6px)",
        }}>
          <span style={{ fontSize: "0.85rem" }}>📷</span>
          <span style={{
            color: "#f5d77f",
            fontSize: "0.72rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontWeight: 700,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Divija&apos;s Memory Scrapbook
          </span>
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(1.8rem, 3.8vw, 2.6rem)",
          color: "#ffffff",
          fontStyle: "italic",
          fontWeight: 700,
          margin: "0 0 0.3rem",
          textShadow: "0 0 25px rgba(212,175,55,0.3)",
          lineHeight: 1.1,
        }}>
          The Living Sketchbook
        </h2>

        {/* Header Controls: Auto-Turn, Sound & Quick Flip Guide */}
        <div style={{ marginTop: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem", flexWrap: "wrap" }}>
          {/* Glowing Auto-Turn Mode Button (Repeats all pages automatically!) */}
          <button
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            style={{
              padding: "0.35rem 0.95rem",
              borderRadius: 100,
              fontSize: "0.76rem",
              fontWeight: 700,
              border: isAutoPlaying ? "1.5px solid #facc15" : "1px solid rgba(212,175,55,0.5)",
              background: isAutoPlaying
                ? "linear-gradient(135deg, #ffd700 0%, #f59e0b 100%)"
                : "rgba(212,175,55,0.16)",
              color: isAutoPlaying ? "#18020b" : "#f5d77f",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              backdropFilter: "blur(6px)",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: isAutoPlaying
                ? "0 0 20px rgba(250, 204, 21, 0.8), 0 2px 10px rgba(0,0,0,0.5)"
                : "0 2px 8px rgba(0,0,0,0.3)",
              transform: isAutoPlaying ? "scale(1.04)" : "scale(1)",
            }}
            title={isAutoPlaying ? "Click to Pause Auto-Flip" : "Click once to automatically turn and loop through all pages"}
          >
            <span style={{ fontSize: "0.9rem" }}>{isAutoPlaying ? "⏸️" : "▶️"}</span>
            <span>{isAutoPlaying ? "Auto-Flipping Pages (Looping)..." : "Auto-Turn All Pages ▶"}</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              padding: "0.3rem 0.85rem",
              borderRadius: 100,
              fontSize: "0.76rem",
              fontWeight: 600,
              border: "1px solid rgba(212,175,55,0.45)",
              background: soundEnabled ? "rgba(212,175,55,0.18)" : "rgba(255,255,255,0.06)",
              color: soundEnabled ? "#f5d77f" : "#a8a29e",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              backdropFilter: "blur(6px)",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
            title="Toggle Page Turning Audio"
          >
            <span>{soundEnabled ? "🔊" : "🔈"}</span>
            <span>{soundEnabled ? "Page Audio: ON" : "Page Audio: MUTED"}</span>
          </button>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.3rem 0.85rem",
            borderRadius: 100,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(212,175,55,0.35)",
            fontSize: "0.74rem",
            color: "#f5d77f",
            backdropFilter: "blur(6px)",
          }}>
            <span>📖</span>
            <span>Tip: Tap page directly or use side arrows to flip</span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          BALANCED STAGE (BOOK + ORBITING PHOTOS FIT ON ONE SCREEN!)
      ═════════════════════════════════════════════════════════════ */}
      <div
        ref={stageRef}
        className="sketchbook-stage-frame"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 1280,
          height: "clamp(480px, 64vh, 540px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
        }}
      >
        {/* ── Golden Stardust Canvas (Faint Fairytale Sparkles Behind Butterflies) ── */}
        <canvas
          ref={stardustCanvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 32,
          }}
        />

        {/* ── Authentic Floating Polaroids Orbiting Around the Book (Matching Reference Screenshots!) ── */}
        <div className="floating-photos-galaxy" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}>
          {FLOATING_BG_PHOTOS.map((p, idx) => (
            <div
              key={idx}
              className="floating-bg-photo"
              onClick={() => setSelectedPhoto({ src: p.src, caption: p.label })}
              style={{
                position: "absolute",
                ...p.style,
                background: "#fffefc",
                borderRadius: 12,
                padding: "6px 6px 20px 6px",
                boxShadow: "0 16px 36px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.25)",
                border: "1.5px solid rgba(255,255,255,0.7)",
                animation: `floatOrbit 7s ease-in-out infinite alternate`,
                animationDelay: p.style.delay,
                cursor: "pointer",
                pointerEvents: "auto",
                transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `scale(1.08) translateY(-6px) rotate(${p.style.rotate})`;
                e.currentTarget.style.boxShadow = "0 22px 48px rgba(0,0,0,0.85), 0 0 25px rgba(255,77,121,0.3)";
                e.currentTarget.style.zIndex = "40";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `scale(1) translateY(0px) rotate(${p.style.rotate})`;
                e.currentTarget.style.boxShadow = "0 16px 36px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.25)";
                e.currentTarget.style.zIndex = "2";
              }}
            >
              {/* Optional Decorative Gold/Pastel Washi Tape Accent */}
              {p.washiTape && (
                <div
                  style={{
                    position: "absolute",
                    top: -5,
                    [p.washiTape.corner]: -6,
                    width: 32,
                    height: 12,
                    background: p.washiTape.color,
                    borderRadius: 2,
                    transform: `rotate(${p.washiTape.rotate}deg)`,
                    boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                    zIndex: 9,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* 3D Glossy Puffy Pink Heart Pin on Polaroid Corner */}
              <PuffyHeartPin
                size={26}
                rotate={p.heartRotate}
                onClick={(e) => e.stopPropagation()}
                style={{
                  top: -9,
                  [p.heartCorner]: -7,
                }}
              />

              {/* Pressed Botanical Flower Accent */}
              {p.flower && (
                <PressedFlower
                  type={p.flower.type}
                  size={24}
                  rotate={p.flower.rotate}
                  style={{
                    top: -7,
                    [p.flower.corner]: -6,
                  }}
                />
              )}

              {/* Photo Frame */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "calc(100% - 20px)",
                  borderRadius: 7,
                  overflow: "hidden",
                  background: "#1f181c",
                }}
              >
                <img
                  src={p.src}
                  alt={p.alt}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </div>

              {/* Polaroid Bottom Label with Handwritten Script & Emoji */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "4px",
                  fontFamily: "'Caveat', 'Playfair Display', cursive, serif",
                  fontSize: "clamp(0.78rem, 1.2vw, 0.88rem)",
                  fontWeight: 700,
                  color: "#2b1a22",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.15,
                }}
              >
                {p.label}
              </div>
            </div>
          ))}

          {/* ── Nostalgic Screen Favorites: Cartoons to Iconic Heroines (Filling Bottom Empty Spaces!) ── */}
          {NOSTALGIC_CARTOONS_TO_HEROINES.map((item) => (
            <div
              key={item.id}
              className="floating-bg-photo nostalgic-card-node"
              onClick={() => setSelectedNostalgia(item)}
              style={{
                position: "absolute",
                ...item.style,
                background: "#fffefc",
                borderRadius: 12,
                padding: "6px 6px 18px 6px",
                boxShadow: "0 16px 36px rgba(0,0,0,0.68), 0 2px 8px rgba(0,0,0,0.28)",
                border: "1.5px solid rgba(255,255,255,0.75)",
                animation: `floatOrbit 7.5s ease-in-out infinite alternate`,
                animationDelay: item.style.delay,
                cursor: "pointer",
                pointerEvents: "auto",
                transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                zIndex: 5,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `scale(1.09) translateY(-7px) rotate(${item.style.rotate})`;
                e.currentTarget.style.boxShadow = "0 22px 48px rgba(0,0,0,0.9), 0 0 25px rgba(251,191,36,0.35)";
                e.currentTarget.style.zIndex = "42";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `scale(1) translateY(0px) rotate(${item.style.rotate})`;
                e.currentTarget.style.boxShadow = "0 16px 36px rgba(0,0,0,0.68), 0 2px 8px rgba(0,0,0,0.28)";
                e.currentTarget.style.zIndex = "5";
              }}
              title={`Click to read Divija's ${item.title} memory!`}
            >
              {/* Decorative Washi Tape Header */}
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  left: "20%",
                  width: 38,
                  height: 12,
                  background: item.colorScheme.tape,
                  borderRadius: 2,
                  transform: "rotate(-4deg)",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.25)",
                  zIndex: 9,
                  pointerEvents: "none",
                }}
              />

              {/* Puffy 3D Heart Pin */}
              <PuffyHeartPin size={24} rotate={12} style={{ top: -8, right: -6 }} />

              {/* Pressed Botanical Flower Accent */}
              <PressedFlower type={item.flower} size={24} rotate={-15} style={{ top: -7, left: -6 }} />

              {/* Illustration / Badge Card */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "calc(100% - 22px)",
                  borderRadius: 7,
                  overflow: "hidden",
                  background: item.colorScheme.bg,
                  border: `1px solid ${item.colorScheme.border}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px 8px",
                  boxSizing: "border-box",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.18))", marginBottom: "2px" }}>
                  {item.icon}
                </div>
                <span
                  style={{
                    fontSize: "0.64rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: item.colorScheme.accent,
                    background: "rgba(255,255,255,0.85)",
                    padding: "1px 6px",
                    borderRadius: 10,
                    marginBottom: "3px",
                  }}
                >
                  {item.age}
                </span>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#27121b",
                    lineHeight: 1.15,
                  }}
                >
                  {item.characterBadge}
                </p>
              </div>

              {/* Handwritten Bottom Label */}
              <div
                style={{
                  textAlign: "center",
                  marginTop: "4px",
                  fontFamily: "'Caveat', cursive",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#2b1a22",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.15,
                }}
              >
                {item.title}
              </div>
            </div>
          ))}

        </div>

        {/* ── Soft Drifting Flower Petals Across Stage ── */}
        <FloatingFloralPetals />

        {/* ── 3D Fluttering Butterflies Orbiting, Roaming & LANDING on Divija's Photos! ── */}
        <div className="butterflies-stage-layer" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 35 }}>
          {/* 1. Mint Green Butterfly (Flies to Cutie Photo, LANDS & STOPS BODY ON DIVIJA for ~8.5s!) */}
          <FlutteringButterfly
            idPrefix="mint"
            color="#86efac"
            glowColor="rgba(134, 239, 172, 0.65)"
            size={36}
            flapSpeed="0.25s"
            flightAnimation="butterflyFlightMint 18s infinite ease-in-out"
            isPerching={true}
            style={{ animationDelay: "0s" }}
          />
          {/* 2. Dusky Sky Blue Butterfly (Loops across bottom polaroids & starfield) */}
          <FlutteringButterfly
            idPrefix="blue"
            color="#93c5fd"
            glowColor="rgba(147, 197, 253, 0.65)"
            size={38}
            flapSpeed="0.27s"
            flightAnimation="butterflyFlightBlue 18s infinite ease-in-out"
          />
          {/* 3. Blush Coral Butterfly (Flies to Living Sketchbook, LANDS & STOPS BODY ON DIVIJA'S MAIN PHOTO for ~8.5s!) */}
          <FlutteringButterfly
            idPrefix="pink"
            color="#fca5a5"
            glowColor="rgba(252, 165, 165, 0.65)"
            size={36}
            flapSpeed="0.24s"
            flightAnimation="butterflyFlightPink 18s infinite ease-in-out"
            isPerching={true}
            style={{ animationDelay: "-6s" }}
          />
          {/* 4. Warm Honey Gold Butterfly (Right polaroids & floating sparkles) */}
          <FlutteringButterfly
            idPrefix="honey"
            color="#fde047"
            glowColor="rgba(253, 224, 71, 0.65)"
            size={36}
            flapSpeed="0.28s"
            flightAnimation="butterflyFlightHoney 17s infinite ease-in-out"
          />
          {/* 5. Iridescent Lavender Butterfly (Large graceful celestial figure-8 loops across sky) */}
          <FlutteringButterfly
            idPrefix="lavender"
            color="#e9d5ff"
            glowColor="rgba(233, 213, 255, 0.65)"
            size={32}
            flapSpeed="0.26s"
            flightAnimation="butterflyFlightLavender 20s infinite ease-in-out"
          />
          {/* 6. Fiery Royal Monarch Butterfly (Flies to Dream Girl Photo, LANDS & STOPS BODY ON DIVIJA for ~8.5s!) */}
          <FlutteringButterfly
            idPrefix="monarch"
            color="#fb923c"
            glowColor="rgba(251, 146, 60, 0.7)"
            size={36}
            flapSpeed="0.25s"
            flightAnimation="butterflyFlightMonarch 18s infinite ease-in-out"
            isPerching={true}
            style={{ animationDelay: "-12s" }}
          />
          {/* 7. Shimmering Cyan Opal Butterfly (Fast playful shimmers over golden crown ribbon) */}
          <FlutteringButterfly
            idPrefix="cyan"
            color="#22d3ee"
            glowColor="rgba(34, 211, 238, 0.7)"
            size={30}
            flapSpeed="0.22s"
            flightAnimation="butterflyFlightCyan 13s infinite ease-in-out"
          />
          {/* 8. Velvet Magenta Ruby Butterfly (Playfully dances over bottom cartoon memories) */}
          <FlutteringButterfly
            idPrefix="ruby"
            color="#f43f5e"
            glowColor="rgba(244, 63, 94, 0.7)"
            size={34}
            flapSpeed="0.26s"
            flightAnimation="butterflyFlightRuby 14s infinite ease-in-out"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════
            THE CENTERED SKETCHBOOK (PROPORTIONED TO FIT LIKE REFERENCE!)
        ═══════════════════════════════════════════════════════════════ */}
        <div
          className="sketchbook-perspective-wrapper"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
            touchStartY.current = e.touches[0].clientY;
          }}
          onTouchEnd={(e) => {
            const diffX = touchStartX.current - e.changedTouches[0].clientX;
            const diffY = touchStartY.current - e.changedTouches[0].clientY;
            // Only flip if gesture was deliberately horizontal (>45px and steeper than vertical drift)
            if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
              if (diffX > 0) handleNext();
              else handlePrev();
            }
          }}
          style={{
            position: "relative",
            zIndex: 20,
            perspective: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >

          {/* ── STATE 1: CLOSED COVER NOTEBOOK (PAGE 0 - EXACT COMPACT MATCH!) ── */}
          {currentPage === 0 && (
            <div
              onClick={handleNext}
              className={`sketchbook-closed-cover ${isFlipping && flipDirection === "next" ? "cover-flipping-open" : ""}`}
              style={{
                width: "clamp(300px, 34vw, 390px)",
                height: "clamp(440px, 57vh, 500px)",
                background: "#18181c",
                borderRadius: "8px 20px 20px 8px",
                boxShadow: "0 25px 70px rgba(0,0,0,0.85), 0 0 30px rgba(212,175,55,0.25)",
                border: "2px solid #33333d",
                position: "relative",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "clamp(34px, 6vw, 46px) 1fr",
                overflow: "hidden",
                transition: "transform 0.35s ease, box-shadow 0.35s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02) rotate(-0.5deg)";
                e.currentTarget.style.boxShadow = "0 30px 85px rgba(0,0,0,0.92), 0 0 40px rgba(212,175,55,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                e.currentTarget.style.boxShadow = "0 25px 70px rgba(0,0,0,0.85), 0 0 30px rgba(212,175,55,0.25)";
              }}
            >
              {/* Left Wire Spiral Spine on Cover */}
              <div style={{
                background: "linear-gradient(90deg, #111115 0%, #22222b 75%, #333340 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-evenly",
                alignItems: "center",
                padding: "10px 0",
                borderRight: "2px solid #000000",
              }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ position: "relative", width: "100%", height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 8, height: 10, borderRadius: 4, background: "#050508", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.9)" }} />
                    <div style={{
                      position: "absolute",
                      left: -5,
                      width: 28,
                      height: 12,
                      border: "2px solid #d4af37",
                      borderRadius: "12px / 6px",
                      background: "linear-gradient(180deg, #ffffff 0%, #d4af37 50%, #8b6508 100%)",
                      transform: "rotate(-8deg)",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.6)",
                    }} />
                  </div>
                ))}
              </div>

              {/* Cover Collage Elements (Exact Match to Reference Image 1!) */}
              <div style={{
                position: "relative",
                background: "linear-gradient(145deg, #1e1e24 0%, #15151a 100%)",
                padding: "clamp(1rem, 2.5vw, 1.8rem)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                overflow: "hidden",
              }}>
                {/* Ripped Paper Collage Texture at Top-Left */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "50%",
                  height: "26%",
                  background: "#f4ede0",
                  clipPath: "polygon(0 0, 100% 0, 82% 70%, 94% 100%, 0 85%)",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
                  padding: "8px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "4px",
                }}>
                  <span style={{ fontSize: "1.1rem" }}>🌸</span>
                  <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.68rem", color: "#591c28", fontStyle: "italic", fontWeight: 700 }}>
                    Memories & Dreams
                  </span>
                </div>

                {/* Top Stickers: Cherries with Bow + Moon Sticker */}
                <div style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 5,
                }}>
                  <div style={{ width: 30 }} />
                  {/* Cherries with Ribbon Bow Sticker */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))",
                    transform: "rotate(-3deg)",
                  }}>
                    <span style={{ fontSize: "1.3rem" }}>🎀</span>
                    <span style={{ fontSize: "1.9rem", marginTop: "-10px" }}>🍒</span>
                  </div>
                  {/* Full Moon Photographic Sticker */}
                  <div style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    background: "radial-gradient(circle at 35% 35%, #ffffff 0%, #e2e8f0 40%, #94a3b8 100%)",
                    border: "1.5px solid #ffffff",
                    boxShadow: "0 3px 10px rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: "rotate(12deg)",
                  }}>
                    <span style={{ fontSize: "1.4rem" }}>🌕</span>
                  </div>
                </div>

                {/* Center Cutout Typography: "DIVIJA'S STORY" Cut-Out Letter Blocks */}
                <div style={{
                  margin: "0.8rem 0",
                  display: "flex",
                  gap: "2px",
                  background: "#fbf6ec",
                  padding: "5px 12px",
                  borderRadius: 3,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  transform: "rotate(-1.5deg)",
                  zIndex: 5,
                }}>
                  {["D","I","V","I","J","A","'","S"," ","S","T","O","R","Y"].map((letter, i) => (
                    <span
                      key={i}
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: "clamp(0.85rem, 1.8vw, 1.05rem)",
                        fontWeight: 900,
                        color: letter === " " ? "transparent" : "#240413",
                        background: letter === " " ? "transparent" : "#f1ede2",
                        padding: letter === " " ? "0 1px" : "1px 3px",
                        borderRadius: 2,
                        border: letter === " " ? "none" : "1px solid #d4c5a9",
                      }}
                    >
                      {letter}
                    </span>
                  ))}
                </div>

                {/* Vintage Point-and-Shoot Camera Illustration (Compact Centerpiece!) */}
                <div style={{
                  position: "relative",
                  width: "clamp(160px, 22vw, 210px)",
                  height: "clamp(110px, 16vh, 145px)",
                  background: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 50%, #9ca3af 100%)",
                  borderRadius: 12,
                  boxShadow: "0 12px 28px rgba(0,0,0,0.65), inset 0 2px 4px rgba(255,255,255,0.8)",
                  border: "2.5px solid #6b7280",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  zIndex: 6,
                  transform: "rotate(2.5deg)",
                }}>
                  <div style={{
                    position: "absolute",
                    top: 6,
                    left: 10,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "0.62rem",
                    fontWeight: 800,
                    color: "#374151",
                    letterSpacing: "0.08em",
                  }}>
                    CANON · MEMORIES
                  </div>
                  <div style={{ position: "absolute", top: 8, right: 10, width: 12, height: 8, background: "#1f2937", borderRadius: 2 }} />
                  <div style={{ position: "absolute", top: 8, right: 28, width: 16, height: 8, background: "linear-gradient(90deg, #fef08a, #ffffff)", borderRadius: 2, border: "1px solid #9ca3af" }} />

                  {/* Lens with Divija's Childhood Portrait */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPhoto({
                        src: "/images/journey_01_childhood.jpg",
                        caption: "Divija's Childhood Portrait · Little Princess with Big Dreams ✨",
                      });
                    }}
                    title="Click to enlarge photo 🔍"
                    style={{
                      width: "clamp(75px, 11vh, 98px)",
                      height: "clamp(75px, 11vh, 98px)",
                      borderRadius: "50%",
                      background: "#111827",
                      border: "3.5px solid #ffd700",
                      boxShadow: "0 6px 18px rgba(0,0,0,0.65), 0 0 16px rgba(250,204,21,0.5)",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "zoom-in",
                      position: "relative",
                      transition: "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.28s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.09)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.8), 0 0 24px rgba(255,215,0,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.65), 0 0 16px rgba(250,204,21,0.5)";
                    }}
                  >
                    <img
                      src="/images/journey_01_childhood.jpg"
                      alt="Divija in Lens"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 3,
                        background: "rgba(0,0,0,0.75)",
                        borderRadius: "8px",
                        padding: "1px 5px",
                        color: "#ffd700",
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        pointerEvents: "none",
                      }}
                    >
                      🔍
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Open Prompt */}
                <div style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 6,
                  marginTop: "0.6rem",
                }}>
                  <span style={{ fontSize: "1.3rem" }}>🌸</span>
                  <div style={{
                    background: "linear-gradient(135deg, #ffd700, #f59e0b)",
                    color: "#18020b",
                    padding: "6px 18px",
                    borderRadius: 100,
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    boxShadow: "0 4px 14px rgba(212,175,55,0.5)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    letterSpacing: "0.04em",
                  }}>
                    <span>📖 Tap Cover to Open</span>
                    <span>➔</span>
                  </div>
                  <span style={{ fontSize: "1.3rem" }}>⚖️</span>
                </div>

                {/* Engraved Gilded Stamp on Cover */}
                <div style={{
                  marginTop: "0.35rem",
                  textAlign: "center",
                  width: "100%",
                  zIndex: 6,
                }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "3px 12px",
                    borderRadius: 100,
                    background: "rgba(212,175,55,0.14)",
                    border: "1px dashed rgba(212,175,55,0.45)",
                  }}>
                    <span style={{ fontSize: "0.75rem" }}>👆</span>
                    <span style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: "0.66rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#f5d77f",
                      fontWeight: 700,
                      textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                    }}>
                      Tap page or next arrow to open
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STATE 2: OPEN 2-PAGE SPREAD (PAGES 1 TO 6 WITH 3D PHYSICAL TURNING LEAF) ── */}
          {currentPage > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "100%" }}>
              {/* Mobile Page Selector Tabs: Shrinks open book to fit mobile screens perfectly! */}
              {isMobile && (
                <div
                  className="mobile-book-view-switcher"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    margin: "0 auto 10px",
                    padding: "3px 4px",
                    background: "linear-gradient(135deg, rgba(32, 10, 22, 0.95) 0%, rgba(18, 4, 12, 0.98) 100%)",
                    border: "1.2px solid rgba(212, 175, 55, 0.55)",
                    borderRadius: "20px",
                    width: "max-content",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.7), 0 0 14px rgba(212,175,55,0.25)",
                    zIndex: 50,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => { setMobileSubPage("left"); playPageTurnSound(); }}
                    style={{
                      padding: "4px 13px",
                      borderRadius: "16px",
                      border: "none",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: mobileSubPage === "left" ? "linear-gradient(135deg, #ffd700, #f59e0b)" : "transparent",
                      color: mobileSubPage === "left" ? "#1a030d" : "#fce8b2",
                      boxShadow: mobileSubPage === "left" ? "0 2px 8px rgba(250,204,21,0.5)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    📷 Photo (p.{currentPage * 2 - 1})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMobileSubPage("right"); playPageTurnSound(); }}
                    style={{
                      padding: "4px 13px",
                      borderRadius: "16px",
                      border: "none",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: mobileSubPage === "right" ? "linear-gradient(135deg, #ffd700, #f59e0b)" : "transparent",
                      color: mobileSubPage === "right" ? "#1a030d" : "#fce8b2",
                      boxShadow: mobileSubPage === "right" ? "0 2px 8px rgba(250,204,21,0.5)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    📖 Story (p.{currentPage * 2})
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileSubPage("both")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "16px",
                      border: "none",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      background: mobileSubPage === "both" ? "linear-gradient(135deg, #ffd700, #f59e0b)" : "transparent",
                      color: mobileSubPage === "both" ? "#1a030d" : "#fce8b2",
                      boxShadow: mobileSubPage === "both" ? "0 2px 8px rgba(250,204,21,0.5)" : "none",
                      transition: "all 0.2s ease",
                    }}
                  >
                    📜 Both
                  </button>
                </div>
              )}

              <div
                className={`sketchbook-open-spread ${isMobile ? `is-mobile-sub-${mobileSubPage}` : ""} ${isFlipping ? "is-flipping-mobile" : ""} ${isFlipping && targetPage === 0 ? "spread-flipping-close" : ""}`}
                style={{
                  width: "clamp(580px, 62vw, 800px)",
                  height: "clamp(460px, 60vh, 520px)",
                  background: "#fbf6ec",
                  borderRadius: 12,
                  boxShadow: "0 25px 75px rgba(0,0,0,0.9), 0 0 30px rgba(212,175,55,0.2)",
                  display: "grid",
                  gridTemplateColumns: isMobile && mobileSubPage !== "both" ? "1fr" : "1fr clamp(28px, 4vw, 36px) 1fr",
                  position: "relative",
                  transformStyle: "preserve-3d",
                  perspective: 2400,
                  boxSizing: "border-box",
                }}
              >
                {/* ── BASE LEFT PAGE ── */}
                {(!isMobile || mobileSubPage === "left" || mobileSubPage === "both") && (
                  <div
                    className="sketchbook-page-col sketchbook-page-col-left"
                    style={{
                      position: "relative",
                      height: "100%",
                      width: "100%",
                      overflow: "hidden",
                      borderRadius: isMobile && mobileSubPage !== "both" ? "12px" : "12px 0 0 12px",
                      borderRight: isMobile && mobileSubPage !== "both" ? "none" : "1px solid rgba(139,101,8,0.2)",
                    }}
                  >
                    {renderLeftPage(
                      isFlipping && flipDirection === "prev" && targetPage > 0
                        ? targetPage - 1
                        : currentPage - 1
                    )}
                  </div>
                )}

                {/* ── CENTER WIRE SPIRAL SPINE ── */}
                {!isMobile && renderWireSpiral()}

                {/* ── BASE RIGHT PAGE ── */}
                {(!isMobile || mobileSubPage === "right" || mobileSubPage === "both") && (
                  <div
                    className="sketchbook-page-col sketchbook-page-col-right"
                    style={{
                      position: "relative",
                      height: "100%",
                      width: "100%",
                      overflow: "hidden",
                      borderRadius: isMobile && mobileSubPage !== "both" ? "12px" : "0 12px 12px 0",
                      borderLeft: isMobile && mobileSubPage !== "both" ? "none" : "1px solid rgba(139,101,8,0.2)",
                    }}
                  >
                    {renderRightPage(
                      isFlipping && flipDirection === "next" && targetPage > 0
                        ? targetPage - 1
                        : currentPage - 1
                    )}
                  </div>
                )}

                {/* ── 3D PHYSICAL TURNING LEAF (FORWARD TO NEXT CHAPTER) ── */}
                {!isMobile && isFlipping && flipDirection === "next" && targetPage > 0 && (
                  <div className="turning-page-leaf leaf-turning-next">
                    {/* Front Face: Outgoing Right Page */}
                    <div className="leaf-face leaf-face-front">
                      <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "0 12px 12px 0" }}>
                        {renderRightPage(currentPage - 1)}
                      </div>
                      <div className="leaf-curl-shadow-overlay" />
                    </div>

                    {/* Back Face: Incoming Left Page */}
                    <div className="leaf-face leaf-face-back">
                      <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "12px 0 0 12px" }}>
                        {renderLeftPage(targetPage - 1)}
                      </div>
                      <div className="leaf-curl-highlight-overlay" />
                    </div>
                  </div>
                )}

                {/* ── 3D PHYSICAL TURNING LEAF (BACKWARD TO PREVIOUS CHAPTER) ── */}
                {!isMobile && isFlipping && flipDirection === "prev" && targetPage > 0 && (
                  <div className="turning-page-leaf leaf-turning-prev">
                    {/* Front Face: Outgoing Left Page */}
                    <div className="leaf-face leaf-face-front">
                      <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "12px 0 0 12px" }}>
                        {renderLeftPage(currentPage - 1)}
                      </div>
                      <div className="leaf-curl-shadow-overlay" />
                    </div>

                    {/* Back Face: Incoming Right Page */}
                    <div className="leaf-face leaf-face-back">
                      <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "0 12px 12px 0" }}>
                        {renderRightPage(targetPage - 1)}
                      </div>
                      <div className="leaf-curl-highlight-overlay" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── FLOATING GILDED SIDE NAVIGATION CONTROLS (MASSIVE, RADIANT & UNMISSABLE!) ── */}
        {currentPage > 0 && (
          <div
            className="floating-nav-arrow floating-nav-prev-wrap"
            style={{
              position: "absolute",
              left: "clamp(16px, 3.5vw, 55px)",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={handlePrev}
          >
            <button
              onClick={handlePrev}
              aria-label="Previous Chapter"
              className="floating-nav-arrow-btn floating-nav-prev"
              style={{
                width: "clamp(54px, 5.8vw, 68px)",
                height: "clamp(54px, 5.8vw, 68px)",
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 35%, #4a132e 0%, #200414 70%, #0d0108 100%)",
                border: "2.5px solid #f5d77f",
                boxShadow: "0 10px 30px rgba(0,0,0,0.85), 0 0 24px rgba(212,175,55,0.5), inset 0 1px 3px rgba(255,255,255,0.3)",
                color: "#f5d77f",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.12)";
                e.currentTarget.style.boxShadow = "0 14px 36px rgba(0,0,0,0.92), 0 0 35px rgba(245,215,127,0.85)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.85), 0 0 24px rgba(212,175,55,0.5)";
              }}
              title="Previous Chapter"
            >
              <span style={{
                fontSize: "clamp(1.8rem, 2.6vw, 2.3rem)",
                fontWeight: 900,
                lineHeight: 1,
                marginTop: "-3px",
                marginRight: "2px",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
              }}>
                ‹
              </span>
            </button>
            <span className="nav-arrow-badge" style={{
              marginTop: "6px",
              background: "rgba(15, 3, 10, 0.92)",
              border: "1px solid rgba(212,175,55,0.5)",
              color: "#f5d77f",
              padding: "2px 8px",
              borderRadius: 12,
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              boxShadow: "0 3px 10px rgba(0,0,0,0.6)",
              pointerEvents: "none",
            }}>
              ‹ PREV
            </span>
          </div>
        )}

        {currentPage < TOTAL_PAGES - 1 && (
          <div
            className="floating-nav-arrow floating-nav-next-wrap"
            style={{
              position: "absolute",
              right: "clamp(16px, 3.5vw, 55px)",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={handleNext}
          >
            <button
              onClick={handleNext}
              aria-label={currentPage === 0 ? "Open Sketchbook" : "Next Chapter"}
              className="floating-nav-arrow-btn floating-nav-next pulsing-next-btn"
              style={{
                width: "clamp(62px, 6.8vw, 76px)",
                height: "clamp(62px, 6.8vw, 76px)",
                borderRadius: "50%",
                background: "radial-gradient(circle at 32% 28%, #fffbe6 0%, #fde047 30%, #eab308 65%, #ca8a04 100%)",
                border: "3.5px solid #ffffff",
                boxShadow: "0 12px 36px rgba(0,0,0,0.9), 0 0 35px rgba(250, 204, 21, 0.85), inset 0 2px 6px rgba(255,255,255,0.9)",
                color: "#18020b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.15)";
                e.currentTarget.style.boxShadow = "0 16px 44px rgba(0,0,0,0.95), 0 0 55px rgba(255,235,100,1), 0 0 85px rgba(245,158,11,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.9), 0 0 35px rgba(250, 204, 21, 0.85)";
              }}
              title={currentPage === 0 ? "Open Sketchbook" : "Next Chapter"}
            >
              <span style={{
                fontSize: "clamp(2rem, 3.2vw, 2.7rem)",
                fontWeight: 900,
                lineHeight: 1,
                marginLeft: "3px",
                filter: "drop-shadow(0 2px 3px rgba(255,255,255,0.5))",
                display: "inline-block",
              }}>
                ➔
              </span>
            </button>
            <span className="nav-arrow-badge" style={{
              marginTop: "8px",
              background: "linear-gradient(135deg, #2b0417 0%, #15020c 100%)",
              border: "2px solid #facc15",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: "clamp(0.72rem, 1vw, 0.82rem)",
              fontWeight: 900,
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              boxShadow: "0 6px 20px rgba(0,0,0,0.85), 0 0 16px rgba(250,204,21,0.65)",
              pointerEvents: "none",
            }}>
              {currentPage === 0 ? "OPEN BOOK 📖" : "NEXT CHAPTER ➔"}
            </span>
          </div>
        )}

        {/* Replay Story Button on Final Page (Continuous Loop) */}
        {currentPage === TOTAL_PAGES - 1 && (
          <div
            className="floating-nav-arrow floating-nav-next-wrap"
            style={{
              position: "absolute",
              right: "clamp(16px, 3.5vw, 55px)",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 80,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => flipToPage(0)}
          >
            <button
              onClick={() => flipToPage(0)}
              aria-label="Replay Divija's Story from Cover"
              className="floating-nav-arrow-btn floating-nav-next pulsing-next-btn"
              style={{
                width: "clamp(62px, 6.8vw, 76px)",
                height: "clamp(62px, 6.8vw, 76px)",
                borderRadius: "50%",
                background: "radial-gradient(circle at 32% 28%, #fffbe6 0%, #fde047 30%, #eab308 65%, #ca8a04 100%)",
                border: "3.5px solid #ffffff",
                boxShadow: "0 12px 36px rgba(0,0,0,0.9), 0 0 35px rgba(250, 204, 21, 0.85), inset 0 2px 6px rgba(255,255,255,0.9)",
                color: "#18020b",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.15) rotate(-45deg)";
                e.currentTarget.style.boxShadow = "0 16px 44px rgba(0,0,0,0.95), 0 0 55px rgba(255,235,100,1), 0 0 85px rgba(245,158,11,0.7)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) rotate(0deg)";
                e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,0.9), 0 0 35px rgba(250, 204, 21, 0.85)";
              }}
              title="Replay Divija's Story from Cover"
            >
              <span style={{
                fontSize: "clamp(2rem, 3.2vw, 2.7rem)",
                fontWeight: 900,
                lineHeight: 1,
                filter: "drop-shadow(0 2px 3px rgba(255,255,255,0.5))",
                display: "inline-block",
              }}>
                ↺
              </span>
            </button>
            <span className="nav-arrow-badge" style={{
              marginTop: "8px",
              background: "linear-gradient(135deg, #2b0417 0%, #15020c 100%)",
              border: "2px solid #facc15",
              color: "#fff",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: "clamp(0.72rem, 1vw, 0.82rem)",
              fontWeight: 900,
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              boxShadow: "0 6px 20px rgba(0,0,0,0.85), 0 0 16px rgba(250,204,21,0.65)",
              pointerEvents: "none",
            }}>
              REPLAY STORY ↺
            </span>
          </div>
        )}
      </div>

      {/* ── Mobile-Only Interactive Nostalgia & Polaroid Carousel (Visible on screens <= 860px) ── */}
      <div className="mobile-nostalgia-tray" style={{ width: "100%", maxWidth: 640, margin: "1.2rem auto 0" }}>
        <div style={{
          textAlign: "center",
          marginBottom: "0.6rem",
          padding: "0 12px",
        }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 14px",
            borderRadius: 100,
            background: "rgba(212,175,55,0.14)",
            border: "1px solid rgba(212,175,55,0.4)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}>
            <span style={{ fontSize: "0.85rem" }}>🌸</span>
            <span style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "1.02rem",
              fontWeight: 700,
              color: "#f5d77f",
              letterSpacing: "0.02em",
            }}>
              Divija's Childhood Favorites & Polaroids (Swipe ➔)
            </span>
          </div>
        </div>

        <div
          className="mobile-nostalgia-scroll"
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "12px",
            padding: "8px 14px 16px",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* 1. Nostalgic Cartoon to Heroine Cards */}
          {NOSTALGIC_CARTOONS_TO_HEROINES.map((item) => (
            <div
              key={`mobile-nostalgia-${item.id}`}
              onClick={() => setSelectedNostalgia(item)}
              style={{
                flex: "0 0 155px",
                scrollSnapAlign: "start",
                background: "#fffefc",
                borderRadius: 12,
                padding: "6px 6px 14px 6px",
                boxShadow: "0 8px 22px rgba(0,0,0,0.65)",
                border: "1.5px solid rgba(255,255,255,0.75)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                transition: "transform 0.2s ease",
              }}
            >
              <div style={{
                height: 104,
                borderRadius: 7,
                overflow: "hidden",
                background: item.colorScheme.bg,
                border: `1px solid ${item.colorScheme.border}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "1.9rem", marginBottom: "2px" }}>{item.icon}</div>
                <span style={{
                  fontSize: "0.58rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: item.colorScheme.accent,
                  background: "rgba(255,255,255,0.85)",
                  padding: "1px 6px",
                  borderRadius: 8,
                  marginBottom: "2px",
                }}>
                  {item.age}
                </span>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#27121b", lineHeight: 1.15 }}>
                  {item.characterBadge}
                </div>
              </div>
              <div style={{
                textAlign: "center",
                marginTop: "6px",
                fontFamily: "'Caveat', cursive",
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#2b1a22",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {item.title}
              </div>
            </div>
          ))}

          {/* 2. Floating Polaroids */}
          {FLOATING_BG_PHOTOS.map((p, idx) => (
            <div
              key={`mobile-polaroid-${idx}`}
              onClick={() => setSelectedPhoto({ src: p.src, caption: p.label })}
              style={{
                flex: "0 0 145px",
                scrollSnapAlign: "start",
                background: "#fffefc",
                borderRadius: 12,
                padding: "6px 6px 14px 6px",
                boxShadow: "0 8px 22px rgba(0,0,0,0.65)",
                border: "1.5px solid rgba(255,255,255,0.75)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
            >
              <div style={{ height: 112, borderRadius: 6, overflow: "hidden", background: "#1f181c" }}>
                <img src={p.src} alt={p.alt} loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{
                textAlign: "center",
                marginTop: "6px",
                fontFamily: "'Caveat', cursive",
                fontSize: "0.84rem",
                fontWeight: 700,
                color: "#2b1a22",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                {p.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FULLSCREEN HIGH-DEFINITION PHOTO ZOOM MODAL (Teleported directly to document.body) ── */}
      <PhotoZoomModal
        isOpen={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        src={selectedPhoto?.src || ""}
        title="Divija's Living Storybook · Keepsake Memory"
        subtitle="✦ High-Definition Photo Vault · Touch & Drag to Pan ✦"
        caption={selectedPhoto?.caption || ""}
      />

      {/* ── NOSTALGIC SCREEN MEMORY SPOTLIGHT MODAL (Teleported directly to document.body) ── */}
      {mounted && selectedNostalgia && typeof document !== "undefined" && createPortal(
        <div
          onClick={() => setSelectedNostalgia(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Nostalgia spotlight memory"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 99999,
            background: "rgba(10, 3, 7, 0.92)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            cursor: "zoom-out",
            animation: "lightboxFadeIn 0.25s ease-out forwards",
            boxSizing: "border-box",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 480,
              width: "100%",
              background: "#fffdf9",
              borderRadius: 20,
              padding: "24px 22px",
              boxShadow: "0 25px 70px rgba(0,0,0,0.92), 0 0 40px rgba(251,191,36,0.4)",
              border: "2px solid #d4af37",
              position: "relative",
              textAlign: "center",
              cursor: "default",
              animation: "lightboxZoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            <button
              onClick={() => setSelectedNostalgia(null)}
              style={{
                position: "absolute",
                top: 12,
                right: 14,
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.06)",
                border: "none",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>

            <div style={{ fontSize: "3.2rem", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))", marginBottom: "6px" }}>
              {selectedNostalgia.icon}
            </div>

            <div
              style={{
                display: "inline-block",
                padding: "3px 14px",
                borderRadius: 14,
                background: "rgba(212,175,55,0.15)",
                border: "1px solid rgba(212,175,55,0.45)",
                color: "#92400e",
                fontSize: "0.8rem",
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              ✦ {selectedNostalgia.era} · {selectedNostalgia.age} ✦
            </div>

            <h3
              style={{
                margin: "0 0 4px",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.45rem",
                color: "#4a0e17",
                fontWeight: 800,
              }}
            >
              {selectedNostalgia.title}
            </h3>

            <p style={{ margin: "0 0 14px", color: "#831843", fontSize: "0.88rem", fontWeight: 600 }}>
              {selectedNostalgia.characterBadge}
            </p>

            <div
              style={{
                background: "#fef7ee",
                borderRadius: 12,
                padding: "16px",
                border: "1.5px dashed rgba(217,119,6,0.35)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Caveat', cursive",
                  fontSize: "1.22rem",
                  color: "#2b0a16",
                  lineHeight: 1.35,
                  fontWeight: 700,
                }}
              >
                {selectedNostalgia.quote}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── CSS KEYFRAMES & 3D ANIMATIONS ──────────────────── */}
      <style jsx global>{`
        /* ─── Lightbox Teleport Modal Keyframes ─── */
        @keyframes lightboxFadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes lightboxZoomIn {
          0% { opacity: 0; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1); }
        }

        /* ─── Butterfly 3D Realistic Wing Flapping ─── */
        @keyframes butterflyWingFlapLeft {
          0% {
            transform: rotateY(0deg) skewY(0deg);
          }
          100% {
            transform: rotateY(74deg) skewY(-8deg);
          }
        }

        @keyframes butterflyWingFlapRight {
          0% {
            transform: rotateY(0deg) skewY(0deg);
          }
          100% {
            transform: rotateY(-74deg) skewY(8deg);
          }
        }

        /* Synchronized vertical wing-beat bobbing */
        @keyframes butterflyBob {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-4px);
          }
        }

        /* ─── Perching Butterfly: Flaps in flight, but STOPS BODY & FOLDS WINGS when landing on Divija! ─── */
        @keyframes butterflyPerchWingLeft {
          /* Flight phase 1 (0% to 24%): Active wing flaps */
          0% { transform: rotateY(0deg) skewY(0deg); }
          3% { transform: rotateY(74deg) skewY(-8deg); }
          6% { transform: rotateY(0deg) skewY(0deg); }
          9% { transform: rotateY(74deg) skewY(-8deg); }
          12% { transform: rotateY(0deg) skewY(0deg); }
          15% { transform: rotateY(74deg) skewY(-8deg); }
          18% { transform: rotateY(0deg) skewY(0deg); }
          21% { transform: rotateY(74deg) skewY(-8deg); }
          24% { transform: rotateY(0deg) skewY(0deg); }

          /* PERCHED & STOPPED ON DIVIJA (24% to 71% - ~8.5 SECONDS RESTING BODY!) */
          24%, 44% { transform: rotateY(72deg) skewY(-7deg); }
          47% { transform: rotateY(54deg) skewY(-4deg); } /* Gentle resting breath */
          50%, 71% { transform: rotateY(74deg) skewY(-8deg); }

          /* Flight phase 2 (72% to 100%): Active wing flaps taking off */
          73% { transform: rotateY(0deg) skewY(0deg); }
          76% { transform: rotateY(74deg) skewY(-8deg); }
          79% { transform: rotateY(0deg) skewY(0deg); }
          82% { transform: rotateY(74deg) skewY(-8deg); }
          85% { transform: rotateY(0deg) skewY(0deg); }
          88% { transform: rotateY(74deg) skewY(-8deg); }
          91% { transform: rotateY(0deg) skewY(0deg); }
          94% { transform: rotateY(74deg) skewY(-8deg); }
          97% { transform: rotateY(0deg) skewY(0deg); }
          100% { transform: rotateY(74deg) skewY(-8deg); }
        }

        @keyframes butterflyPerchWingRight {
          /* Flight phase 1 (0% to 24%): Active wing flaps */
          0% { transform: rotateY(0deg) skewY(0deg); }
          3% { transform: rotateY(-74deg) skewY(8deg); }
          6% { transform: rotateY(0deg) skewY(0deg); }
          9% { transform: rotateY(-74deg) skewY(8deg); }
          12% { transform: rotateY(0deg) skewY(0deg); }
          15% { transform: rotateY(-74deg) skewY(8deg); }
          18% { transform: rotateY(0deg) skewY(0deg); }
          21% { transform: rotateY(-74deg) skewY(8deg); }
          24% { transform: rotateY(0deg) skewY(0deg); }

          /* PERCHED & STOPPED ON DIVIJA (24% to 71% - ~8.5 SECONDS RESTING BODY!) */
          24%, 44% { transform: rotateY(-72deg) skewY(7deg); }
          47% { transform: rotateY(-54deg) skewY(4deg); } /* Gentle resting breath */
          50%, 71% { transform: rotateY(-74deg) skewY(8deg); }

          /* Flight phase 2 (72% to 100%): Active wing flaps taking off */
          73% { transform: rotateY(0deg) skewY(0deg); }
          76% { transform: rotateY(-74deg) skewY(8deg); }
          79% { transform: rotateY(0deg) skewY(0deg); }
          82% { transform: rotateY(-74deg) skewY(8deg); }
          85% { transform: rotateY(0deg) skewY(0deg); }
          88% { transform: rotateY(-74deg) skewY(8deg); }
          91% { transform: rotateY(0deg) skewY(0deg); }
          94% { transform: rotateY(-74deg) skewY(8deg); }
          97% { transform: rotateY(0deg) skewY(0deg); }
          100% { transform: rotateY(-74deg) skewY(8deg); }
        }

        /* Perching Butterfly: Body stops bobbing completely while landed */
        @keyframes butterflyPerchBob {
          0%, 6%, 12%, 18%, 24% { transform: translateY(0px); }
          3%, 9%, 15%, 21% { transform: translateY(-4px); }

          /* 24% to 71%: DEAD STOP! Zero bobbing, fully resting on Divija! */
          24%, 71% { transform: translateY(0px); }

          73%, 79%, 85%, 91%, 97% { transform: translateY(-4px); }
          76%, 82%, 88%, 94%, 100% { transform: translateY(0px); }
        }

        /* ─── Butterfly Flight Paths Across Screen with Real Landing Perches! ─── */
        /* 1. Mint Butterfly: Loops left side and LANDS & STOPS ON DIVIJA'S CUTIE PHOTO for ~8.5s! */
        @keyframes butterflyFlightMint {
          0% { left: 16%; top: 26%; transform: rotate(18deg) scale(1); }
          12% { left: 24%; top: 12%; transform: rotate(-18deg) scale(1.05); }
          20% { left: 10%; top: 4%; transform: rotate(14deg) scale(0.95); }
          /* LANDS & STOPS ON DIVIJA'S CUTIE PHOTO (24% to 71% - ~8.5s UNMOVING!) */
          24%, 71% { left: 5.5%; top: 6%; transform: rotate(10deg) scale(0.92); }
          /* Takes flight again! */
          78% { left: 18%; top: 42%; transform: rotate(-22deg) scale(1.06); }
          89% { left: 22%; top: 32%; transform: rotate(12deg) scale(1); }
          100% { left: 16%; top: 26%; transform: rotate(18deg) scale(1); }
        }

        /* 2. Blue Butterfly: Loops bottom across polaroids */
        @keyframes butterflyFlightBlue {
          0% { left: 55%; top: 76%; transform: rotate(6deg) scale(1); }
          18% { left: 40%; top: 84%; transform: rotate(-18deg) scale(1.04); }
          32% { left: 66%; top: 68%; transform: rotate(22deg) scale(0.98); }
          46% { left: 88%; top: 78%; transform: rotate(-10deg) scale(0.9); }
          60% { left: 78%; top: 74%; transform: rotate(14deg) scale(0.95); }
          78% { left: 74%; top: 60%; transform: rotate(18deg) scale(1.06); }
          90% { left: 62%; top: 82%; transform: rotate(-14deg) scale(1); }
          100% { left: 55%; top: 76%; transform: rotate(6deg) scale(1); }
        }

        /* 3. Pink Butterfly: Flutters in & LANDS & STOPS ON DIVIJA'S CENTRAL PHOTO IN SKETCHBOOK for ~8.5s! */
        @keyframes butterflyFlightPink {
          0% { left: 22%; top: 58%; transform: rotate(18deg) scale(1); }
          12% { left: 32%; top: 44%; transform: rotate(-14deg) scale(1.05); }
          20% { left: 42%; top: 26%; transform: rotate(16deg) scale(0.95); }
          /* LANDS & STOPS RIGHT ON DIVIJA'S PHOTO IN SKETCHBOOK (24% to 71% - ~8.5s UNMOVING!) */
          24%, 71% { left: 36%; top: 32%; transform: rotate(-8deg) scale(0.88); }
          /* Takes flight again! */
          78% { left: 26%; top: 52%; transform: rotate(-24deg) scale(1.05); }
          89% { left: 16%; top: 68%; transform: rotate(14deg) scale(1); }
          100% { left: 22%; top: 58%; transform: rotate(18deg) scale(1); }
        }

        /* 4. Honey Gold Butterfly: Dances across right polaroids */
        @keyframes butterflyFlightHoney {
          0% { left: 80%; top: 16%; transform: rotate(-14deg) scale(1); }
          18% { left: 70%; top: 30%; transform: rotate(16deg) scale(1.05); }
          35% { left: 91%; top: 35%; transform: rotate(-16deg) scale(0.9); }
          50% { left: 84%; top: 42%; transform: rotate(12deg) scale(0.96); }
          72% { left: 76%; top: 48%; transform: rotate(24deg) scale(1.04); }
          86% { left: 86%; top: 28%; transform: rotate(-18deg) scale(1); }
          100% { left: 80%; top: 16%; transform: rotate(-14deg) scale(1); }
        }

        /* 5. Lavender Butterfly: Wide Random Celestial Sky Explorer */
        @keyframes butterflyFlightLavender {
          0% { left: 48%; top: 8%; transform: rotate(-8deg) scale(1); }
          18% { left: 26%; top: 16%; transform: rotate(18deg) scale(1.05); }
          36% { left: 14%; top: 8%; transform: rotate(-16deg) scale(0.95); }
          54% { left: 38%; top: 22%; transform: rotate(24deg) scale(1.04); }
          72% { left: 68%; top: 12%; transform: rotate(-18deg) scale(0.98); }
          88% { left: 84%; top: 24%; transform: rotate(14deg) scale(1.02); }
          100% { left: 48%; top: 8%; transform: rotate(-8deg) scale(1); }
        }

        /* 6. Monarch Butterfly: LANDS & STOPS ON DIVIJA'S DREAM GIRL PHOTO for ~8.5s! */
        @keyframes butterflyFlightMonarch {
          0% { left: 20%; top: 76%; transform: rotate(18deg) scale(1); }
          12% { left: 36%; top: 56%; transform: rotate(-12deg) scale(1.06); }
          20% { left: 18%; top: 68%; transform: rotate(20deg) scale(0.96); }
          /* LANDS & STOPS ON DIVIJA'S DREAM GIRL PHOTO (24% to 71% - ~8.5s UNMOVING!) */
          24%, 71% { left: 5.5%; top: 72%; transform: rotate(-12deg) scale(0.9); }
          /* Takes flight again! */
          78% { left: 28%; top: 64%; transform: rotate(24deg) scale(1.05); }
          89% { left: 14%; top: 82%; transform: rotate(-16deg) scale(1); }
          100% { left: 20%; top: 76%; transform: rotate(18deg) scale(1); }
        }

        /* 7. Cyan Opal Butterfly: Playful Ribbon Flutter Over Sketchbook Crown */
        @keyframes butterflyFlightCyan {
          0% { left: 74%; top: 44%; transform: rotate(18deg) scale(0.95); }
          22% { left: 58%; top: 32%; transform: rotate(-16deg) scale(1.08); }
          44% { left: 44%; top: 48%; transform: rotate(22deg) scale(0.96); }
          66% { left: 62%; top: 62%; transform: rotate(-20deg) scale(1.05); }
          85% { left: 78%; top: 52%; transform: rotate(14deg) scale(1); }
          100% { left: 74%; top: 44%; transform: rotate(18deg) scale(0.95); }
        }

        /* 8. Velvet Ruby Butterfly: Nostalgic Bottom Strip Explorer */
        @keyframes butterflyFlightRuby {
          0% { left: 16%; top: 88%; transform: rotate(-14deg) scale(1); }
          24% { left: 34%; top: 92%; transform: rotate(16deg) scale(1.04); }
          48% { left: 52%; top: 86%; transform: rotate(-18deg) scale(0.96); }
          72% { left: 68%; top: 92%; transform: rotate(20deg) scale(1.05); }
          88% { left: 82%; top: 88%; transform: rotate(-12deg) scale(1); }
          100% { left: 16%; top: 88%; transform: rotate(-14deg) scale(1); }
        }

        /* ─── Gentle Drifting Flower Petals Keyframe ─── */
        @keyframes petalDrift {
          0% {
            transform: translate3d(0, -10px, 0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.85;
          }
          90% {
            opacity: 0.85;
          }
          100% {
            transform: translate3d(40px, 880px, 0) rotate(360deg);
            opacity: 0;
          }
        }

        /* Floating background photos orbit animation */
        @keyframes floatOrbit {
          0% {
            transform: translateY(0px) rotate(var(--rot, 0deg));
          }
          50% {
            transform: translateY(-8px) rotate(calc(var(--rot, 0deg) + 1.5deg));
          }
          100% {
            transform: translateY(0px) rotate(var(--rot, 0deg));
          }
        }

        /* ── 3D Physical Paper Leaf Turning System ── */
        .turning-page-leaf {
          position: absolute;
          top: 0;
          height: 100%;
          pointer-events: none;
          transform-style: preserve-3d;
          z-index: 45;
          box-sizing: border-box;
        }

        /* Forward Flip: Page swings from right to left across spiral with diagonal corner lift */
        .leaf-turning-next {
          left: 50%;
          width: 50%;
          transform-origin: left center;
          animation: pageTurnNext3D 0.75s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .leaf-turning-next .leaf-face-front {
          padding-left: clamp(14px, 2vw, 18px);
        }

        .leaf-turning-next .leaf-face-back {
          padding-right: clamp(14px, 2vw, 18px);
        }

        /* Backward Flip: Page swings from left to right across spiral with diagonal corner lift */
        .leaf-turning-prev {
          left: 0;
          width: 50%;
          transform-origin: right center;
          animation: pageTurnPrev3D 0.75s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .leaf-turning-prev .leaf-face-front {
          padding-right: clamp(14px, 2vw, 18px);
        }

        .leaf-turning-prev .leaf-face-back {
          padding-left: clamp(14px, 2vw, 18px);
        }

        .leaf-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          box-sizing: border-box;
          background: #fffdf8;
          border-radius: 6px;
          overflow: hidden;
        }

        .leaf-face-front {
          transform: rotateY(0deg);
        }

        .leaf-face-back {
          transform: rotateY(180deg);
        }

        /* Roman Cortes Inspired Diagonal Paper Crease Shadow & Specular Sheen */
        .leaf-curl-shadow-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            rgba(0, 0, 0, 0.65) 0%,
            rgba(0, 0, 0, 0.35) 20%,
            rgba(0, 0, 0, 0.08) 35%,
            rgba(255, 255, 255, 0.22) 48%,
            rgba(255, 255, 255, 0.4) 52%,
            rgba(0, 0, 0, 0.12) 60%,
            rgba(0, 0, 0, 0) 100%
          );
          animation: curlShadowFade 0.75s ease-in-out forwards;
        }

        .leaf-curl-highlight-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(
            -115deg,
            rgba(255, 255, 255, 0.6) 0%,
            rgba(255, 255, 255, 0.25) 25%,
            rgba(0, 0, 0, 0.2) 42%,
            rgba(0, 0, 0, 0.4) 50%,
            rgba(0, 0, 0, 0.05) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: curlHighlightFade 0.75s ease-in-out forwards;
        }

        @keyframes curlShadowFade {
          0% { opacity: 0; }
          45% { opacity: 0.95; }
          100% { opacity: 0; }
        }

        @keyframes curlHighlightFade {
          0% { opacity: 0; }
          55% { opacity: 0.9; }
          100% { opacity: 0; }
        }

        @keyframes pageTurnNext3D {
          0% {
            transform: rotateY(0deg) rotateZ(0deg) skewY(0deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          }
          25% {
            transform: rotateY(-45deg) rotateZ(-3deg) skewY(-2.5deg);
            box-shadow: -15px 10px 30px rgba(0,0,0,0.35);
          }
          50% {
            transform: rotateY(-90deg) rotateZ(-1deg) skewY(-1deg) scale(1.02);
            box-shadow: -35px 25px 60px rgba(0,0,0,0.65);
          }
          75% {
            transform: rotateY(-135deg) rotateZ(2.5deg) skewY(2deg);
            box-shadow: -15px 10px 30px rgba(0,0,0,0.35);
          }
          100% {
            transform: rotateY(-180deg) rotateZ(0deg) skewY(0deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          }
        }

        @keyframes pageTurnPrev3D {
          0% {
            transform: rotateY(0deg) rotateZ(0deg) skewY(0deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          }
          25% {
            transform: rotateY(45deg) rotateZ(3deg) skewY(2.5deg);
            box-shadow: 15px 10px 30px rgba(0,0,0,0.35);
          }
          50% {
            transform: rotateY(90deg) rotateZ(1deg) skewY(1deg) scale(1.02);
            box-shadow: 35px 25px 60px rgba(0,0,0,0.65);
          }
          75% {
            transform: rotateY(135deg) rotateZ(-2.5deg) skewY(-2deg);
            box-shadow: 15px 10px 30px rgba(0,0,0,0.35);
          }
          100% {
            transform: rotateY(180deg) rotateZ(0deg) skewY(0deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          }
        }

        /* Cover open / close transitions */
        .cover-flipping-open {
          animation: coverFlipOpen3D 0.75s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: left center;
        }

        @keyframes coverFlipOpen3D {
          0% {
            transform: rotateY(0deg) scale(1);
            opacity: 1;
          }
          50% {
            transform: rotateY(-70deg) scale(0.96);
            opacity: 0.85;
          }
          100% {
            transform: rotateY(-120deg) scale(0.9);
            opacity: 0;
          }
        }

        .spread-flipping-close {
          animation: spreadClose3D 0.75s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes spreadClose3D {
          0% {
            transform: rotateY(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: rotateY(20deg) scale(0.94);
            opacity: 0;
          }
        }

        /* ── Radiant Golden Pulse Animation for Next Arrow Button ── */
        @keyframes nextArrowPulseGlow {
          0% {
            box-shadow: 0 10px 30px rgba(0,0,0,0.9), 0 0 24px rgba(250, 204, 21, 0.75), inset 0 2px 6px rgba(255,255,255,0.9);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 14px 40px rgba(0,0,0,0.95), 0 0 45px rgba(250, 204, 21, 1), 0 0 75px rgba(245, 158, 11, 0.65), inset 0 2px 8px rgba(255,255,255,1);
            transform: scale(1.09);
          }
          100% {
            box-shadow: 0 10px 30px rgba(0,0,0,0.9), 0 0 24px rgba(250, 204, 21, 0.75), inset 0 2px 6px rgba(255,255,255,0.9);
            transform: scale(1);
          }
        }

        .pulsing-next-btn {
          animation: nextArrowPulseGlow 2.2s ease-in-out infinite;
        }

        .mobile-nostalgia-tray {
          display: none !important;
        }

        /* Responsive adjustments for mobile phones & small screens */
        @media (max-width: 860px) {
          .desktop-nostalgia-ribbon {
            display: none !important;
          }
          .floating-bg-photo {
            display: none !important;
          }
          .mobile-nostalgia-tray {
            display: block !important;
          }
          .mobile-nostalgia-scroll::-webkit-scrollbar {
            height: 5px;
          }
          .mobile-nostalgia-scroll::-webkit-scrollbar-thumb {
            background: rgba(212,175,55,0.45);
            border-radius: 4px;
          }
          .sketchbook-stage-frame {
            height: auto !important;
            min-height: 460px !important;
            padding: 0 10px 70px !important; /* Space for comfortable mobile bottom navigation! */
            position: relative !important;
          }
          .sketchbook-closed-cover {
            width: clamp(285px, 92vw, 360px) !important;
            max-width: calc(100vw - 20px) !important;
            height: clamp(430px, 58vh, 500px) !important;
            margin: 0 auto !important;
          }

          /* ── MOBILE NATURAL OPEN SPREAD: CRISP 1:1 FITS COMFORTABLY IN MOBILE VIEWPORT! ── */
          .sketchbook-open-spread {
            grid-template-columns: 1fr !important;
            width: clamp(285px, 92vw, 360px) !important;
            max-width: calc(100vw - 20px) !important;
            height: auto !important;
            min-height: clamp(410px, 56vh, 490px) !important;
            border-radius: 12px !important;
            margin: 0 auto !important;
            transform: none !important;
          }
          .sketchbook-open-spread.is-mobile-sub-both {
            min-height: auto !important;
            transform: none !important;
          }
          .sketchbook-open-spread.is-flipping-mobile {
            animation: mobilePageTurnPulse 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }
          @keyframes mobilePageTurnPulse {
            0% {
              opacity: 1;
              transform: translateY(0px);
            }
            40% {
              opacity: 0.4;
              transform: translateY(-4px);
              box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            100% {
              opacity: 1;
              transform: translateY(0px);
            }
          }
          .sketchbook-center-spiral {
            display: none !important;
          }
          .sketchbook-page-col {
            height: auto !important;
            min-height: clamp(400px, 54vh, 470px) !important;
            width: 100% !important;
          }
          .sketchbook-open-spread.is-mobile-sub-both .sketchbook-page-col {
            min-height: auto !important;
          }
          .sketchbook-page-col-left {
            border-radius: 12px !important;
            border-right: none !important;
          }
          .sketchbook-page-col-right {
            border-radius: 12px !important;
            border-left: none !important;
          }
          .sketchbook-page-left,
          .sketchbook-page-right {
            border-radius: 12px !important;
            padding: 12px 14px 10px !important;
            min-height: clamp(400px, 54vh, 470px) !important;
            box-sizing: border-box !important;
          }
          .sketchbook-open-spread.is-mobile-sub-both .sketchbook-page-col-left {
            border-radius: 12px 12px 0 0 !important;
            border-bottom: 2px dashed rgba(139,101,8,0.25) !important;
          }
          .sketchbook-open-spread.is-mobile-sub-both .sketchbook-page-col-right {
            border-radius: 0 0 12px 12px !important;
          }
          .sketchbook-open-spread.is-mobile-sub-both .sketchbook-page-left {
            border-radius: 12px 12px 0 0 !important;
            min-height: auto !important;
          }
          .sketchbook-open-spread.is-mobile-sub-both .sketchbook-page-right {
            border-radius: 0 0 12px 12px !important;
            min-height: auto !important;
          }

          /* Shrunk photo dimensions to comfortably fit on phone screens */
          .main-chapter-photo-frame {
            height: clamp(135px, 19vh, 165px) !important;
          }
          .secondary-chapter-photo-frame {
            width: clamp(76px, 19vw, 92px) !important;
            margin: 0 0 6px 8px !important;
          }
          .turning-page-leaf {
            display: none !important;
          }

          /* Floating Navigation Arrows - Positioned cleanly BELOW the book on mobile so they NEVER obscure story text! */
          .floating-nav-arrow {
            display: flex !important;
            position: absolute !important;
            top: auto !important;
            bottom: 8px !important;
            transform: none !important;
            z-index: 95 !important;
          }
          .floating-nav-next-wrap {
            right: 18px !important;
            left: auto !important;
          }
          .floating-nav-prev-wrap {
            left: 18px !important;
            right: auto !important;
          }
          .floating-nav-next {
            width: 50px !important;
            height: 50px !important;
          }
          .floating-nav-prev {
            width: 44px !important;
            height: 44px !important;
          }
          .nav-arrow-badge {
            font-size: 0.64rem !important;
            padding: 2px 8px !important;
            margin-top: 4px !important;
          }
        }

        @media (max-width: 480px) {
          .sketchbook-closed-cover {
            width: min(92vw, 350px) !important;
            height: clamp(410px, 56vh, 480px) !important;
          }
          .sketchbook-open-spread {
            width: min(92vw, 350px) !important;
            min-height: clamp(400px, 55vh, 470px) !important;
            transform: none !important;
          }
          .sketchbook-open-spread.is-mobile-sub-both {
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
