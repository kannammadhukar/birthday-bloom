"use client";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import photoDataset, { PhotoItem } from "@/content/photos";
import { ribbonPathData } from "@/content/ribbonPath";
import { smoothAlign } from "@/lib/autoAlign";
import PhotoZoomModal from "@/components/PhotoZoomModal";
import MobileMemoryReel from "@/components/MobileMemoryReel";

// Number of photos placed along the ribbon loop
const PHOTO_COUNT = 22;

export default function MemoryReel() {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [closingIdx, setClosingIdx] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null);
  const [zoomPhoto, setZoomPhoto] = useState<PhotoItem | null>(null);
  const [showRuleOfThirds, setShowRuleOfThirds] = useState<boolean>(false);
  const [depthModeEnabled, setDepthModeEnabled] = useState<boolean>(true);
  const [marqueeUserPaused, setMarqueeUserPaused] = useState(false);
  const [isMarqueeHovered, setIsMarqueeHovered] = useState(false);
  const [marqueeKey, setMarqueeKey] = useState(0);
  const [isStillMode, setIsStillMode] = useState(false);

  const isPaused = activeIdx !== null || closingIdx !== null;

  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerDownTimeRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth <= 860);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 60fps continuous buttery-smooth ribbon drift
  useEffect(() => {
    if (!mounted) return;
    let running = true;
    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      if (!isPaused) {
        // Drifts through the full ribbon circuit smoothly in ~44 seconds
        setProgress((prev) => (prev + dt * 0.0227) % 1);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [mounted, isPaused]);

  // Open photo with smooth expansion
  const handleOpen = useCallback((cardId: number, photo: PhotoItem) => {
    smoothAlign("#memory-reel-section");
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setClosingIdx(null);
    setActiveIdx(cardId);
    setActivePhoto(photo);
  }, []);

  // Close photo with smooth return transition
  const handleClose = useCallback(() => {
    smoothAlign("#memory-reel-section");
    setActiveIdx((curr) => {
      if (curr === null) return null;
      setClosingIdx(curr);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setClosingIdx(null);
        setActivePhoto(null);
      }, 380);
      return null;
    });
  }, []);

  // Global release listener
  useEffect(() => {
    const onUp = () => {
      const elapsed = performance.now() - pointerDownTimeRef.current;
      // If user was holding down (> 220ms), release upon letting go
      if (elapsed > 220 && activeIdx !== null) {
        handleClose();
      }
    };
    const onVis = () => {
      if (document.hidden) handleClose();
    };

    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [activeIdx, handleClose]);

  // Interpolate position and continuous unwrapped angle from precomputed uniform data
  const samplePath = useCallback((t: number) => {
    const ct = ((t % 1) + 1) % 1;
    const len = ribbonPathData.length;
    const idx = ct * (len - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, len - 1);
    const alpha = idx - i0;

    const p0 = ribbonPathData[i0];
    const p1 = ribbonPathData[i1];

    const x = p0[0] + alpha * (p1[0] - p0[0]);
    const y = p0[1] + alpha * (p1[1] - p0[1]);
    // Continuous tangent angle: completes full loop and emerges upright on the next line!
    const angle = p0[2] + alpha * (p1[2] - p0[2]);

    return { x, y, angle };
  }, []);

  // Compute positioned photos along the ribbon (12 cards on mobile for breathing room, 22 on desktop)
  const effectiveCount = isMobile ? 12 : PHOTO_COUNT;
  const cards = useMemo(() => {
    return Array.from({ length: effectiveCount }, (_, i) => {
      const rawT = progress + i / effectiveCount;
      const t = rawT % 1;
      const lap = Math.floor(rawT);
      const photoIdx = (lap * effectiveCount + i) % photoDataset.length;
      const photo = photoDataset[photoIdx] || photoDataset[0];
      const { x, y, angle } = samplePath(t);

      // When pressed/hovered, find the nearest upright angle (multiple of 360) so it turns
      // straight upright via the shortest smooth path, even if it was upside down at the apex!
      const uprightAngle = Math.round(angle / 360) * 360;

      // ── Right-Side Cinema Spotlight Zone (Rule of Thirds 2/3 Line at x ≈ 67%, y ≈ 66.6%) ──
      // Point index 231 corresponds to x ≈ 938px (67% of 1400), y ≈ 453.1px (66.6% of 680), t ≈ 0.7725, angle = -360° (upright!)
      const SPOTLIGHT_T = 0.7725;
      const SPOTLIGHT_WINDOW = 0.038;
      let distToSpot = Math.abs(t - SPOTLIGHT_T);
      if (distToSpot > 0.5) distToSpot = 1 - distToSpot;
      const rawSpotFactor = Math.max(0, 1 - distToSpot / SPOTLIGHT_WINDOW);
      // Cosine smooth bell curve (0 to 1)
      const spotlightFactor = 0.5 - 0.5 * Math.cos(rawSpotFactor * Math.PI);

      // ── 3D Depth Function along the Memory Loop (Rule of Thirds Left Line Focus) ──
      // Front arc (t: 0.20 -> 0.391): climbs forward towards the viewer (zDepth: 0 -> +1.0)
      // Back descending arc (t: 0.391 -> 0.52): drops over the crest into deep background (zDepth: +1.0 -> -1.0)
      // Receding exit arc (t: 0.52 -> 0.65): curves back up to stage baseline (zDepth: -1.0 -> 0.0)
      let zDepth = 0;
      if (depthModeEnabled) {
        if (t >= 0.20 && t < 0.391) {
          const phase = (t - 0.20) / (0.391 - 0.20);
          zDepth = Math.sin(phase * Math.PI * 0.5);
        } else if (t >= 0.391 && t < 0.52) {
          const phase = (t - 0.391) / (0.52 - 0.391);
          zDepth = Math.cos(phase * Math.PI);
        } else if (t >= 0.52 && t < 0.65) {
          const phase = (t - 0.52) / (0.65 - 0.52);
          zDepth = -Math.cos(phase * Math.PI * 0.5);
        }
      }

      // Depth sorting & Z-indexing:
      // Active card: 120 (always on top)
      // Spotlight focus: 60..90
      // Foreground loop: 26..45 (passes cleanly in FRONT of background track!)
      // Flat stage: 15..20
      // Deep background loop: 6..12 (passes BEHIND front track!)
      let zIndex = 15;
      if (spotlightFactor > 0.05) {
        zIndex = 60 + Math.round(spotlightFactor * 30);
      } else if (zDepth > 0.05) {
        zIndex = 26 + Math.round(zDepth * 18);
      } else if (zDepth < -0.05) {
        zIndex = 6 + Math.round((zDepth + 1) * 6);
      }

      return {
        id: i,
        t,
        photo,
        x,
        y,
        angle,
        uprightAngle,
        zIndex,
        spotlightFactor,
        zDepth,
      };
    });
  }, [progress, samplePath, effectiveCount, depthModeEnabled]);

  // Track which card is currently centered in the right-side spotlight box
  const currentSpotlightCard = useMemo(() => {
    let topCard: (typeof cards)[0] | null = null;
    let maxFactor = 0;
    for (const card of cards) {
      if (card.spotlightFactor > maxFactor) {
        maxFactor = card.spotlightFactor;
        topCard = card;
      }
    }
    return maxFactor > 0.45 ? topCard : null;
  }, [cards]);

  // Display caption: manual click takes priority; otherwise track right-side spotlight
  const displayedPhoto = activePhoto || currentSpotlightCard?.photo || null;

  // Pre-generate SVG string paths for the ribbon track and 3D depth segments
  const svgRibbonD = useMemo(() => {
    return (
      "M " +
      ribbonPathData
        .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
        .join(" L ")
    );
  }, []);

  // Foreground loop segment (Indices 60 to 120): climbs over the front in 3D
  const svgFrontLoopD = useMemo(() => {
    const pts = ribbonPathData.slice(60, 121);
    if (!pts.length) return "";
    return "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  }, []);

  // Receding back loop segment (Indices 118 to 180): tucks behind into deep perspective
  const svgBackLoopD = useMemo(() => {
    const pts = ribbonPathData.slice(118, 181);
    if (!pts.length) return "";
    return "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  }, []);

  const singleMarqueeQuote =
    "“Divija, your beauty is not only in your smile or eyes, but in the beautiful soul you carry, making you truly one of the best people anyone could ever have.”";

  if (!mounted) {
    return (
      <section
        style={{
          minHeight: "560px",
          background:
            "radial-gradient(ellipse 75% 55% at 50% 38%, rgba(122, 21, 38, 0.42) 0%, transparent 70%), linear-gradient(180deg, rgba(20, 6, 13, 0.97) 0%, rgba(48, 12, 24, 0.95) 50%, rgba(18, 5, 12, 0.98) 100%)",
        }}
      />
    );
  }

  return (
    <section
      id="memory-reel-section"
      style={{
        position: "relative",
        // Website Gala Theme: Deep Burgundy Wine & Warm Gold Stardust Glow
        background:
          "radial-gradient(ellipse 75% 55% at 50% 38%, rgba(122, 21, 38, 0.42) 0%, transparent 70%), radial-gradient(circle at 12% 20%, rgba(212, 175, 55, 0.12), transparent 45%), radial-gradient(circle at 88% 80%, rgba(212, 175, 55, 0.12), transparent 45%), linear-gradient(180deg, rgba(20, 6, 13, 0.97) 0%, rgba(48, 12, 24, 0.95) 50%, rgba(18, 5, 12, 0.98) 100%)",
        padding: "4.5rem 0 5.5rem",
        overflow: "hidden",
        borderTop: "1px solid rgba(212, 175, 55, 0.32)",
        borderBottom: "1px solid rgba(212, 175, 55, 0.32)",
        boxShadow:
          "inset 0 25px 50px rgba(0,0,0,0.85), inset 0 -25px 50px rgba(0,0,0,0.85), 0 0 40px rgba(107, 20, 34, 0.25)",
      }}
    >
      {/* ── Soft Burgundy-Gold Ambient Lighting Glow Layer ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.06), transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 1: ELEGANT ELASTIC INTERACTIVE MARQUEE FRAME
          Single heartfelt quote honoring Divija's beauty and soul.
          Slow, relaxed reading speed with interactive pause & elastic hover.
      ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          width: "100%",
          maxWidth: "1320px",
          margin: "0 auto 3.4rem",
          padding: "0 1.25rem",
          position: "relative",
          zIndex: 15,
        }}
      >
        <div
          className="marquee-elastic-frame"
          onMouseEnter={() => setIsMarqueeHovered(true)}
          onMouseLeave={() => setIsMarqueeHovered(false)}
          onClick={() => setMarqueeUserPaused((prev) => !prev)}
          role="button"
          tabIndex={0}
          aria-label="Interactive scrolling quote for Divija. Click or tap to pause."
          style={{
            position: "relative",
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, rgba(38, 9, 21, 0.88) 0%, rgba(56, 12, 28, 0.82) 50%, rgba(20, 5, 12, 0.92) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isMarqueeHovered || marqueeUserPaused
              ? "1.5px solid rgba(255, 223, 128, 0.9)"
              : "1.5px solid rgba(212, 175, 55, 0.55)",
            boxShadow:
              isMarqueeHovered || marqueeUserPaused
                ? "0 22px 50px rgba(0, 0, 0, 0.85), 0 0 50px rgba(212, 175, 55, 0.42), inset 0 0 26px rgba(212, 175, 55, 0.22)"
                : "0 14px 38px rgba(0, 0, 0, 0.72), 0 0 28px rgba(212, 175, 55, 0.15), inset 0 1px 1px rgba(255, 235, 170, 0.35), inset 0 -1px 1px rgba(0, 0, 0, 0.8)",
            padding: "18px 24px 14px",
            cursor: "pointer",
            userSelect: "none",
            transition:
              "transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease, border-color 0.4s ease",
            transform:
              isMarqueeHovered || marqueeUserPaused
                ? "translateY(-3px) scale(1.008)"
                : "translateY(0) scale(1)",
          }}
        >
          {/* Ornate Gold Filigree Top Accent Line */}
          <div
            style={{
              position: "absolute",
              top: -1,
              left: "12%",
              right: "12%",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.2) 12%, #ffd700 50%, rgba(212, 175, 55, 0.2) 88%, transparent 100%)",
              boxShadow: "0 0 12px rgba(255, 215, 0, 0.75)",
              pointerEvents: "none",
            }}
          />

          {/* Ornate Gold Filigree Bottom Accent Line */}
          <div
            style={{
              position: "absolute",
              bottom: -1,
              left: "12%",
              right: "12%",
              height: "2px",
              background:
                "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.2) 12%, #ffd700 50%, rgba(212, 175, 55, 0.2) 88%, transparent 100%)",
              boxShadow: "0 0 12px rgba(255, 215, 0, 0.75)",
              pointerEvents: "none",
            }}
          />

          {/* Corner Flourish Brackets */}
          <div
            style={{
              position: "absolute",
              top: "6px",
              left: "14px",
              fontSize: "0.95rem",
              color: "#f6d896",
              opacity: 0.8,
              pointerEvents: "none",
              fontFamily: "serif",
              filter: "drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))",
            }}
          >
            ⚜
          </div>
          <div
            style={{
              position: "absolute",
              top: "6px",
              right: "14px",
              fontSize: "0.95rem",
              color: "#f6d896",
              opacity: 0.8,
              pointerEvents: "none",
              fontFamily: "serif",
              filter: "drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))",
            }}
          >
            ⚜
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "7px",
              left: "14px",
              fontSize: "0.9rem",
              color: "#f6d896",
              opacity: 0.75,
              pointerEvents: "none",
              fontFamily: "serif",
              filter: "drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))",
            }}
          >
            ✧
          </div>
          <div
            style={{
              position: "absolute",
              bottom: "7px",
              right: "14px",
              fontSize: "0.9rem",
              color: "#f6d896",
              opacity: 0.75,
              pointerEvents: "none",
              fontFamily: "serif",
              filter: "drop-shadow(0 0 6px rgba(212, 175, 55, 0.5))",
            }}
          >
            ✧
          </div>

          {/* Top Center Royal Badge */}
          <div
            style={{
              position: "absolute",
              top: "-13px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "linear-gradient(180deg, #440d21 0%, #1c050e 100%)",
              border: "1.2px solid rgba(212, 175, 55, 0.7)",
              borderRadius: "16px",
              padding: "3px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "#fce8b2",
              textTransform: "uppercase",
              boxShadow: "0 4px 14px rgba(0,0,0,0.65), 0 0 12px rgba(212,175,55,0.35)",
              zIndex: 2,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span>👑</span>
            <span>Dedicated to Divija</span>
            <span>✨</span>
          </div>

          {/* ── Content View: Either Scrolling Marquee or Stationary Card ── */}
          {!isStillMode ? (
            /* Vignette-Masked Smooth Marquee Track */
            <div
              style={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                padding: "8px 0 6px",
                maskImage:
                  "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.85) 3%, black 8%, black 92%, rgba(0,0,0,0.85) 97%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.85) 3%, black 8%, black 92%, rgba(0,0,0,0.85) 97%, transparent 100%)",
              }}
            >
              <div
                key={marqueeKey}
                className="marquee-slow-track"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  willChange: "transform",
                  animationPlayState:
                    isMarqueeHovered || marqueeUserPaused ? "paused" : "running",
                }}
              >
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {/* START BADGE — Unmistakable Beginning */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background:
                          "linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(20, 83, 45, 0.45) 100%)",
                        border: "1.2px solid rgba(74, 222, 128, 0.8)",
                        borderRadius: "12px",
                        padding: "3px 11px",
                        color: "#86efac",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        marginRight: "14px",
                        boxShadow: "0 0 14px rgba(74, 222, 128, 0.35)",
                        verticalAlign: "middle",
                      }}
                    >
                      <span style={{ fontSize: "0.7rem" }}>▶</span> START
                    </span>

                    {/* The Golden Quote */}
                    <span
                      style={{
                        fontSize: "clamp(1.15rem, 2.35vw, 1.58rem)",
                        fontFamily:
                          "'Playfair Display', 'Iowan Old Style', Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: 600,
                        color: "#fdf0cb",
                        textShadow:
                          "0 0 25px rgba(212, 175, 55, 0.45), 0 2px 8px rgba(0,0,0,0.85)",
                        letterSpacing: "0.035em",
                        lineHeight: 1.4,
                        verticalAlign: "middle",
                      }}
                    >
                      {singleMarqueeQuote}
                    </span>

                    {/* END BADGE — Unmistakable Ending */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background:
                          "linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(159, 18, 57, 0.45) 100%)",
                        border: "1.2px solid rgba(251, 113, 133, 0.8)",
                        borderRadius: "12px",
                        padding: "3px 11px",
                        color: "#fda4af",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        marginLeft: "14px",
                        boxShadow: "0 0 14px rgba(251, 113, 133, 0.35)",
                        verticalAlign: "middle",
                      }}
                    >
                      <span style={{ fontSize: "0.7rem" }}>■</span> END ✦
                    </span>

                    {/* Decorative Separator Ribbon Between Loops */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "0 4.5rem",
                        color: "rgba(212, 175, 55, 0.65)",
                        fontSize: "0.95rem",
                        letterSpacing: "0.28em",
                        textShadow: "0 0 10px rgba(212, 175, 55, 0.4)",
                        verticalAlign: "middle",
                      }}
                    >
                      ─── ⚜ 👑 ⚜ ───
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Stationary Readable Card Mode */
            <div
              style={{
                textAlign: "center",
                padding: "16px 20px 10px",
                maxWidth: "880px",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "rgba(212, 175, 55, 0.15)",
                  border: "1px solid rgba(212, 175, 55, 0.45)",
                  borderRadius: "16px",
                  padding: "3px 14px",
                  color: "#fce8b2",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                }}
              >
                <span>✨</span>
                <span>Full Tribute for Divija</span>
                <span>✨</span>
              </div>

              <p
                style={{
                  fontFamily:
                    "'Playfair Display', 'Iowan Old Style', Georgia, serif",
                  fontSize: "clamp(1.15rem, 2.4vw, 1.55rem)",
                  fontStyle: "italic",
                  fontWeight: 600,
                  color: "#fdf0cb",
                  lineHeight: 1.6,
                  textShadow:
                    "0 0 25px rgba(212, 175, 55, 0.45), 0 2px 8px rgba(0,0,0,0.85)",
                  margin: "0 0 10px",
                  letterSpacing: "0.025em",
                }}
              >
                {singleMarqueeQuote}
              </p>

              <div
                style={{
                  fontSize: "1rem",
                  letterSpacing: "0.25em",
                  color: "#f6d896",
                  marginTop: "6px",
                }}
              >
                💖 ✨ 👑 🌸 💛
              </div>
            </div>
          )}

          {/* Bottom Interactive Toolbar */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: "1px solid rgba(212, 175, 55, 0.16)",
            }}
          >
            {/* Quick Restart Button */}
            {!isStillMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMarqueeKey((k) => k + 1);
                  setMarqueeUserPaused(false);
                }}
                style={{
                  background: "rgba(212, 175, 55, 0.14)",
                  border: "1px solid rgba(212, 175, 55, 0.45)",
                  borderRadius: "14px",
                  padding: "4px 12px",
                  color: "#fce8b2",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  transition: "all 0.2s ease",
                }}
                title="Restart marquee to beginning"
              >
                <span>↺</span>
                <span>Read from Start</span>
              </button>
            )}

            {/* Pause / Resume Button */}
            {!isStillMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMarqueeUserPaused((prev) => !prev);
                }}
                style={{
                  background: marqueeUserPaused
                    ? "rgba(234, 179, 8, 0.22)"
                    : "rgba(212, 175, 55, 0.14)",
                  border: marqueeUserPaused
                    ? "1px solid rgba(250, 204, 21, 0.75)"
                    : "1px solid rgba(212, 175, 55, 0.45)",
                  borderRadius: "14px",
                  padding: "4px 12px",
                  color: marqueeUserPaused ? "#fef08a" : "#fce8b2",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  transition: "all 0.2s ease",
                }}
                title="Pause or resume scrolling"
              >
                <span>{marqueeUserPaused ? "▶" : "⏸"}</span>
                <span>{marqueeUserPaused ? "Resume Scroll" : "Pause to Read"}</span>
              </button>
            )}

            {/* Toggle Stationary View Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsStillMode((prev) => !prev);
              }}
              style={{
                background: isStillMode
                  ? "linear-gradient(135deg, rgba(122, 21, 38, 0.65) 0%, rgba(212, 175, 55, 0.35) 100%)"
                  : "rgba(212, 175, 55, 0.14)",
                border: isStillMode
                  ? "1px solid rgba(255, 215, 0, 0.8)"
                  : "1px solid rgba(212, 175, 55, 0.45)",
                borderRadius: "14px",
                padding: "4px 14px",
                color: "#ffffff",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: isStillMode
                  ? "0 0 12px rgba(212, 175, 55, 0.35)"
                  : "none",
                transition: "all 0.2s ease",
              }}
              title="Toggle stationary readable card view"
            >
              <span>{isStillMode ? "📜" : "📖"}</span>
              <span>{isStillMode ? "Switch to Scrolling Banner" : "Stationary Card View"}</span>
            </button>

            {/* Rule of Thirds Composition Guide Toggle (Desktop Only) */}
            {!isMobile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRuleOfThirds((prev) => !prev);
                }}
                style={{
                  background: showRuleOfThirds
                    ? "linear-gradient(135deg, rgba(212, 175, 55, 0.28) 0%, rgba(122, 21, 38, 0.35) 100%)"
                    : "rgba(212, 175, 55, 0.12)",
                  border: showRuleOfThirds
                    ? "1px solid rgba(255, 215, 0, 0.75)"
                    : "1px solid rgba(212, 175, 55, 0.35)",
                  borderRadius: "14px",
                  padding: "4px 12px",
                  color: showRuleOfThirds ? "#fff3cf" : "rgba(252, 232, 178, 0.75)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  boxShadow: showRuleOfThirds
                    ? "0 0 10px rgba(212, 175, 55, 0.35)"
                    : "none",
                  transition: "all 0.2s ease",
                }}
                title="Toggle Rule of Thirds camera viewfinder alignment grid"
              >
                <span>📐</span>
                <span>Rule of 3rds: {showRuleOfThirds ? "ON" : "OFF"}</span>
              </button>
            )}

            {/* 3D Loop Depth Perspective Toggle (Desktop Only) */}
            {!isMobile && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDepthModeEnabled((prev) => !prev);
                }}
                style={{
                  background: depthModeEnabled
                    ? "linear-gradient(135deg, rgba(212, 175, 55, 0.28) 0%, rgba(122, 21, 38, 0.35) 100%)"
                    : "rgba(212, 175, 55, 0.12)",
                  border: depthModeEnabled
                    ? "1px solid rgba(255, 215, 0, 0.75)"
                    : "1px solid rgba(212, 175, 55, 0.35)",
                  borderRadius: "14px",
                  padding: "4px 12px",
                  color: depthModeEnabled ? "#fff3cf" : "rgba(252, 232, 178, 0.75)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  boxShadow: depthModeEnabled
                    ? "0 0 10px rgba(212, 175, 55, 0.35)"
                    : "none",
                  transition: "all 0.2s ease",
                }}
                title="Toggle 3D perspective depth, distance scaling, and atmospheric fog along the loop"
              >
                <span>🌀</span>
                <span>3D Loop Depth: {depthModeEnabled ? "ON" : "OFF"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Section Title & Badge ── */}
      <div
        style={{
          textAlign: "center",
          maxWidth: 720,
          margin: "0 auto 1.8rem",
          padding: "0 1.5rem",
          position: "relative",
          zIndex: 25,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 18px",
            borderRadius: "24px",
            background: "rgba(122, 21, 38, 0.35)",
            border: "1px solid rgba(212, 175, 55, 0.45)",
            color: "#f3e5ab",
            fontSize: "0.82rem",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "0.7rem",
            boxShadow: "0 4px 15px rgba(0,0,0,0.4), 0 0 10px rgba(212,175,55,0.2)",
          }}
        >
          <span>🌸</span>
          <span>A Ribbon of Memories</span>
          <span>🌸</span>
        </div>

        <h2
          style={{
            fontSize: "clamp(2rem, 4.8vw, 3.2rem)",
            fontFamily: "'Iowan Old Style', Georgia, serif",
            color: "#f6d896",
            fontStyle: "italic",
            margin: "0 0 0.5rem",
            textShadow: "0 0 40px rgba(212, 175, 55, 0.4), 0 2px 10px rgba(0,0,0,0.8)",
          }}
        >
          The Memory Reel
        </h2>

        <p
          style={{
            color: "rgba(243, 237, 225, 0.82)",
            fontSize: "0.96rem",
            lineHeight: 1.6,
            margin: 0,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {isMobile
            ? "A dedicated 3D cinematic reel of cherished moments. Swipe left or right, or tap any photo to open its full story! ✨"
            : "A continuous 3D loop of memories flowing through time and space. Frames climb forward into the light, recede into gentle depth, and bloom vibrantly inside the golden stage! Touch or hover any card to pause. ✨"}
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          LAYER 2: MOBILE 3D COVERFLOW REEL vs DESKTOP ROLLER-COASTER LOOP
      ══════════════════════════════════════════════════════════════════ */}
      {isMobile ? (
        <MobileMemoryReel
          photos={photoDataset}
          onSelectPhoto={(photo) => setZoomPhoto(photo)}
        />
      ) : (
        <div
          className="ribbon-loop-stage"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          height: "640px",
          overflow: "hidden", // Clips cards at stage edges on mobile
          touchAction: "pan-y",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* Background Glowing Ribbon String Track (Base Layer: zIndex 4) */}
        <svg
          viewBox="0 0 1400 680"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            overflow: "visible",
            zIndex: 4,
          }}
        >
          <defs>
            <linearGradient id="ribbonLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(212, 175, 55, 0.3)" />
              <stop offset="50%" stopColor="rgba(246, 216, 150, 0.9)" />
              <stop offset="100%" stopColor="rgba(212, 175, 55, 0.3)" />
            </linearGradient>
            <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="frontLoopShadow" x="-20%" y="-20%" width="160%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.85" />
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ffd700" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Dotted Golden Ribbon String Line with Headroom */}
          <path
            d={svgRibbonD}
            fill="none"
            stroke="url(#ribbonLineGrad)"
            strokeWidth="2.8"
            strokeDasharray="6,6"
            filter="url(#ribbonGlow)"
          />

          {/* Receding Back Loop Track (Deeper distance shading) */}
          {depthModeEnabled && (
            <path
              d={svgBackLoopD}
              fill="none"
              stroke="rgba(180, 140, 35, 0.35)"
              strokeWidth="2.0"
              strokeDasharray="4,6"
            />
          )}
        </svg>

        {/* ── Photo Cards Strung Along the Ribbon ── */}
        {cards.map((card) => {
          const isThisActive = activeIdx === card.id;
          const isThisClosing = closingIdx === card.id;
          const leftPct = (card.x / 1400) * 100;
          const topPct = (card.y / 680) * 100;

          // Don't render cards that are completely offstage
          if (card.x < -120 || card.x > 1520) return null;

          // Spotlight dynamics & 3D Depth Scaling
          const effFactor = isThisActive ? 1 : card.spotlightFactor;
          const maxScale = isMobile ? 1.55 : 2.05;

          // 3D perspective foreshortening along the loop:
          // In foreground (zDepth > 0): climbs closer up to 1.18x (or 1.12x on mobile)
          // In background (zDepth < 0): recedes down to 0.80x (or 0.85x on mobile)
          const depthScale = card.zDepth >= 0
            ? 1 + card.zDepth * (isMobile ? 0.12 : 0.18)
            : 1 + card.zDepth * (isMobile ? 0.15 : 0.20);

          const baseScale = depthModeEnabled ? depthScale : 1;
          const currentScale = isThisActive
            ? maxScale
            : baseScale + (maxScale - baseScale) * card.spotlightFactor;

          const currentAngle = isThisActive
            ? card.uprightAngle
            : card.angle + (card.uprightAngle - card.angle) * card.spotlightFactor;

          let transitionStyle = "box-shadow 0.35s ease, filter 0.35s ease, opacity 0.35s ease";
          if (isThisActive) {
            transitionStyle =
              "transform 0.48s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s ease, filter 0.35s ease, opacity 0.25s ease";
          } else if (isThisClosing) {
            transitionStyle =
              "transform 0.38s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.35s ease, filter 0.35s ease, opacity 0.25s ease";
          }

          // 3D Atmospheric Depth Lighting:
          const isForeground = depthModeEnabled && card.zDepth > 0.15;
          const isBackground = depthModeEnabled && card.zDepth < -0.15;

          // Background cards receive gentle distance dimming, soft opacity, and subtle camera depth-of-field blur
          const depthBrightness = isBackground
            ? (0.76 + (1 + card.zDepth) * 0.24).toFixed(2)
            : (1.0 + (isForeground ? card.zDepth * 0.08 : 0)).toFixed(2);

          const depthOpacity = isBackground
            ? Math.max(0.74, 0.80 + (1 + card.zDepth) * 0.20)
            : 1.0;

          const depthBlur = isBackground && card.zDepth < -0.2
            ? `blur(${Math.min(0.8, (-card.zDepth - 0.2) * 0.9).toFixed(1)}px)`
            : "";

          const isCardGlowing = isThisActive || card.spotlightFactor > 0.15 || isForeground;
          let glowShadow = "0 10px 22px rgba(0,0,0,0.65), 0 0 10px rgba(212, 175, 55, 0.25)";
          if (isThisActive || card.spotlightFactor > 0.15) {
            glowShadow = `0 25px 60px rgba(0,0,0,0.95), 0 0 ${Math.round(20 + 25 * effFactor)}px rgba(212, 175, 55, 0.95), 0 0 15px rgba(246, 216, 150, 0.85)`;
          } else if (isForeground) {
            // Radiant starlight rim glow for cards closer to the viewer
            glowShadow = `0 18px 36px rgba(0,0,0,0.85), 0 0 ${Math.round(14 + 16 * card.zDepth)}px rgba(255, 215, 0, ${(0.45 + 0.35 * card.zDepth).toFixed(2)}), 0 0 8px rgba(255, 240, 180, 0.6)`;
          } else if (isBackground) {
            // Softer, tucked-away shadow for receding cards
            glowShadow = "0 6px 14px rgba(0,0,0,0.85), 0 0 6px rgba(122, 21, 38, 0.4)";
          }

          const cardBorder = isThisActive || card.spotlightFactor > 0.25
            ? "2px solid #f6d896"
            : isForeground
            ? "1.8px solid rgba(255, 223, 128, 0.95)"
            : isBackground
            ? "1.2px solid rgba(212, 175, 55, 0.4)"
            : "1.5px solid rgba(255, 255, 255, 0.88)";

          const grayPct = Math.max(0, Math.round((1 - effFactor) * 100));
          const contrastVal = (1.05 + 0.1 * effFactor + (isForeground ? card.zDepth * 0.1 : 0)).toFixed(2);
          const brightnessVal = (
            parseFloat(depthBrightness) * (0.95 + 0.12 * effFactor)
          ).toFixed(2);
          const saturateVal = (1.0 + 0.25 * effFactor + (isForeground ? card.zDepth * 0.15 : 0)).toFixed(2);
          const imgFilter = `grayscale(${grayPct}%) contrast(${contrastVal}) brightness(${brightnessVal}) saturate(${saturateVal}) ${depthBlur}`.trim();

          return (
            <div
              key={card.id}
              className={`ribbon-card-item ${isThisActive ? "card-active" : ""}`}
              style={{
                position: "absolute",
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: "clamp(78px, 7.6vw, 98px)",
                height: "clamp(104px, 10.2vw, 134px)",
                // WHEN PRESSED OR IN SPOTLIGHT: ALWAYS ROTATES SMOOTHLY TO UPRIGHT (0deg / -360deg), GLOWS, AND BECOMES BIGGER!
                transform: `translate(-50%, -50%) rotate(${currentAngle}deg) scale(${currentScale})`,
                zIndex: isThisActive ? 120 : card.zIndex,
                opacity: isThisActive ? 1 : depthOpacity,
                transition: transitionStyle,
                willChange: "transform, opacity",
                cursor: "pointer",
                touchAction: "pan-y",
                WebkitTouchCallout: "none",
                userSelect: "none",
              }}
              onPointerDown={() => {
                pointerDownTimeRef.current = performance.now();
                if (isThisActive) {
                  setZoomPhoto(card.photo);
                } else {
                  handleOpen(card.id, card.photo);
                }
              }}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse") {
                  handleOpen(card.id, card.photo);
                }
              }}
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse" && activeIdx === card.id) {
                  handleClose();
                }
              }}
            >
              {/* ── Card Frame (Natural Aspect Ratio & Velvet Gold Borders) ── */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: isThisActive || card.spotlightFactor > 0.4 ? "12px" : "8px",
                  background: isThisActive || card.spotlightFactor > 0.3
                    ? "linear-gradient(135deg, #fffdfa 0%, #fff7ea 100%)"
                    : "#fffdf9",
                  padding: isThisActive || card.spotlightFactor > 0.25 ? "5px 5px 18px 5px" : "4px 4px 6px 4px",
                  boxShadow: glowShadow,
                  border: cardBorder,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  transition: "box-shadow 0.45s ease, border-color 0.3s ease",
                }}
              >
                {/* Cute heart pin badge when active or in spotlight */}
                {(isThisActive || card.spotlightFactor > 0.6) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-7px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "0.95rem",
                      zIndex: 10,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                    }}
                  >
                    {isThisActive ? "💖" : "✨"}
                  </div>
                )}

                {/* ── Inner Photo Window (Preserves 100% natural aspect ratio) ── */}
                <div
                  style={{
                    position: "relative",
                    flex: 1,
                    width: "100%",
                    borderRadius: isThisActive || card.spotlightFactor > 0.4 ? "8px" : "5px",
                    overflow: "hidden",
                    background: "#160e13",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={card.photo.src}
                    alt={card.photo.caption}
                    loading="lazy"
                    decoding="async"
                    width={180}
                    height={240}
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: card.photo.fit === "contain" ? "contain" : "cover",
                      objectPosition: "center center",
                      filter: imgFilter,
                      transition: "filter 0.35s ease",
                      display: "block",
                      pointerEvents: "none",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect fill='%231f1318' width='120' height='160'/%3E%3Ctext x='50%25' y='50%25' fill='%23d4af37' font-size='12' text-anchor='middle' dy='.3em'%3EDivija%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Crisp Polaroid bottom tag - 1 line, fully visible */}
                <div
                  style={{
                    height: isThisActive || card.spotlightFactor > 0.25 ? "18px" : "6px",
                    minHeight: isThisActive || card.spotlightFactor > 0.25 ? "18px" : "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "2px",
                    width: "100%",
                    overflow: "hidden",
                    padding: "0 3px",
                    boxSizing: "border-box",
                  }}
                >
                  {(isThisActive || card.spotlightFactor > 0.25) && (
                    <span
                      style={{
                        fontSize: "clamp(0.55rem, 0.72vw, 0.66rem)",
                        fontFamily: "'Iowan Old Style', Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: 700,
                        color: "#240b15",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                        width: "100%",
                        textAlign: "center",
                        lineHeight: 1.15,
                        letterSpacing: "0.01em",
                        opacity: isThisActive ? 1 : Math.min(1, (card.spotlightFactor - 0.25) * 2.2),
                      }}
                      title={card.photo.tagline}
                    >
                      {isThisActive || card.spotlightFactor > 0.4
                        ? card.photo.tagline
                        : card.photo.shortLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* ── 3D Foreground Overlapping Loop Segment (zIndex: 22) ── */}
        {/* Visibly curls in front of background cards with realistic cast drop shadow onto receding loop */}
        {depthModeEnabled && (
          <svg
            viewBox="0 0 1400 680"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              overflow: "visible",
              zIndex: 22,
            }}
          >
            <path
              d={svgFrontLoopD}
              fill="none"
              stroke="url(#ribbonLineGrad)"
              strokeWidth="3.2"
              strokeDasharray="6,6"
              filter="url(#frontLoopShadow)"
            />
          </svg>
        )}

        {/* ── CINEMATIC RULE OF THIRDS VIEWING GRID ── */}
        {showRuleOfThirds && (
          <div
            className="rule-of-thirds-grid"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 6,
              opacity: 0.9,
            }}
          >
            {/* Left 1/3 Line: Passes through The 3D Memory Loop */}
            <div
              style={{
                position: "absolute",
                left: "33.33%",
                top: 0,
                bottom: 0,
                width: 0,
                borderLeft: "1.5px dashed rgba(212, 175, 55, 0.45)",
                boxShadow: "0 0 10px rgba(212, 175, 55, 0.2)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(18, 5, 12, 0.92)",
                  border: "1px solid rgba(212, 175, 55, 0.5)",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  color: "#ffd700",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                1/3 Line · 3D Loop 🌀✨
              </span>
            </div>

            {/* Right 2/3 Line: Passes through The Glowing Stage Box */}
            <div
              style={{
                position: "absolute",
                left: "66.67%",
                top: 0,
                bottom: 0,
                width: 0,
                borderLeft: "1.5px dashed rgba(212, 175, 55, 0.55)",
                boxShadow: "0 0 12px rgba(255, 215, 0, 0.3)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(18, 5, 12, 0.92)",
                  border: "1px solid rgba(255, 215, 0, 0.7)",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  color: "#ffe082",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.6), 0 0 10px rgba(255, 215, 0, 0.3)",
                }}
              >
                2/3 Line · Spotlight Focus 👑
              </span>
            </div>

            {/* Horizontal 1/3 Line */}
            <div
              style={{
                position: "absolute",
                top: "33.33%",
                left: 0,
                right: 0,
                height: 0,
                borderTop: "1px dashed rgba(212, 175, 55, 0.22)",
              }}
            />

            {/* Horizontal 2/3 Line */}
            <div
              style={{
                position: "absolute",
                top: "66.67%",
                left: 0,
                right: 0,
                height: 0,
                borderTop: "1px dashed rgba(212, 175, 55, 0.22)",
              }}
            />

            {/* Power Intersections */}
            {/* 1. (33.3%, 33.3%) - Near the Loop Apex */}
            <div
              style={{
                position: "absolute",
                left: "33.33%",
                top: "33.33%",
                transform: "translate(-50%, -50%)",
                width: 14,
                height: 14,
                border: "1.5px solid #ffd700",
                borderRadius: "50%",
                boxShadow: "0 0 8px #ffd700",
              }}
            />
            {/* 2. (66.7%, 66.7%) - Power Intersection in the Glowing Stage */}
            <div
              style={{
                position: "absolute",
                left: "66.67%",
                top: "66.67%",
                transform: "translate(-50%, -50%)",
                width: 16,
                height: 16,
                border: "2px solid #fff0b3",
                borderRadius: "50%",
                boxShadow: "0 0 14px #ffd700",
              }}
            />
          </div>
        )}

        {/* ── Active Tagline Placed Below the Right-Side Spotlight Focus (Aligned at 66.67%) ── */}
        {displayedPhoto && (
          <div
            style={{
              position: "absolute",
              left: "66.67%",
              top: "calc(66.6% + clamp(94px, 12vw, 140px))",
              transform: "translateX(-50%)",
              zIndex: 120,
              pointerEvents: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "max-content",
              maxWidth: "min(360px, 88vw)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
            }}
          >
            {/* Small golden arrow indicator pointing up to the glowing box */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderBottom: "7px solid rgba(255, 215, 0, 0.9)",
                marginBottom: "-1px",
                filter: "drop-shadow(0 0 6px rgba(255, 215, 0, 0.8))",
              }}
            />
            <div
              onClick={() => setZoomPhoto(displayedPhoto)}
              style={{
                background: "linear-gradient(135deg, rgba(38, 9, 21, 0.96) 0%, rgba(18, 4, 12, 0.98) 100%)",
                border: "1.5px solid rgba(255, 215, 0, 0.85)",
                borderRadius: "20px",
                padding: "6px 16px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.5)",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                maxWidth: "100%",
                boxSizing: "border-box",
                cursor: "pointer",
                pointerEvents: "auto",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              title="Click to zoom & view full high-definition photo 🔍"
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.04)";
                e.currentTarget.style.boxShadow = "0 12px 36px rgba(0,0,0,1), 0 0 28px rgba(255, 215, 0, 0.75)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.5)";
              }}
            >
              <span style={{ fontSize: "0.95rem", flexShrink: 0 }}>
                {activePhoto ? "💖" : "🎞️"}
              </span>
              <span
                style={{
                  color: "#fff3cf",
                  fontSize: "clamp(0.78rem, 1.4vw, 0.88rem)",
                  fontFamily: "'Iowan Old Style', Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  letterSpacing: "0.02em",
                  textShadow: "0 0 10px rgba(212, 175, 55, 0.4)",
                }}
              >
                {displayedPhoto.tagline}
              </span>
              <span style={{ fontSize: "0.78rem", color: "#ffd700", marginLeft: "3px", fontWeight: 700 }}>🔍</span>
            </div>
          </div>
        )}
      </div>
      )}

      {/* ── Discreet Helpful Bottom Guidance Bar (Desktop Only) ── */}
      {!isMobile && (
        <div
          style={{
            minHeight: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "1.2rem",
            padding: "0 1rem",
            position: "relative",
            zIndex: 30,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "5px 18px",
              borderRadius: "24px",
              background: "rgba(212, 175, 55, 0.08)",
              border: "1px solid rgba(212, 175, 55, 0.28)",
              maxWidth: "min(92vw, 680px)",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>✨</span>
            <span
              style={{
                color: "rgba(243, 237, 225, 0.75)",
                fontSize: "0.82rem",
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "0.03em",
              }}
            >
              Touch or hover any photo along the ribbon to pause and expand
            </span>
          </div>
        </div>
      )}

      <style>{`
        /* Smooth, Relaxed Kinetic Text Marquee Keyframes (68s for effortless reading) */
        @keyframes marqueeScrollSmooth {
          0% {
            transform: translate3d(0%, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .marquee-slow-track {
          animation: marqueeScrollSmooth 68s linear infinite;
        }

        .marquee-elastic-frame:hover .marquee-slow-track,
        .marquee-elastic-frame:active .marquee-slow-track {
          animation-play-state: paused;
        }


        /* Mobile adjustments */
        @media (max-width: 768px) {
          .ribbon-loop-stage {
            height: 480px !important;
            transform-origin: top center;
          }
          .ribbon-card-item {
            width: clamp(56px, 15vw, 72px) !important;
            height: clamp(76px, 20vw, 96px) !important;
          }
        }
        @media (max-width: 480px) {
          .ribbon-loop-stage {
            height: 430px !important;
          }
          .ribbon-card-item {
            width: clamp(48px, 13vw, 62px) !important;
            height: clamp(64px, 17vw, 82px) !important;
          }
        }
      `}</style>

      {/* ── FULLSCREEN HIGH-DEFINITION PHOTO ZOOM MODAL ── */}
      <PhotoZoomModal
        isOpen={Boolean(zoomPhoto)}
        onClose={() => setZoomPhoto(null)}
        src={zoomPhoto?.src || ""}
        title={zoomPhoto?.tagline || "Divija's 35mm Memory Reel"}
        subtitle="✦ 35mm Cinematic Memory Reel · Touch & Drag to Pan ✦"
        caption={zoomPhoto?.caption || zoomPhoto?.tagline || ""}
      />
    </section>
  );
}
