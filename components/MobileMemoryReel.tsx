"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { PhotoItem } from "@/content/photos";
import MobileSpiralGallery from "@/components/MobileSpiralGallery";

interface MobileMemoryReelProps {
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
}

// ── Sprocket Holes Row ──────────────────────────────────────────────────────
function SprocketRow({ count = 12 }: { count?: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "100%",
        padding: "0 6px",
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "11px",
            height: "9px",
            borderRadius: "2.5px",
            background: "rgba(30, 10, 18, 0.95)",
            border: "1.5px solid rgba(60, 20, 35, 0.9)",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)",
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

export default function MobileMemoryReel({ photos, onSelectPhoto }: MobileMemoryReelProps) {
  const [viewMode, setViewMode] = useState<"spiral" | "reel">("spiral");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerStartTimeRef = useRef(0);

  const total = photos.length;
  const activePhoto = photos[activeIndex] || photos[0];

  // Auto-drift progression every 4.6 seconds
  const startAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    if (!isAutoPlaying || isDragging) return;

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4600);
  }, [isAutoPlaying, isDragging, total]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [startAutoPlay]);

  // Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    isHorizontalSwipeRef.current = null;
    pointerStartTimeRef.current = performance.now();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipeRef.current === true) {
      setDragOffset(deltaX * 0.72);
    }
  };

  const handleTouchEnd = () => {
    const threshold = 38;
    if (dragOffset < -threshold) {
      setActiveIndex((prev) => (prev + 1) % total);
    } else if (dragOffset > threshold) {
      setActiveIndex((prev) => (prev - 1 + total) % total);
    }
    setDragOffset(0);
    setIsDragging(false);
    isHorizontalSwipeRef.current = null;
    setTimeout(() => { startAutoPlay(); }, 3000);
  };

  // Mouse drag support
  const handleMouseDown = (e: React.MouseEvent) => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    touchStartXRef.current = e.clientX;
    pointerStartTimeRef.current = performance.now();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - touchStartXRef.current;
    setDragOffset(deltaX * 0.72);
  };

  const handleMouseUp = () => {
    const threshold = 38;
    if (dragOffset < -threshold) {
      setActiveIndex((prev) => (prev + 1) % total);
    } else if (dragOffset > threshold) {
      setActiveIndex((prev) => (prev - 1 + total) % total);
    }
    setDragOffset(0);
    setIsDragging(false);
    setTimeout(() => { startAutoPlay(); }, 3000);
  };

  const goNext = () => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    setActiveIndex((prev) => (prev + 1) % total);
    setTimeout(startAutoPlay, 3000);
  };

  const goPrev = () => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    setActiveIndex((prev) => (prev - 1 + total) % total);
    setTimeout(startAutoPlay, 3000);
  };

  // Frames visible: center + 1 each side = 3 frames
  const visibleOffsets = [-2, -1, 0, 1, 2];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "0 0 12px 0",
        gap: "0",
      }}
    >
      {/* ── Mode Switcher ── */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          background: "rgba(24, 6, 15, 0.88)",
          border: "1px solid rgba(212, 175, 55, 0.45)",
          borderRadius: "32px",
          padding: "4px 8px",
          marginBottom: "14px",
          zIndex: 20,
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.6)",
        }}
      >
        <button
          type="button"
          onClick={() => setViewMode("spiral")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: viewMode === "spiral" ? "linear-gradient(135deg, #ffd700, #b45309)" : "transparent",
            color: viewMode === "spiral" ? "#12020a" : "#fef08a",
            fontWeight: 800,
            fontSize: "0.76rem",
            border: "none",
            borderRadius: "20px",
            padding: "5px 14px",
            cursor: "pointer",
            boxShadow: viewMode === "spiral" ? "0 2px 10px rgba(255, 215, 0, 0.5)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <span>🌀</span>
          <span>Cosmic Spiral</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode("reel")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            background: viewMode === "reel" ? "linear-gradient(135deg, #ffd700, #b45309)" : "transparent",
            color: viewMode === "reel" ? "#12020a" : "#fef08a",
            fontWeight: 800,
            fontSize: "0.76rem",
            border: "none",
            borderRadius: "20px",
            padding: "5px 14px",
            cursor: "pointer",
            boxShadow: viewMode === "reel" ? "0 2px 10px rgba(255, 215, 0, 0.5)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <span>🎞️</span>
          <span>Film Reel</span>
        </button>
      </div>

      {viewMode === "spiral" ? (
        <MobileSpiralGallery onSelectPhoto={onSelectPhoto} />
      ) : (
        <>
          {/* ── Active Caption Pill ── */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "linear-gradient(135deg, rgba(46, 12, 25, 0.9) 0%, rgba(24, 6, 15, 0.95) 100%)",
              border: "1px solid rgba(255, 215, 0, 0.6)",
              borderRadius: "16px",
              padding: "4px 14px",
              marginBottom: "10px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.7), 0 0 12px rgba(212, 175, 55, 0.25)",
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: "0.82rem" }}>🎞️</span>
            <span
              style={{
                color: "#fce8b2",
                fontSize: "0.74rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
            >
              {activePhoto.milestoneEra || "Cherished Moment"} · {activeIndex + 1} / {total}
            </span>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              AUTHENTIC CINEMA FILMSTRIP
              Dark celluloid strip — sprocket holes top & bottom
              Rectangular photo frames (NOT circles, NOT polaroids)
          ══════════════════════════════════════════════════════════════ */}
          <div
            style={{
              position: "relative",
              width: "100%",
              /* The strip itself */
              background: "linear-gradient(180deg, #0f0508 0%, #140709 50%, #0f0508 100%)",
              borderTop: "3px solid #251018",
              borderBottom: "3px solid #251018",
              overflow: "hidden",
              touchAction: "pan-y",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* ── Top Sprocket Row ── */}
            <div
              style={{
                height: "22px",
                display: "flex",
                alignItems: "center",
                background: "#0d0407",
                borderBottom: "1.5px solid #2a0f1a",
              }}
            >
              <SprocketRow count={14} />
            </div>

            {/* ── Photo Frames Strip ── */}
            <div
              style={{
                position: "relative",
                height: "230px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {/* Left & right cinema vignette gradient overlays */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "50px",
                  background: "linear-gradient(to right, #0d0407 0%, transparent 100%)",
                  zIndex: 20,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: "50px",
                  background: "linear-gradient(to left, #0d0407 0%, transparent 100%)",
                  zIndex: 20,
                  pointerEvents: "none",
                }}
              />

              {/* ── Render 5 filmstrip frames ── */}
              {visibleOffsets.map((offset) => {
                const photoIdx = (activeIndex + offset + total) % total;
                const photo = photos[photoIdx];
                const isCenter = offset === 0;

                /* Each frame shifts by frameWidth + gap */
                const FRAME_W = isCenter ? 175 : 130;
                const GAP = 6;
                const translateX = offset * (130 + GAP) + dragOffset;
                const scale = isCenter ? 1 : Math.abs(offset) === 1 ? 0.88 : 0.72;
                const opacity = isCenter ? 1 : Math.abs(offset) === 1 ? 0.7 : 0.35;
                const blur = isCenter ? 0 : Math.abs(offset) === 1 ? 0.8 : 2;
                const zIndex = isCenter ? 15 : 10 - Math.abs(offset);

                return (
                  <div
                    key={`${photoIdx}-${offset}`}
                    onClick={() => {
                      if (isCenter) {
                        onSelectPhoto(photo);
                      } else {
                        if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
                        setActiveIndex((activeIndex + offset + total) % total);
                        setTimeout(startAutoPlay, 3000);
                      }
                    }}
                    style={{
                      position: "absolute",
                      /* Rectangular filmstrip frame — NO border-radius */
                      width: `${FRAME_W}px`,
                      height: isCenter ? "210px" : "175px",
                      borderRadius: "1px",   /* ← only 1px — almost sharp corners like real film */
                      transform: `translateX(${translateX}px) scale(${scale})`,
                      zIndex,
                      opacity,
                      filter: blur > 0 ? `blur(${blur}px) brightness(${isCenter ? 1 : 0.75})` : "none",
                      transition: isDragging
                        ? "none"
                        : "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease, filter 0.3s ease, width 0.3s ease, height 0.3s ease",
                      cursor: "pointer",
                      willChange: "transform, opacity",
                      /* Thin orange-gold film edge dividers between frames */
                      outline: isCenter
                        ? "2.5px solid rgba(255, 180, 40, 0.9)"
                        : "1.5px solid rgba(80, 30, 10, 0.7)",
                      outlineOffset: "-1px",
                      boxShadow: isCenter
                        ? "0 0 30px rgba(255, 140, 20, 0.55), 0 8px 24px rgba(0,0,0,0.9)"
                        : "0 4px 12px rgba(0,0,0,0.7)",
                      overflow: "hidden",
                      background: "#100508",
                    }}
                  >
                    {/* The photo fills the full rectangular frame */}
                    <img
                      src={photo.src}
                      alt={photo.caption || "Divija Memory"}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: photo.fit === "contain" ? "contain" : "cover",
                        objectPosition: "center center",
                        display: "block",
                        pointerEvents: "none",
                        userSelect: "none",
                        WebkitUserSelect: "none",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='175' height='210'%3E%3Crect fill='%231a080e' width='175' height='210'/%3E%3Ctext x='50%25' y='50%25' fill='%23d4af37' font-size='14' text-anchor='middle' dy='.3em'%3E✨%3C/text%3E%3C/svg%3E";
                      }}
                    />

                    {/* Frame number label at bottom of active frame — like real film */}
                    {isCenter && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)",
                          padding: "18px 8px 6px",
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Courier New', Courier, monospace",
                            fontSize: "0.58rem",
                            color: "rgba(255, 200, 80, 0.85)",
                            letterSpacing: "0.12em",
                            fontWeight: 700,
                          }}
                        >
                          {String(activeIndex + 1).padStart(3, "0")}A
                        </span>
                        <span
                          style={{
                            fontFamily: "Georgia, serif",
                            fontStyle: "italic",
                            fontSize: "0.62rem",
                            color: "rgba(255, 240, 200, 0.9)",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            maxWidth: "110px",
                            textAlign: "center",
                          }}
                        >
                          {photo.tagline}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Courier New', Courier, monospace",
                            fontSize: "0.58rem",
                            color: "rgba(255, 200, 80, 0.85)",
                            letterSpacing: "0.12em",
                            fontWeight: 700,
                          }}
                        >
                          {String(activeIndex + 1).padStart(3, "0")}B
                        </span>
                      </div>
                    )}

                    {/* Tap-to-zoom icon on center frame */}
                    {isCenter && (
                      <div
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          background: "rgba(0,0,0,0.6)",
                          borderRadius: "50%",
                          width: "22px",
                          height: "22px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.68rem",
                          pointerEvents: "none",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                        }}
                      >
                        🔍
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── Bottom Sprocket Row ── */}
            <div
              style={{
                height: "22px",
                display: "flex",
                alignItems: "center",
                background: "#0d0407",
                borderTop: "1.5px solid #2a0f1a",
              }}
            >
              <SprocketRow count={14} />
            </div>

            {/* ── Left Arrow ── */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous memory photo"
              style={{
                position: "absolute",
                left: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(12, 3, 8, 0.88)",
                border: "1.5px solid rgba(255, 180, 40, 0.7)",
                color: "#ffb428",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 40,
                boxShadow: "0 4px 14px rgba(0,0,0,0.8)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            >
              ‹
            </button>

            {/* ── Right Arrow ── */}
            <button
              type="button"
              onClick={goNext}
              aria-label="Next memory photo"
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                background: "rgba(12, 3, 8, 0.88)",
                border: "1.5px solid rgba(255, 180, 40, 0.7)",
                color: "#ffb428",
                fontSize: "1.2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 40,
                boxShadow: "0 4px 14px rgba(0,0,0,0.8)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            >
              ›
            </button>
          </div>

          {/* ── Tap to zoom prompt ── */}
          <div
            onClick={() => onSelectPhoto(activePhoto)}
            role="button"
            tabIndex={0}
            aria-label="Tap to zoom photo and view story"
            style={{
              marginTop: "10px",
              background: "linear-gradient(135deg, rgba(38, 9, 21, 0.94) 0%, rgba(18, 4, 12, 0.96) 100%)",
              border: "1.2px solid rgba(255, 180, 40, 0.75)",
              borderRadius: "20px",
              padding: "6px 18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.85), 0 0 16px rgba(255, 140, 20, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>🔍</span>
            <span
              style={{
                color: "#fff3cf",
                fontSize: "0.78rem",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              Tap to zoom &amp; read story
            </span>
            <span style={{ fontSize: "0.72rem", color: "#ffb428" }}>✦</span>
          </div>

          {/* ── Bottom Controls ── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              marginTop: "10px",
              zIndex: 10,
            }}
          >
            {/* Play / Pause */}
            <button
              type="button"
              onClick={() => setIsAutoPlaying((prev) => !prev)}
              style={{
                background: isAutoPlaying ? "rgba(80, 20, 10, 0.5)" : "rgba(255, 180, 40, 0.18)",
                border: isAutoPlaying
                  ? "1px solid rgba(255, 100, 30, 0.5)"
                  : "1px solid rgba(255, 180, 40, 0.75)",
                borderRadius: "14px",
                padding: "3px 10px",
                color: isAutoPlaying ? "#ffaa60" : "#ffb428",
                fontSize: "0.68rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.05em",
              }}
            >
              <span>{isAutoPlaying ? "⏸" : "▶"}</span>
              <span>{isAutoPlaying ? "PAUSE" : "PLAY"}</span>
            </button>

            {/* Dot indicators */}
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {Array.from({ length: 5 }).map((_, dotIdx) => {
                const currentSlot = activeIndex % 5;
                const isDotActive = currentSlot === dotIdx;
                return (
                  <div
                    key={dotIdx}
                    style={{
                      width: isDotActive ? "16px" : "5px",
                      height: "5px",
                      borderRadius: "2px",
                      background: isDotActive
                        ? "linear-gradient(90deg, #ffb428, #ff8c00)"
                        : "rgba(255, 140, 0, 0.28)",
                      boxShadow: isDotActive ? "0 0 8px rgba(255, 140, 0, 0.85)" : "none",
                      transition: "all 0.3s ease",
                    }}
                  />
                );
              })}
            </div>

            {/* Swipe hint */}
            <span
              style={{
                color: "rgba(255, 200, 120, 0.6)",
                fontSize: "0.64rem",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.04em",
              }}
            >
              ← SWIPE →
            </span>
          </div>
        </>
      )}
    </div>
  );
}
