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
  const [showCursorPicker, setShowCursorPicker] = useState(false);

  const cursorHostRef = useRef<HTMLDivElement | null>(null);
  const trailCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable pointer physics state (bypasses React state completely to achieve 60-120fps hardware smoothness)
  const pointerStateRef = useRef({
    targetX: -200,
    targetY: -200,
    currentX: -200,
    currentY: -200,
    targetAngle: 0,
    currentAngle: 0,
    targetScale: 1,
    currentScale: 1,
    targetOpacity: 0,
    currentOpacity: 0,
    lastX: -200,
    lastY: -200,
    isTouch: false,
  });

  // Load saved cursor preference and listen for external changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem("divija_custom_cursor");
      if (saved) setCursorEmoji(saved);
    } catch {}

    const onCustomCursorChanged = (e: any) => {
      if (e.detail?.emoji) {
        setCursorEmoji(e.detail.emoji);
      }
    };
    const onOpenCursorPicker = () => {
      setShowCursorPicker(true);
    };

    window.addEventListener("divija-cursor-changed", onCustomCursorChanged);
    window.addEventListener("open-cursor-picker", onOpenCursorPicker);
    return () => {
      window.removeEventListener("divija-cursor-changed", onCustomCursorChanged);
      window.removeEventListener("open-cursor-picker", onOpenCursorPicker);
    };
  }, []);

  // ── 1. High-Performance Hardware-Accelerated Cursor Follower Loop ──
  useEffect(() => {
    let animId: number;
    let touchFadeTimer: NodeJS.Timeout | null = null;
    const state = pointerStateRef.current;

    const onMouseMove = (e: MouseEvent) => {
      const cx = e.clientX;
      const cy = e.clientY;
      const dx = cx - state.lastX;
      state.targetX = cx;
      state.targetY = cy;
      state.lastX = cx;
      state.lastY = cy;
      state.targetAngle = Math.max(-24, Math.min(24, dx * 1.4));
      state.targetOpacity = 1;
      state.isTouch = false;

      const target = e.target as HTMLElement | null;
      const overInteractive = !!target?.closest?.("button, .close-modal, [role='button'], a, input, textarea, select");
      state.targetScale = overInteractive ? 1.2 : 1;
    };

    const onMouseDown = () => {
      state.targetScale = 0.88;
    };

    const onMouseUp = () => {
      state.targetScale = 1;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (touchFadeTimer) clearTimeout(touchFadeTimer);
      if (e.touches.length > 0) {
        const t = e.touches[0];
        state.isTouch = true;
        // Float smoothly ~34px above touch point so finger doesn't obscure the butterfly
        const targetY = t.clientY - 34;
        state.targetX = t.clientX;
        state.targetY = targetY;
        if (state.currentOpacity < 0.1) {
          state.currentX = t.clientX;
          state.currentY = targetY;
        }
        state.lastX = t.clientX;
        state.lastY = targetY;
        state.targetAngle = 0;
        state.targetScale = 0.96;
        state.targetOpacity = 1;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchFadeTimer) clearTimeout(touchFadeTimer);
      if (e.touches.length > 0) {
        const t = e.touches[0];
        state.isTouch = true;
        const targetY = t.clientY - 34;
        const dx = t.clientX - state.lastX;
        state.targetX = t.clientX;
        state.targetY = targetY;
        state.lastX = t.clientX;
        state.lastY = targetY;
        state.targetAngle = Math.max(-24, Math.min(24, dx * 1.4));
        state.targetOpacity = 1;
      }
    };

    const onTouchEnd = () => {
      state.targetScale = 1;
      if (touchFadeTimer) clearTimeout(touchFadeTimer);
      // Keep follower visible during touch browsing, smoothly fade out 1.8s after touch release
      touchFadeTimer = setTimeout(() => {
        state.targetOpacity = 0;
      }, 1800);
    };

    const onTouchCancel = () => {
      state.targetOpacity = 0;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });

    // 60-120FPS RAF Loop (Direct DOM style updates with zero React VDOM overhead)
    const renderLoop = () => {
      // Lerp smoothing physics
      state.currentX += (state.targetX - state.currentX) * 0.45;
      state.currentY += (state.targetY - state.currentY) * 0.45;
      state.currentAngle += (state.targetAngle - state.currentAngle) * 0.3;
      state.currentScale += (state.targetScale - state.currentScale) * 0.25;
      state.currentOpacity += (state.targetOpacity - state.currentOpacity) * 0.2;

      const host = cursorHostRef.current;
      if (host) {
        if (state.currentOpacity > 0.02) {
          host.style.transform = `translate3d(${state.currentX}px, ${state.currentY}px, 0) translate(-50%, -50%) rotate(${state.currentAngle.toFixed(1)}deg) scale(${state.currentScale.toFixed(2)})`;
          host.style.opacity = state.currentOpacity.toFixed(3);
          host.style.visibility = "visible";
        } else {
          host.style.opacity = "0";
          host.style.visibility = "hidden";
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      if (touchFadeTimer) clearTimeout(touchFadeTimer);
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
    };
  }, []);

  // ── 2. Ultra-Smooth 60FPS Floating Hearts Trail (Mobile & Desktop Enabled) ──
  useEffect(() => {
    const canvas = trailCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Detect touch / small screen to optimize particle pool
    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth <= 768 || window.matchMedia("(hover: none) and (pointer: coarse)").matches);

    const maxParticles = isMobile ? 32 : 80;

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      // Cap scale on mobile to avoid high DPI raster fill bottlenecks
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

    // Pre-render GPU offscreen heart sprites (zero raster overhead during frame draw)
    const sprites: HTMLCanvasElement[] = colors.map((color) => {
      const off = document.createElement("canvas");
      const size = 56;
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
      oCtx.fill();

      // Delicate 3D shine
      oCtx.beginPath();
      oCtx.ellipse(-3.5 * s, -8 * s, 2.2 * s, 1.4 * s, -Math.PI / 4, 0, Math.PI * 2);
      oCtx.fillStyle = "rgba(255, 255, 255, 0.55)";
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
      const size = isBurst ? Math.random() * 8 + 12 : Math.random() * 7 + 10;
      const angle = isBurst ? Math.random() * Math.PI * 2 : (Math.random() - 0.5) * 0.7;
      const speed = isBurst ? Math.random() * 3 + 1.2 : Math.random() * 0.8 + 0.3;

      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        size,
        scale: 0.25,
        spriteIdx,
        vx: Math.cos(angle) * speed,
        vy: isBurst ? Math.sin(angle) * speed - 1.1 : -Math.random() * 1.3 - 0.7,
        rot: (Math.random() - 0.5) * 0.4,
        vRot: (Math.random() - 0.5) * 0.035,
        life: 0,
        maxLife: isBurst ? 36 + Math.random() * 20 : 44 + Math.random() * 24,
        swayFreq: Math.random() * 0.08 + 0.04,
        swayAmp: Math.random() * 1.1 + 0.4,
      });

      if (particles.length > maxParticles) particles.shift();
    }

    const handlePointerLocation = (cx: number, cy: number) => {
      if (lastX < 0) {
        lastX = cx;
        lastY = cy;
        spawnHeart(cx, cy);
        return;
      }

      const dist = Math.hypot(cx - lastX, cy - lastY);
      const step = isMobile ? 18 : 14;
      if (dist >= step) {
        const steps = Math.min(Math.floor(dist / step), isMobile ? 4 : 8);
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          spawnHeart(lastX + (cx - lastX) * t, lastY + (cy - lastY) * t);
        }
        lastX = cx;
        lastY = cy;
      }
    };

    const onPointerMove = (e: MouseEvent) => {
      handlePointerLocation(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        // Spawn hearts directly behind the floating butterfly
        handlePointerLocation(t.clientX, t.clientY - 26);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        handlePointerLocation(t.clientX, t.clientY - 26);
        for (let i = 0; i < 4; i++) spawnHeart(t.clientX, t.clientY - 26, true);
      }
    };

    const onClick = (e: MouseEvent) => {
      for (let i = 0; i < 6; i++) spawnHeart(e.clientX, e.clientY, true);
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("click", onClick, { passive: true });

    const render = () => {
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
          ctx.globalAlpha = Math.min(1, Math.max(0, (1 - progress) * 1.15));
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
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <>
      {/* ── 1. Full-Screen Floating Hearts Trail Canvas (60FPS GPU Sprite Render) ── */}
      <canvas
        ref={trailCanvasRef}
        className="global-trail-canvas"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          touchAction: "none",
          zIndex: 2147483646,
        }}
      />

      {/* ── 2. High-Definition Fluttering Pink Butterfly Cursor (Direct DOM GPU Compositing) ── */}
      <div
        ref={cursorHostRef}
        className="global-custom-cursor-host"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 2147483647,
          willChange: "transform, opacity",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          WebkitUserSelect: "none",
          visibility: "hidden",
          opacity: 0,
        }}
      >
        {cursorEmoji === "🦋" ? (
          <div
            style={{
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "globalButterflyFlutter 0.38s infinite ease-in-out",
              filter: "drop-shadow(0 2px 10px rgba(255, 42, 122, 0.75))",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              fontSize: "34px",
              filter: "drop-shadow(0 2px 10px rgba(255, 105, 180, 0.8))",
              lineHeight: 1,
            }}
          >
            {cursorEmoji}
          </span>
        )}

        {/* Soft Ambient Glow Halo */}
        <span
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255, 42, 122, 0.35) 0%, rgba(255, 209, 102, 0) 70%)",
            pointerEvents: "none",
            animation: "globalAuraPulse 1.8s infinite ease-in-out",
          }}
        />
      </div>

      {/* ── 3. Elegant Quick Cursor Selector Pill (Bottom-Left) ── */}
      <div
        className="global-cursor-picker-host"
        style={{
          position: "fixed",
          bottom: "16px",
          left: "16px",
          zIndex: 9999990,
          pointerEvents: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowCursorPicker((prev) => !prev);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowCursorPicker((prev) => !prev);
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
            minHeight: "44px",
            color: "#fff3cf",
            fontSize: "0.85rem",
            fontWeight: 800,
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.8), 0 0 16px rgba(255, 215, 0, 0.35)",
            transition: "all 0.25s ease",
            cursor: "pointer",
            touchAction: "manipulation",
            pointerEvents: "auto",
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
              padding: "14px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.95), 0 0 35px rgba(255, 215, 0, 0.4)",
              width: "min(280px, 86vw)",
              zIndex: 100001,
              touchAction: "manipulation",
            }}
          >
            {/* Header with Title and Large Glowing Close Button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "0.9rem",
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
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCursorPicker(false);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.16)",
                  border: "2px solid rgba(255, 215, 0, 0.8)",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  color: "#ffd700",
                  fontSize: "1.1rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  boxShadow: "0 0 14px rgba(255, 215, 0, 0.45)",
                  transition: "transform 0.15s ease",
                  touchAction: "manipulation",
                }}
                title="Close picker"
              >
                ✕
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "8px",
              }}
            >
              {TOP_GIRL_EMOJIS.map((item) => {
                const isSelected = cursorEmoji === item.emoji;
                const selectEmoji = () => {
                  setCursorEmoji(item.emoji);
                  try {
                    localStorage.setItem("divija_custom_cursor", item.emoji);
                  } catch {}
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("divija-cursor-changed", { detail: { emoji: item.emoji } }));
                  }
                  setShowCursorPicker(false);
                };
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    onClick={selectEmoji}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      selectEmoji();
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
                      borderRadius: "12px",
                      padding: "6px 2px",
                      minHeight: "42px",
                      fontSize: "1.4rem",
                      cursor: "pointer",
                      boxShadow: isSelected
                        ? "0 0 16px rgba(255, 215, 0, 0.5)"
                        : "none",
                      transition: "all 0.18s ease",
                      touchAction: "manipulation",
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
