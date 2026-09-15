"use client";

import { useEffect, useRef, useState } from "react";

// Top 10 Girl Aesthetic Emojis
export const TOP_GIRL_EMOJIS = [
  { emoji: "🦋", name: "Pink Butterfly", desc: "Fluttering luxury pink butterfly (Default)" },
  { emoji: "💖", name: "Sparkling Heart", desc: "Glittering love & celebration" },
  { emoji: "🌸", name: "Cherry Blossom", desc: "Delicate spring blossom" },
  { emoji: "👑", name: "Royal Crown", desc: "For Princess Divija" },
  { emoji: "✨", name: "Magic Sparkles", desc: "Celestial starlight" },
  { emoji: "🌷", name: "Soft Tulip", desc: "Elegant floral grace" },
  { emoji: "🧸", name: "Cute Teddy", desc: "Warm cozy hugs" },
  { emoji: "🎀", name: "Coquette Ribbon", desc: "Luxury silk bow" },
  { emoji: "🌙", name: "Crescent Moon", desc: "Dreamy midnight serenity" },
  { emoji: "🍓", name: "Sweet Strawberry", desc: "Playful pastel berry" },
];

export default function GlobalButterflyTheme() {
  const [cursorEmoji, setCursorEmoji] = useState("🦋");
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorAngle, setCursorAngle] = useState(0);
  const [isClicking, setIsClicking] = useState(false);
  const [hasPointerMoved, setHasPointerMoved] = useState(false);
  const [showCursorPicker, setShowCursorPicker] = useState(false);
  const [showCursorHint, setShowCursorHint] = useState(true);
  const [isOverInteractive, setIsOverInteractive] = useState(false);

  const lastPointerRef = useRef({ x: -100, y: -100 });
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load saved cursor preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("divija_custom_cursor");
      if (saved) setCursorEmoji(saved);
    } catch {}
  }, []);

  // ── Global Pointer Tracker ──
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setHasPointerMoved(true);
      const dx = e.clientX - lastPointerRef.current.x;
      const tilt = Math.max(-22, Math.min(22, dx * 1.5));
      setCursorAngle(tilt);
      setCursorPos({ x: e.clientX, y: e.clientY });
      lastPointerRef.current = { x: e.clientX, y: e.clientY };

      const target = e.target as HTMLElement | null;
      const overInteractive = !!target?.closest?.("button, .close-modal, [role='button'], a, input, textarea, select");
      setIsOverInteractive(overInteractive);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setHasPointerMoved(true);
        const t = e.touches[0];
        const dx = t.clientX - lastPointerRef.current.x;
        const tilt = Math.max(-22, Math.min(22, dx * 1.5));
        setCursorAngle(tilt);
        setCursorPos({ x: t.clientX, y: t.clientY });
        lastPointerRef.current = { x: t.clientX, y: t.clientY };
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchMove);
    };
  }, []);

  // ── Ultra-Smooth 60FPS Hardware-Accelerated Floating Hearts Trail ──
  useEffect(() => {
    const canvas = trailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const colors = [
      "#ff2d60", // Vivid Rose Red
      "#ff6699", // Pastel Bubblegum
      "#ff33cc", // Neon Magenta
      "#ff80bf", // Soft Fairy Pink
      "#ff4d94", // Glamour Pink
      "#ffd700", // Imperial Gold
      "#ff69b4", // Romantic Pink
      "#c084fc", // Whimsical Violet
    ];

    // Pre-render GPU offscreen heart sprites
    const sprites: HTMLCanvasElement[] = colors.map((color) => {
      const off = document.createElement("canvas");
      const size = 64;
      off.width = size;
      off.height = size;
      const oCtx = off.getContext("2d");
      if (!oCtx) return off;

      const s = size / 28;
      oCtx.save();
      oCtx.translate(size / 2, size / 2);
      oCtx.beginPath();
      oCtx.moveTo(0, 6 * s);
      oCtx.bezierCurveTo(0, 2.5 * s, -10 * s, -2 * s, -10 * s, -7.5 * s);
      oCtx.bezierCurveTo(-10 * s, -13 * s, -2 * s, -13 * s, 0, -7 * s);
      oCtx.bezierCurveTo(2 * s, -13 * s, 10 * s, -13 * s, 10 * s, -7.5 * s);
      oCtx.bezierCurveTo(10 * s, -2 * s, 0, 2.5 * s, 0, 6 * s);
      oCtx.closePath();
      oCtx.fillStyle = color;
      oCtx.shadowColor = "rgba(255, 105, 180, 0.55)";
      oCtx.shadowBlur = 8;
      oCtx.fill();

      // Soft 3D top shine
      oCtx.beginPath();
      oCtx.ellipse(-3.5 * s, -8 * s, 2.2 * s, 1.4 * s, -Math.PI / 4, 0, Math.PI * 2);
      oCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
      oCtx.shadowBlur = 0;
      oCtx.fill();

      oCtx.restore();
      return off;
    });

    interface Particle {
      x: number;
      y: number;
      size: number;
      scale: number;
      spriteIdx: number;
      vx: number;
      vy: number;
      rot: number;
      vRot: number;
      life: number;
      maxLife: number;
      swayFreq: number;
      swayAmp: number;
    }

    const particles: Particle[] = [];
    let lastX = -100;
    let lastY = -100;

    function spawnHeart(x: number, y: number, isBurst = false) {
      const spriteIdx = Math.floor(Math.random() * sprites.length);
      const size = isBurst ? Math.random() * 10 + 14 : Math.random() * 8 + 12;
      const angle = isBurst ? Math.random() * Math.PI * 2 : (Math.random() - 0.5) * 0.7;
      const speed = isBurst ? Math.random() * 3.5 + 1.2 : Math.random() * 0.8 + 0.3;

      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        size,
        scale: 0.25,
        spriteIdx,
        vx: Math.cos(angle) * speed,
        vy: isBurst ? Math.sin(angle) * speed - 1.2 : -Math.random() * 1.5 - 0.9,
        rot: (Math.random() - 0.5) * 0.4,
        vRot: (Math.random() - 0.5) * 0.035,
        life: 0,
        maxLife: isBurst ? 45 + Math.random() * 25 : 55 + Math.random() * 30,
        swayFreq: Math.random() * 0.08 + 0.04,
        swayAmp: Math.random() * 1.2 + 0.5,
      });

      if (particles.length > 90) particles.shift();
    }

    const onPointerMove = (e: MouseEvent) => {
      const cx = e.clientX;
      const cy = e.clientY;
      if (lastX < 0) {
        lastX = cx;
        lastY = cy;
        spawnHeart(cx, cy);
        return;
      }

      const dist = Math.hypot(cx - lastX, cy - lastY);
      const step = 14; // Seamless interpolation spacing
      if (dist >= step) {
        const steps = Math.min(Math.floor(dist / step), 8);
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          spawnHeart(lastX + (cx - lastX) * t, lastY + (cy - lastY) * t);
        }
        lastX = cx;
        lastY = cy;
      }
    };

    const onClick = (e: MouseEvent) => {
      for (let i = 0; i < 8; i++) spawnHeart(e.clientX, e.clientY, true);
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("click", onClick, { passive: true });

    let tFrame = 0;
    const render = () => {
      tFrame++;
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        const progress = p.life / p.maxLife;
        if (progress < 0.25) {
          p.scale = 0.25 + (progress / 0.25) * 0.75;
        } else if (progress > 0.65) {
          p.scale = Math.max(0, 1 - (progress - 0.65) / 0.35);
        } else {
          p.scale = 1;
        }

        const sway = Math.sin(p.life * p.swayFreq) * p.swayAmp;
        p.x += p.vx + sway;
        p.y += p.vy;
        p.rot += p.vRot;

        const sprite = sprites[p.spriteIdx];
        if (sprite && p.scale > 0.05) {
          const drawSize = p.size * p.scale;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = Math.min(1, Math.max(0, (1 - progress) * 1.2));
          ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      {/* ── Global CSS: Ensure Visible and Interactive Cursors ── */}
      <style jsx global>{`
        /* Keep cursor 100% visible and responsive on all desktop and laptop screens */
        html,
        body {
          cursor: default;
        }

        button,
        a,
        [role="button"],
        input[type="button"],
        input[type="submit"],
        .numpad-key {
          cursor: pointer !important;
        }

        input[type="text"],
        input[type="tel"],
        input[type="password"],
        textarea {
          cursor: text !important;
        }

        /* On mobile touch devices, hide artificial cursor & floating picker so they never obstruct reading or touch targets */
        @media (hover: none) and (pointer: coarse), (max-width: 768px) {
          .global-custom-cursor-host,
          .global-cursor-picker-host {
            display: none !important;
          }
        }

        @keyframes globalButterflyFlutter {
          0%,
          100% {
            transform: scale(1) rotateY(0deg);
          }
          50% {
            transform: scale(0.88, 1.05) rotateY(42deg);
          }
        }

        @keyframes globalAuraPulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0.45;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0.85;
          }
        }
      `}</style>

      {/* ── 1. Full-Screen Floating Hearts Trail Canvas ── */}
      <canvas
        ref={trailCanvasRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 2147483646,
        }}
      />

      {/* ── 2. High-Definition Fluttering Pink Butterfly Cursor Companion ── */}
      {hasPointerMoved && (
        <div
          className="global-custom-cursor-host"
          style={{
            position: "fixed",
            left: cursorPos.x + 8,
            top: cursorPos.y + 8,
            pointerEvents: "none",
            zIndex: 2147483647,
            transform: `rotate(${cursorAngle}deg) scale(${isClicking ? 1.15 : (isOverInteractive ? 1.08 : 1)})`,
            opacity: 1,
            transition: "transform 0.08s ease-out, opacity 0.15s ease",
            willChange: "transform, left, top, opacity",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cursorEmoji === "🦋" ? (
            <div
              style={{
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "globalButterflyFlutter 0.38s infinite ease-in-out",
                filter:
                  "drop-shadow(0 0 10px rgba(255, 42, 122, 0.75)) drop-shadow(0 0 20px rgba(255, 160, 205, 0.5))",
              }}
            >
              <svg width="50" height="50" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="globalPinkWingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff2a7a" />
                    <stop offset="45%" stopColor="#ff529a" />
                    <stop offset="100%" stopColor="#ffa0cd" />
                  </linearGradient>
                  <linearGradient id="globalPinkWingGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e91e63" />
                    <stop offset="60%" stopColor="#ff4081" />
                    <stop offset="100%" stopColor="#ffa0cd" />
                  </linearGradient>
                </defs>
                {/* Left Top Wing */}
                <path d="M24 22 C22 13, 9 5, 3 13 C-2 20, 5 30, 24 26 Z" fill="url(#globalPinkWingGrad1)" opacity="0.96" />
                {/* Left Bottom Wing */}
                <path d="M24 26 C19 33, 10 39, 6 35 C2 30, 9 24, 24 24 Z" fill="url(#globalPinkWingGrad2)" opacity="0.92" />
                {/* Right Top Wing */}
                <path d="M24 22 C26 13, 39 5, 45 13 C50 20, 43 30, 24 26 Z" fill="url(#globalPinkWingGrad1)" opacity="0.96" />
                {/* Right Bottom Wing */}
                <path d="M24 26 C29 33, 38 39, 42 35 C46 30, 39 24, 24 24 Z" fill="url(#globalPinkWingGrad2)" opacity="0.92" />
                {/* Center Golden Body & Antennae */}
                <ellipse cx="24" cy="24" rx="2.2" ry="9" fill="#ffd700" />
                <path d="M23 16 Q20 9 15 7" stroke="#ffd700" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="14.5" cy="6.5" r="1.5" fill="#ffffff" />
                <path d="M25 16 Q28 9 33 7" stroke="#ffd700" strokeWidth="1.6" strokeLinecap="round" />
                <circle cx="33.5" cy="6.5" r="1.5" fill="#ffffff" />
              </svg>
            </div>
          ) : (
            <span
              style={{
                fontSize: "36px",
                filter: "drop-shadow(0 0 12px rgba(255, 105, 180, 0.8))",
                lineHeight: 1,
              }}
            >
              {cursorEmoji}
            </span>
          )}

          {/* Soft Pulsing Ambient Glow Halo */}
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255, 42, 122, 0.4) 0%, rgba(255, 209, 102, 0) 70%)",
              pointerEvents: "none",
              animation: "globalAuraPulse 1.8s infinite ease-in-out",
            }}
          />
        </div>
      )}

      {/* ── 4. Elegant Quick Cursor Selector Pill (Bottom-Left) ── */}
      <div
        className="global-cursor-picker-host"
        style={{
          position: "fixed",
          bottom: "16px",
          left: "16px",
          zIndex: 99999,
          pointerEvents: "auto",
        }}
      >
        {/* Floating Helpful Callout Message For New Visitors */}
        {showCursorHint && !showCursorPicker && (
          <div
            style={{
              position: "absolute",
              bottom: "54px",
              left: "0",
              background: "linear-gradient(135deg, rgba(38, 9, 21, 0.96) 0%, rgba(18, 4, 12, 0.98) 100%)",
              border: "1.5px solid rgba(255, 215, 0, 0.85)",
              borderRadius: "18px",
              padding: "8px 14px",
              boxShadow: "0 10px 32px rgba(0, 0, 0, 0.9), 0 0 20px rgba(212, 175, 55, 0.45)",
              color: "#fff3cf",
              fontSize: "0.78rem",
              fontFamily: "'Outfit', sans-serif",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              zIndex: 100000,
            }}
          >
            <span style={{ fontSize: "1rem" }}>🪄</span>
            <span>
              <strong>Magic Cursor:</strong> Tap here to pick your favorite emoji follower!
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowCursorHint(false);
              }}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "50%",
                color: "#ffd700",
                width: "20px",
                height: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                lineHeight: 1,
              }}
              title="Dismiss tip"
            >
              ✕
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setShowCursorPicker((prev) => !prev);
            setShowCursorHint(false);
          }}
          title="Change Custom Butterfly/Emoji Cursor"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "linear-gradient(135deg, rgba(32, 8, 20, 0.94) 0%, rgba(16, 4, 10, 0.98) 100%)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1.5px solid rgba(255, 215, 0, 0.75)",
            borderRadius: "30px",
            padding: "8px 18px",
            color: "#fff3cf",
            fontSize: "0.85rem",
            fontWeight: 800,
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.8), 0 0 16px rgba(255, 215, 0, 0.35)",
            transition: "all 0.25s ease",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "1.15rem" }}>🪄</span>
          <span style={{ color: "#ffd700", letterSpacing: "0.2px" }}>Cursor:</span>
          <span style={{ fontSize: "1.3rem", filter: "drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))" }}>
            {cursorEmoji}
          </span>
          <span
            style={{
              fontSize: "0.76rem",
              color: "#ffd700",
              background: "rgba(212, 175, 55, 0.2)",
              borderRadius: "10px",
              padding: "2px 8px",
              fontWeight: 700,
            }}
          >
            {showCursorPicker ? "Close ▴" : "Change ▾"}
          </span>
        </button>

        {showCursorPicker && (
          <div
            style={{
              position: "absolute",
              bottom: "54px",
              left: "0",
              background: "linear-gradient(165deg, #240818 0%, #12030d 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "2px solid #ffd700",
              borderRadius: "22px",
              padding: "16px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 215, 0, 0.4)",
              width: "290px",
              zIndex: 100001,
            }}
          >
            {/* Header with Title and Large Glowing Close Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  color: "#ffd700",
                  letterSpacing: "0.3px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>🪄</span>
                <span>Choose Magic Cursor</span>
              </div>
              <button
                type="button"
                onClick={() => setShowCursorPicker(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.16)",
                  border: "2px solid rgba(255, 215, 0, 0.8)",
                  borderRadius: "50%",
                  width: "38px",
                  height: "38px",
                  color: "#ffd700",
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  boxShadow: "0 0 14px rgba(255, 215, 0, 0.45)",
                  transition: "transform 0.15s ease",
                }}
                title="Close picker"
              >
                ✕
              </button>
            </div>

            <p
              style={{
                margin: "0 0 12px",
                fontSize: "0.74rem",
                color: "rgba(251, 207, 232, 0.9)",
                lineHeight: 1.4,
              }}
            >
              Tap an emoji below — it will fly &amp; sparkle with your touch and mouse everywhere!
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "8px",
              }}
            >
              {TOP_GIRL_EMOJIS.map((item) => {
                const isSelected = cursorEmoji === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={() => {
                      setCursorEmoji(item.emoji);
                      try {
                        localStorage.setItem("divija_custom_cursor", item.emoji);
                      } catch {}
                      setShowCursorPicker(false);
                    }}
                    title={`${item.name} · ${item.desc}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(255, 42, 122, 0.45) 0%, rgba(212, 175, 55, 0.4) 100%)"
                        : "rgba(255, 255, 255, 0.06)",
                      border: isSelected
                        ? "2px solid #ffd700"
                        : "1px solid rgba(255, 255, 255, 0.14)",
                      borderRadius: "14px",
                      padding: "8px 2px",
                      fontSize: "1.45rem",
                      cursor: "pointer",
                      boxShadow: isSelected
                        ? "0 0 16px rgba(255, 215, 0, 0.5)"
                        : "none",
                      transition: "all 0.18s ease",
                    }}
                  >
                    <span>{item.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
