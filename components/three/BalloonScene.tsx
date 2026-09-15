"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/* Smoothly aligns the Gala Spheres section dead-center in the viewport */
export function autoAlignGalaSpheres() {
  if (typeof window === "undefined") return;
  try {
    const sectionEl =
      document.getElementById("gala-spheres-section") ||
      document.querySelector(".game-section");
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  } catch {}
}

/* ──────────────────────────────────────────────────────────────
   Cinema Gala Spheres — Velvet Maroon, Champagne & Warm Gold
────────────────────────────────────────────────────────────── */
const SPHERE_DATA = [
  {
    icon: "👭",
    label: "Sister",
    color: "#d97589",
    glow: "#d9758933",
    wish: {
      from: "Sister 👭",
      text: "Happy Birthday to my favourite person in the whole world! Keep shining, mowa! Every single day I'm grateful you're my sister. 💖❤️",
    },
  },
  {
    icon: "💛",
    label: "Krushni",
    color: "#d4af37",
    glow: "#d4af3733",
    wish: {
      from: "Krushni 💛 Best Friend",
      text: "Happy Birthday Divija! From every laugh to every cry — I'm always your constant. No matter what, I'll be right beside you! 🥺💛",
    },
  },
  {
    icon: "🏠",
    label: "Roomies",
    color: "#e59b2b",
    glow: "#e59b2b33",
    wish: {
      from: "Sai Prathima & Bhavana 🏠",
      text: "Happy Birthday Divija! The room feels magical because of you. Our memories together will last a lifetime! 🎉💕",
    },
  },
  {
    icon: "🩺",
    label: "KMC Friends",
    color: "#c59b27",
    glow: "#c59b2733",
    wish: {
      from: "KMC Batchmates 🩺",
      text: "Happy Birthday Divija! The wards feel brighter with you in them. Here's to becoming the most incredible doctor! 🏥🌟",
    },
  },
  {
    icon: "✨",
    label: "Universe",
    color: "#f3e5ab",
    glow: "#f3e5ab33",
    wish: {
      from: "The Universe ✨",
      text: "You came, you shone, and you made 23 look absolutely radiant. May this year bring everything your heart quietly wishes for. 🌅🌿",
    },
  },
  {
    icon: "🎬",
    label: "Telugu Cinema",
    color: "#8b1528",
    glow: "#8b152833",
    wish: {
      from: "Your Telugu Cinema Soul 🎬",
      text: "May every re-release feel like a first watch. May every classic melody play at exactly the right moment. Your story is the best film ever made! 🎶🌟",
    },
  },
  {
    icon: "🌸",
    label: "Telangana",
    color: "#e6a135",
    glow: "#e6a13533",
    wish: {
      from: "Telangana & Home 🌸",
      text: "From marigold mornings to moonlit nights — Warangal, your roots, your family, all cheer for you today. Come home victorious, Divija! 🏡💚",
    },
  },
];

/* Floating positions on desktop */
const SPHERE_POSITIONS_DESKTOP = [
  { left: "9%",  top: "54%", animDelay: "0s",    animDur: "5.5s",  size: 88 },
  { left: "23%", top: "24%", animDelay: "0.7s",  animDur: "6.2s",  size: 78 },
  { left: "37%", top: "62%", animDelay: "1.3s",  animDur: "5.0s",  size: 94 },
  { left: "53%", top: "20%", animDelay: "0.4s",  animDur: "6.8s",  size: 82 },
  { left: "67%", top: "58%", animDelay: "1.8s",  animDur: "5.3s",  size: 88 },
  { left: "80%", top: "26%", animDelay: "0.9s",  animDur: "7.0s",  size: 76 },
  { left: "91%", top: "60%", animDelay: "2.1s",  animDur: "5.8s",  size: 84 },
];

/* Floating positions on mobile (balanced 3-tier constellation so spheres NEVER collide or clip) */
const SPHERE_POSITIONS_MOBILE = [
  { left: "22%", top: "22%", animDelay: "0s",    animDur: "5.5s",  size: 68 },
  { left: "50%", top: "16%", animDelay: "0.7s",  animDur: "6.2s",  size: 72 },
  { left: "78%", top: "24%", animDelay: "1.3s",  animDur: "5.0s",  size: 68 },
  { left: "34%", top: "48%", animDelay: "0.4s",  animDur: "6.8s",  size: 74 },
  { left: "68%", top: "46%", animDelay: "1.8s",  animDur: "5.3s",  size: 72 },
  { left: "24%", top: "76%", animDelay: "0.9s",  animDur: "7.0s",  size: 70 },
  { left: "76%", top: "74%", animDelay: "2.1s",  animDur: "5.8s",  size: 70 },
];

/* Burst particles for pop */
function BurstParticles({ color }: { color: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: 8, height: 8,
            borderRadius: "50%",
            background: color,
            transform: "translate(-50%, -50%)",
            animation: `burst-${i % 4} 0.5s ease-out forwards`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      ))}
    </div>
  );
}

/* Individual Sphere */
function Sphere({
  data, pos, onPop, popped,
}: {
  data: typeof SPHERE_DATA[0];
  pos: { left: string; top: string; animDelay: string; animDur: string; size: number };
  onPop: () => void;
  popped: boolean;
}) {
  const [bursting, setBursting] = useState(false);

  function handleTap() {
    if (popped || bursting) return;
    // Align screen smoothly into the center of the viewport immediately
    autoAlignGalaSpheres();
    setBursting(true);
    setTimeout(() => {
      onPop();
    }, 280);
  }

  if (popped && !bursting) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        transform: "translate(-50%, -50%)",
        width: pos.size,
        height: pos.size,
        cursor: "pointer",
        animation: bursting
          ? `pop-burst 0.35s cubic-bezier(0.4,0,0.6,1) forwards`
          : `float ${pos.animDur} ${pos.animDelay} ease-in-out infinite alternate`,
        zIndex: 5,
        userSelect: "none",
        touchAction: "manipulation",
      }}
      onClick={handleTap}
      onPointerDown={e => {
        if (!popped && !bursting) {
          handleTap();
        }
      }}
    >
      {/* Glass sphere body */}
      <div style={{
        width: "100%", height: "100%",
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, ${data.color}ff 0%, ${data.color}bb 45%, ${data.color}44 100%)`,
        boxShadow: `0 0 ${pos.size * 0.5}px ${data.color}55, inset 0 -6px 20px rgba(0,0,0,0.35), inset 0 6px 15px rgba(255,255,255,0.35)`,
        border: `1.5px solid rgba(212, 175, 55, 0.45)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        backdropFilter: "blur(2px)",
        transition: "transform 0.15s ease",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glass sheen */}
        <div style={{
          position: "absolute",
          top: "10%", left: "20%",
          width: "35%", height: "28%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.45)",
          transform: "rotate(-25deg)",
          pointerEvents: "none",
        }} />
        {/* Icon */}
        <span style={{ fontSize: pos.size * 0.3, lineHeight: 1, filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.5))" }}>
          {data.icon}
        </span>
        {/* Label */}
        <span style={{
          fontSize: pos.size * 0.115,
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          color: "#fff",
          textShadow: "0 1px 4px rgba(0,0,0,0.7)",
          letterSpacing: "0.02em",
          textAlign: "center",
          padding: "0 6px",
          lineHeight: 1.1,
        }}>
          {data.label}
        </span>
      </div>

      {bursting && <BurstParticles color={data.color} />}
    </div>
  );
}

/* Wish Modal (Mounted directly to document.body so it is ALWAYS 100% centered in viewport) */
function WishModal({ data, onClose }: { data: typeof SPHERE_DATA[0]; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(6, 2, 5, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        padding: "16px",
        animation: "fadeIn 0.25s ease forwards",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(145deg, #1f0b17 0%, #0d040a 100%)",
          border: "1.5px solid rgba(212, 175, 55, 0.5)",
          borderRadius: 24,
          padding: "clamp(24px, 5vw, 36px) clamp(18px, 4vw, 30px) clamp(20px, 4vw, 26px)",
          maxWidth: 440,
          width: "100%",
          boxShadow: `0 0 70px rgba(107, 20, 34, 0.5), 0 0 40px ${data.color}55, 0 30px 70px rgba(0,0,0,0.85)`,
          position: "relative",
          animation: "cardIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
          textAlign: "center",
        }}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14,
            background: "linear-gradient(135deg, rgba(58, 12, 28, 0.96) 0%, rgba(22, 5, 14, 0.98) 100%)",
            border: "2px solid #ffd700",
            borderRadius: "50%", width: 46, height: 46,
            minWidth: 46, minHeight: 46,
            color: "#ffd700", fontSize: "1.45rem", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.9), 0 0 16px rgba(255, 215, 0, 0.5)",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
            zIndex: 10,
            touchAction: "manipulation",
          }}
        >×</button>

        {/* Glow ring icon */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: `radial-gradient(circle, ${data.color}33 0%, transparent 70%)`,
          border: `2px solid ${data.color}88`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.2rem",
          margin: "0 auto 1.2rem",
          boxShadow: `0 0 30px ${data.color}55`,
          animation: "pulseGlow 2s ease-in-out infinite",
        }}>
          {data.icon}
        </div>

        {/* From label */}
        <div style={{
          color: data.color,
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700, fontSize: "1.15rem",
          marginBottom: "1rem",
          letterSpacing: "0.03em",
          textShadow: "0 0 15px rgba(212, 175, 55, 0.3)",
        }}>
          {data.wish.from}
        </div>

        {/* Wish text */}
        <p style={{
          fontFamily: "'Caveat', cursive",
          fontSize: "1.52rem",
          color: "#f8f3e6",
          lineHeight: 1.65,
          margin: 0,
          fontWeight: 600,
        }}>
          {data.wish.text}
        </p>

        {/* Footer */}
        <div style={{
          marginTop: "1.6rem",
          paddingTop: "1rem",
          borderTop: "1px solid rgba(212, 175, 55, 0.15)",
          color: "rgba(213, 199, 184, 0.6)",
          fontSize: "0.8rem",
          letterSpacing: "0.05em",
        }}>
          ✦ Tap anywhere to close ✦
        </div>
      </div>
    </div>,
    document.body
  );
}

/* Main Export */
export default function BalloonScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [popped, setPopped] = useState<boolean[]>(Array(SPHERE_DATA.length).fill(false));
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const allPopped = popped.every(Boolean);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activePositions = isMobile ? SPHERE_POSITIONS_MOBILE : SPHERE_POSITIONS_DESKTOP;

  function handlePop(i: number) {
    // Automatically smooth-align the section in the center of the viewport
    autoAlignGalaSpheres();
    setPopped(prev => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
    setOpenIdx(i);
  }

  function handleCloseModal() {
    setOpenIdx(null);
    autoAlignGalaSpheres();
  }

  function resetAll() {
    autoAlignGalaSpheres();
    setPopped(Array(SPHERE_DATA.length).fill(false));
    setOpenIdx(null);
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Theatrical Vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        background: "radial-gradient(circle at center, transparent 45%, rgba(8, 3, 5, 0.6) 100%)",
      }} />

      {/* Instruction */}
      <div style={{
        position: "absolute", top: 16, left: 0, right: 0, zIndex: 10,
        textAlign: "center", color: "#d4af37",
        fontFamily: "'Outfit', sans-serif", fontSize: "0.82rem",
        fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
        opacity: allPopped ? 0 : 0.85,
        textShadow: "0 0 15px rgba(212, 175, 55, 0.4)",
        transition: "opacity 0.4s ease",
      }}>
        ✦ Tap the Gala Spheres to Reveal Blessings ✦
      </div>

      {/* Progress dots */}
      <div style={{
        position: "absolute", bottom: 16, left: 0, right: 0, zIndex: 10,
        display: "flex", justifyContent: "center", gap: 10,
      }}>
        {SPHERE_DATA.map((s, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: "50%",
            background: popped[i] ? s.color : "rgba(212, 175, 55, 0.2)",
            boxShadow: popped[i] ? `0 0 10px ${s.color}` : "none",
            transition: "all 0.3s ease",
          }} />
        ))}
      </div>

      {/* Spheres with responsive positions */}
      {SPHERE_DATA.map((s, i) => (
        <Sphere
          key={i}
          data={s}
          pos={activePositions[i]}
          popped={popped[i]}
          onPop={() => handlePop(i)}
        />
      ))}

      {/* All popped celebration */}
      {allPopped && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 8,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(8,3,5,0.75)", backdropFilter: "blur(6px)",
          animation: "fadeIn 0.4s ease forwards",
          gap: "1rem",
        }}>
          <div style={{ fontSize: "3.2rem", filter: "drop-shadow(0 0 20px rgba(212, 175, 55, 0.5))" }}>👑</div>
          <div style={{
            color: "#f3e5ab", fontFamily: "'Playfair Display', serif",
            fontSize: "1.5rem", fontWeight: 700, textAlign: "center",
            textShadow: "0 0 25px rgba(212, 175, 55, 0.5)",
          }}>
            All Gala Blessings Revealed!
          </div>
          <button
            type="button"
            onClick={resetAll}
            style={{
              marginTop: 8, padding: "10px 30px",
              background: "rgba(107, 20, 34, 0.4)",
              border: "1px solid rgba(212, 175, 55, 0.5)",
              borderRadius: 50, color: "#f3e5ab",
              fontFamily: "'Outfit', sans-serif", fontWeight: 700,
              fontSize: "0.9rem", cursor: "pointer",
              boxShadow: "0 0 20px rgba(107, 20, 34, 0.4)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(107, 20, 34, 0.7)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(212, 175, 55, 0.4)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(107, 20, 34, 0.4)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(107, 20, 34, 0.4)";
            }}
          >
            ↺ Replay Gala Spheres
          </button>
        </div>
      )}

      {/* Wish Modal */}
      {openIdx !== null && (
        <WishModal data={SPHERE_DATA[openIdx]} onClose={handleCloseModal} />
      )}

      <style>{`
        @keyframes float {
          0%   { transform: translate(-50%, -50%) translateY(0px) rotate(-1deg); }
          100% { transform: translate(-50%, -50%) translateY(-18px) rotate(1deg); }
        }
        @keyframes pop-burst {
          0%   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
          50%  { transform: translate(-50%, -50%) scale(1.5); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(0);   opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px currentColor; }
          50%       { box-shadow: 0 0 40px currentColor; }
        }
      `}</style>
    </div>
  );
}
