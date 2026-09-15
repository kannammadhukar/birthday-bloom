"use client";
import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { smoothAlign } from "@/lib/autoAlign";

/* ── Phase State Machine ────────────────────────────────────────
   idle → cracking → flap → peek → open
────────────────────────────────────────────────────────────── */
type Phase = "idle" | "cracking" | "flap" | "peek" | "open";

/* ── Web Audio Paper Rustle ─────────────────────────────────── */
function playRustle(gain = 0.28) {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const dur = 0.14;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.25));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = "bandpass";
    flt.frequency.value = 1400;
    flt.Q.value = 2.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + dur);
    src.connect(flt); flt.connect(g); g.connect(ctx.destination);
    src.start();
  } catch { /* ignore */ }
}

/* ── Seal Burst Particles ───────────────────────────────────── */
function SealBurst({ color }: { color: string }) {
  const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315, 22, 67, 112, 157];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 25 }}>
      {ANGLES.map((deg, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: i % 3 === 0 ? 10 : 6,
            height: i % 3 === 0 ? 10 : 6,
            borderRadius: i % 2 === 0 ? "50%" : 2,
            background: i % 4 === 0 ? "#fef08a" : color,
            animation: `particle-${i % 4} 0.55s cubic-bezier(0.2,0,0.8,1) forwards`,
            transformOrigin: "center",
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */
export default function BirthdayLetter() {
  const [isFlipped, setIsFlipped] = useState(false); // false = Front (Address), true = Back (Seal & Flap)
  const [showBackElements, setShowBackElements] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /* Clear all pending timers on unmount */
  useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

  /* Lock body scroll when full letter overlay is open */
  useEffect(() => {
    if (phase === "open") {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [phase]);

  /* ── Flip envelope over ─────────────────────────────────── */
  function handleFlip() {
    smoothAlign("#birthday-letter-section");
    playRustle(0.22);
    if (!isFlipped) {
      setShowBackElements(true);
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
      setTimeout(() => setShowBackElements(false), 450);
    }
  }

  /* ── Single-tap entry point on the seal ─────────────────── */
  function handleSealTap() {
    if (phase !== "idle") return;
    smoothAlign("#birthday-letter-section");

    /* Haptic feedback on mobile */
    try { navigator.vibrate?.([40, 30, 80, 30, 180]); } catch { /* ignore */ }

    /* Confetti on seal crack */
    confetti({
      particleCount: 75, spread: 75, origin: { y: 0.55 },
      colors: ["#d4af37", "#f3e5ab", "#80182a", "#fef08a", "#c59b27"],
      scalar: 0.85,
    });

    playRustle(0.32);
    setPhase("cracking");

    const t1 = setTimeout(() => { playRustle(0.20); setPhase("flap");  },  320);
    const t2 = setTimeout(() => { playRustle(0.16); setPhase("peek");  },  760);
    const t3 = setTimeout(() => {                   setPhase("open");  }, 1120);
    timersRef.current = [t1, t2, t3];
  }

  /* ── Reset back to idle ─────────────────────────────────── */
  function handleReseal() {
    smoothAlign("#birthday-letter-section");
    timersRef.current.forEach(clearTimeout);
    playRustle(0.18);
    setPhase("idle");
  }

  /* ── Derived states from phase ──────────────────────────── */
  const sealCracking = phase === "cracking";
  const sealGone     = phase !== "idle" && phase !== "cracking";
  const flapOpen     = phase === "flap" || phase === "peek" || phase === "open";
  const paperPeek    = phase === "peek" || phase === "open";
  const letterOpen   = phase === "open";

  return (
    <section id="birthday-letter-section" style={{
      position: "relative",
      padding: "48px 20px 64px",
      background: "radial-gradient(ellipse 90% 55% at 50% 50%, rgba(42,10,24,0.95) 0%, rgba(9,3,6,0.93) 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Ambient backdrop glow */}
      <div style={{
        position: "absolute", width: 560, height: 560, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 65%)",
        pointerEvents: "none", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
      }} />

      {/* Section header */}
      <div style={{ textAlign: "center", maxWidth: 620, marginBottom: "2rem", position: "relative", zIndex: 2 }}>
        <p style={{
          color: "#d4af37", fontSize: "0.78rem", letterSpacing: "0.28em",
          textTransform: "uppercase", marginBottom: "0.5rem", opacity: 0.9,
          textShadow: "0 0 15px rgba(212,175,55,0.4)",
        }}>
          ✦ Royal Gala Presentation ✦
        </p>
        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(1.9rem, 5vw, 2.8rem)",
          color: "#f3e5ab", fontStyle: "italic",
          textShadow: "0 0 35px rgba(212,175,55,0.35)",
        }}>
          A Personal Letter for Divija ✉️
        </h2>
      </div>

      {/* ── 3D ENVELOPE CONTAINER (Perspective Host) ───────────── */}
      <div style={{
        position: "relative", zIndex: 2, maxWidth: 620, width: "100%", height: 380,
        perspective: "1400px",
      }}>

        {/* Quick Flip Back to Front Button (Top Right) */}
        {isFlipped && (
          <button
            className="btn-floating-top-flip"
            onClick={handleFlip}
            style={{
              position: "absolute",
              top: -44,
              right: 0,
              zIndex: 40,
              background: "rgba(28, 10, 18, 0.9)",
              border: "1px solid rgba(212, 175, 55, 0.6)",
              borderRadius: 50,
              padding: "7px 18px",
              color: "#f3e5ab",
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(107, 20, 34, 0.9)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(28, 10, 18, 0.9)"; }}
          >
            <span>↩ Flip to Front Address</span>
          </button>
        )}

        {/* ── 3D FLIPPING CARD ─────────────────────────────────── */}
        <div style={{
          position: "relative", width: "100%", height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.85s cubic-bezier(0.34, 1.2, 0.64, 1)",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>

          {/* ══════════════════════════════════════════════════════
              SIDE 1: THE FRONT (Clean Address, Stamp, Calligraphy)
              NO SEAL, NO FLAP, 100% CLEAN
             ══════════════════════════════════════════════════════ */}
          <div
            className="envelope-front-card"
            onClick={handleFlip}
            style={{
              position: "absolute", inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(0deg) translateZ(1px)",
              borderRadius: 16,
              background: "linear-gradient(145deg, #faf3ea 0%, #ede1d1 100%)",
              boxShadow: "0 25px 70px rgba(0,0,0,0.8), 0 0 45px rgba(212,175,55,0.2), 0 0 15px rgba(107,20,34,0.3)",
              border: "1.5px solid #d4af37",
              cursor: "pointer",
              overflow: "hidden",
              padding: "24px 32px",
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              userSelect: "none",
              zIndex: isFlipped ? 1 : 10,
              visibility: isFlipped ? "hidden" : "visible",
              pointerEvents: isFlipped ? "none" : "auto",
              transition: "visibility 0.4s",
            }}
          >
            {/* Inner dashed gold border */}
            <div style={{
              position: "absolute", inset: 10,
              border: "1px dashed rgba(212,175,55,0.45)",
              borderRadius: 10,
              pointerEvents: "none",
            }} />

            {/* Top Bar: Royal Postmark (Left) + Air Mail Stamp (Right) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 2 }}>
              <div>
                <span style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: "0.78rem", fontWeight: 800,
                  color: "#3d2b1f", letterSpacing: "0.2em", textTransform: "uppercase",
                  display: "block",
                }}>
                  ✦ ROYAL COURIER · SPECIAL DELIVERY ✦
                </span>
                <span style={{ fontFamily: "sans-serif", fontSize: "0.72rem", color: "#5c4033", fontWeight: 600, letterSpacing: "0.08em" }}>
                  DISPATCH REF: DVJ-23-GALA
                </span>
              </div>

              {/* Stamp & Cancellation */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  border: "1.5px solid rgba(185,28,28,0.45)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transform: "rotate(-10deg)",
                }}>
                  <span style={{ fontFamily: "sans-serif", fontSize: "0.45rem", fontWeight: 700, color: "rgba(185,28,28,0.7)", textAlign: "center", lineHeight: 1.1 }}>
                    WARANGAL<br />11 SEP 2026<br />POST
                  </span>
                </div>

                <div style={{
                  width: 66, height: 80, background: "#fff",
                  border: "2px dashed #b91c1c", borderRadius: 4,
                  padding: 5, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.15)", transform: "rotate(3deg)",
                }}>
                  <span style={{ fontSize: "1.55rem", lineHeight: 1 }}>🩺</span>
                  <span style={{ fontFamily: "sans-serif", fontSize: "0.52rem", fontWeight: 900, color: "#b91c1c", marginTop: 2, letterSpacing: "0.06em" }}>
                    AIR MAIL
                  </span>
                  <span style={{ fontFamily: "sans-serif", fontSize: "0.46rem", color: "#666" }}>23 YEARS</span>
                </div>
              </div>
            </div>

            {/* Center: Recipient Calligraphy */}
            <div style={{ paddingLeft: "1.2rem", position: "relative", zIndex: 2, margin: "auto 0" }}>
              <p style={{
                fontFamily: "'Outfit', sans-serif", fontSize: "0.9rem",
                color: "#4a3525", letterSpacing: "0.15em", textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 2,
              }}>
                To:
              </p>
              <h1 style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(2.6rem, 7vw, 3.8rem)",
                color: "#0f172a",
                fontWeight: 700,
                lineHeight: 1.05,
                margin: 0,
                textShadow: "0 1px 2px rgba(255,255,255,0.9)",
              }}>
                Divija 🩺✨
              </h1>
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "1.12rem",
                color: "#3d2b1f",
                fontStyle: "italic",
                fontWeight: 600,
                marginTop: 6,
                marginBottom: 2,
              }}>
                Kakatiya Medical College · Warangal
              </p>
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.95rem",
                color: "#2d1f15",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}>
                4th-Year MBBS · The Girl Behind The Dimples
              </p>
            </div>

            {/* Bottom Bar: Interactive "Turn Over" Button */}
            <div className="envelope-front-bottom-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem", color: "#3d2b1f", letterSpacing: "0.06em", fontWeight: 700 }}>
                ✦ THURSDAY, 11 SEPTEMBER 2026 ✦
              </span>

              <button
                className="btn-envelope-desktop-flip"
                onClick={(e) => { e.stopPropagation(); handleFlip(); }}
                style={{
                  background: "linear-gradient(135deg, #5c111d, #380811)",
                  color: "#f3e5ab",
                  border: "1.5px solid rgba(212, 175, 55, 0.6)",
                  borderRadius: 50,
                  padding: "9px 24px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "8px",
                  boxShadow: "0 4px 20px rgba(107, 20, 34, 0.45)",
                  fontSize: "0.85rem", fontWeight: 700,
                  fontFamily: "'Outfit', sans-serif",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.04)";
                  e.currentTarget.style.boxShadow = "0 6px 25px rgba(212, 175, 55, 0.35)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(107, 20, 34, 0.45)";
                }}
              >
                <span>Turn Envelope Over</span>
                <span style={{ fontSize: "1.05rem" }}>↻</span>
              </button>
            </div>
          </div>


          {/* ══════════════════════════════════════════════════════
              SIDE 2: THE BACK (Folds, Wax Seal, 3D Opening Flap)
              ONLY ACTIVE & VISIBLE WHEN FLIPPED OVER
             ══════════════════════════════════════════════════════ */}
          <div
            style={{
              position: "absolute", inset: 0,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg) translateZ(1px)",
              borderRadius: 16,
              background: "#220812",
              boxShadow: "0 25px 70px rgba(0,0,0,0.8), 0 0 45px rgba(212,175,55,0.2), 0 0 15px rgba(107,20,34,0.3)",
              overflow: "visible",
              zIndex: isFlipped ? 10 : 1,
              visibility: isFlipped ? "visible" : "hidden",
              pointerEvents: isFlipped ? "auto" : "none",
              transition: "visibility 0.4s",
            }}
          >
            {/* Interior Pocket Lining */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: 16,
              background: "linear-gradient(180deg, #18050c 0%, #360a16 100%)",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.9)",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: "42%", left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: 0.15, fontSize: "4rem", color: "#d4af37",
                pointerEvents: "none",
              }}>
                👑
              </div>
            </div>

            {/* Paper Peek (slides up from inside pocket when flap opens) */}
            {paperPeek && !letterOpen && (
              <div style={{
                position: "absolute",
                top: -40, left: "10%", right: "10%",
                height: 120,
                background: "linear-gradient(180deg, #fffdfa 0%, #f6eee3 100%)",
                border: "1px solid #d4c5b3",
                borderRadius: "8px 8px 0 0",
                boxShadow: "0 -12px 35px rgba(0,0,0,0.35)",
                zIndex: 6,
                animation: "paperPeek 0.45s cubic-bezier(0.16,1,0.3,1) forwards",
                display: "flex", flexDirection: "column", justifyContent: "flex-start",
                padding: "16px 24px",
              }}>
                <div style={{ width: "40%", height: 3, background: "#80182a", borderRadius: 2, marginBottom: 12 }} />
                <div style={{ width: "80%", height: 2, background: "rgba(212,175,55,0.35)", marginBottom: 8 }} />
                <div style={{ width: "65%", height: 2, background: "rgba(212,175,55,0.25)" }} />
              </div>
            )}

            {/* Envelope Folds (Left, Right, Bottom) */}
            <div style={{
              position: "absolute", inset: 0,
              borderRadius: 16,
              overflow: "hidden",
              zIndex: 8,
              pointerEvents: "none",
            }}>
              <svg
                viewBox="0 0 620 380"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                style={{ display: "block" }}
              >
                <defs>
                  <linearGradient id="sideFlapGrad2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ede1d2" />
                    <stop offset="100%" stopColor="#dfd0be" />
                  </linearGradient>
                  <linearGradient id="bottomFlapGrad2" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#f5ebe0" />
                    <stop offset="60%" stopColor="#ede0d1" />
                    <stop offset="100%" stopColor="#dfcfbd" />
                  </linearGradient>
                  <filter id="bottomFoldShadow2" x="-5%" y="-10%" width="110%" height="120%">
                    <feDropShadow dx="0" dy="-4" stdDeviation="5" floodColor="rgba(0,0,0,0.18)" />
                  </filter>
                </defs>

                {/* Left fold */}
                <polygon points="0,0 270,190 0,380" fill="url(#sideFlapGrad2)" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />

                {/* Right fold */}
                <polygon points="620,0 350,190 620,380" fill="url(#sideFlapGrad2)" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />

                {/* Bottom pocket fold */}
                <polygon
                  points="0,380 310,175 620,380"
                  fill="url(#bottomFlapGrad2)"
                  stroke="rgba(0,0,0,0.08)"
                  strokeWidth="1"
                  filter="url(#bottomFoldShadow2)"
                />
              </svg>
            </div>

            {/* Go Back to Front Side Button (Prominently placed at bottom-left, zIndex: 35) */}
            <button
              className="btn-envelope-back-side-flip"
              onClick={(e) => { e.stopPropagation(); handleFlip(); }}
              style={{
                position: "absolute",
                bottom: 22,
                left: 24,
                zIndex: 35,
                background: "linear-gradient(135deg, #5c111d, #380811)",
                border: "1.5px solid rgba(212, 175, 55, 0.65)",
                borderRadius: 50,
                padding: "9px 20px",
                color: "#f3e5ab",
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                pointerEvents: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 20px rgba(0,0,0,0.65), 0 0 12px rgba(107,20,34,0.4)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 24px rgba(212, 175, 55, 0.4)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.65)";
              }}
            >
              <span style={{ fontSize: "1.05rem" }}>↩</span>
              <span>Go Back to Front</span>
            </button>

            {/* Back Elements: Flap & Wax Seal (rendered ONLY when showBackElements is true) */}
            {showBackElements && (
              <>
                {/* ── 3D TOP FLAP ── */}
                <div style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: 195,
                  zIndex: 12,
                  transformOrigin: "top center",
                  transition: flapOpen
                    ? "transform 0.65s cubic-bezier(0.34, 1.2, 0.64, 1)"
                    : "none",
                  transform: flapOpen ? "rotateX(-180deg)" : "rotateX(0deg)",
                  pointerEvents: "none",
                }}>
                  {/* Front face of flap — visible when CLOSED */}
                  <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}>
                    <svg viewBox="0 0 620 195" width="100%" height="195" preserveAspectRatio="none" style={{ display: "block" }}>
                      <defs>
                        <linearGradient id="flapFrontGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f5ebe0" />
                          <stop offset="70%" stopColor="#e8dcd0" />
                          <stop offset="100%" stopColor="#d5c4b2" />
                        </linearGradient>
                        <filter id="flapShadow2" x="-5%" y="0%" width="110%" height="130%">
                          <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="rgba(0,0,0,0.3)" />
                        </filter>
                      </defs>
                      <polygon
                        points="0,0 620,0 310,195"
                        fill="url(#flapFrontGrad2)"
                        stroke="rgba(0,0,0,0.08)"
                        strokeWidth="1"
                        filter="url(#flapShadow2)"
                      />
                    </svg>
                  </div>

                  {/* Back face of flap — visible when OPEN */}
                  <div style={{
                    position: "absolute", inset: 0,
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateX(180deg)",
                  }}>
                    <svg viewBox="0 0 620 195" width="100%" height="195" preserveAspectRatio="none" style={{ display: "block" }}>
                      <defs>
                        <linearGradient id="flapBackGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2b0711" />
                          <stop offset="100%" stopColor="#4a0e1c" />
                        </linearGradient>
                      </defs>
                      <polygon points="0,0 620,0 310,195" fill="url(#flapBackGrad2)" />
                      <line x1="0" y1="0" x2="310" y2="195" stroke="rgba(212,175,55,0.4)" strokeWidth="2" />
                      <line x1="620" y1="0" x2="310" y2="195" stroke="rgba(212,175,55,0.4)" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* ── KHANSAAR WAX SEAL (Sits on apex) ── */}
                <div style={{
                  position: "absolute",
                  top: 155,
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 16,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.6rem",
                }}>
                  {!sealGone && (
                    <div
                      onClick={handleSealTap}
                      style={{
                        position: "relative",
                        width: 90, height: 90, borderRadius: "50%",
                        background: "radial-gradient(circle at 35% 35%, #2a0808 0%, #7f1d1d 50%, #3d0505 100%)",
                        border: "2.5px solid #d4af37",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: phase === "idle" ? "pointer" : "default",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.85), inset 0 2px 5px rgba(255,215,0,0.4), 0 0 15px rgba(212,175,55,0.25)",
                        animation: sealCracking ? "sealCrack 0.32s cubic-bezier(0.4,0,0.6,1) forwards" : undefined,
                        userSelect: "none",
                        touchAction: "manipulation",
                        transition: "transform 0.15s ease",
                      }}
                      onMouseEnter={e => { if (phase === "idle") e.currentTarget.style.transform = "scale(1.06)"; }}
                      onMouseLeave={e => { if (phase === "idle") e.currentTarget.style.transform = "scale(1)"; }}
                    >
                      <span style={{ fontSize: "1.85rem", lineHeight: 1, pointerEvents: "none" }}>⚔️</span>
                      <span style={{
                        position: "absolute", bottom: 12,
                        fontFamily: "sans-serif", fontSize: "0.5rem", fontWeight: 900,
                        color: "#fef08a", letterSpacing: "0.16em", textShadow: "0 0 6px rgba(217,169,79,0.8)",
                      }}>
                        KHANSAAR
                      </span>

                      {sealCracking && <SealBurst color="#d4af37" />}
                    </div>
                  )}

                  {/* Tap to Open Hint */}
                  {phase === "idle" && (
                    <div style={{
                      background: "rgba(10, 4, 7, 0.75)",
                      border: "1px solid rgba(212,175,55,0.35)",
                      borderRadius: 50,
                      padding: "5px 14px",
                      color: "#f3e5ab",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                      animation: "pulse-hint 2.2s ease-in-out infinite",
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    }}>
                      ✦ Tap Seal to Open ✦
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

        </div>{/* end 3D flipping card */}

        {/* ── FULL LETTER OVERLAY (Centered in viewport) ───────── */}
        {letterOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              width: "100%",
              height: "100dvh",
              minHeight: "-webkit-fill-available",
              zIndex: 9000,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(8, 3, 5, 0.85)",
              backdropFilter: "blur(12px)",
              padding: "max(14px, 2.5vh) max(14px, 3.5vw)",
              animation: "backdropFadeIn 0.3s ease forwards",
              overflowY: "auto",
            }}
            onClick={handleReseal}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: "#fffdf9",
                backgroundImage: "linear-gradient(rgba(147,197,253,0.22) 1px, transparent 1px)",
                backgroundSize: "100% 2.65rem",
                color: "#0a0f1d",
                borderRadius: 14,
                padding: "clamp(1.8rem, 4.5vw, 3.5rem) clamp(1.4rem, 4vw, 3.2rem) 2.2rem",
                maxWidth: 640,
                width: "100%",
                maxHeight: "88dvh",
                overflowY: "auto",
                margin: "auto",
                boxShadow: "0 30px 80px rgba(0,0,0,0.85), 0 0 50px rgba(212,175,55,0.25)",
                borderLeft: "4px double #d4af37",
                animation: "letterReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                position: "relative",
              }}
            >
              <div style={{
                position: "absolute", top: 0, bottom: 0, left: 54, width: 1,
                background: "rgba(212,175,55,0.4)", pointerEvents: "none",
              }} />

              {/* Header */}
              <div style={{ marginBottom: "1.6rem", paddingLeft: "1.6rem" }}>
                <h3 style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "clamp(2rem, 5.5vw, 2.6rem)",
                  color: "#0a0f1d", fontWeight: 700, lineHeight: 1.2,
                }}>
                  Dearest Divija,
                </h3>
              </div>

              {/* Letter content */}
              <div style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(1.45rem, 3.5vw, 1.75rem)",
                lineHeight: "2.65rem",
                color: "#0a0f1d", fontWeight: 600,
                paddingLeft: "1.6rem",
                display: "flex", flexDirection: "column", gap: "1.8rem",
              }}>
                <p style={{ margin: 0, maxWidth: 560 }}>
                  With great power comes great responsibility 🩺. You literally have the ability to save lives now as a future doctor 👩‍⚕️✨!
                </p>
                <p style={{ margin: 0, maxWidth: 560 }}>
                  I&apos;ve been watching you for the past decade 👀, especially through every &ldquo;why the hell is this happening to me?&rdquo; phase 🤦‍♀️. Bad things might happen fast, but truly great things take time… just like your height 🤏📏⏳.
                </p>
                <p style={{ margin: 0, maxWidth: 560 }}>
                  God gives you what you need, not what you greed ✨. And well, today you officially turned 23 — congrats, you&apos;re officially one step closer to full aunty status 👵!
                </p>
                <p style={{ margin: 0, maxWidth: 560, color: "#721021", fontSize: "clamp(1.5rem, 3.8vw, 1.95rem)", fontWeight: 700 }}>
                  Happy Birthday to my favorite person, best friend, big sis, bro, and coach 🥳🎂❤️
                </p>
              </div>

              {/* Footer / Reseal */}
              <div style={{
                textAlign: "center", marginTop: "2.5rem", paddingTop: "1.2rem",
                borderTop: "1px dashed rgba(212,175,55,0.4)",
              }}>
                <button
                  onClick={handleReseal}
                  style={{
                    background: "#5c111d", color: "#f3e5ab",
                    fontFamily: "'Outfit', sans-serif", fontSize: "0.86rem", fontWeight: 700,
                    padding: "0.75rem 2.2rem", borderRadius: 50,
                    border: "1px solid rgba(212,175,55,0.45)", cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(107,20,34,0.5)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "#7a1526";
                    e.currentTarget.style.boxShadow = "0 6px 28px rgba(212,175,55,0.35)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "#5c111d";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(107,20,34,0.5)";
                  }}
                >
                  Close &amp; Reseal Envelope ✉️
                </button>
                <p style={{ marginTop: "0.6rem", color: "#4a3b32", fontSize: "0.85rem", lineHeight: 1.6, fontWeight: 500 }}>
                  ✦ Tap outside to close ✦
                </p>
              </div>
            </div>
          </div>
        )}
      </div>{/* end perspective container */}

      {/* ── Normal Document Flow Flip Button for Mobile ── */}
      <div className="envelope-flow-cta" style={{
        marginTop: "1.4rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        zIndex: 20,
        width: "100%",
        maxWidth: 620,
      }}>
        <button
          onClick={handleFlip}
          style={{
            background: "linear-gradient(135deg, #5c111d, #380811)",
            color: "#f3e5ab",
            border: "1.5px solid rgba(212, 175, 55, 0.65)",
            borderRadius: 50,
            padding: "12px 28px",
            minHeight: "48px",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: "0 6px 25px rgba(0,0,0,0.65), 0 0 15px rgba(212,175,55,0.25)",
            fontSize: "0.88rem",
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            touchAction: "manipulation",
            transition: "all 0.2s ease",
          }}
        >
          {isFlipped ? (
            <>
              <span style={{ fontSize: "1.1rem" }}>↩</span>
              <span>Flip to Front Address</span>
            </>
          ) : (
            <>
              <span>Turn Envelope Over to Open</span>
              <span style={{ fontSize: "1.1rem" }}>↻</span>
            </>
          )}
        </button>
      </div>

      {/* ── CSS Animations ────────────────────────────────────── */}
      <style>{`
        @media (max-width: 640px) {
          .envelope-front-card {
            padding: 16px 18px !important;
          }
          .btn-floating-top-flip {
            display: none !important;
          }
          .btn-envelope-desktop-flip {
            display: none !important;
          }
          .btn-envelope-back-side-flip {
            display: none !important;
          }
          .envelope-front-bottom-bar {
            justify-content: center !important;
          }
          .envelope-flow-cta {
            display: flex !important;
          }
        }
        @media (min-width: 641px) {
          .envelope-flow-cta {
            display: none !important;
          }
        }

        @keyframes sealCrack {
          0%   { transform: scale(1);    opacity: 1; filter: brightness(1); }
          35%  { transform: scale(1.45); opacity: 0.9; filter: brightness(2.5); }
          65%  { transform: scale(0.8);  opacity: 0.6; }
          100% { transform: scale(0);    opacity: 0; }
        }
        @keyframes paperPeek {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(-35px); }
        }
        @keyframes letterReveal {
          0%   { opacity: 0; transform: scale(0.87) translateY(36px); }
          55%  { opacity: 1; transform: scale(1.015) translateY(-4px); }
          100% { opacity: 1; transform: scale(1)     translateY(0); }
        }
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse-hint {
          0%,100% { opacity: 0.6; transform: scale(1); }
          50%     { opacity: 1;   transform: scale(1.04); }
        }

        /* 4 burst directions for wax seal */
        @keyframes particle-0 {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + 55px), calc(-50% - 55px)) scale(0); opacity: 0; }
        }
        @keyframes particle-1 {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% - 55px), calc(-50% - 55px)) scale(0); opacity: 0; }
        }
        @keyframes particle-2 {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% + 48px), calc(-50% + 48px)) scale(0); opacity: 0; }
        }
        @keyframes particle-3 {
          0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          100% { transform: translate(calc(-50% - 48px), calc(-50% + 48px)) scale(0); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
