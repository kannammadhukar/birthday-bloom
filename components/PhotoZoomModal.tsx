"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

export interface PhotoZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  caption?: string;
  accentColor?: string;
}

export default function PhotoZoomModal({
  isOpen,
  onClose,
  src,
  alt = "Enlarged Photo",
  title,
  subtitle,
  caption,
  accentColor = "#ffd700",
}: PhotoZoomModalProps) {
  const [mounted, setMounted] = useState(false);
  const [scale, setScale] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialDistance, setInitialDistance] = useState<number | null>(null);
  const [initialPinchScale, setInitialPinchScale] = useState<number>(1);
  const lastTapRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Mount check for createPortal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset zoom & pan whenever the modal opens or photo changes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPan({ x: 0, y: 0 });
      setIsDragging(false);
      // Lock background scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, src]);

  // Handle Zoom In / Out / Reset
  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(3.5, Number((prev + 0.5).toFixed(2))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(2)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Quick toggle zoom: 1x <-> 2x
  const handleToggleZoom = useCallback(() => {
    setScale((prev) => {
      if (prev > 1.1) {
        setPan({ x: 0, y: 0 });
        return 1;
      }
      return 2;
    });
  }, []);

  // Keyboard Shortcuts (ESC, +, -, 0, Arrow keys for pan)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        handleZoomOut();
      } else if (e.key === "0") {
        handleResetZoom();
      } else if (scale > 1) {
        const step = 40;
        if (e.key === "ArrowLeft") setPan((p) => ({ ...p, x: p.x + step }));
        else if (e.key === "ArrowRight") setPan((p) => ({ ...p, x: p.x - step }));
        else if (e.key === "ArrowUp") setPan((p) => ({ ...p, y: p.y + step }));
        else if (e.key === "ArrowDown") setPan((p) => ({ ...p, y: p.y - step }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, scale, onClose, handleZoomIn, handleZoomOut, handleResetZoom]);

  // Mouse Wheel Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.002;
    setScale((prev) => {
      const next = Math.min(3.5, Math.max(1, Number((prev + delta).toFixed(2))));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Mouse / Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // If double tap/click
    const now = performance.now();
    if (now - lastTapRef.current < 280) {
      handleToggleZoom();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || scale <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  // Mobile Touch Pinch-to-Zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      setInitialDistance(dist);
      setInitialPinchScale(scale);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance !== null) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = currentDist / initialDistance;
      const nextScale = Math.min(3.5, Math.max(1, Number((initialPinchScale * ratio).toFixed(2))));
      setScale(nextScale);
      if (nextScale === 1) setPan({ x: 0, y: 0 });
    }
  };

  const handleTouchEnd = () => {
    setInitialDistance(null);
  };

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="photo-zoom-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Enlarged photo view"}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        zIndex: 999999,
        background: "rgba(5, 1, 4, 0.96)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "max(env(safe-area-inset-top), 12px) max(env(safe-area-inset-right), 12px) max(env(safe-area-inset-bottom), 14px) max(env(safe-area-inset-left), 12px)",
        boxSizing: "border-box",
        animation: "pzmFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        userSelect: "none",
        WebkitUserSelect: "none",
        touchAction: "manipulation",
      }}
    >
      {/* ── TOP FLOATING CONTROL BAR ── */}
      <header
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1280px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          padding: "8px 16px",
          background: "rgba(22, 6, 15, 0.85)",
          border: "1px solid rgba(212, 175, 55, 0.5)",
          borderRadius: "28px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.85), 0 0 16px rgba(212, 175, 55, 0.2)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Title & Tag Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <span style={{ fontSize: "1.1rem" }}>👑</span>
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span
              style={{
                color: "#fff6d6",
                fontSize: "clamp(0.78rem, 2.2vw, 0.95rem)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                fontFamily: "'Playfair Display', Georgia, serif",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title || "Divija · Birthday Keepsake"}
            </span>
            {subtitle && (
              <span
                style={{
                  color: "rgba(246, 216, 150, 0.78)",
                  fontSize: "0.7rem",
                  letterSpacing: "0.05em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Zoom Controls & Close Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            aria-label="Zoom out"
            title="Zoom out (-)"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: scale > 1 ? "rgba(212, 175, 55, 0.25)" : "rgba(255, 255, 255, 0.06)",
              border: `1px solid ${scale > 1 ? "rgba(212, 175, 55, 0.7)" : "rgba(255, 255, 255, 0.15)"}`,
              color: scale > 1 ? "#ffd700" : "rgba(255, 255, 255, 0.35)",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: scale > 1 ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
          >
            ➖
          </button>

          {/* Scale Percentage Badge / Reset Button */}
          <button
            type="button"
            onClick={handleToggleZoom}
            title="Click to toggle 100% / 200% zoom"
            style={{
              background: scale > 1 ? "linear-gradient(135deg, rgba(212, 175, 55, 0.35) 0%, rgba(140, 24, 48, 0.4) 100%)" : "rgba(212, 175, 55, 0.14)",
              border: "1px solid rgba(212, 175, 55, 0.65)",
              borderRadius: "16px",
              padding: "4px 12px",
              color: "#ffe082",
              fontSize: "0.76rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              minWidth: "62px",
              justifyContent: "center",
              boxShadow: scale > 1 ? "0 0 14px rgba(212, 175, 55, 0.45)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            <span>{Math.round(scale * 100)}%</span>
            {scale > 1 && <span style={{ fontSize: "0.65rem" }}>⟲</span>}
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 3.5}
            aria-label="Zoom in"
            title="Zoom in (+)"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: scale < 3.5 ? "rgba(212, 175, 55, 0.25)" : "rgba(255, 255, 255, 0.06)",
              border: `1px solid ${scale < 3.5 ? "rgba(212, 175, 55, 0.7)" : "rgba(255, 255, 255, 0.15)"}`,
              color: scale < 3.5 ? "#ffd700" : "rgba(255, 255, 255, 0.35)",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: scale < 3.5 ? "pointer" : "default",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
            }}
          >
            ➕
          </button>

          {/* Glowing 48px Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close enlarged photo"
            title="Close (ESC)"
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(74, 14, 34, 0.95) 0%, rgba(26, 6, 16, 0.98) 100%)",
              border: "2px solid #ffd700",
              color: "#ffd700",
              fontSize: "1.45rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 18px rgba(0, 0, 0, 0.85), 0 0 16px rgba(255, 215, 0, 0.6)",
              marginLeft: "4px",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.12)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,1), 0 0 22px rgba(255, 215, 0, 0.9)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 18px rgba(0, 0, 0, 0.85), 0 0 16px rgba(255, 215, 0, 0.6)";
            }}
          >
            ✕
          </button>
        </div>
      </header>

      {/* ── CENTER INTERACTIVE PHOTO VIEWPORT ── */}
      <main
        ref={containerRef}
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          flex: 1,
          width: "100%",
          maxWidth: "1320px",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
          touchAction: "none",
          margin: "8px 0",
        }}
      >
        {/* Transformable Canvas Layer */}
        <div
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.28s cubic-bezier(0.2, 0.9, 0.3, 1)",
            willChange: "transform",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            draggable={false}
            loading="eager"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: "14px",
              boxShadow: "0 28px 85px rgba(0, 0, 0, 0.98), 0 0 45px rgba(212, 175, 55, 0.35)",
              border: "1.5px solid rgba(212, 175, 55, 0.5)",
              filter: "drop-shadow(0 12px 36px rgba(0, 0, 0, 0.9))",
              pointerEvents: "auto",
            }}
          />
        </div>
      </main>

      {/* ── BOTTOM FLOATING CAPTION & HELPER TOOLBAR ── */}
      <footer
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1040px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          padding: "10px 18px",
          background: "rgba(18, 5, 12, 0.88)",
          border: "1px solid rgba(212, 175, 55, 0.45)",
          borderRadius: "22px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.85), 0 0 20px rgba(212, 175, 55, 0.18)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          zIndex: 10,
          flexShrink: 0,
          textAlign: "center",
        }}
      >
        {caption && (
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: "clamp(0.92rem, 2.2vw, 1.15rem)",
              color: "#ffe8a8",
              margin: 0,
              lineHeight: 1.45,
              textShadow: "0 0 16px rgba(212, 175, 55, 0.45)",
              maxWidth: "820px",
            }}
          >
            &ldquo;{caption}&rdquo;
          </p>
        )}

        {/* Helpful User Interaction Tip */}
        <div
          style={{
            fontSize: "0.72rem",
            color: "rgba(252, 232, 178, 0.72)",
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <span>💡 Tap or double-click photo to zoom</span>
          <span>•</span>
          <span>Drag to pan</span>
          <span>•</span>
          <span>Scroll wheel / Pinch to inspect details</span>
          <span>•</span>
          <span>ESC to close</span>
        </div>
      </footer>

      <style>{`
        @keyframes pzmFadeIn {
          from {
            opacity: 0;
            transform: scale(0.98);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
