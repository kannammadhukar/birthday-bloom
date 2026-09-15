"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { PhotoItem } from "@/content/photos";
import MobileSpiralGallery from "@/components/MobileSpiralGallery";

interface MobileMemoryReelProps {
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
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

    // Detect gesture direction on first significant movement
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    // Only drag carousel horizontally if user is swiping sideways
    if (isHorizontalSwipeRef.current === true) {
      // Damped elastic drag
      setDragOffset(deltaX * 0.72);
    }
  };

  const handleTouchEnd = () => {
    const threshold = 38;

    if (dragOffset < -threshold) {
      // Swiped left -> Next photo
      setActiveIndex((prev) => (prev + 1) % total);
    } else if (dragOffset > threshold) {
      // Swiped right -> Previous photo
      setActiveIndex((prev) => (prev - 1 + total) % total);
    }

    setDragOffset(0);
    setIsDragging(false);
    isHorizontalSwipeRef.current = null;

    // Restart auto-drift after 3 seconds of inactivity
    setTimeout(() => {
      startAutoPlay();
    }, 3000);
  };

  // Mouse drag support for desktop emulation
  const handleMouseDown = (e: React.MouseEvent) => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    touchStartXRef.current = e.clientX;
    pointerStartTimeRef.current = performance.now();
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - touchStartXRef.current;
    setDragOffset(deltaX * 0.65);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    if (dragOffset < -35) {
      setActiveIndex((prev) => (prev + 1) % total);
    } else if (dragOffset > 35) {
      setActiveIndex((prev) => (prev - 1 + total) % total);
    }
    setDragOffset(0);
    setIsDragging(false);
    setTimeout(() => startAutoPlay(), 3000);
  };

  // Navigation actions
  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  // Visible card offsets around the active card: -2, -1, 0, 1, 2
  const visibleOffsets = [-2, -1, 0, 1, 2];

  return (
    <div
      className="mobile-cinematic-reel-container"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "520px",
        margin: "0 auto",
        padding: "0.5rem 0 1.2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* ── Mode Toggle Switch (Spiral vs Linear Reel) ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(24, 6, 16, 0.92)",
          backdropFilter: "blur(14px)",
          border: "1.5px solid rgba(255, 215, 0, 0.5)",
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
            background:
              viewMode === "spiral"
                ? "linear-gradient(135deg, #ffd700, #b45309)"
                : "transparent",
            color: viewMode === "spiral" ? "#12020a" : "#fef08a",
            fontWeight: 800,
            fontSize: "0.76rem",
            border: "none",
            borderRadius: "20px",
            padding: "5px 14px",
            cursor: "pointer",
            boxShadow:
              viewMode === "spiral" ? "0 2px 10px rgba(255, 215, 0, 0.5)" : "none",
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
            background:
              viewMode === "reel"
                ? "linear-gradient(135deg, #ffd700, #b45309)"
                : "transparent",
            color: viewMode === "reel" ? "#12020a" : "#fef08a",
            fontWeight: 800,
            fontSize: "0.76rem",
            border: "none",
            borderRadius: "20px",
            padding: "5px 14px",
            cursor: "pointer",
            boxShadow:
              viewMode === "reel" ? "0 2px 10px rgba(255, 215, 0, 0.5)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <span>🎞️</span>
          <span>Classic Reel</span>
        </button>
      </div>

      {viewMode === "spiral" ? (
        <MobileSpiralGallery onSelectPhoto={onSelectPhoto} />
      ) : (
        <>
          {/* ── Active Milestone Pill Badge ── */}
          <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "linear-gradient(135deg, rgba(46, 12, 25, 0.9) 0%, rgba(24, 6, 15, 0.95) 100%)",
          border: "1px solid rgba(255, 215, 0, 0.6)",
          borderRadius: "16px",
          padding: "4px 14px",
          marginBottom: "1.1rem",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.7), 0 0 12px rgba(212, 175, 55, 0.25)",
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: "0.82rem" }}>👑</span>
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
          {activePhoto.milestoneEra || "Cherished Milestone"} · {activeIndex + 1} of {total}
        </span>
      </div>

      {/* ── 3D Perspective Stage ── */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "360px",
          perspective: "1100px",
          perspectiveOrigin: "50% 50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "pan-y",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Subtle Warm Starlight Radial Halo behind active card */}
        <div
          style={{
            position: "absolute",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212, 175, 55, 0.25) 0%, rgba(122, 21, 38, 0.15) 50%, transparent 70%)",
            filter: "blur(30px)",
            pointerEvents: "none",
            zIndex: 5,
          }}
        />

        {/* ── Render 3D Coverflow Cards ── */}
        {visibleOffsets.map((offset) => {
          const photoIdx = (activeIndex + offset + total) % total;
          const photo = photos[photoIdx];
          const isCenter = offset === 0;

          // Compute 3D transforms
          const baseSpacing = 135; // horizontal spacing in px
          const translateX = offset * baseSpacing + dragOffset;
          const rotateY = isCenter ? (dragOffset * -0.06) : offset * -24;
          const scale = isCenter ? 1.14 : Math.abs(offset) === 1 ? 0.84 : 0.65;
          const opacity = isCenter ? 1.0 : Math.abs(offset) === 1 ? 0.78 : 0.26;
          const zIndex = isCenter ? 35 : 25 - Math.abs(offset) * 5;
          const blurAmount = isCenter ? 0 : Math.abs(offset) === 1 ? 0.5 : 2;

          return (
            <div
              key={`${photoIdx}-${offset}`}
              onClick={() => {
                if (isCenter) {
                  onSelectPhoto(photo);
                } else {
                  setActiveIndex((activeIndex + offset + total) % total);
                }
              }}
              style={{
                position: "absolute",
                width: "clamp(185px, 54vw, 215px)",
                height: "clamp(245px, 72vw, 285px)",
                transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
                transformStyle: "preserve-3d",
                zIndex,
                opacity,
                filter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
                transition: isDragging
                  ? "none"
                  : "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease, filter 0.35s ease",
                cursor: "pointer",
                willChange: "transform, opacity",
              }}
            >
              {/* Polaroid Frame */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: isCenter ? "14px" : "10px",
                  background: isCenter
                    ? "linear-gradient(145deg, #fffdf8 0%, #fff6ea 100%)"
                    : "#fffdf9",
                  padding: isCenter ? "7px 7px 22px 7px" : "5px 5px 12px 5px",
                  boxShadow: isCenter
                    ? "0 22px 55px rgba(0,0,0,0.92), 0 0 35px rgba(212, 175, 55, 0.75), 0 0 10px rgba(255, 235, 170, 0.55)"
                    : "0 12px 30px rgba(0,0,0,0.75), 0 0 12px rgba(122, 21, 38, 0.35)",
                  border: isCenter
                    ? "2px solid #ffd700"
                    : "1.5px solid rgba(255, 255, 255, 0.85)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  boxSizing: "border-box",
                  position: "relative",
                  transition: "box-shadow 0.4s ease, border-color 0.3s ease",
                }}
              >
                {/* Heart Pin on Center Card */}
                {isCenter && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "1.05rem",
                      zIndex: 10,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))",
                    }}
                  >
                    💖
                  </div>
                )}

                {/* Inner Image Frame */}
                <div
                  style={{
                    position: "relative",
                    flex: 1,
                    width: "100%",
                    borderRadius: isCenter ? "10px" : "7px",
                    overflow: "hidden",
                    background: "#160e13",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={photo.src}
                    alt={photo.caption}
                    loading="lazy"
                    draggable={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: photo.fit === "contain" ? "contain" : "cover",
                      objectPosition: "center center",
                      display: "block",
                      pointerEvents: "none",
                      filter: isCenter ? "contrast(1.04) brightness(1.02)" : "contrast(0.96) brightness(0.88)",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260'%3E%3Crect fill='%231f1318' width='200' height='260'/%3E%3Ctext x='50%25' y='50%25' fill='%23d4af37' font-size='14' text-anchor='middle' dy='.3em'%3EDivija%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Polaroid Tagline on Chin */}
                <div
                  style={{
                    height: isCenter ? "28px" : "12px",
                    minHeight: isCenter ? "28px" : "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "4px",
                    padding: "0 4px",
                    boxSizing: "border-box",
                  }}
                >
                  {isCenter && (
                    <span
                      style={{
                        fontSize: "0.74rem",
                        fontFamily: "'Iowan Old Style', Georgia, serif",
                        fontStyle: "italic",
                        fontWeight: 700,
                        color: "#240b15",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        width: "100%",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {photo.tagline}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* ── Left Navigation Arrow Button ── */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous memory photo"
          style={{
            position: "absolute",
            left: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "rgba(38, 9, 21, 0.85)",
            border: "1.5px solid rgba(255, 215, 0, 0.65)",
            color: "#ffd700",
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 40,
            boxShadow: "0 4px 14px rgba(0,0,0,0.7), 0 0 10px rgba(212, 175, 55, 0.3)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          ‹
        </button>

        {/* ── Right Navigation Arrow Button ── */}
        <button
          type="button"
          onClick={goNext}
          aria-label="Next memory photo"
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            background: "rgba(38, 9, 21, 0.85)",
            border: "1.5px solid rgba(255, 215, 0, 0.65)",
            color: "#ffd700",
            fontSize: "1.1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 40,
            boxShadow: "0 4px 14px rgba(0,0,0,0.7), 0 0 10px rgba(212, 175, 55, 0.3)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          ›
        </button>
      </div>

      {/* ── Interactive Tap to Zoom Prompt Pill ── */}
      <div
        onClick={() => onSelectPhoto(activePhoto)}
        role="button"
        tabIndex={0}
        aria-label="Tap to zoom photo and view story"
        style={{
          marginTop: "1.1rem",
          background: "linear-gradient(135deg, rgba(38, 9, 21, 0.94) 0%, rgba(18, 4, 12, 0.96) 100%)",
          border: "1.2px solid rgba(255, 215, 0, 0.75)",
          borderRadius: "20px",
          padding: "6px 18px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.85), 0 0 16px rgba(212, 175, 55, 0.35)",
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          cursor: "pointer",
          zIndex: 10,
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
        }}
      >
        <span style={{ fontSize: "0.85rem" }}>🔍</span>
        <span
          style={{
            color: "#fff3cf",
            fontSize: "0.78rem",
            fontFamily: "'Iowan Old Style', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          Tap photo to read story & zoom
        </span>
        <span style={{ fontSize: "0.72rem", color: "#ffd700" }}>✦</span>
      </div>

      {/* ── Bottom Controls & Sliding Progress Dots ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          marginTop: "1.1rem",
          zIndex: 10,
        }}
      >
        {/* Play / Pause Auto-Drift Button */}
        <button
          type="button"
          onClick={() => setIsAutoPlaying((prev) => !prev)}
          style={{
            background: isAutoPlaying
              ? "rgba(212, 175, 55, 0.14)"
              : "rgba(234, 179, 8, 0.22)",
            border: isAutoPlaying
              ? "1px solid rgba(212, 175, 55, 0.45)"
              : "1px solid rgba(250, 204, 21, 0.75)",
            borderRadius: "14px",
            padding: "3px 10px",
            color: isAutoPlaying ? "#fce8b2" : "#fef08a",
            fontSize: "0.68rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
          title="Pause or resume auto-drift"
        >
          <span>{isAutoPlaying ? "⏸" : "▶"}</span>
          <span>{isAutoPlaying ? "Pause Drift" : "Auto-Drift"}</span>
        </button>

        {/* Minimalist 5-dot sliding indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {Array.from({ length: 5 }).map((_, dotIdx) => {
            const currentSlot = activeIndex % 5;
            const isDotActive = currentSlot === dotIdx;
            return (
              <div
                key={dotIdx}
                style={{
                  width: isDotActive ? "16px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background: isDotActive
                    ? "linear-gradient(90deg, #ffd700, #ffb700)"
                    : "rgba(212, 175, 55, 0.28)",
                  boxShadow: isDotActive
                    ? "0 0 8px rgba(255, 215, 0, 0.85)"
                    : "none",
                  transition: "all 0.3s ease",
                }}
              />
            );
          })}
        </div>

        {/* Swipe Hint */}
        <span
          style={{
            color: "rgba(243, 237, 225, 0.65)",
            fontSize: "0.68rem",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            letterSpacing: "0.04em",
          }}
        >
          👆 Swipe left/right
        </span>
      </div>
        </>
      )}
    </div>
  );
}
