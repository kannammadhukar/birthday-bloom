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

  // ── Keepsake Modal, Photo & Video States ──
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedVideoUrl, setCapturedVideoUrl] = useState<string | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeKeepsakeTab, setActiveKeepsakeTab] = useState<"video" | "photo">("video");

  // ── Cake Slice & Cutting States ──
  const [sliced, setSliced] = useState(false);
  const [cutting, setCutting] = useState(false);

  // ── Toast Feedback ──
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Rotation Control ──
  const [autoRotate, setAutoRotate] = useState(true);

  // ── 3D Cake Placement & AR Transformation States (Freedom of Movement) ──
  // By default, y is -1.55 (significantly lowered onto the table, completely clear of the user's face!)
  const [cakeTransform, setCakeTransform] = useState<CakeTransform>({
    x: 0,
    y: -1.55,
    z: 0,
    scale: 0.88,
    rotationY: 0,
  });
  const [placementPing, setPlacementPing] = useState<{ x: number; y: number } | null>(null);
  const cakeTransformRef = useRef(cakeTransform);
  useEffect(() => {
    cakeTransformRef.current = cakeTransform;
  }, [cakeTransform]);

  // Adjust default Y placement when toggling between Studio View (centered) and AR Camera (tabletop)
  useEffect(() => {
    if (cameraActive) {
      setCakeTransform((prev) => ({
        ...prev,
        y: prev.y > -0.8 ? -1.55 : prev.y,
        scale: prev.scale > 1.2 ? 0.88 : prev.scale,
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

  // Lazy-load MediaPipe FaceLandmarker in idle time so it never blocks initial page load or animations
  useEffect(() => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const handle = (window as any).requestIdleCallback(
        () => {
          initFaceLandmarker();
        },
        { timeout: 10000 }
      );
      return () => (window as any).cancelIdleCallback?.(handle);
    }
  }, []);

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

  // Screen Tap-to-Place logic (Raycasts screen tap to horizontal table plane)
  const handleScreenTapToPlace = (clientX: number, clientY: number) => {
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
      const cakeContainer = document.getElementById("cake-three-canvas-container") ||
        document.getElementById("cake-three-canvas") ||
        containerRef.current;
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

    animFrameRef.current = requestAnimationFrame(renderFrame);
  }

  function stopCompositeRenderLoop() {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }

  // ── Start AR Video Recording ──
  function startVideoRecording() {
    try {
      startCompositeRenderLoop(); // Always make sure composite render loop is actively running
      const canvas = compositeCanvasRef.current;
      if (!canvas || typeof canvas.captureStream !== "function") return;

      // Avoid restarting if already active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        return;
      }

      recordedChunksRef.current = [];

      // 30fps canvas stream
      const canvasStream = canvas.captureStream(30);

      // Attach audio track if mic is on
      if (micStreamRef.current && micStreamRef.current.getAudioTracks().length > 0) {
        try {
          const audioTrack = micStreamRef.current.getAudioTracks()[0];
          canvasStream.addTrack(audioTrack);
        } catch {}
      }

      let mimeType = "video/webm;codecs=vp9,opus";
      if (typeof MediaRecorder === "undefined") return;
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8,opus";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "video/mp4";
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = "";
            }
          }
        }
      }

      const recorder = new MediaRecorder(canvasStream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        setIsRecording(false);
        isRecordingRef.current = false;

        const finalMime = recorder.mimeType || "video/webm";
        const blob = new Blob(recordedChunksRef.current, { type: finalMime });
        if (blob.size > 0) {
          const videoUrl = URL.createObjectURL(blob);
          setCapturedVideoUrl(videoUrl);
          setActiveKeepsakeTab("video");
          setIsPhotoModalOpen(true);
          // Keep video in browser memory preview - user can preview on-site and download only if they like!
          showToast("🎬 Celebration video ready! Preview & view photo in the Keepsake viewer! 👑✨", 4000);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      isRecordingRef.current = true;
    } catch (err) {
      console.warn("MediaRecorder could not start:", err);
    }
  }

  // ── Manual AR Photo Snapshot (Divija + 3D Cake + Gold Filigree Plaque) ──
  const autoCaptureCelebrationSnap = useCallback(async () => {
    try {
      setIsCapturing(true);

      const offCanvas = document.createElement("canvas");
      offCanvas.width = 1280;
      offCanvas.height = 920;
      const ctx = offCanvas.getContext("2d");
      if (!ctx) {
        setIsCapturing(false);
        return;
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
      const cakeContainer = document.getElementById("cake-three-canvas-container") ||
        document.getElementById("cake-three-canvas") ||
        containerRef.current;
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

      // Open Modal to present the souvenir (NO autoDownload - purely in modal preview!)
      setIsPhotoModalOpen(true);
      setActiveKeepsakeTab("photo");
    } catch {
      setIsCapturing(false);
    }
  }, [cameraActive, facingMode]);

  // ── Unified Blow Trigger: Records 4.5s Celebration Video (Single Video, Zero Photo Spam) ──
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
      triggerVideoConfetti(); // Renders confetti in composite video over both human and cake!

      // Ensure composite render loop and video recording are active
      startCompositeRenderLoop();
      if (!isRecordingRef.current || !mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
        startVideoRecording();
      }

      // Snap celebration photo with both Divija and the 3D cake at peak confetti
      setTimeout(() => {
        autoCaptureCelebrationSnap();
      }, 1500);

      // Record exactly 4.0 seconds of celebration through blowout, smoke, confetti & laughter
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          try {
            mediaRecorderRef.current.stop();
          } catch (err) {
            console.warn("Error stopping MediaRecorder:", err);
          }
        }
      }, 4000);
    },
    [onToggleBlow]
  );

  // ── Unified 7-Second Pre-Roll & Video Recording Ceremony Flow ──
  const startCelebrationRecordingFlow = useCallback(() => {
    setIsPositioning(false);
    startCompositeRenderLoop();
    startVideoRecording(); // Start recording IMMEDIATELY so the entire 7 seconds are recorded!
    setCountdown(7);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev > 1) {
          return prev - 1;
        }
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        isArmedRef.current = true;
        showToast("💨 NOW! Make your wish & blow out the candles! 🎂✨", 4000);
        return null;
      });
    }, 1000);
  }, []);

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
                    triggerBlowSuccess("💨 You blew out the candles! Happy 23rd Birthday Divija! 🎉✨");
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
            triggerBlowSuccess("💨 Breath detected! Candles blown out! 🎉✨");
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
            onClick={startCelebrationRecordingFlow}
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
            <span>🎬 Ready! Start 7s Celebration</span>
          </button>
        </div>
      )}

      {/* ── 7-Second Celebration Recording & Make a Wish Countdown Overlay ── */}
      {countdown !== null && (
        <div
          style={{
            position: "absolute",
            top: "28%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 35,
            background: "rgba(18, 4, 14, 0.94)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "2.5px solid #ffd166",
            borderRadius: "26px",
            padding: "18px 30px",
            textAlign: "center",
            boxShadow: "0 16px 45px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 209, 102, 0.55)",
            animation: "fadeIn 0.2s ease-out",
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: "0.78rem", color: "#ffd166", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase" }}>
            ✦ Recording Live · Smile with Cake ✦
          </div>
          <div style={{ fontSize: "4.2rem", fontWeight: 900, color: "#ffffff", lineHeight: 1.05, margin: "4px 0", textShadow: "0 0 20px rgba(255, 209, 102, 0.8)" }}>
            {countdown}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#fbcfe8", fontWeight: 700 }}>
            {countdown > 3 ? "😊 Smile & make your 23rd birthday wish!" : "💨 Inhale & get ready to blow!"}
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

      {/* ── Studio Ambient Halo (Active when camera is off) ── */}
      {!cameraActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
            background:
              "radial-gradient(circle at 50% 45%, rgba(251, 113, 133, 0.16) 0%, rgba(254, 240, 138, 0.1) 40%, rgba(20, 5, 15, 0.85) 85%)",
          }}
        />
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
          touchAction: "none",
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
            triggerBlowSuccess("💨 You tapped the cake! Candles blown out! 🎉✨");
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
              setCakeTransform({ x: 0, y: -1.55, z: 0, scale: 0.88, rotationY: 0 });
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
                  <span>🎬 View Keepsakes (Video & Photo)</span>
                </button>
              )}

              {/* 2. Manual Snap AR Photo Button (when camera is on) */}
              {cameraActive && (
                <button
                  type="button"
                  onClick={() => {
                    autoCaptureCelebrationSnap();
                    showToast("📸 Commemorative AR Photo Captured! ✨");
                  }}
                  disabled={isCapturing}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "32px",
                    border: "1.5px solid #4ade80",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
                    color: "#ffffff",
                    fontWeight: 800,
                    fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 0 14px rgba(74, 222, 128, 0.4)",
                  }}
                >
                  <span>{isCapturing ? "⏳ Snapping..." : "📸 Snap AR Photo"}</span>
                </button>
              )}

              {/* 4. Direct Blow Button */}
              <button
                type="button"
                onClick={() => {
                  triggerBlowSuccess("💨 Candles blown out! Divija's wish is granted! 👑✨");
                }}
                style={{
                  padding: "9px 18px",
                  borderRadius: "32px",
                  border: "1px solid rgba(255, 255, 255, 0.35)",
                  cursor: "pointer",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "clamp(0.82rem, 1.4vw, 0.92rem)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease",
                }}
              >
                <span>💨 Blow Candles</span>
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

              {/* 2. View Keepsake (Video & Photo) */}
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
                  <span>🎬 View Video &amp; Photo</span>
                </button>
              )}

              {/* 3. Relight Candles Option */}
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
      {isPhotoModalOpen && (capturedVideoUrl || capturedPhotoUrl) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(10, 2, 8, 0.88)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            animation: "fadeIn 0.3s ease-out",
          }}
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            style={{
              background: "linear-gradient(145deg, #220818 0%, #16040e 100%)",
              border: "2px solid rgba(255, 209, 102, 0.65)",
              borderRadius: "28px",
              padding: "20px",
              maxWidth: "680px",
              width: "100%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.85), 0 0 30px rgba(212, 175, 55, 0.35)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
              position: "relative",
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
              {/* Save / Download Current Tab */}
              {activeKeepsakeTab === "video" && capturedVideoUrl ? (
                <a
                  href={capturedVideoUrl}
                  download={`divija-23rd-birthday-video-${Date.now()}.webm`}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "32px",
                    background: "linear-gradient(135deg, #ffd166 0%, #d4af37 100%)",
                    color: "#18020b",
                    fontWeight: 900,
                    fontSize: "0.92rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 18px rgba(212, 175, 55, 0.45)",
                  }}
                >
                  <span>💾 Download Video Clip</span>
                </a>
              ) : capturedPhotoUrl ? (
                <a
                  href={capturedPhotoUrl}
                  download={`divija-23rd-birthday-wish-${Date.now()}.jpg`}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "32px",
                    background: "linear-gradient(135deg, #ffd166 0%, #d4af37 100%)",
                    color: "#18020b",
                    fontWeight: 900,
                    fontSize: "0.92rem",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 4px 18px rgba(212, 175, 55, 0.45)",
                  }}
                >
                  <span>💾 Download Photo</span>
                </a>
              ) : null}

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
        </div>
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
