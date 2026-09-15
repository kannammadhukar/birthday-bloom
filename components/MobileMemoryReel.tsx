"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { PhotoItem } from "@/content/photos";

interface MobileMemoryReelProps {
  photos: PhotoItem[];
  onSelectPhoto: (photo: PhotoItem) => void;
}

// ── Continuous Moving Sprocket Hole Track ──────────────────────────────────
// Sprocket holes slide in real-time with drag & frame progression
function MovingSprocketTrack({
  scrollOffset,
  edgeText,
  isTop = true,
}: {
  scrollOffset: number;
  edgeText: string;
  isTop?: boolean;
}) {
  // Pitch between holes in pixels
  const PITCH = 24;
  // Normalized shift so it loops seamlessly
  const shift = ((scrollOffset % PITCH) + PITCH) % PITCH;

  return (
    <div
      style={{
        position: "relative",
        height: "26px",
        width: "100%",
        background: "linear-gradient(180deg, #090306 0%, #15060d 50%, #0a0307 100%)",
        borderBottom: isTop ? "1.5px solid #2d0e1b" : "none",
        borderTop: !isTop ? "1.5px solid #2d0e1b" : "none",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      {/* Edge markings running across the film track (Kodak 35mm aesthetic) */}
      <div
        style={{
          position: "absolute",
          top: isTop ? "1px" : "auto",
          bottom: !isTop ? "1px" : "auto",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          color: "rgba(255, 190, 70, 0.45)",
          fontSize: "0.5rem",
          fontFamily: "'Courier New', Courier, monospace",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          transform: `translateX(${-shift}px)`,
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        <span>EASTMAN 5219</span>
        <span>•</span>
        <span>KODAK VISION3 35MM</span>
        <span>•</span>
        <span>SAFETY FILM</span>
        <span>•</span>
        <span>{edgeText}</span>
        <span>•</span>
        <span>DIVIJA 23RD GALA</span>
      </div>

      {/* Repeating punched sprocket perforation holes */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "calc(100% + 120px)",
          transform: `translateX(${-shift - 20}px)`,
          paddingLeft: "6px",
        }}
      >
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            style={{
              width: "12px",
              height: "10px",
              borderRadius: "2.5px",
              background: "#030002",
              border: "1.2px solid rgba(80, 26, 42, 0.95)",
              boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.95), 0 0.5px 1px rgba(255, 180, 60, 0.15)",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MobileMemoryReel({ photos, onSelectPhoto }: MobileMemoryReelProps) {
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

  // Trigger gentle haptic tick on mobile if supported
  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
  }, []);

  // Continuous auto-drift progression every 4.2 seconds
  const startAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    if (!isAutoPlaying || isDragging) return;

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4200);
  }, [isAutoPlaying, isDragging, total]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [startAutoPlay]);

  // Touch Handlers with flick momentum detection
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
      if (Math.abs(deltaX) > 7 || Math.abs(deltaY) > 7) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipeRef.current === true) {
      setDragOffset(deltaX * 0.78);
    }
  };

  const handleTouchEnd = () => {
    const elapsed = performance.now() - pointerStartTimeRef.current;
    const velocity = Math.abs(dragOffset) / Math.max(elapsed, 1);
    const isFlick = velocity > 0.32 && Math.abs(dragOffset) > 20;
    const threshold = 34;

    if (dragOffset < -threshold || (isFlick && dragOffset < 0)) {
      setActiveIndex((prev) => (prev + 1) % total);
      triggerHaptic();
    } else if (dragOffset > threshold || (isFlick && dragOffset > 0)) {
      setActiveIndex((prev) => (prev - 1 + total) % total);
      triggerHaptic();
    }

    setDragOffset(0);
    setIsDragging(false);
    isHorizontalSwipeRef.current = null;
    setTimeout(startAutoPlay, 3200);
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
    setDragOffset(deltaX * 0.78);
  };

  const handleMouseUp = () => {
    const threshold = 34;
    if (dragOffset < -threshold) {
      setActiveIndex((prev) => (prev + 1) % total);
      triggerHaptic();
    } else if (dragOffset > threshold) {
      setActiveIndex((prev) => (prev - 1 + total) % total);
      triggerHaptic();
    }
    setDragOffset(0);
    setIsDragging(false);
    setTimeout(startAutoPlay, 3200);
  };

  const goNext = () => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    setActiveIndex((prev) => (prev + 1) % total);
    triggerHaptic();
    setTimeout(startAutoPlay, 3200);
  };

  const goPrev = () => {
    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    setActiveIndex((prev) => (prev - 1 + total) % total);
    triggerHaptic();
    setTimeout(startAutoPlay, 3200);
  };

  const visibleOffsets = [-2, -1, 0, 1, 2];

  // Continuous physical scroll position for sprocket holes
  const cumulativeScrollOffset = activeIndex * 175 - dragOffset;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        padding: "0 0 16px 0",
        gap: "0",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* ── Top Cinematic Milestone Pill ── */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "linear-gradient(135deg, rgba(38, 9, 21, 0.95) 0%, rgba(18, 4, 12, 0.98) 100%)",
          border: "1.2px solid rgba(255, 205, 75, 0.65)",
          borderRadius: "24px",
          padding: "5px 16px",
          marginBottom: "12px",
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.75), 0 0 14px rgba(255, 180, 40, 0.25)",
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: "0.85rem", filter: "drop-shadow(0 0 4px #ffd700)" }}>🎞️</span>
        <span
          style={{
            color: "#fef08a",
            fontSize: "0.75rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {activePhoto.milestoneEra || "Cherished Milestone"}
        </span>
        <span style={{ color: "rgba(255, 215, 0, 0.4)", fontSize: "0.75rem" }}>|</span>
        <span
          style={{
            color: "#ffd700",
            fontSize: "0.74rem",
            fontFamily: "'Courier New', Courier, monospace",
            fontWeight: 700,
            letterSpacing: "0.05em",
          }}
        >
          {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          AUTHENTIC 35MM CINEMA FILMSTRIP STAGE
          Dark celluloid strip with synchronized sprocket tracks,
          precision rectangular frames, and golden camera viewfinder marks.
          ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "500px",
          background: "linear-gradient(180deg, #070204 0%, #120409 50%, #070204 100%)",
          borderTop: "3px solid #331020",
          borderBottom: "3px solid #331020",
          overflow: "hidden",
          touchAction: "pan-y",
          boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.95), 0 12px 36px rgba(0, 0, 0, 0.85)",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* ── Top Sprocket Track (moving with reel physics) ── */}
        <MovingSprocketTrack
          scrollOffset={cumulativeScrollOffset}
          edgeText={`▲ ${String(activeIndex + 1).padStart(3, "0")}A`}
          isTop={true}
        />

        {/* ── Film Frames Projection Chamber ── */}
        <div
          style={{
            position: "relative",
            height: "260px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Left Cinema Shadow Mask */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "60px",
              background: "linear-gradient(to right, #070204 0%, rgba(7, 2, 4, 0.8) 50%, transparent 100%)",
              zIndex: 25,
              pointerEvents: "none",
            }}
          />

          {/* Right Cinema Shadow Mask */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "60px",
              background: "linear-gradient(to left, #070204 0%, rgba(7, 2, 4, 0.8) 50%, transparent 100%)",
              zIndex: 25,
              pointerEvents: "none",
            }}
          />

          {/* Golden Center Spotlight Backlight Beam */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "220px",
              height: "260px",
              background: "radial-gradient(ellipse at center, rgba(255, 180, 40, 0.22) 0%, rgba(212, 110, 20, 0.08) 55%, transparent 80%)",
              pointerEvents: "none",
              zIndex: 5,
            }}
          />

          {/* ── Render 5 Precision Film Frames ── */}
          {visibleOffsets.map((offset) => {
            const photoIdx = (activeIndex + offset + total) % total;
            const photo = photos[photoIdx];
            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);

            // Exact horizontal placement with drag delta
            // Center is at 0, offset 1 is at 170px, offset 2 is at 315px
            const baseX =
              offset === 0
                ? 0
                : offset > 0
                ? 170 + (offset - 1) * 145
                : -170 + (offset + 1) * 145;

            const translateX = baseX + dragOffset;
            const scale = isCenter ? 1 : absOffset === 1 ? 0.86 : 0.72;
            const opacity = isCenter ? 1 : absOffset === 1 ? 0.65 : 0.28;
            const blur = isCenter ? 0 : absOffset === 1 ? 0.6 : 1.8;
            const zIndex = isCenter ? 20 : 15 - absOffset;

            // Frame dimensions
            const frameWidth = isCenter ? 186 : 140;
            const frameHeight = isCenter ? 236 : 180;

            return (
              <div
                key={`${photoIdx}-${offset}`}
                onClick={() => {
                  if (isCenter) {
                    onSelectPhoto(photo);
                  } else {
                    if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
                    setActiveIndex((activeIndex + offset + total) % total);
                    triggerHaptic();
                    setTimeout(startAutoPlay, 3200);
                  }
                }}
                style={{
                  position: "absolute",
                  width: `${frameWidth}px`,
                  height: `${frameHeight}px`,
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  zIndex,
                  opacity,
                  filter: blur > 0 ? `blur(${blur}px) brightness(${isCenter ? 1 : 0.7})` : "none",
                  transition: isDragging
                    ? "none"
                    : "transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.3s ease, filter 0.3s ease, width 0.3s ease, height 0.3s ease",
                  cursor: "pointer",
                  willChange: "transform, opacity",
                  borderRadius: "2px", // Classic sharp film rectangle
                  outline: isCenter
                    ? "2.5px solid rgba(255, 205, 75, 0.95)"
                    : "1.5px solid rgba(130, 45, 20, 0.6)",
                  outlineOffset: "-1px",
                  boxShadow: isCenter
                    ? "0 0 32px rgba(255, 170, 30, 0.45), 0 14px 34px rgba(0, 0, 0, 0.9)"
                    : "0 6px 16px rgba(0, 0, 0, 0.75)",
                  overflow: "hidden",
                  background: "#0d0307",
                }}
              >
                {/* Real Photo in Rectangular Film Frame */}
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
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='186' height='236'%3E%3Crect fill='%2314050a' width='186' height='236'/%3E%3Ctext x='50%25' y='50%25' fill='%23d4af37' font-size='15' text-anchor='middle' dy='.3em'%3E✨%3C/text%3E%3C/svg%3E";
                  }}
                />

                {/* Celluloid Film Sheen Glare */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 30%, transparent 60%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Viewfinder Camera Focus Reticle Marks (Center Frame Only) */}
                {isCenter && (
                  <>
                    {/* Top-Left Corner */}
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        width: "12px",
                        height: "12px",
                        borderTop: "2px solid #ffd700",
                        borderLeft: "2px solid #ffd700",
                        pointerEvents: "none",
                      }}
                    />
                    {/* Top-Right Corner */}
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        width: "12px",
                        height: "12px",
                        borderTop: "2px solid #ffd700",
                        borderRight: "2px solid #ffd700",
                        pointerEvents: "none",
                      }}
                    />
                    {/* Bottom-Left Corner */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "32px",
                        left: "8px",
                        width: "12px",
                        height: "12px",
                        borderBottom: "2px solid #ffd700",
                        borderLeft: "2px solid #ffd700",
                        pointerEvents: "none",
                      }}
                    />
                    {/* Bottom-Right Corner */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "32px",
                        right: "8px",
                        width: "12px",
                        height: "12px",
                        borderBottom: "2px solid #ffd700",
                        borderRight: "2px solid #ffd700",
                        pointerEvents: "none",
                      }}
                    />
                  </>
                )}

                {/* Tap to Zoom Lens Badge on Center Frame */}
                {isCenter && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(10, 2, 6, 0.78)",
                      border: "1px solid rgba(255, 215, 0, 0.6)",
                      borderRadius: "14px",
                      padding: "2px 7px",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      color: "#ffd700",
                      pointerEvents: "none",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <span>🔍</span>
                    <span>ZOOM</span>
                  </div>
                )}

                {/* Bottom Vintage Film Metadata Bar on Center Frame */}
                {isCenter && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(to top, rgba(8, 1, 4, 0.95) 0%, rgba(8, 1, 4, 0.8) 75%, transparent 100%)",
                      padding: "16px 8px 6px",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: "0.6rem",
                        color: "#ffc850",
                        letterSpacing: "0.1em",
                        fontWeight: 800,
                      }}
                    >
                      ▲ {String(activeIndex + 1).padStart(3, "0")}A
                    </span>
                    <span
                      style={{
                        fontFamily: "Georgia, serif",
                        fontStyle: "italic",
                        fontSize: "0.64rem",
                        color: "#fff3cf",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        maxWidth: "115px",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                    >
                      {photo.shortLabel || photo.tagline}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Courier New', Courier, monospace",
                        fontSize: "0.56rem",
                        color: "rgba(255, 200, 80, 0.75)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      35MM
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Bottom Sprocket Track (moving with reel physics) ── */}
        <MovingSprocketTrack
          scrollOffset={cumulativeScrollOffset}
          edgeText={`DIVIJA 35MM · ISO 100 · #${activeIndex + 1}`}
          isTop={false}
        />

        {/* ── Left Quick-Advance Chevron Button ── */}
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous memory frame"
          style={{
            position: "absolute",
            left: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(18, 4, 12, 0.88)",
            border: "1.5px solid rgba(255, 205, 75, 0.8)",
            color: "#ffd700",
            fontSize: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 35,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.85), 0 0 10px rgba(255, 180, 40, 0.3)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          ‹
        </button>

        {/* ── Right Quick-Advance Chevron Button ── */}
        <button
          type="button"
          onClick={goNext}
          aria-label="Next memory frame"
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "rgba(18, 4, 12, 0.88)",
            border: "1.5px solid rgba(255, 205, 75, 0.8)",
            color: "#ffd700",
            fontSize: "1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 35,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.85), 0 0 10px rgba(255, 180, 40, 0.3)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          ›
        </button>
      </div>

      {/* ── Prominent Tap-to-Zoom Story Button ── */}
      <button
        type="button"
        onClick={() => onSelectPhoto(activePhoto)}
        style={{
          marginTop: "12px",
          background: "linear-gradient(135deg, rgba(48, 12, 28, 0.96) 0%, rgba(22, 5, 14, 0.98) 100%)",
          border: "1.5px solid rgba(255, 215, 0, 0.85)",
          borderRadius: "24px",
          padding: "7px 20px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.8), 0 0 18px rgba(255, 180, 40, 0.35)",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: "0.9rem" }}>✨</span>
        <span
          style={{
            color: "#fff3cf",
            fontSize: "0.82rem",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontWeight: 700,
            letterSpacing: "0.02em",
          }}
        >
          Tap to Zoom &amp; Read Full Story
        </span>
        <span style={{ fontSize: "0.75rem", color: "#ffd700" }}>✦</span>
      </button>

      {/* ── Precision Film Roll Timeline Scrubber ── */}
      <div
        style={{
          width: "100%",
          maxWidth: "360px",
          marginTop: "12px",
          padding: "0 16px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          zIndex: 10,
        }}
      >
        {/* Scrubber track with mini frame ticks */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "4px 8px",
            background: "rgba(18, 4, 12, 0.75)",
            borderRadius: "14px",
            border: "1px solid rgba(255, 205, 75, 0.3)",
          }}
        >
          {photos.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
                  setActiveIndex(idx);
                  triggerHaptic();
                  setTimeout(startAutoPlay, 3200);
                }}
                aria-label={`Jump to frame ${idx + 1}`}
                style={{
                  width: isActive ? "14px" : "5px",
                  height: isActive ? "10px" : "6px",
                  borderRadius: isActive ? "3px" : "1.5px",
                  background: isActive
                    ? "linear-gradient(135deg, #ffd700, #ff8c00)"
                    : "rgba(255, 180, 40, 0.25)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  boxShadow: isActive ? "0 0 10px rgba(255, 215, 0, 0.9)" : "none",
                  transition: "all 0.25s cubic-bezier(0.2, 0.8, 0.3, 1)",
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>

        {/* Play/Pause & Swipe Gesture Hint */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "0 4px",
          }}
        >
          {/* Play/Pause Button */}
          <button
            type="button"
            onClick={() => setIsAutoPlaying((prev) => !prev)}
            style={{
              background: isAutoPlaying ? "rgba(70, 16, 26, 0.6)" : "rgba(255, 205, 75, 0.2)",
              border: isAutoPlaying
                ? "1px solid rgba(255, 140, 40, 0.5)"
                : "1.2px solid rgba(255, 205, 75, 0.8)",
              borderRadius: "12px",
              padding: "3px 10px",
              color: isAutoPlaying ? "#ffa868" : "#ffd700",
              fontSize: "0.68rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "0.06em",
            }}
          >
            <span>{isAutoPlaying ? "⏸" : "▶"}</span>
            <span>{isAutoPlaying ? "PAUSE REEL" : "PLAY REEL"}</span>
          </button>

          {/* Swipe indicator */}
          <span
            style={{
              color: "rgba(255, 215, 120, 0.7)",
              fontSize: "0.65rem",
              fontFamily: "'Courier New', monospace",
              letterSpacing: "0.06em",
              fontWeight: 700,
            }}
          >
            ← SWIPE FILM →
          </span>
        </div>
      </div>
    </div>
  );
}
