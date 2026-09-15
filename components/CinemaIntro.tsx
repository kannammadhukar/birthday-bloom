"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { content } from "@/content";

interface Props {
  onDone: () => void;
}

function getTimeLeft(target: string) {
  const now = Date.now();
  const end = new Date(target).getTime();
  const diff = Math.max(0, end - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff <= 0 };
}

const ROLL_NUMBERS = [15, 16, 17, 18, 19, 20, 21, 22, 23];

export default function CinemaIntro({ onDone }: Props) {
  const [scene, setScene] = useState<1 | 2 | 3 | 4>(1);
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, done: true });
  const [odometerVal, setOdometerVal] = useState(15);
  const [odometerLanded, setOdometerLanded] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const hasFinishedRef = useRef(false);

  // Pre-warm Web Audio API on click / touch
  const preWarmAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        ctx.close().catch(() => {});
      }
    } catch {}
  };

  const finish = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    preWarmAudio();
    onDone();
  };

  const handleSkip = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsClosing(true);
    setTimeout(finish, 400);
  };

  // Countdown timer for Scene 1
  useEffect(() => {
    setTime(getTimeLeft(content.targetCountdownDate));
    const t = setInterval(() => setTime(getTimeLeft(content.targetCountdownDate)), 1000);
    return () => clearInterval(t);
  }, []);

  // Scene 1 Auto-Progression after 5.5s
  useEffect(() => {
    if (scene !== 1) return;
    const timer = setTimeout(() => {
      setScene(2);
    }, 5500);
    return () => clearTimeout(timer);
  }, [scene]);

  // Scene 2 (Curtain Close) Auto-Progression after 1.2s
  useEffect(() => {
    if (scene !== 2) return;
    const timer = setTimeout(() => {
      setScene(3);
    }, 1200);
    return () => clearTimeout(timer);
  }, [scene]);

  // Scene 3 (Odometer Roll)
  useEffect(() => {
    if (scene !== 3) return;
    let idx = 0;
    const rollInterval = setInterval(() => {
      idx++;
      if (idx < ROLL_NUMBERS.length) {
        setOdometerVal(ROLL_NUMBERS[idx]);
      } else {
        clearInterval(rollInterval);
        setOdometerLanded(true);
      }
    }, 140);

    // After roll lands + ember burning display (total ~4s in Scene 3), advance to Scene 4
    const advanceTimer = setTimeout(() => {
      setScene(4);
    }, 4200);

    return () => {
      clearInterval(rollInterval);
      clearTimeout(advanceTimer);
    };
  }, [scene]);

  // Scene 4 (Balloon Float into Hero)
  useEffect(() => {
    if (scene !== 4) return;
    const finishTimer = setTimeout(() => {
      finish();
    }, 2400);
    return () => clearTimeout(finishTimer);
  }, [scene]);

  return (
    <div
      onClick={() => {
        if (scene === 1) setScene(2);
        else if (scene === 3 && odometerLanded) setScene(4);
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        backgroundColor: "#080305",
        opacity: isClosing ? 0 : 1,
        transition: "opacity 0.45s ease",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* Persistent Skip Intro Button */}
      <button
        onClick={handleSkip}
        style={{
          position: "absolute",
          top: 18,
          right: 20,
          zIndex: 100,
          padding: "6px 16px",
          borderRadius: 20,
          background: "rgba(18, 6, 12, 0.75)",
          border: "1px solid rgba(212, 175, 55, 0.4)",
          color: "#f3e5ab",
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.82rem",
          fontWeight: 600,
          letterSpacing: "0.06em",
          backdropFilter: "blur(8px)",
          cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span>⏭ Skip Intro</span>
      </button>

      {/* ═══════════════════════════════════════════════════════════
          SCENE 1: "NOW SHOWING" TICKET INTRO
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {scene === 1 && (
          <motion.div
            key="scene-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle at 50% 35%, #2c0716 0%, #16040d 65%, #080205 100%)",
            }}
          >
            {/* Shimmering Gold Pinstripes Overlay on Velvet Purple */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "repeating-linear-gradient(90deg, transparent 0, transparent 40px, rgba(212, 175, 55, 0.08) 40px, rgba(212, 175, 55, 0.08) 42px)",
                pointerEvents: "none",
              }}
            />

            {/* Festoon String-Light Garland Across the Top */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 48,
                display: "flex",
                justifyContent: "space-around",
                alignItems: "flex-start",
                padding: "6px 20px",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 1, height: 12 + (i % 3) * 6, background: "rgba(212, 175, 55, 0.6)" }} />
                  <div
                    className="festoon-bulb"
                    style={{
                      width: 10,
                      height: 14,
                      borderRadius: "50% 50% 45% 45%",
                      background: "radial-gradient(circle, #fffbeb 0%, #fde047 50%, #d97706 100%)",
                      boxShadow: "0 0 12px 3px rgba(253, 224, 71, 0.7)",
                      animation: `bulbGlow 2s ease-in-out infinite ${(i * 0.15) % 1.5}s`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Scrolling Marquee Ticker Banner */}
            <div
              style={{
                position: "absolute",
                top: 48,
                left: 0,
                right: 0,
                background: "rgba(18, 4, 12, 0.88)",
                borderTop: "1px solid rgba(212, 175, 55, 0.3)",
                borderBottom: "1px solid rgba(212, 175, 55, 0.3)",
                padding: "6px 0",
                overflow: "hidden",
                whiteSpace: "nowrap",
                zIndex: 10,
              }}
            >
              <div className="marquee-track" style={{ display: "inline-block" }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      letterSpacing: "0.22em",
                      color: "#f3e5ab",
                      textTransform: "uppercase",
                      marginRight: "4rem",
                    }}
                  >
                    ✦ SAVE THE DATE · THURSDAY, 11 SEPTEMBER 2026 · DIVIJA&apos;S 23RD BIRTHDAY GALA · ✦
                  </span>
                ))}
              </div>
            </div>

            {/* Ticket Content Box */}
            <div style={{ textAlign: "center", zIndex: 10, padding: "0 20px", maxWidth: 680 }}>
              {/* Bold Title "NOW SHOWING" */}
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(2.8rem, 8.5vw, 5.5rem)",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  color: "#ffffff",
                  textShadow: "0 0 40px rgba(212, 175, 55, 0.6), 0 4px 18px rgba(0,0,0,0.8)",
                  margin: "0 0 0.4rem 0",
                }}
              >
                ✨ NOW SHOWING ✨
              </h1>

              {/* Script Subtitle */}
              <p
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "clamp(1.4rem, 4vw, 2.2rem)",
                  color: "#f6d896",
                  margin: "0 0 1.8rem 0",
                  fontWeight: 600,
                }}
              >
                a Sreeja production, live Thursday, 11 September 2026
              </p>

              {/* Golden Divider */}
              <div
                style={{
                  width: 140,
                  height: 2,
                  background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
                  margin: "0 auto 1.8rem auto",
                }}
              />

              {/* Live Flip-Clock Countdown */}
              <div style={{ display: "flex", justifyContent: "center", gap: "clamp(8px, 2vw, 16px)", marginBottom: "2rem" }}>
                {time.done ? (
                  <div
                    style={{
                      background: "rgba(24, 6, 16, 0.9)",
                      border: "2px solid #d4af37",
                      borderRadius: 12,
                      padding: "12px 28px",
                      color: "#fce8b2",
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      boxShadow: "0 0 25px rgba(212, 175, 55, 0.4)",
                    }}
                  >
                    🎉 TODAY IS THE GALA!
                  </div>
                ) : (
                  [
                    { label: "DAYS", val: time.d, prominent: true },
                    { label: "HOURS", val: time.h },
                    { label: "MINUTES", val: time.m },
                    { label: "SECONDS", val: time.s },
                  ].map(({ label, val, prominent }) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: prominent ? "clamp(64px, 16vw, 88px)" : "clamp(52px, 13vw, 70px)",
                          height: prominent ? "clamp(72px, 18vw, 98px)" : "clamp(58px, 14vw, 76px)",
                          background: "linear-gradient(180deg, #1f0714 0%, #12040b 50%, #0a0206 100%)",
                          border: prominent ? "2px solid #d4af37" : "1px solid rgba(212, 175, 55, 0.45)",
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: prominent ? "0 8px 24px rgba(0,0,0,0.8), 0 0 20px rgba(212, 175, 55, 0.3)" : "0 4px 14px rgba(0,0,0,0.6)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {/* Horizontal Split Flip Crease */}
                        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(0,0,0,0.7)" }} />
                        <span
                          style={{
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontSize: prominent ? "clamp(2rem, 5vw, 2.8rem)" : "clamp(1.4rem, 3.8vw, 2rem)",
                            fontWeight: 700,
                            color: prominent ? "#f3e5ab" : "#ffffff",
                          }}
                        >
                          {String(val).padStart(2, "0")}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#e8c988", letterSpacing: "0.14em", marginTop: 6 }}>
                        {label}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Tap to Begin Hint */}
              <p
                className="tap-hint-anim"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.78rem",
                  letterSpacing: "0.22em",
                  color: "rgba(255, 255, 255, 0.6)",
                  textTransform: "uppercase",
                }}
              >
                ✦ TAP ANYWHERE TO BEGIN PREMIERE ✦
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          SCENE 2: DUAL CURTAIN CLOSE WITH FLASH
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {scene === 2 && (
          <div style={{ position: "absolute", inset: 0, zIndex: 50, overflow: "hidden" }}>
            {/* Left Curtain Panel Sliding In */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: "50.5%",
                background: "radial-gradient(circle at 100% 50%, #300818 0%, #16040d 65%, #080205 100%)",
                borderRight: "2px solid #d4af37",
                boxShadow: "10px 0 35px rgba(0,0,0,0.9)",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, transparent 0, transparent 35px, rgba(212, 175, 55, 0.12) 35px, rgba(212, 175, 55, 0.12) 37px)" }} />
            </motion.div>

            {/* Right Curtain Panel Sliding In */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              transition={{ duration: 0.85, ease: [0.76, 0, 0.24, 1] }}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: "50.5%",
                background: "radial-gradient(circle at 0% 50%, #300818 0%, #16040d 65%, #080205 100%)",
                borderLeft: "2px solid #d4af37",
                boxShadow: "-10px 0 35px rgba(0,0,0,0.9)",
              }}
            >
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(90deg, transparent 0, transparent 35px, rgba(212, 175, 55, 0.12) 35px, rgba(212, 175, 55, 0.12) 37px)" }} />
            </motion.div>

            {/* Brief Flash on Center Seal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 0.85, 0] }}
              transition={{ duration: 1.1, times: [0, 0.65, 0.85, 1] }}
              style={{
                position: "absolute",
                inset: 0,
                background: "#ffffff",
                pointerEvents: "none",
                zIndex: 60,
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          SCENE 3: COSMIC ODOMETER AGE REVEAL (BURNING 23)
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {scene === 3 && (
          <motion.div
            key="scene-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "radial-gradient(circle at 50% 50%, #1a0628 0%, #0c0214 55%, #05010a 100%)",
            }}
          >
            {/* Cosmic Starfield Sparks */}
            <div className="stars" />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.3em",
                color: "#f6d896",
                textTransform: "uppercase",
                marginBottom: "1rem",
                zIndex: 10,
              }}
            >
              Turning
            </motion.p>

            {/* Slot-Machine Odometer Display */}
            <div
              style={{
                position: "relative",
                zIndex: 10,
                padding: "10px 40px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                className={odometerLanded ? "burning-ember-num" : ""}
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(6rem, 24vw, 12rem)",
                  fontWeight: 800,
                  lineHeight: 1,
                  color: odometerLanded ? "#fef08a" : "#ffffff",
                  textShadow: odometerLanded
                    ? "0 0 35px #d4af37, 0 0 70px #f59e0b, 0 0 110px #b45309"
                    : "0 0 25px rgba(255,255,255,0.4)",
                  transition: "color 0.4s ease, text-shadow 0.4s ease",
                }}
              >
                {odometerVal}
              </div>

              {/* Rising Light Sparks / Burning Ember Particles */}
              {odometerLanded && (
                <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  {Array.from({ length: 18 }).map((_, i) => (
                    <div
                      key={i}
                      className="ember-particle"
                      style={{
                        position: "absolute",
                        bottom: "20%",
                        left: `${20 + (i * 4) % 60}%`,
                        width: 4 + (i % 3) * 2,
                        height: 4 + (i % 3) * 2,
                        borderRadius: "50%",
                        background: i % 2 === 0 ? "#fef08a" : "#f59e0b",
                        boxShadow: "0 0 8px 2px #d4af37",
                        animation: `emberDrift 1.8s ease-out infinite ${(i * 0.12) % 1.5}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Subtitle Message */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: "clamp(1.6rem, 4.5vw, 2.5rem)",
                color: "#f3e5ab",
                fontWeight: 700,
                marginTop: "1.2rem",
                zIndex: 10,
              }}
            >
              Years of pure magic ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          SCENE 4: BALLOON TRANSITION INTO EXISTING HERO
      ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {scene === 4 && (
          <motion.div
            key="scene-4"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "transparent",
              pointerEvents: "none",
              zIndex: 70,
            }}
          >
            {/* 3 Jewel-Toned Balloons Floating Upward */}
            {[
              { left: "25%", color: "#9333ea", delay: 0 },
              { left: "50%", color: "#d4af37", delay: 0.2 },
              { left: "75%", color: "#be185d", delay: 0.4 },
            ].map((b, i) => (
              <motion.div
                key={i}
                initial={{ y: "100vh", opacity: 0 }}
                animate={{ y: "-120vh", opacity: [0, 1, 1, 0] }}
                transition={{ duration: 2.2, delay: b.delay, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  left: b.left,
                  width: 56,
                  height: 72,
                }}
              >
                <svg width="56" height="72" viewBox="0 0 56 72" fill="none">
                  <ellipse cx="28" cy="28" rx="24" ry="28" fill={b.color} opacity="0.92" />
                  <ellipse cx="20" cy="20" rx="6" ry="8" fill="#ffffff" opacity="0.3" />
                  <path d="M28 56 Q32 64 28 72" stroke={b.color} strokeWidth="2" fill="none" />
                </svg>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bulbGlow {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee-track {
          animation: marqueeScroll 25s linear infinite;
        }

        @keyframes emberDrift {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-140px) scale(0.3); opacity: 0; }
        }

        .tap-hint-anim {
          animation: tapHintPulse 2s ease-in-out infinite;
        }

        @keyframes tapHintPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}
