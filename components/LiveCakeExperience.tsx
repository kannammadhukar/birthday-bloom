"use client";
// Silence benign TensorFlow Lite / XNNPACK C++ log prints that Next.js Turbopack mistakes for console errors
if (typeof window !== "undefined") {
  const _origError = console.error;
  console.error = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (
      msg.includes("TensorFlow Lite") ||
      msg.includes("XNNPACK") ||
      msg.includes("delegate for CPU") ||
      msg.startsWith("INFO:")
    ) {
      return;
    }
    _origError.apply(console, args);
  };
}
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import CakeScene, { CakeTransform } from "./three/CakeScene";
import confetti from "canvas-confetti";
import { smoothAlign } from "@/lib/autoAlign";

interface LiveCakeExperienceProps {
  candlesBlown: boolean;
  onToggleBlow: () => void;
  confettiTrigger: number;
  blowTrigger: number;
  onCakeCut?: () => void;
}

export default function LiveCakeExperience({
  candlesBlown,
  onToggleBlow,
  confettiTrigger,
  blowTrigger,
  onCakeCut,
}: LiveCakeExperienceProps) {
  // ── Camera States ──
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // ── Detection & Timing States ──
  const [faceDetected, setFaceDetected] = useState(false);
  const [isBlowingFace, setIsBlowingFace] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPositioning, setIsPositioning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingCountdown, setRecordingCountdown] = useState<number | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [celebrationPostRecordSec, setCelebrationPostRecordSec] = useState<number | null>(null);
  const isCeremonyRunningRef = useRef(false);

  // ── Keepsake Modal, Photo & Video States ──
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedVideoUrl, setCapturedVideoUrl] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeKeepsakeTab, setActiveKeepsakeTab] = useState<"video" | "photo">("video");
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── Cake Slice & Cutting States ──
  const [sliced, setSliced] = useState(false);
  const [cutting, setCutting] = useState(false);

  // ── Toast Feedback ──
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Rotation Control ──
  const [autoRotate, setAutoRotate] = useState(false);

  // ── 3D Cake Placement & AR Transformation States (Freedom of Movement) ──
  // Studio View: y = -1.05 (naturally grounded at the bottom on the celebration banquet table)
  // AR Camera Mode: y = -1.55 (lowered onto real table, leaving top 60% completely clear for face)
  const [cakeTransform, setCakeTransform] = useState<CakeTransform>({
    x: 0,
    y: -1.05,
    z: 0,
    scale: 0.94,
    rotationY: 0,
  });
  const [placementPing, setPlacementPing] = useState<{ x: number; y: number } | null>(null);
  const cakeTransformRef = useRef(cakeTransform);
  useEffect(() => {
    cakeTransformRef.current = cakeTransform;
  }, [cakeTransform]);

  // Adjust default Y placement when toggling between Studio View and AR Camera
  useEffect(() => {
    if (cameraActive) {
      setCakeTransform((prev) => ({
        ...prev,
        y: -1.55,
        scale: 0.88,
      }));
    } else {
      setCakeTransform((prev) => ({
        ...prev,
        y: -1.05,
        scale: 0.94,
      }));
    }
  }, [cameraActive]);


  // ── Refs for Synchronous Loop Access ──
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micIntervalRef = useRef<any>(null);
  const faceLandmarkerRef = useRef<any>(null);
  const faceAnalysisIntervalRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const lastVideoTimeRef = useRef(-1);
  const lastTimestampRef = useRef(0);

  // ── AR Video Recorder Refs ──
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const isRecordingRef = useRef(false);

  // Confetti particles rendered directly on composite video (so human + cake + confetti are captured)
  const videoConfettiRef = useRef<
    { x: number; y: number; vx: number; vy: number; color: string; size: number; rot: number; vRot: number }[]
  >([]);

  const isArmedRef = useRef(true);
  const candlesBlownRef = useRef(candlesBlown);
  const hasTriggeredBlowRef = useRef(false); // Ironclad guard against 35 duplicate photos/triggers
  const isBlowingFaceRef = useRef(false);
  const faceBlowingTicksRef = useRef(0);
  const sustainedBlowTicksRef = useRef(0);
  const ambientNoiseFloorRef = useRef(40);
  const avgTurbulenceRef = useRef(0);

  function triggerVideoConfetti() {
    const colors = ["#ffd166", "#f472b6", "#fb7185", "#ffffff", "#d4af37", "#fef08a", "#c084fc"];
    const particles = [];
    for (let i = 0; i < 110; i++) {
      particles.push({
        x: Math.random() * 1280,
        y: Math.random() * -300,
        vx: (Math.random() - 0.5) * 4.5,
        vy: Math.random() * 4.5 + 3.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 6,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.12,
      });
    }
    videoConfettiRef.current = particles;
  }

  useEffect(() => {
    candlesBlownRef.current = candlesBlown;
    if (!candlesBlown) {
      hasTriggeredBlowRef.current = false;
      setSliced(false);
      setCutting(false);
    }
  }, [candlesBlown]);

  useEffect(() => {
    isBlowingFaceRef.current = isBlowingFace;
  }, [isBlowingFace]);



  function showToast(msg: string, durationMs = 3800) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), durationMs);
  }

  // ── Touch & Pointer Gesture Engine for 3D Cake Canvas ──
  // Enables: 1-finger drag (X/Y position), 2-finger pinch (scale), 2-finger twist (rotate), tap-to-place (hit-test)
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialDist: number;
    initialScale: number;
    initialAngle: number;
    initialRotY: number;
    isMultiTouch: boolean;
    startTime: number;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialDist: 0,
    initialScale: 0.88,
    initialAngle: 0,
    initialRotY: 0,
    isMultiTouch: false,
    startTime: 0,
  });
  const isMouseDownRef = useRef(false);

  // Screen Tap-to-Place logic (Raycasts screen tap to horizontal table plane in AR camera mode only)
  const handleScreenTapToPlace = (clientX: number, clientY: number) => {
    if (!cameraActive) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    // Show golden placement ping
    setPlacementPing({ x: relX, y: relY });
    setTimeout(() => setPlacementPing(null), 900);

    // Convert screen coordinates to world coordinates on the tabletop plane
    const targetX = ((relX / (rect.width || 400)) - 0.5) * 6.2;
    const targetY = -((relY / (rect.height || 600)) - 0.5) * 5.8;

    const clampedX = Math.max(-3.4, Math.min(3.4, targetX));
    const clampedY = Math.max(-3.0, Math.min(0.6, targetY));

    setCakeTransform((prev) => ({
      ...prev,
      x: clampedX,
      y: clampedY,
    }));

    showToast("📍 Cake anchored to table surface! ✨", 2200);
  };

  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // In normal studio view, allow natural 1-finger page scrolling without trapping
    if (!cameraActive && e.touches.length === 1) return;
    const touches = e.touches;
    const now = performance.now();

    if (touches.length === 1) {
      touchStateRef.current = {
        startX: touches[0].clientX,
        startY: touches[0].clientY,
        initialX: cakeTransformRef.current.x,
        initialY: cakeTransformRef.current.y,
        initialDist: 0,
        initialScale: cakeTransformRef.current.scale,
        initialAngle: 0,
        initialRotY: cakeTransformRef.current.rotationY,
        isMultiTouch: false,
        startTime: now,
      };
    } else if (touches.length >= 2) {
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      touchStateRef.current = {
        startX: (touches[0].clientX + touches[1].clientX) / 2,
        startY: (touches[0].clientY + touches[1].clientY) / 2,
        initialX: cakeTransformRef.current.x,
        initialY: cakeTransformRef.current.y,
        initialDist: dist,
        initialScale: cakeTransformRef.current.scale,
        initialAngle: angle,
        initialRotY: cakeTransformRef.current.rotationY,
        isMultiTouch: true,
        startTime: now,
      };
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    // In normal studio view, never hijack 1-finger vertical swipes so page scrolls naturally
    if (!cameraActive && e.touches.length === 1) return;
    const touches = e.touches;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const w = rect.width || 400;
    const h = rect.height || 600;

    if (touches.length === 1 && !touchStateRef.current.isMultiTouch) {
      const dx = touches[0].clientX - touchStateRef.current.startX;
      const dy = touches[0].clientY - touchStateRef.current.startY;

      // Convert pixel delta to Three.js world units
      const worldDx = (dx / w) * 6.5;
      const worldDy = -(dy / h) * 6.5;

      const newX = Math.max(-3.5, Math.min(3.5, touchStateRef.current.initialX + worldDx));
      const newY = Math.max(-3.2, Math.min(1.2, touchStateRef.current.initialY + worldDy));

      setCakeTransform((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }));
    } else if (touches.length >= 2) {
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      const currentDist = Math.hypot(dx, dy);
      const currentAngle = Math.atan2(dy, dx);

      if (touchStateRef.current.initialDist > 0) {
        const pinchRatio = currentDist / touchStateRef.current.initialDist;
        const newScale = Math.max(0.35, Math.min(2.2, touchStateRef.current.initialScale * pinchRatio));

        const deltaAngle = currentAngle - touchStateRef.current.initialAngle;
        const newRotY = touchStateRef.current.initialRotY - deltaAngle;

        setCakeTransform((prev) => ({
          ...prev,
          scale: newScale,
          rotationY: newRotY,
        }));
      }
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cameraActive) return;
    const elapsed = performance.now() - touchStateRef.current.startTime;
    if (elapsed < 240 && !touchStateRef.current.isMultiTouch && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const dist = Math.hypot(
        touch.clientX - touchStateRef.current.startX,
        touch.clientY - touchStateRef.current.startY
      );
      if (dist < 12) {
        handleScreenTapToPlace(touch.clientX, touch.clientY);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isMouseDownRef.current = true;
    touchStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: cakeTransformRef.current.x,
      initialY: cakeTransformRef.current.y,
      initialDist: 0,
      initialScale: cakeTransformRef.current.scale,
      initialAngle: 0,
      initialRotY: cakeTransformRef.current.rotationY,
      isMultiTouch: false,
      startTime: performance.now(),
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const w = rect.width || 400;
    const h = rect.height || 600;

    const dx = e.clientX - touchStateRef.current.startX;
    const dy = e.clientY - touchStateRef.current.startY;

    const worldDx = (dx / w) * 6.5;
    const worldDy = -(dy / h) * 6.5;

    setCakeTransform((prev) => ({
      ...prev,
      x: Math.max(-3.5, Math.min(3.5, touchStateRef.current.initialX + worldDx)),
      y: Math.max(-3.2, Math.min(1.2, touchStateRef.current.initialY + worldDy)),
    }));
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;
    const elapsed = performance.now() - touchStateRef.current.startTime;
    const dist = Math.hypot(e.clientX - touchStateRef.current.startX, e.clientY - touchStateRef.current.startY);
    if (elapsed < 240 && dist < 8) {
      handleScreenTapToPlace(e.clientX, e.clientY);
    }
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!cameraActive) return;
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setCakeTransform((prev) => ({
      ...prev,
      scale: Math.max(0.35, Math.min(2.2, prev.scale * zoomFactor)),
    }));
  };

  // ── Sound Synthesizers ──
  function playKnifeSliceSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(920, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.38);
    } catch {}
  }

  function fireCelebrationConfetti() {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.58 },
        colors: ["#ffd166", "#f472b6", "#fb7185", "#ffffff", "#d4af37", "#fef08a"],
        zIndex: 200,
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0.2, y: 0.6 },
          colors: ["#ffd166", "#fb7185", "#ffffff"],
          zIndex: 200,
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 0.8, y: 0.6 },
          colors: ["#ffd166", "#fb7185", "#ffffff"],
          zIndex: 200,
        });
      }, 160);
    } catch {}
  }

  // ── Cake Cutting ──
  function handleCutCake() {
    if (cutting || sliced) return;
    smoothAlign(containerRef.current);
    setCutting(true);
    playKnifeSliceSound();
    showToast("🔪 Ceremonial golden slice cut! Serving on golden saucer... ✨");

    setTimeout(() => {
      setCutting(false);
      setSliced(true);
      fireCelebrationConfetti();
      setTimeout(() => {
        autoCaptureCelebrationSnap(false);
      }, 700);
      if (onCakeCut) onCakeCut();
    }, 1200);
  }

  // ── Real-Time AR Compositing Loop (Person + 3D Cake + Confetti + Watermark) ──
  function startCompositeRenderLoop() {
    if (!compositeCanvasRef.current) {
      const c = document.createElement("canvas");
      c.width = 1280;
      c.height = 720;
      compositeCanvasRef.current = c;
    }

    const canvas = compositeCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    function renderFrame() {
      if (!ctx) return;
      const video = videoRef.current;
      const isVideoReady = video && video.readyState >= 2 && video.videoWidth > 0;

      // 1. Draw Live Camera Stream (Person / Divija)
      if (isVideoReady && video) {
        const vW = video.videoWidth || 1280;
        const vH = video.videoHeight || 720;
        const vAspect = vW / vH;
        const targetAspect = 1280 / 720; // 16:9

        let sx = 0, sy = 0, sw = vW, sh = vH;
        if (vAspect > targetAspect) {
          sw = vH * targetAspect;
          sx = (vW - sw) / 2;
        } else {
          sh = vW / targetAspect;
          sy = (vH - sh) / 2;
        }

        ctx.save();
        if (facingMode === "user") {
          ctx.translate(1280, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 1280, 720);
        } else {
          ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 1280, 720);
        }
        ctx.restore();

        // Subtle warm celebratory studio vignette
        const vignette = ctx.createRadialGradient(640, 360, 260, 640, 360, 720);
        vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
        vignette.addColorStop(1, "rgba(18, 4, 12, 0.4)");
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, 1280, 720);
      } else {
        // Luxury Burgundy Studio Backdrop
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 720);
        bgGrad.addColorStop(0, "#1a0512");
        bgGrad.addColorStop(0.5, "#380c24");
        bgGrad.addColorStop(1, "#0d0208");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1280, 720);

        const glowGrad = ctx.createRadialGradient(640, 360, 60, 640, 360, 520);
        glowGrad.addColorStop(0, "rgba(255, 209, 102, 0.22)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, 1280, 720);
      }

      // 2. Draw 3D Three.js Cake Canvas directly in front of the Person (Tabletop Position)
      const cakeContainer =
        document.getElementById("cake-three-canvas") ||
        document.querySelector("#cake-three-canvas-container canvas") ||
        containerRef.current?.querySelector("canvas");
      const webglCanvas = (cakeContainer?.tagName === "CANVAS"
        ? cakeContainer
        : cakeContainer?.querySelector("canvas")) as HTMLCanvasElement | null;

      if (webglCanvas && webglCanvas.width > 0 && webglCanvas.height > 0) {
        const cW = webglCanvas.width;
        const cH = webglCanvas.height;

        try {
          // When camera is active, draw 1:1 so the cake matches the user's on-screen placed position & scale
          if (streamRef.current && streamRef.current.active) {
            ctx.drawImage(webglCanvas, 0, 0, cW, cH, 0, 0, 1280, 720);
          } else {
            const cakeAspect = cW / cH;
            const targetCakeH = Math.round(720 * 0.72);
            let drawW = Math.round(targetCakeH * cakeAspect);
            let drawH = targetCakeH;
            if (drawW > 1280) {
              drawW = 1280;
              drawH = Math.round(1280 / cakeAspect);
            }
            const drawX = Math.round((1280 - drawW) / 2);
            const drawY = Math.round((720 - drawH) / 2);
            ctx.drawImage(webglCanvas, 0, 0, cW, cH, drawX, drawY, drawW, drawH);
          }
        } catch (err) {
          console.warn("Could not draw cake to composite canvas:", err);
        }
      }

      // 3. Draw In-Video Celebration Confetti (falling over human and cake)
      if (videoConfettiRef.current.length > 0) {
        ctx.save();
        for (let i = 0; i < videoConfettiRef.current.length; i++) {
          const p = videoConfettiRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.vRot;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.55);
          ctx.restore();
        }
        videoConfettiRef.current = videoConfettiRef.current.filter((p) => p.y < 760);
        ctx.restore();
      }

      // 4. Commemorative AR Gala Ribbon at Bottom
      ctx.save();
      const ribbonGrad = ctx.createLinearGradient(0, 670, 0, 720);
      ribbonGrad.addColorStop(0, "rgba(22, 6, 16, 0.72)");
      ribbonGrad.addColorStop(1, "rgba(10, 2, 8, 0.94)");
      ctx.fillStyle = ribbonGrad;
      ctx.fillRect(0, 670, 1280, 50);

      // Gold hairline divider above ribbon
      ctx.fillStyle = "rgba(255, 209, 102, 0.6)";
      ctx.fillRect(0, 670, 1280, 1.5);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Gold Typography
      ctx.fillStyle = "#ffe082";
      ctx.font = "bold 15px 'Playfair Display', Georgia, serif";
      ctx.fillText("✦ DIVIJA'S 23RD BIRTHDAY GALA · THE CANDLE BLOWOUT MOMENT 👑🎂 ✦", 640, 688);

      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "11px sans-serif";
      ctx.fillText("✨ Captured in Live AR · Divija & 3D Celebration Cake ✨", 640, 706);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(renderFrame);
    }

    renderFrame();
    animFrameRef.current = requestAnimationFrame(renderFrame);
  }

  function stopCompositeRenderLoop() {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }

  // ── Convert Data URL to Blob (Failsafe for Mobile Browsers without network fetch) ──
  function dataUrlToBlob(dataUrl: string): Blob {
    try {
      const parts = dataUrl.split(",");
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: mime });
    } catch {
      return new Blob([], { type: "image/jpeg" });
    }
  }

  // ── Save Media Directly to Device (Mobile Gallery / Laptop Files) ──
  const saveMediaToDevice = useCallback(
    async (type: "photo" | "video", directUrl?: string) => {
      try {
        const isMobile =
          typeof window !== "undefined" &&
          (window.innerWidth <= 768 ||
            /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "") ||
            window.matchMedia("(hover: none) and (pointer: coarse)").matches);

        if (type === "photo") {
          const photoSrc = directUrl || capturedPhotoUrl;
          if (!photoSrc) {
            showToast("⚠️ No photo captured yet. Tap '📸 Take Photo' first!");
            return;
          }

          const filename = `divija-23rd-birthday-wish-${Date.now()}.jpg`;

          // Mobile Web Share API: Saves directly to Camera Roll / Google Photos / WhatsApp!
          if (isMobile && typeof navigator !== "undefined" && typeof navigator.share === "function") {
            try {
              let blob: Blob;
              if (photoSrc.startsWith("data:")) {
                blob = dataUrlToBlob(photoSrc);
              } else {
                const res = await fetch(photoSrc);
                blob = await res.blob();
              }
              const file = new File([blob], filename, { type: "image/jpeg" });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: "Divija's 23rd Birthday Commemorative Photo 👑",
                  text: "Divija's 23rd Birthday Celebration Snapshot! ✨",
                });
                showToast("✅ Photo saved to device! 📸✨");
                return;
              }
            } catch (err: any) {
              if (err?.name === "AbortError") return;
              console.warn("Mobile share photo failed, falling back to download:", err);
            }
          }

          // Direct browser download for laptop and standard browsers
          const a = document.createElement("a");
          a.href = photoSrc;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            try {
              document.body.removeChild(a);
            } catch {}
          }, 300);
          showToast("💾 Photo saved to your device Downloads! 📸✨", 3500);
        } else {
          // Video Save
          const videoSrc = directUrl || capturedVideoUrl;
          if (!videoSrc) {
            showToast("⚠️ No video recorded yet. Tap '🎬 Record Clip' first!");
            return;
          }

          const isMp4 = videoSrc.includes("mp4") || (mediaRecorderRef.current?.mimeType?.includes("mp4"));
          const ext = isMp4 ? "mp4" : "webm";
          const filename = `divija-23rd-birthday-video-${Date.now()}.${ext}`;

          // Mobile Web Share API
          if (isMobile && typeof navigator !== "undefined" && typeof navigator.share === "function") {
            try {
              const res = await fetch(videoSrc);
              const blob = await res.blob();
              const file = new File([blob], filename, { type: isMp4 ? "video/mp4" : "video/webm" });
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                  files: [file],
                  title: "Divija's 23rd Birthday Video Clip 🎬",
                  text: "Divija's 23rd Birthday Candle Blowout Video! 👑🎂",
                });
                showToast("✅ Video saved to device! 🎬✨");
                return;
              }
            } catch (err: any) {
              if (err?.name === "AbortError") return;
              console.warn("Mobile share video failed, falling back to download:", err);
            }
          }

          // Direct browser download
          const a = document.createElement("a");
          a.href = videoSrc;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            try {
              document.body.removeChild(a);
            } catch {}
          }, 300);
          showToast("💾 Video saved to your device Downloads! 🎬✨", 3500);
        }
      } catch (err) {
        console.warn("Save to device error:", err);
        showToast("⚠️ Please tap 'View Keepsakes' and use Download button!");
      }
    },
    [capturedPhotoUrl, capturedVideoUrl]
  );

  // ── Stop Video Recording Cleanly ──
  function stopVideoRecording() {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecordingCountdown(null);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn("Error stopping MediaRecorder:", err);
      }
    }
    setIsRecording(false);
    isRecordingRef.current = false;
  }

  // ── Start AR / Studio Video Recording ──
  function startVideoRecording(durationMs = 4500, autoSave = false) {
    try {
      startCompositeRenderLoop(); // Always make sure composite render loop is actively running
      const canvas = compositeCanvasRef.current;
      if (!canvas || typeof canvas.captureStream !== "function") {
        console.warn("Canvas captureStream not supported on this browser.");
        showToast("⚠️ Video recording is not supported on this browser.");
        return;
      }

      // Avoid restarting if already active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        return;
      }

      recordedChunksRef.current = [];

      // 25fps canvas stream for smooth mobile & desktop capture
      const canvasStream = canvas.captureStream(25);

      // Best MIME types in order of mobile & desktop compatibility
      const candidateMimes = [
        "video/mp4;codecs=avc1,mp4a.40.2",
        "video/mp4",
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "",
      ];

      let selectedMime = "";
      if (typeof MediaRecorder !== "undefined") {
        for (const m of candidateMimes) {
          if (m === "" || MediaRecorder.isTypeSupported(m)) {
            selectedMime = m;
            break;
          }
        }
      } else {
        console.warn("MediaRecorder is not supported on this device/browser.");
        showToast("⚠️ MediaRecorder is not supported on this browser.");
        return;
      }

      let recorder: MediaRecorder | null = null;

      // Attempt audio track combining, fallback to video-only if WebKit throws
      if (micStreamRef.current && micStreamRef.current.getAudioTracks().length > 0) {
        try {
          const audioTrack = micStreamRef.current.getAudioTracks()[0];
          const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            audioTrack,
          ]);
          try {
            recorder = new MediaRecorder(combinedStream, selectedMime ? { mimeType: selectedMime } : undefined);
          } catch {
            recorder = null;
          }
        } catch {}
      }

      if (!recorder) {
        try {
          recorder = new MediaRecorder(canvasStream, selectedMime ? { mimeType: selectedMime } : undefined);
        } catch {
          try {
            recorder = new MediaRecorder(canvasStream);
          } catch (errRec) {
            console.warn("Could not create MediaRecorder:", errRec);
            showToast("⚠️ Could not initialize video recorder.");
            return;
          }
        }
      }

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        setIsRecording(false);
        isRecordingRef.current = false;
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
        setRecordingCountdown(null);

        const finalMime = recorder?.mimeType || selectedMime || "video/webm";
        const blob = new Blob(recordedChunksRef.current, { type: finalMime });
        if (blob.size > 0) {
          const videoUrl = URL.createObjectURL(blob);
          setCapturedVideoUrl(videoUrl);
          setActiveKeepsakeTab("video");
          showToast("🎬 Celebration video recorded! Tap '💾 Save Video' or '🎬 View Keepsakes'! 👑✨", 4000);
          if (autoSave) {
            saveMediaToDevice("video", videoUrl);
          }
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      isRecordingRef.current = true;
      showToast("🔴 Recording celebration video... ✨", 2000);

      if (durationMs > 0) {
        let remainingSec = Math.ceil(durationMs / 1000);
        setRecordingCountdown(remainingSec);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          remainingSec -= 1;
          if (remainingSec <= 0) {
            if (recordingTimerRef.current) {
              clearInterval(recordingTimerRef.current);
              recordingTimerRef.current = null;
            }
            setRecordingCountdown(null);
            stopVideoRecording();
          } else {
            setRecordingCountdown(remainingSec);
          }
        }, 1000);
      }
    } catch (err) {
      console.warn("MediaRecorder could not start:", err);
      setIsRecording(false);
      isRecordingRef.current = false;
      showToast("⚠️ Could not start video recording.");
    }
  }

  // ── Manual AR / Studio Photo Snapshot (Divija + 3D Cake + Gold Filigree Plaque) ──
  const autoCaptureCelebrationSnap = useCallback(
    async (saveDirectly = false) => {
      try {
        setIsCapturing(true);

        const offCanvas = document.createElement("canvas");
        offCanvas.width = 1280;
        offCanvas.height = 920;
        const ctx = offCanvas.getContext("2d");
        if (!ctx) {
          setIsCapturing(false);
          return null;
        }

        // Outer Luxury Dark Bordeaux Frame
        ctx.fillStyle = "#12040b";
        ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);

        const photoX = 40;
        const photoY = 36;
        const photoW = 1200;
        const photoH = 744;

        const video = videoRef.current;
        const isVideoReady = cameraActive && video && video.readyState >= 2 && video.videoWidth > 0;

        // 1. Draw Background: Live Camera Stream (Divija) or Studio Backdrop
        if (isVideoReady && video) {
          const vW = video.videoWidth || 1280;
          const vH = video.videoHeight || 720;
          const vAspect = vW / vH;
          const targetAspect = photoW / photoH; // 1200 / 744 ≈ 1.613

          let sx = 0, sy = 0, sw = vW, sh = vH;
          if (vAspect > targetAspect) {
            sw = vH * targetAspect;
            sx = (vW - sw) / 2;
          } else {
            sh = vW / targetAspect;
            sy = (vH - sh) / 2;
          }

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(photoX, photoY, photoW, photoH, 16);
          ctx.clip();

          if (facingMode === "user") {
            ctx.translate(photoX + photoW, photoY);
            ctx.scale(-1, 1);
            ctx.drawImage(video, sx, sy, sw, sh, 0, 0, photoW, photoH);
          } else {
            ctx.drawImage(video, sx, sy, sw, sh, photoX, photoY, photoW, photoH);
          }
          ctx.restore();
        } else {
          // Luxury Burgundy Studio Backdrop
          const bgGrad = ctx.createLinearGradient(photoX, photoY, photoX, photoY + photoH);
          bgGrad.addColorStop(0, "#220517");
          bgGrad.addColorStop(0.5, "#420d29");
          bgGrad.addColorStop(1, "#0d0208");
          ctx.fillStyle = bgGrad;
          ctx.fillRect(photoX, photoY, photoW, photoH);

          const glowGrad = ctx.createRadialGradient(
            photoX + photoW / 2,
            photoY + photoH / 2,
            50,
            photoX + photoW / 2,
            photoY + photoH / 2,
            550
          );
          glowGrad.addColorStop(0, "rgba(255, 209, 102, 0.28)");
          glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = glowGrad;
          ctx.fillRect(photoX, photoY, photoW, photoH);
        }

        // 2. Draw 3D Three.js Cake Canvas directly on top (Tabletop Position)
        const cakeContainer =
          document.getElementById("cake-three-canvas") ||
          document.querySelector("#cake-three-canvas-container canvas") ||
          containerRef.current?.querySelector("canvas");
        const webglCanvas = (cakeContainer?.tagName === "CANVAS"
          ? cakeContainer
          : cakeContainer?.querySelector("canvas")) as HTMLCanvasElement | null;

        if (webglCanvas && webglCanvas.width > 0 && webglCanvas.height > 0) {
          const cW = webglCanvas.width;
          const cH = webglCanvas.height;
          try {
            if (streamRef.current && streamRef.current.active) {
              // Drawn 1:1 across photo area so the cake is at the exact position & scale the user placed it
              ctx.drawImage(webglCanvas, 0, 0, cW, cH, photoX, photoY, photoW, photoH);
            } else {
              const cakeAspect = cW / cH;
              const targetH = Math.round(photoH * 0.72);
              let drawW = Math.round(targetH * cakeAspect);
              let drawH = targetH;
              if (drawW > photoW) {
                drawW = photoW;
                drawH = Math.round(photoW / cakeAspect);
              }
              const drawX = photoX + Math.round((photoW - drawW) / 2);
              const drawY = photoY + Math.round((photoH - drawH) / 2);
              ctx.drawImage(webglCanvas, 0, 0, cW, cH, drawX, drawY, drawW, drawH);
            }
          } catch (err) {
            console.warn("Could not draw cake to snapshot canvas:", err);
          }
        }

        // 3. Ornate Gold Filigree Frame Border
        ctx.strokeStyle = "rgba(212, 175, 55, 0.85)";
        ctx.lineWidth = 4;
        ctx.strokeRect(photoX, photoY, photoW, photoH);

        // Inner thin gold accent border
        ctx.strokeStyle = "rgba(255, 209, 102, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(photoX + 8, photoY + 8, photoW - 16, photoH - 16);

        // 4. Polaroid Souvenir Plaque Footer
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(photoX, photoY + photoH, photoW, 104);

        ctx.fillStyle = "#d4af37";
        ctx.fillRect(photoX, photoY + photoH, photoW, 3);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#6a040f";
        ctx.font = "bold 26px 'Playfair Display', Georgia, serif";
        ctx.fillText("✦ DIVIJA'S 23RD BIRTHDAY GALA · THURSDAY, 11 SEPTEMBER 2026 👑 ✦", 640, 826);

        ctx.fillStyle = "#9d174d";
        ctx.font = "italic 16px 'Cinzel', Georgia, serif";
        ctx.fillText(
          "✨ The Birthday Wish Made & Candles Extinguished in Pure Wonder · Medico Divija ✨",
          640,
          858
        );

        ctx.fillStyle = "#78350f";
        ctx.font = "12px sans-serif";
        ctx.fillText(`Recorded Live · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, 640, 878);

        const dataUrl = offCanvas.toDataURL("image/jpeg", 0.95);
        setCapturedPhotoUrl(dataUrl);
        setIsCapturing(false);
        setActiveKeepsakeTab("photo");

        if (saveDirectly) {
          await saveMediaToDevice("photo", dataUrl);
        } else {
          showToast("📸 Commemorative keepsake photo captured! 👑✨", 3500);
        }
        return dataUrl;
      } catch (err) {
        console.warn("Snapshot capture error:", err);
        setIsCapturing(false);
        return null;
      }
    },
    [cameraActive, facingMode, saveMediaToDevice]
  );

  // ── Unified Blow Trigger: Extinguishes Candles with Confetti & Music ──
  const triggerBlowSuccess = useCallback(
    (reasonMsg?: string) => {
      // Synchronous ironclad guard to prevent runaway duplicate triggers
      if (hasTriggeredBlowRef.current || candlesBlownRef.current) return;
      hasTriggeredBlowRef.current = true;
      candlesBlownRef.current = true;

      // Stop detection loops immediately
      stopMic();
      stopFaceAnalysis();

      smoothAlign(containerRef.current);
      onToggleBlow();
      showToast(reasonMsg || "💨 Candles blown out! Divija's wish is granted! 👑✨");
      fireCelebrationConfetti();
      triggerVideoConfetti();

      // Ensure composite canvas is actively running
      startCompositeRenderLoop();

      // If recording is not already active, start 5s celebration clip with auto-save
      if (!isRecordingRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
        startVideoRecording(5200, true);
        setTimeout(() => {
          autoCaptureCelebrationSnap(true);
        }, 1500);
      }
    },
    [onToggleBlow, autoCaptureCelebrationSnap]
  );

  // ── Unified Automatic 3, 2, 1 Countdown Ceremony with Auto-Recording & Auto-Download ──
  const startBlowoutCeremony = useCallback(
    (reasonMsg?: string | unknown) => {
      // Ironclad guard: do not run multiple times or if already blown
      if (hasTriggeredBlowRef.current || candlesBlownRef.current || isCeremonyRunningRef.current) return;
      isCeremonyRunningRef.current = true;
      const msg = typeof reasonMsg === "string" ? reasonMsg : undefined;

      // 1. Stop background detector loops & align container
      stopMic();
      stopFaceAnalysis();
      smoothAlign(containerRef.current);

      // 2. Start composite render loop so canvas is actively drawing
      startCompositeRenderLoop();

      // 3. START VIDEO RECORDING RIGHT AT COUNT 3 (autoSave = true)
      // Total duration: 3s countdown (3, 2, 1) + 5s celebration post-blowout = 8.2s
      startVideoRecording(8200, true);

      // 4. Start 3, 2, 1 Countdown ("from 3 only")
      setCountdown(3);
      showToast("🔴 Recording started! 3... Make your wish! 🎂✨", 2500);

      let currentCount = 3;
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        currentCount -= 1;
        if (currentCount > 0) {
          setCountdown(currentCount);
        } else {
          // Reached 0 -> Blow out candles!
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setCountdown(null);

          // Blow out candles, launch confetti & audio
          triggerBlowSuccess(msg || "💨 Candles blown out! Divija's wish is granted! 👑✨");

          // Automatically capture commemorative Polaroid photo (+1.5s after blowout) and save to device
          setTimeout(() => {
            autoCaptureCelebrationSnap(true);
          }, 1500);

          // Start 5-second post-blowout celebration timer in UI
          let postSec = 5;
          setCelebrationPostRecordSec(postSec);
          const postInterval = setInterval(() => {
            postSec -= 1;
            if (postSec <= 0) {
              clearInterval(postInterval);
              setCelebrationPostRecordSec(null);
              isCeremonyRunningRef.current = false;
              // Ensure recording stops cleanly, triggering automatic download in onstop
              stopVideoRecording();
            } else {
              setCelebrationPostRecordSec(postSec);
            }
          }, 1000);
        }
      }, 1000);
    },
    [triggerBlowSuccess, autoCaptureCelebrationSnap]
  );

  const startCelebrationRecordingFlow = startBlowoutCeremony;

  // ── MediaPipe Face Landmarker Initializer ──
  async function initFaceLandmarker() {
    if (faceLandmarkerRef.current) return faceLandmarkerRef.current;
    try {
      const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");

      let fileset;
      try {
        fileset = await FilesetResolver.forVisionTasks("/wasm");
      } catch {
        fileset = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
      }

      let landmarker;
      try {
        landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: "/models/face_landmarker.task",
            delegate: "CPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });
      } catch {
        landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
        });
      }

      faceLandmarkerRef.current = landmarker;
      return landmarker;
    } catch {
      return null;
    }
  }

  // ── Face Analysis Loop (Sensitive & Adaptive at 1-2m distance) ──
  function startFaceAnalysis() {
    if (faceAnalysisIntervalRef.current) clearInterval(faceAnalysisIntervalRef.current);

    faceAnalysisIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.paused || video.ended) return;

      if (faceLandmarkerRef.current && video.videoWidth > 0 && video.videoHeight > 0) {
        try {
          if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;
            const now = performance.now();
            const timestamp = Math.max(now, lastTimestampRef.current + 1);
            lastTimestampRef.current = timestamp;

            const results = faceLandmarkerRef.current.detectForVideo(video, timestamp);
            if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
              setFaceDetected(true);
              const landmarks = results.faceLandmarks[0];

              let mouthRatio = 0.38;
              const lm61 = landmarks[61];
              const lm291 = landmarks[291];
              const lm234 = landmarks[234];
              const lm454 = landmarks[454];

              if (lm61 && lm291 && lm234 && lm454) {
                const mouthWidth = Math.hypot(lm291.x - lm61.x, lm291.y - lm61.y);
                const faceWidth = Math.hypot(lm454.x - lm234.x, lm454.y - lm234.y);
                if (faceWidth > 0.02) {
                  mouthRatio = mouthWidth / faceWidth;
                }
              }

              let pucker = 0;
              let funnel = 0;
              if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
                const categories = results.faceBlendshapes[0].categories;
                for (let i = 0; i < categories.length; i++) {
                  const cat = categories[i];
                  if (cat.categoryName === "mouthPucker") pucker = cat.score;
                  else if (cat.categoryName === "mouthFunnel") funnel = cat.score;
                }
              }

              const blendMax = Math.max(pucker, funnel);
              // Sensitive blowing gesture detection: pursed lips + blendshape
              const isPuckering = (mouthRatio < 0.35 && blendMax >= 0.08) || blendMax >= 0.12 || mouthRatio < 0.29;
              setIsBlowingFace(isPuckering);

              if (isArmedRef.current && !candlesBlownRef.current && !hasTriggeredBlowRef.current) {
                if (isPuckering) {
                  faceBlowingTicksRef.current++;
                  const faintMic = avgTurbulenceRef.current > 45;
                  if (faceBlowingTicksRef.current >= 2 || (faceBlowingTicksRef.current >= 1 && faintMic)) {
                    startBlowoutCeremony("💨 You blew out the candles! Happy 23rd Birthday Divija! 🎉✨");
                    faceBlowingTicksRef.current = 0;
                  }
                } else {
                  faceBlowingTicksRef.current = Math.max(0, faceBlowingTicksRef.current - 1);
                }
              }
              return;
            } else {
              setFaceDetected(false);
              setIsBlowingFace(false);
              faceBlowingTicksRef.current = 0;
            }
          }
        } catch {}
      }
    }, 70);
  }

  function stopFaceAnalysis() {
    if (faceAnalysisIntervalRef.current) {
      clearInterval(faceAnalysisIntervalRef.current);
      faceAnalysisIntervalRef.current = null;
    }
    setFaceDetected(false);
    setIsBlowingFace(false);
    faceBlowingTicksRef.current = 0;
  }

  // ── Unified Camera, Mic & AR Video Recorder Activation ──
  async function startCameraAndMic(overrideFacingMode?: "user" | "environment", existingStream?: MediaStream) {
    const activeFacing = overrideFacingMode || facingMode || "user";
    setCameraLoading(true);
    isArmedRef.current = false;

    // Clean up existing camera tracks before re-initializing to prevent hardware locks
    if (streamRef.current && streamRef.current !== existingStream) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject && videoRef.current.srcObject !== existingStream) {
      try {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
      } catch {}
      videoRef.current.srcObject = null;
    }
    if (typeof window !== "undefined" && (window as any).__AR_ACTIVE_STREAM__ && (window as any).__AR_ACTIVE_STREAM__ !== existingStream) {
      try {
        (window as any).__AR_ACTIVE_STREAM__.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        (window as any).__AR_ACTIVE_STREAM__ = null;
      } catch {}
    }
    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      micStreamRef.current = null;
    }

    let userStream: MediaStream | null = existingStream || null;
    let lastError: any = null;

    if (!userStream) {
      if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraLoading(false);
        isArmedRef.current = true;
        showToast("📷 Camera is not supported on this browser/connection. Tap cake to celebrate! 🎂✨", 5000);
        return;
      }

      // Pure Video constraints - front selfie camera (user) as primary constraint so person is with cake
      const videoConstraints: MediaStreamConstraints[] = [
        { video: { facingMode: { ideal: activeFacing } } },
        { video: { facingMode: { ideal: "user" } } },
        { video: { facingMode: { ideal: activeFacing }, width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: true },
      ];

      for (const c of videoConstraints) {
        try {
          userStream = await navigator.mediaDevices.getUserMedia(c);
          if (userStream && userStream.getVideoTracks().length > 0) {
            lastError = null;
            break;
          }
        } catch (err: any) {
          lastError = err;
          console.warn("Camera attempt failed with constraint:", c, err);
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError" || err.name === "NotReadableError") {
            break;
          }
        }
      }
    }

    if (userStream && userStream.getVideoTracks().length > 0) {
      streamRef.current = userStream;
      if (typeof window !== "undefined") {
        (window as any).__AR_ACTIVE_STREAM__ = userStream;
      }

      if (videoRef.current) {
        const v = videoRef.current;
        v.muted = true;
        v.defaultMuted = true;
        (v as any).playsInline = true;
        v.setAttribute("playsinline", "true");
        v.setAttribute("webkit-playsinline", "true");
        v.setAttribute("muted", "true");
        v.setAttribute("autoplay", "true");
        v.srcObject = userStream;
        v.onloadedmetadata = () => {
          v.play().catch(() => {});
        };
        v.play().catch(() => {});
      }
      setCameraActive(true);
      startCompositeRenderLoop();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("ar-camera-state-changed", {
            detail: { active: true, loading: false, facingMode: activeFacing, error: null },
          })
        );
      }
      showToast("📷 AR Camera active! Step back to fit with the cake ✨", 3500);

      // Verify playback in next tick
      setTimeout(() => {
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(() => {});
        }
      }, 150);

      initFaceLandmarker().then(() => {
        startFaceAnalysis();
      }).catch(() => {});

      // Optionally attempt to attach microphone for breath detection
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((aStream) => attachMicStream(aStream))
        .catch(() => {});

      setCameraLoading(false);
      smoothAlign(containerRef.current);
      setIsPositioning(true);
      showToast("📸 Position face above cake & hold steady! When ready, tap Start Celebration! 🎬✨", 4500);
    } else {
      setCameraLoading(false);
      isArmedRef.current = true;
      const errName = lastError ? lastError.name : "CameraError";
      const errMsg = lastError ? (lastError.message || lastError.name) : "Camera access denied";
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("ar-camera-state-changed", {
            detail: { active: false, loading: false, facingMode: activeFacing, error: errName || errMsg },
          })
        );
      }
      if (lastError) {
        if (lastError.name === "NotAllowedError" || lastError.name === "PermissionDeniedError") {
          showToast("📷 Camera blocked: Click the tune/lock icon in your URL bar & set Camera to Allow! ✨", 5000);
        } else if (lastError.name === "NotFoundError" || lastError.name === "DevicesNotFoundError") {
          showToast("📷 No camera hardware found on this system. Tap cake to celebrate! 🎂✨", 4000);
        } else if (lastError.name === "NotReadableError" || lastError.name === "TrackStartError") {
          showToast("📷 Camera is in use by another app or browser tab. Please close it and retry! ⚠️", 5000);
        } else {
          showToast("🎂 Tap cake or press 'Blow Candles' to make your wish! ✨", 3500);
        }
      } else {
        showToast("🎂 Tap cake or press 'Blow Candles' to make your wish! ✨", 3500);
      }
    }
  }

  function stopCamera() {
    setIsPositioning(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    stopFaceAnalysis();
    stopCompositeRenderLoop();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch {}
      streamRef.current = null;
    }
    if (typeof window !== "undefined" && (window as any).__AR_ACTIVE_STREAM__) {
      try {
        (window as any).__AR_ACTIVE_STREAM__.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        (window as any).__AR_ACTIVE_STREAM__ = null;
      } catch {}
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("ar-camera-state-changed", {
          detail: { active: false, loading: false, facingMode, error: null },
        })
      );
    }
    showToast("Returned to Studio View ✨");
  }

  function flipCamera() {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCameraAndMic(nextMode);
  }

  function attachMicStream(stream: MediaStream) {
    try {
      micStreamRef.current = stream;
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      ambientNoiseFloorRef.current = 40;

      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      micIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sumTurbulence = 0;
        for (let i = 1; i <= 8; i++) {
          sumTurbulence += dataArray[i];
        }
        const avgTurbulence = sumTurbulence / 8;
        avgTurbulenceRef.current = avgTurbulence;

        ambientNoiseFloorRef.current = ambientNoiseFloorRef.current * 0.94 + avgTurbulence * 0.06;

        let effectiveThreshold = isBlowingFaceRef.current ? 70 : 105;
        const isAboveThreshold = avgTurbulence >= effectiveThreshold && avgTurbulence - ambientNoiseFloorRef.current >= 18;

        if (isAboveThreshold && isArmedRef.current && !candlesBlownRef.current && !hasTriggeredBlowRef.current) {
          sustainedBlowTicksRef.current++;
          if (sustainedBlowTicksRef.current >= 4) {
            startBlowoutCeremony("💨 Breath detected! Candles blown out! 🎉✨");
            sustainedBlowTicksRef.current = 0;
          }
        } else {
          sustainedBlowTicksRef.current = Math.max(0, sustainedBlowTicksRef.current - 1);
        }
      }, 70);
    } catch {}
  }

  function stopMic() {
    if (micIntervalRef.current) {
      clearInterval(micIntervalRef.current);
      micIntervalRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      stopCamera();
      stopMic();
      stopCompositeRenderLoop();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // ── Listen for External Camera Triggers (from Top Header & Settings Modal) ──
  useEffect(() => {
    function handleTriggerArCamera(e: any) {
      const action = e.detail?.action;
      if (action === "start") {
        startCameraAndMic(e.detail?.facingMode, e.detail?.stream);
      } else if (action === "stop") {
        stopCamera();
      } else if (action === "toggle") {
        if (cameraActive) {
          stopCamera();
        } else {
          startCameraAndMic(e.detail?.facingMode, e.detail?.stream);
        }
      } else if (action === "flip") {
        flipCamera();
      }
    }

    function handleQueryState() {
      window.dispatchEvent(
        new CustomEvent("ar-camera-state-changed", {
          detail: { active: cameraActive, loading: cameraLoading, facingMode, error: null },
        })
      );
    }

    window.addEventListener("trigger-ar-camera", handleTriggerArCamera);
    window.addEventListener("query-ar-camera-state", handleQueryState);

    // Announce initial state
    handleQueryState();

    return () => {
      window.removeEventListener("trigger-ar-camera", handleTriggerArCamera);
      window.removeEventListener("query-ar-camera-state", handleQueryState);
    };
  }, [cameraActive, cameraLoading, facingMode]);

  return (
    <div
      ref={containerRef}
      className="live-cake-wrapper"
      style={{
        width: "100%",
        height: "100%",
        flex: 1,
        minHeight: 0,
        position: "relative",
        borderRadius: "24px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* ── Camera Stabilization & Hold Steady Placement Guide ── */}
      {cameraActive && isPositioning && (
        <div
          style={{
            position: "absolute",
            top: "24%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 35,
            background: "linear-gradient(145deg, rgba(28, 8, 20, 0.95) 0%, rgba(12, 2, 8, 0.98) 100%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "2px solid #ffd166",
            borderRadius: "26px",
            padding: "20px 24px",
            textAlign: "center",
            boxShadow: "0 18px 50px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 209, 102, 0.4)",
            maxWidth: "92%",
            width: "350px",
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "4px" }}>🎂✨</div>
          <h3 style={{ color: "#ffd166", fontSize: "1.05rem", fontWeight: 800, margin: "0 0 6px", letterSpacing: "0.5px" }}>
            Hold Camera Steady
          </h3>
          <p style={{ color: "rgba(243, 237, 225, 0.88)", fontSize: "0.82rem", margin: "0 0 16px", lineHeight: 1.35 }}>
            Place phone or hold steady so your face is framed above the cake. When ready, tap below!
          </p>
          <button
            type="button"
            onClick={() => startCelebrationRecordingFlow()}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #b38728 100%)",
              color: "#18040d",
              fontWeight: 900,
              fontSize: "0.95rem",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(212, 175, 55, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <span>🎬 Ready! Start 3, 2, 1 Celebration</span>
          </button>
        </div>
      )}

      {/* ── Automatic 3, 2, 1 Countdown & Auto-Recording Overlay ── */}
      {countdown !== null && (
        <div
          style={{
            position: "absolute",
            top: "32%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 40,
            background: "rgba(18, 4, 14, 0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "2.5px solid #ffd166",
            borderRadius: "28px",
            padding: "18px 24px",
            textAlign: "center",
            width: "min(340px, 90vw)",
            boxSizing: "border-box",
            boxShadow: "0 20px 55px rgba(0, 0, 0, 0.92), 0 0 35px rgba(255, 209, 102, 0.6)",
            animation: "fadeIn 0.2s ease-out",
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "0.82rem", color: "#fef08a", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", whiteSpace: "nowrap" }}>
            <span style={{ color: "#ef4444", fontSize: "1.1rem" }}>🔴</span>
            <span>Recording Automatically</span>
          </div>
          <div style={{ fontSize: "4.8rem", fontWeight: 900, color: "#ffffff", lineHeight: 1.05, margin: "4px 0", textShadow: "0 0 25px rgba(255, 209, 102, 0.95)" }}>
            {countdown}
          </div>
          <div style={{ fontSize: "0.88rem", color: "#fbcfe8", fontWeight: 700, lineHeight: 1.3 }}>
            {countdown === 3 && "✨ 3... Make your 23rd birthday wish!"}
            {countdown === 2 && "💨 2... Inhale deeply & get ready to blow!"}
            {countdown === 1 && "🎂 1... Blow candles now!"}
          </div>
        </div>
      )}

      {/* ── Post-Blowout 5-Second Celebration Recording & Auto-Download Overlay ── */}
      {celebrationPostRecordSec !== null && (
        <div
          style={{
            position: "absolute",
            top: "22%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 40,
            background: "rgba(18, 4, 14, 0.94)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "2px solid #4ade80",
            borderRadius: "24px",
            padding: "12px 20px",
            textAlign: "center",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.85), 0 0 25px rgba(74, 222, 128, 0.45)",
            pointerEvents: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "min(340px, 92vw)",
            boxSizing: "border-box",
          }}
        >
          <span style={{ color: "#ef4444", fontSize: "1.2rem", flexShrink: 0 }}>🔴</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ color: "#ffffff", fontWeight: 900, fontSize: "clamp(0.85rem, 1.6vw, 0.98rem)" }}>
              Recording Celebration ({celebrationPostRecordSec}s)...
            </div>
            <div style={{ color: "#86efac", fontSize: "clamp(0.72rem, 1.3vw, 0.8rem)", fontWeight: 700 }}>
              📥 Downloading automatically to your device!
            </div>
          </div>
        </div>
      )}


      {/* ── Live Camera Feed (Divija in Frame) ── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 1,
          opacity: cameraActive ? 1 : 0,
          pointerEvents: "none",
          transform: facingMode === "user" ? "scaleX(-1)" : "none",
          filter: "brightness(0.95) contrast(1.05)",
          transition: "opacity 0.25s ease",
        }}
      />

      {/* ── Festive Celebration Studio Background (Active when camera is off) ── */}
      {!cameraActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            overflow: "hidden",
            background:
              "radial-gradient(circle at 50% 32%, rgba(159, 18, 57, 0.45) 0%, rgba(88, 5, 30, 0.65) 45%, rgba(15, 3, 10, 0.98) 100%)",
          }}
        >
          {/* Glowing Golden Fairy Lights Garland draped across the top */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "70px",
              pointerEvents: "none",
            }}
          >
            {/* Curved wire line */}
            <svg
              width="100%"
              height="70"
              viewBox="0 0 1000 70"
              preserveAspectRatio="none"
              style={{ position: "absolute", top: 0, left: 0, opacity: 0.4 }}
            >
              <path
                d="M0,8 Q250,55 500,20 T1000,12"
                fill="none"
                stroke="#ffd700"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            </svg>

            {/* Individual Glowing Fairy Light Bulbs */}
            {[
              { left: "5%", top: "14px", delay: "0s" },
              { left: "12%", top: "28px", delay: "0.4s" },
              { left: "20%", top: "38px", delay: "0.9s" },
              { left: "28%", top: "42px", delay: "1.3s" },
              { left: "37%", top: "35px", delay: "0.2s" },
              { left: "46%", top: "24px", delay: "1.6s" },
              { left: "55%", top: "18px", delay: "0.7s" },
              { left: "64%", top: "26px", delay: "1.1s" },
              { left: "73%", top: "36px", delay: "0.5s" },
              { left: "82%", top: "32px", delay: "1.8s" },
              { left: "90%", top: "20px", delay: "0.3s" },
              { left: "96%", top: "12px", delay: "1.4s" },
            ].map((bulb, idx) => (
              <div
                key={`fairy-${idx}`}
                style={{
                  position: "absolute",
                  left: bulb.left,
                  top: bulb.top,
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, #ffffff 10%, #ffd700 60%, #ffb703 100%)",
                  boxShadow: "0 0 10px #ffd700, 0 0 20px rgba(251, 191, 36, 0.8)",
                  animation: `fairyPulse 2.4s ease-in-out infinite`,
                  animationDelay: bulb.delay,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>

          {/* Dreamy Celebration Bokeh Orbs */}
          {[
            { left: "10%", top: "22%", size: 90, color: "rgba(255, 215, 0, 0.22)", delay: "0s" },
            { left: "82%", top: "25%", size: 110, color: "rgba(251, 113, 133, 0.20)", delay: "1.2s" },
            { left: "22%", top: "42%", size: 70, color: "rgba(254, 240, 138, 0.18)", delay: "0.6s" },
            { left: "72%", top: "45%", size: 85, color: "rgba(255, 183, 3, 0.16)", delay: "1.8s" },
            { left: "48%", top: "18%", size: 60, color: "rgba(255, 255, 255, 0.25)", delay: "2.1s" },
            { left: "6%", top: "54%", size: 95, color: "rgba(225, 29, 72, 0.16)", delay: "2.7s" },
            { left: "88%", top: "52%", size: 90, color: "rgba(255, 215, 0, 0.18)", delay: "0.9s" },
          ].map((b, idx) => (
            <div
              key={`bokeh-${idx}`}
              style={{
                position: "absolute",
                left: b.left,
                top: b.top,
                width: `${b.size}px`,
                height: `${b.size}px`,
                borderRadius: "50%",
                background: b.color,
                filter: "blur(22px)",
                animation: `bokehFloat 4.2s ease-in-out infinite`,
                animationDelay: b.delay,
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Natural Celebration Banquet Tabletop Surface (Grounding the Cake at the Bottom) */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "36%",
              background:
                "linear-gradient(180deg, rgba(38, 12, 26, 0.96) 0%, rgba(16, 4, 11, 0.98) 100%)",
              borderTop: "1.5px solid rgba(255, 215, 0, 0.38)",
              boxShadow: "inset 0 1px 14px rgba(255, 215, 0, 0.16), 0 -12px 35px rgba(0, 0, 0, 0.75)",
              pointerEvents: "none",
            }}
          >
            {/* Warm Candlelight Reflection on Tabletop */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "420px",
                maxWidth: "95%",
                height: "100%",
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(255, 215, 0, 0.28) 0%, rgba(244, 63, 94, 0.14) 42%, transparent 75%)",
              }}
            />
            {/* Subtle Gold Table Runner Edge */}
            <div
              style={{
                position: "absolute",
                top: "8px",
                left: "8%",
                right: "8%",
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.32) 50%, transparent 100%)",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Clean Top Guidance Pill & Live Recording Badge ── */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 15,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          pointerEvents: "none",
          maxWidth: "92%",
        }}
      >
        <div
          style={{
            background: isBlowingFace
              ? "linear-gradient(135deg, rgba(22, 101, 52, 0.95), rgba(21, 128, 61, 0.95))"
              : isRecording
              ? "linear-gradient(135deg, rgba(153, 27, 27, 0.95), rgba(127, 29, 29, 0.95))"
              : "rgba(18, 6, 14, 0.88)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: `1.5px solid ${isBlowingFace ? "#4ade80" : isRecording ? "#f87171" : "rgba(255, 209, 102, 0.5)"}`,
            borderRadius: "30px",
            padding: "6px 18px",
            color: isBlowingFace ? "#ffffff" : isRecording ? "#fee2e2" : "#fef08a",
            fontSize: "clamp(0.78rem, 1.4vw, 0.92rem)",
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: isBlowingFace ? "0 0 20px rgba(74, 222, 128, 0.6)" : "0 4px 16px rgba(0, 0, 0, 0.45)",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {isRecording && (
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ef4444",
                boxShadow: "0 0 8px #ef4444",
                display: "inline-block",
                animation: "pulseGlow 1.2s infinite ease-in-out",
              }}
            />
          )}
          <span>
            {!candlesBlown
              ? isBlowingFace
                ? "💨 Blowing detected! Keep going... ✨"
                : cameraActive
                ? isRecording
                  ? "🔴 Recording AR Moment · Pucker lips & blow candles! 🎬"
                  : faceDetected
                  ? "👤 In frame! Pucker lips & blow or tap cake! ✨"
                  : "👤 Stand back (1–2m) so you're with the cake!"
                : "✨ Make a wish! Blow candles or tap the cake ✨"
              : sliced
              ? "👑 Happy 23rd Birthday Divija! Enjoy your cake! 🎂"
              : "🔪 Tap 'Cut the Cake' for the ceremonial slice!"}
          </span>
        </div>
      </div>

      {/* ── 3D Three.js Cake Canvas (Full Viewport Freedom of Placement) ── */}
      <div
        id="cake-three-canvas-container"
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasTouchEnd}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onWheel={handleCanvasWheel}
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          minHeight: 0,
          position: "absolute",
          inset: 0,
          zIndex: 5,
          pointerEvents: "auto",
          touchAction: cameraActive ? "none" : "pan-y",
          cursor: cameraActive ? "grab" : "default",
        }}
      >
        <CakeScene
          blown={candlesBlown}
          sliced={sliced}
          cutting={cutting}
          confettiTrigger={confettiTrigger}
          autoRotate={autoRotate && !cameraActive}
          isARMode={cameraActive}
          cakeTransform={cakeTransform}
          onPlaneHit={(point) => {
            setCakeTransform((prev) => ({
              ...prev,
              x: Math.max(-3.5, Math.min(3.5, point.x)),
              z: Math.max(-3.5, Math.min(3.5, point.z)),
            }));
            showToast("📍 Cake anchored to surface! ✨", 1800);
          }}
          onToggleBlow={() => {
            if (!candlesBlown) {
              startBlowoutCeremony("💨 You tapped the cake! Starting celebration! 🎉✨");
            }
          }}
        />
      </div>

      {/* ── Golden Placement Ping Effect ── */}
      {placementPing && (
        <div
          style={{
            position: "absolute",
            left: `${placementPing.x}px`,
            top: `${placementPing.y}px`,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 18,
            animation: "pingPulse 0.8s ease-out forwards",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: "2.5px solid #ffd700",
              boxShadow: "0 0 26px #ffd700, inset 0 0 16px #ffd700",
            }}
          />
        </div>
      )}

      {/* ── AR Transformation Floating Toolbar (Lower, Raise, Scale, Rotate, Reset) ── */}
      {cameraActive && (
        <div
          style={{
            position: "absolute",
            right: "12px",
            top: "46%",
            transform: "translateY(-50%)",
            zIndex: 25,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            alignItems: "center",
            background: "rgba(18, 5, 14, 0.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1.5px solid rgba(255, 209, 102, 0.5)",
            borderRadius: "26px",
            padding: "8px 6px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.65), 0 0 14px rgba(212, 175, 55, 0.25)",
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            onClick={() => setCakeTransform((t) => ({ ...t, y: Math.max(t.y - 0.28, -3.2) }))}
            title="Lower cake down onto table"
            style={{
              background: "rgba(255, 209, 102, 0.16)",
              border: "1px solid rgba(255, 209, 102, 0.5)",
              color: "#ffd166",
              borderRadius: "16px",
              padding: "6px 8px",
              fontSize: "0.82rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <span>⬇️</span>
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.5px" }}>Lower</span>
          </button>

          <button
            type="button"
            onClick={() => setCakeTransform((t) => ({ ...t, y: Math.min(t.y + 0.28, 1.2) }))}
            title="Raise cake higher"
            style={{
              background: "rgba(255, 209, 102, 0.16)",
              border: "1px solid rgba(255, 209, 102, 0.5)",
              color: "#ffd166",
              borderRadius: "16px",
              padding: "6px 8px",
              fontSize: "0.82rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <span>⬆️</span>
            <span style={{ fontSize: "0.62rem", letterSpacing: "0.5px" }}>Raise</span>
          </button>

          <button
            type="button"
            onClick={() => setCakeTransform((t) => ({ ...t, scale: Math.min(t.scale * 1.15, 2.2) }))}
            title="Enlarge cake"
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#ffffff",
              borderRadius: "16px",
              padding: "6px 8px",
              fontSize: "0.85rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ➕
          </button>

          <button
            type="button"
            onClick={() => setCakeTransform((t) => ({ ...t, scale: Math.max(t.scale * 0.86, 0.35) }))}
            title="Shrink cake"
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#ffffff",
              borderRadius: "16px",
              padding: "6px 8px",
              fontSize: "0.85rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ➖
          </button>

          <button
            type="button"
            onClick={() => setCakeTransform((t) => ({ ...t, rotationY: t.rotationY + Math.PI / 4 }))}
            title="Rotate cake 45°"
            style={{
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#ffffff",
              borderRadius: "16px",
              padding: "6px 8px",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🔄
          </button>

          <button
            type="button"
            onClick={() => {
              setCakeTransform({ x: 0, y: cameraActive ? -1.55 : -1.05, z: 0, scale: cameraActive ? 0.88 : 0.94, rotationY: 0 });
              showToast("↺ Cake reset to optimal tabletop position! ✨", 2000);
            }}
            title="Reset to tabletop"
            style={{
              background: "rgba(212, 175, 55, 0.22)",
              border: "1px solid rgba(212, 175, 55, 0.65)",
              color: "#fde047",
              borderRadius: "16px",
              padding: "6px 7px",
              fontSize: "0.66rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ↺
          </button>
        </div>
      )}

      {/* ── AR Tabletop Pedestal Shadow (when camera active) ── */}
      {cameraActive && (
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            left: `calc(50% + ${cakeTransform.x * 28}px)`,
            transform: "translateX(-50%)",
            width: `${Math.round(360 * cakeTransform.scale)}px`,
            maxWidth: "85%",
            height: "40px",
            background: "radial-gradient(ellipse at center, rgba(0,0,0,0.65) 0%, rgba(212,175,55,0.12) 40%, transparent 75%)",
            borderRadius: "50%",
            pointerEvents: "none",
            zIndex: 4,
            transition: "left 0.1s ease, width 0.1s ease",
          }}
        />
      )}

      {/* ── Clean, Simple Control Dock (Anchored at Bottom) ── */}
      <div
        style={{
          width: "100%",
          position: "absolute",
          bottom: "10px",
          left: 0,
          right: 0,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px 6px",
          pointerEvents: "none",
        }}
      >
        {/* AR Gesture Hint Badge */}
        {cameraActive && (
          <div
            style={{
              background: "rgba(18, 5, 12, 0.85)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 209, 102, 0.4)",
              borderRadius: "20px",
              padding: "4px 14px",
              color: "#fef08a",
              fontSize: "clamp(0.68rem, 1.3vw, 0.78rem)",
              fontWeight: 700,
              letterSpacing: "0.2px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            👆 Drag cake to move · 🤏 Pinch to resize · 🔄 Twist to spin · Tap to place
          </div>
        )}
        <div
          className="cake-controls-dock-responsive"
          style={{
            pointerEvents: "auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: "rgba(22, 8, 16, 0.92)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1.5px solid rgba(251, 113, 133, 0.45)",
            borderRadius: "44px",
            padding: "6px 14px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.2)",
            maxWidth: "96%",
          }}
        >
          {!candlesBlown ? (
            <>
              {/* 1. Live AR Camera Button */}
              <button
                type="button"
                onClick={() => {
                  if (cameraActive) {
                    stopCamera();
                  } else {
                    startCameraAndMic();
                  }
                }}
                disabled={cameraLoading}
                style={{
                  padding: "9px 18px",
                  borderRadius: "32px",
                  border: `1.5px solid ${cameraActive ? "#38bdf8" : "#ffd166"}`,
                  cursor: cameraLoading ? "wait" : "pointer",
                  background: cameraActive
                    ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                    : "linear-gradient(135deg, #ffd166 0%, #ffb703 50%, #d4af37 100%)",
                  color: cameraActive ? "#ffffff" : "#18020b",
                  fontWeight: 900,
                  fontSize: "clamp(0.82rem, 1.4vw, 0.95rem)",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{cameraLoading ? "⏳ Starting..." : cameraActive ? "🌌 Studio View" : "📷 AR Camera"}</span>
              </button>

              {/* 1b. Camera Settings & Permissions Quick Button */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("open-camera-settings"));
                  }
                }}
                title="Camera Settings & Device Permissions"
                style={{
                  padding: "9px 12px",
                  borderRadius: "32px",
                  border: "1.5px solid rgba(255, 209, 102, 0.45)",
                  cursor: "pointer",
                  background: "rgba(255, 209, 102, 0.12)",
                  color: "#ffd166",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                }}
              >
                ⚙️
              </button>

              {/* 2. Manual Snap Photo Button (Always Available in AR & Studio Modes) */}
              <button
                type="button"
                onClick={() => autoCaptureCelebrationSnap(true)}
                disabled={isCapturing}
                title="Snap photo & save directly to device"
                style={{
                  padding: "9px 16px",
                  borderRadius: "32px",
                  border: "1.5px solid #4ade80",
                  cursor: isCapturing ? "wait" : "pointer",
                  background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 0 14px rgba(74, 222, 128, 0.35)",
                }}
              >
                <span>{isCapturing ? "⏳ Snapping..." : "📸 Take Photo"}</span>
              </button>

              {/* 3. Manual Record Clip Button (Always Available) */}
              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    stopVideoRecording();
                  } else {
                    startVideoRecording(5000, true);
                  }
                }}
                title={isRecording ? "Stop recording clip" : "Record 5s video clip & save to device"}
                style={{
                  padding: "9px 16px",
                  borderRadius: "32px",
                  border: isRecording ? "2px solid #ef4444" : "1.5px solid #f43f5e",
                  cursor: "pointer",
                  background: isRecording
                    ? "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)"
                    : "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: isRecording ? "0 0 18px rgba(239, 68, 68, 0.7)" : "0 0 12px rgba(244, 63, 94, 0.35)",
                }}
              >
                <span>{isRecording ? `⏹️ Stop (${recordingCountdown ?? 5}s)` : "🎬 Record Clip"}</span>
              </button>

              {/* Keepsake Viewer Button: allows re-opening video & photo at any time */}
              {(capturedVideoUrl || capturedPhotoUrl) && (
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "32px",
                    border: "1.5px solid #ffd700",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, rgba(212, 175, 55, 0.35) 0%, rgba(180, 83, 9, 0.45) 100%)",
                    color: "#fef08a",
                    fontWeight: 800,
                    fontSize: "clamp(0.78rem, 1.3vw, 0.88rem)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 0 14px rgba(255, 215, 0, 0.4)",
                  }}
                >
                  <span>🎬 View Keepsakes</span>
                </button>
              )}

              {/* Direct Save Photo shortcut */}
              {capturedPhotoUrl && (
                <button
                  type="button"
                  onClick={() => saveMediaToDevice("photo")}
                  title="Save captured photo to device"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "32px",
                    border: "1px solid #4ade80",
                    cursor: "pointer",
                    background: "rgba(34, 197, 94, 0.2)",
                    color: "#86efac",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>💾 Photo</span>
                </button>
              )}

              {/* Direct Save Video shortcut */}
              {capturedVideoUrl && (
                <button
                  type="button"
                  onClick={() => saveMediaToDevice("video")}
                  title="Save celebration video to device"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "32px",
                    border: "1px solid #38bdf8",
                    cursor: "pointer",
                    background: "rgba(56, 189, 248, 0.2)",
                    color: "#7dd3fc",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>💾 Video</span>
                </button>
              )}

              {/* 4. Blow Candles Button with 3, 2, 1 Countdown & Auto-Save */}
              <button
                type="button"
                onClick={() => {
                  startBlowoutCeremony("💨 Candles blown out! Divija's wish is granted! 👑✨");
                }}
                disabled={countdown !== null || celebrationPostRecordSec !== null}
                style={{
                  padding: "9px 18px",
                  borderRadius: "32px",
                  border: countdown !== null ? "2px solid #ef4444" : "1px solid rgba(255, 255, 255, 0.35)",
                  cursor: countdown !== null || celebrationPostRecordSec !== null ? "wait" : "pointer",
                  background: countdown !== null
                    ? "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)"
                    : "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                  boxShadow: countdown !== null ? "0 0 16px rgba(239, 68, 68, 0.6)" : "none",
                }}
              >
                <span>
                  {countdown !== null
                    ? `🔴 ${countdown} · Recording...`
                    : celebrationPostRecordSec !== null
                    ? `🔴 Celebration (${celebrationPostRecordSec}s)`
                    : "💨 Blow Candles (3, 2, 1)"}
                </span>
              </button>

              {/* Flip camera if live camera is on */}
              {cameraActive && (
                <button
                  type="button"
                  onClick={flipCamera}
                  title="Flip Camera"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "32px",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    cursor: "pointer",
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  🔄 Flip
                </button>
              )}
            </>
          ) : (
            <>
              {/* 1. Cut the Cake Button */}
              {!sliced && (
                <button
                  type="button"
                  onClick={handleCutCake}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "32px",
                    border: "2px solid #ffd700",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #ffb703 0%, #fb8500 50%, #d97706 100%)",
                    color: "#18020b",
                    fontWeight: 900,
                    fontSize: "clamp(0.88rem, 1.5vw, 1rem)",
                    boxShadow: "0 0 20px rgba(255, 183, 3, 0.65)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    animation: "pulseGlow 2s infinite ease-in-out",
                  }}
                >
                  <span>🔪 Cut the Cake!</span>
                </button>
              )}

              {/* 2. Manual Snap Photo Button (After Blow) */}
              <button
                type="button"
                onClick={() => autoCaptureCelebrationSnap(true)}
                disabled={isCapturing}
                title="Snap photo & save directly to device"
                style={{
                  padding: "9px 16px",
                  borderRadius: "32px",
                  border: "1.5px solid #4ade80",
                  cursor: isCapturing ? "wait" : "pointer",
                  background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 0 14px rgba(74, 222, 128, 0.35)",
                }}
              >
                <span>{isCapturing ? "⏳ Snapping..." : "📸 Take Photo"}</span>
              </button>

              {/* 3. Manual Record Clip Button (After Blow) */}
              <button
                type="button"
                onClick={() => {
                  if (isRecording) {
                    stopVideoRecording();
                  } else {
                    startVideoRecording(5000, true);
                  }
                }}
                title={isRecording ? "Stop recording clip" : "Record 5s video clip & save to device"}
                style={{
                  padding: "9px 16px",
                  borderRadius: "32px",
                  border: isRecording ? "2px solid #ef4444" : "1.5px solid #f43f5e",
                  cursor: "pointer",
                  background: isRecording
                    ? "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)"
                    : "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: isRecording ? "0 0 18px rgba(239, 68, 68, 0.7)" : "0 0 12px rgba(244, 63, 94, 0.35)",
                }}
              >
                <span>{isRecording ? `⏹️ Stop (${recordingCountdown ?? 5}s)` : "🎬 Record Clip"}</span>
              </button>

              {/* 4. View Keepsake (Video & Photo) */}
              {(capturedVideoUrl || capturedPhotoUrl) && (
                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "32px",
                    border: "1px solid rgba(255, 209, 102, 0.6)",
                    cursor: "pointer",
                    background: "rgba(255, 209, 102, 0.15)",
                    color: "#ffd166",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🎬 View Keepsakes</span>
                </button>
              )}

              {/* Direct Save Photo shortcut */}
              {capturedPhotoUrl && (
                <button
                  type="button"
                  onClick={() => saveMediaToDevice("photo")}
                  title="Save photo to device"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "32px",
                    border: "1px solid #4ade80",
                    cursor: "pointer",
                    background: "rgba(34, 197, 94, 0.2)",
                    color: "#86efac",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>💾 Photo</span>
                </button>
              )}

              {/* Direct Save Video shortcut */}
              {capturedVideoUrl && (
                <button
                  type="button"
                  onClick={() => saveMediaToDevice("video")}
                  title="Save celebration video to device"
                  style={{
                    padding: "8px 12px",
                    borderRadius: "32px",
                    border: "1px solid #38bdf8",
                    cursor: "pointer",
                    background: "rgba(56, 189, 248, 0.2)",
                    color: "#7dd3fc",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>💾 Video</span>
                </button>
              )}

              {/* 5. Relight Candles Option */}
              <button
                type="button"
                onClick={() => {
                  smoothAlign(containerRef.current);
                  hasTriggeredBlowRef.current = false;
                  candlesBlownRef.current = false;
                  onToggleBlow();
                  if (cameraActive) {
                    startFaceAnalysis();
                    if (micStreamRef.current) attachMicStream(micStreamRef.current);
                    startCompositeRenderLoop();
                  }
                  showToast("🕯️ Candles relit! Make another wish! ✨");
                }}
                style={{
                  padding: "9px 16px",
                  borderRadius: "32px",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#e2e8f0",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>🔥 Relight</span>
              </button>
            </>
          )}

          {/* Auto-spin Toggle */}
          <button
            type="button"
            onClick={() => setAutoRotate((r) => !r)}
            title={autoRotate ? "Pause rotation" : "Auto rotate"}
            style={{
              padding: "7px 10px",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              cursor: "pointer",
              background: autoRotate ? "rgba(255, 209, 102, 0.2)" : "rgba(255, 255, 255, 0.06)",
              color: autoRotate ? "#fef08a" : "#94a3b8",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {autoRotate ? "🔄" : "⏸"}
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.95), rgba(180, 83, 9, 0.95))",
              color: "#18020b",
              fontWeight: 800,
              fontSize: "0.82rem",
              padding: "7px 20px",
              borderRadius: "20px",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.35)",
              animation: "fadeIn 0.25s ease-out",
              maxWidth: "88%",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            {toastMessage}
          </div>
        )}
      </div>

      {/* ── Celebratory Keepsake Modal (Video Clip & Photo) ── */}
      {isMounted && isPhotoModalOpen && (capturedVideoUrl || capturedPhotoUrl) && typeof document !== "undefined" && createPortal(
        <div
          id="keepsake-preview-portal-modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483647,
            backgroundColor: "rgba(10, 2, 8, 0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            animation: "fadeIn 0.3s ease-out",
            overflowY: "auto",
            touchAction: "auto",
          }}
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, #220818 0%, #16040e 100%)",
              border: "2px solid rgba(255, 209, 102, 0.65)",
              borderRadius: "24px",
              padding: "20px",
              maxWidth: "640px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.85), 0 0 30px rgba(212, 175, 55, 0.35)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
              position: "relative",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close 'X' Button */}
            <button
              onClick={() => setIsPhotoModalOpen(false)}
              style={{
                position: "absolute",
                top: "14px",
                right: "16px",
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#ffffff",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontWeight: 900,
                fontSize: "1rem",
              }}
            >
              ✕
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: "2px" }}>🎉 👑 ✨</div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: "#ffd166",
                  fontSize: "clamp(1.2rem, 2.8vw, 1.6rem)",
                  fontWeight: 800,
                  margin: "0 0 4px",
                }}
              >
                Divija&apos;s Birthday Wish Celebration!
              </h2>
              <p
                style={{
                  color: "#fbcfe8",
                  fontSize: "clamp(0.78rem, 1.6vw, 0.88rem)",
                  margin: "0 0 4px",
                  fontStyle: "italic",
                }}
              >
                Recorded live with AR: human &amp; 3D cake together! ✨
              </p>
              <div
                style={{
                  fontSize: "0.74rem",
                  color: "#fef08a",
                  background: "rgba(255, 215, 0, 0.1)",
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                  borderRadius: "14px",
                  padding: "4px 10px",
                  display: "inline-block",
                  margin: "2px auto 0",
                }}
              >
                👁️ Preview here anytime · Tap &apos;Download&apos; below only if you want to save to My Files!
              </div>
            </div>

            {/* Tab Switcher: Video vs Photo */}
            {capturedVideoUrl && capturedPhotoUrl && (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  background: "rgba(255, 255, 255, 0.08)",
                  padding: "4px",
                  borderRadius: "30px",
                }}
              >
                <button
                  onClick={() => setActiveKeepsakeTab("video")}
                  style={{
                    padding: "6px 18px",
                    borderRadius: "24px",
                    border: "none",
                    cursor: "pointer",
                    background: activeKeepsakeTab === "video" ? "#ffd166" : "transparent",
                    color: activeKeepsakeTab === "video" ? "#18020b" : "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  🎬 Celebration Video
                </button>
                <button
                  onClick={() => setActiveKeepsakeTab("photo")}
                  style={{
                    padding: "6px 18px",
                    borderRadius: "24px",
                    border: "none",
                    cursor: "pointer",
                    background: activeKeepsakeTab === "photo" ? "#ffd166" : "transparent",
                    color: activeKeepsakeTab === "photo" ? "#18020b" : "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  📸 AR Polaroid Photo
                </button>
              </div>
            )}

            {/* Media Display Container */}
            <div
              style={{
                width: "100%",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1.5px solid rgba(255, 209, 102, 0.45)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                background: "#0d0208",
              }}
            >
              {activeKeepsakeTab === "video" && capturedVideoUrl ? (
                <video
                  src={capturedVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  style={{ width: "100%", maxHeight: "380px", display: "block", objectFit: "contain" }}
                />
              ) : capturedPhotoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={capturedPhotoUrl}
                  alt="Divija blowing birthday candles snapshot"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              ) : null}
            </div>

            {/* Modal Action Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                justifyContent: "center",
                width: "100%",
                marginTop: "4px",
              }}
            >
              {/* Primary Action: Direct Save to Device (Works on iOS, Android & PC) */}
              {activeKeepsakeTab === "video" && capturedVideoUrl ? (
                <button
                  type="button"
                  onClick={() => saveMediaToDevice("video")}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "32px",
                    border: "none",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #ffd166 0%, #d4af37 100%)",
                    color: "#18020b",
                    fontWeight: 900,
                    fontSize: "0.92rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 18px rgba(212, 175, 55, 0.45)",
                  }}
                >
                  <span>💾 Save Video to Device</span>
                </button>
              ) : capturedPhotoUrl ? (
                <button
                  type="button"
                  onClick={() => saveMediaToDevice("photo")}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "32px",
                    border: "none",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #ffd166 0%, #d4af37 100%)",
                    color: "#18020b",
                    fontWeight: 900,
                    fontSize: "0.92rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 18px rgba(212, 175, 55, 0.45)",
                  }}
                >
                  <span>💾 Save Photo to Device</span>
                </button>
              ) : null}

              {/* Quick secondary button to save the OTHER media if both exist */}
              {activeKeepsakeTab === "video" && capturedPhotoUrl && (
                <button
                  type="button"
                  onClick={() => saveMediaToDevice("photo")}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "32px",
                    border: "1.5px solid rgba(255, 209, 102, 0.5)",
                    cursor: "pointer",
                    background: "rgba(255, 209, 102, 0.12)",
                    color: "#ffd166",
                    fontWeight: 800,
                    fontSize: "0.88rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>📸 Also Save Photo</span>
                </button>
              )}
              {activeKeepsakeTab === "photo" && capturedVideoUrl && (
                <button
                  type="button"
                  onClick={() => saveMediaToDevice("video")}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "32px",
                    border: "1.5px solid rgba(255, 209, 102, 0.5)",
                    cursor: "pointer",
                    background: "rgba(255, 209, 102, 0.12)",
                    color: "#ffd166",
                    fontWeight: 800,
                    fontSize: "0.88rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🎬 Also Save Video</span>
                </button>
              )}

              {/* Cut Cake button */}
              {!sliced && (
                <button
                  onClick={() => {
                    setIsPhotoModalOpen(false);
                    handleCutCake();
                  }}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "32px",
                    border: "1px solid #ffd700",
                    background: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🔪 Proceed to Cake Cutting</span>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "32px",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 16px rgba(255, 183, 3, 0.6); }
          50% { transform: scale(1.04); box-shadow: 0 0 26px rgba(255, 183, 3, 0.9); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .cake-controls-dock-responsive {
            border-radius: 24px !important;
            padding: 8px 12px !important;
            gap: 8px !important;
            width: 100% !important;
            max-width: 360px !important;
          }
        }
      `}</style>
    </div>
  );
}
