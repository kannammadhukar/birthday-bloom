"use client";
import React, { useState, useEffect, useRef } from "react";

interface CameraSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCakeCamera?: () => void;
  onCloseCakeCamera?: () => void;
  isCakeCameraActive?: boolean;
}

export default function CameraSettingsModal({
  isOpen,
  onClose,
  onOpenCakeCamera,
  onCloseCakeCamera,
  isCakeCameraActive = false,
}: CameraSettingsModalProps) {
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "prompt" | "denied" | "unknown">("unknown");
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const [testStream, setTestStream] = useState<MediaStream | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | "info">("info");
  const [micAllowed, setMicAllowed] = useState<boolean | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement | null>(null);

  // Check browser permissions on mount and when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopTestStream();
      return;
    }

    checkPermissions();
    enumerateCameras();

    // Query state from LiveCakeExperience
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("query-ar-camera-state"));
    }

    // Lock page scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopTestStream();
    };
  }, []);

  // Update preview video element when testStream changes
  useEffect(() => {
    if (previewVideoRef.current && testStream) {
      previewVideoRef.current.srcObject = testStream;
      previewVideoRef.current.play().catch(() => {});
    }
  }, [testStream]);

  function stopTestStream() {
    if (testStream) {
      testStream.getTracks().forEach((t) => t.stop());
      setTestStream(null);
    }
    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
    setIsTestingCamera(false);
  }

  async function checkPermissions() {
    if (typeof navigator === "undefined") return;

    // 1. Query Camera Permission
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const camStatus = await navigator.permissions.query({ name: "camera" as any });
        setPermissionStatus(camStatus.state as any);
        camStatus.onchange = () => {
          setPermissionStatus(camStatus.state as any);
        };
      }
    } catch {
      // Some browsers do not support querying camera
    }

    // 2. Query Microphone Permission
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const micStatus = await navigator.permissions.query({ name: "microphone" as any });
        setMicAllowed(micStatus.state === "granted");
        micStatus.onchange = () => {
          setMicAllowed(micStatus.state === "granted");
        };
      }
    } catch {}
  }

  async function enumerateCameras() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setAvailableDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch {}
  }

  // Directly test and request camera permission
  async function handleRequestPermission() {
    setIsTestingCamera(true);
    setFeedbackMessage("Requesting camera access from browser...");
    setFeedbackType("info");

    stopTestStream();

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setFeedbackMessage("getUserMedia is not supported on this browser or connection.");
      setFeedbackType("error");
      setIsTestingCamera(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setTestStream(stream);
      setPermissionStatus("granted");
      setFeedbackMessage("✅ Camera permission granted & preview active! Ready for AR Cake.");
      setFeedbackType("success");
      setIsTestingCamera(false);
      enumerateCameras();
    } catch (err: any) {
      console.warn("Permission request failed:", err);
      setIsTestingCamera(false);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionStatus("denied");
        setFeedbackMessage("❌ Access blocked by browser. Click the lock/tune icon in URL bar to Allow.");
        setFeedbackType("error");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setFeedbackMessage("⚠️ No camera hardware found on this system.");
        setFeedbackType("error");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setFeedbackMessage("⚠️ Camera is in use by another app or tab. Please close it and try again.");
        setFeedbackType("error");
      } else {
        setFeedbackMessage(`⚠️ Camera error: ${err.name || "Failed to start"}`);
        setFeedbackType("error");
      }
    }
  }

  // Trigger AR Camera directly inside the user click handler
  async function handleToggleCakeCamera() {
    if (isCakeCameraActive) {
      stopTestStream();
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("trigger-ar-camera", {
            detail: { action: "stop" },
          })
        );
      }
      if (onCloseCakeCamera) onCloseCakeCamera();
      setFeedbackMessage("AR Camera turned off. Returned to Studio View.");
      setFeedbackType("info");
      return;
    }

    // 1. Clean up existing tracks before initializing
    stopTestStream();
    if (typeof window !== "undefined" && (window as any).__AR_ACTIVE_STREAM__) {
      try {
        (window as any).__AR_ACTIVE_STREAM__.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        (window as any).__AR_ACTIVE_STREAM__ = null;
      } catch {}
    }

    if (typeof navigator === "undefined" || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setFeedbackMessage("getUserMedia is not supported on this browser or connection.");
      setFeedbackType("error");
      return;
    }

    setFeedbackMessage("Starting AR camera with selfie camera...");
    setFeedbackType("info");

    try {
      // Direct user gesture initialization with front selfie camera constraints
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId } }
          : { facingMode: { ideal: facingMode || "user" } },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (typeof window !== "undefined") {
        (window as any).__AR_ACTIVE_STREAM__ = stream;
      }

      setPermissionStatus("granted");
      setFeedbackMessage("🚀 AR Camera launched on Divija's Birthday Cake!");
      setFeedbackType("success");

      // Pass active stream directly to LiveCakeExperience
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("trigger-ar-camera", {
            detail: { action: "start", stream, facingMode: facingMode || "user" },
          })
        );
      }

      if (onOpenCakeCamera) onOpenCakeCamera();

      // Smoothly scroll to the cake
      setTimeout(() => {
        const cakeElem = document.getElementById("cake-canvas-container");
        if (cakeElem) {
          cakeElem.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        onClose();
      }, 400);
    } catch (err: any) {
      console.warn("Direct camera initialization error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionStatus("denied");
        setFeedbackMessage("❌ Access blocked by browser. Click the lock/tune icon in URL bar to Allow.");
        setFeedbackType("error");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setFeedbackMessage("⚠️ No camera hardware found on this system.");
        setFeedbackType("error");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setFeedbackMessage("⚠️ Camera is in use by another app or tab. Please close it and try again.");
        setFeedbackType("error");
      } else {
        setFeedbackMessage(`⚠️ Camera error: ${err.name || "Failed to start"}`);
        setFeedbackType("error");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("ar-camera-state-changed", {
            detail: { active: false, loading: false, facingMode, error: err.name || err.message },
          })
        );
      }
    }
  }

  function handleFlipFacing() {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    if (isCakeCameraActive && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("trigger-ar-camera", {
          detail: { action: "flip" },
        })
      );
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        minHeight: "-webkit-fill-available",
        zIndex: 9999,
        background: "rgba(10, 2, 8, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
        animation: "fadeIn 0.25s ease-out",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopTestStream();
          onClose();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          margin: "auto",
          background: "linear-gradient(165deg, #1f0714 0%, #15030e 100%)",
          border: "2px solid #ffd166",
          borderRadius: "28px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(255, 209, 102, 0.25)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90dvh",
        }}
      >
        {/* ── Modal Header ── */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid rgba(255, 209, 102, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.6rem" }}>⚙️</span>
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1.18rem",
                  fontFamily: "'Cinzel', serif, Georgia",
                  color: "#ffd166",
                  letterSpacing: "1px",
                  fontWeight: 800,
                }}
              >
                AR Camera Settings
              </h2>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#fbcfe8" }}>
                Device controls, permission status &amp; testing
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopTestStream();
              onClose();
            }}
            style={{
              background: "linear-gradient(135deg, rgba(58, 12, 28, 0.96) 0%, rgba(22, 5, 14, 0.98) 100%)",
              border: "2px solid #ffd700",
              color: "#ffd700",
              width: "46px",
              height: "46px",
              minWidth: "46px",
              minHeight: "46px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "1.45rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.9), 0 0 16px rgba(255, 215, 0, 0.5)",
              transition: "all 0.2s ease",
              touchAction: "manipulation",
              lineHeight: 1,
            }}
            aria-label="Close settings modal"
          >
            ✕
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* 1. Status Indicator Bar */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "18px",
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                Camera Permission
              </div>
              <div style={{ fontSize: "0.98rem", fontWeight: 700, color: "#ffffff", marginTop: "2px" }}>
                {permissionStatus === "granted" && "✅ Allowed / Granted"}
                {permissionStatus === "prompt" && "⚠️ Needs Permission (Prompt)"}
                {permissionStatus === "denied" && "❌ Blocked by Browser"}
                {permissionStatus === "unknown" && "ℹ️ Ready to Test"}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.74rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                Cake AR Mode
              </div>
              <div
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 800,
                  color: isCakeCameraActive ? "#4ade80" : "#ffd166",
                  marginTop: "2px",
                }}
              >
                {isCakeCameraActive ? "🟢 Active on Cake" : "🌌 Studio Mode"}
              </div>
            </div>
          </div>

          {/* 2. Live Mini-Viewfinder (if test active or stream available) */}
          {testStream && (
            <div
              style={{
                width: "100%",
                height: "190px",
                borderRadius: "16px",
                overflow: "hidden",
                position: "relative",
                background: "#000",
                border: "2px solid #4ade80",
                boxShadow: "0 0 20px rgba(74, 222, 128, 0.35)",
              }}
            >
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transform: facingMode === "user" ? "scaleX(-1)" : "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  left: "10px",
                  background: "rgba(0, 0, 0, 0.75)",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "0.74rem",
                  color: "#4ade80",
                  fontWeight: 700,
                }}
              >
                ● Live Camera Test Signal
              </div>
              <button
                onClick={stopTestStream}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(0, 0, 0, 0.75)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "10px",
                  fontSize: "0.74rem",
                  cursor: "pointer",
                }}
              >
                Stop Preview
              </button>
            </div>
          )}

          {/* 3. Feedback Banner */}
          {feedbackMessage && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "14px",
                fontSize: "0.82rem",
                lineHeight: "1.4",
                background:
                  feedbackType === "success"
                    ? "rgba(22, 101, 52, 0.35)"
                    : feedbackType === "error"
                    ? "rgba(153, 27, 27, 0.35)"
                    : "rgba(30, 41, 59, 0.6)",
                border: `1px solid ${
                  feedbackType === "success"
                    ? "#4ade80"
                    : feedbackType === "error"
                    ? "#f87171"
                    : "rgba(255, 255, 255, 0.15)"
                }`,
                color: feedbackType === "success" ? "#86efac" : feedbackType === "error" ? "#fca5a5" : "#cbd5e1",
              }}
            >
              {feedbackMessage}
            </div>
          )}

          {/* 4. Primary Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Launch / Stop AR Camera on Cake */}
            <button
              onClick={handleToggleCakeCamera}
              style={{
                width: "100%",
                padding: "13px 20px",
                borderRadius: "20px",
                border: `2px solid ${isCakeCameraActive ? "#38bdf8" : "#ffd166"}`,
                cursor: "pointer",
                background: isCakeCameraActive
                  ? "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                  : "linear-gradient(135deg, #ffd166 0%, #ffb703 50%, #d4af37 100%)",
                color: isCakeCameraActive ? "#ffffff" : "#18020b",
                fontWeight: 900,
                fontSize: "1rem",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s ease",
              }}
            >
              <span>{isCakeCameraActive ? "🌌 Switch to Studio View (Close Camera)" : "🚀 Open AR Camera on Cake"}</span>
            </button>

            {/* Test / Request Permission Button */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleRequestPermission}
                disabled={isTestingCamera}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 209, 102, 0.5)",
                  background: "rgba(255, 209, 102, 0.12)",
                  color: "#ffd166",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: isTestingCamera ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <span>{isTestingCamera ? "⏳ Testing..." : "🔑 Request / Test Camera"}</span>
              </button>

              <button
                onClick={handleFlipFacing}
                style={{
                  padding: "10px 16px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>🔄</span>
                <span>{facingMode === "user" ? "Front" : "Back"}</span>
              </button>
            </div>
          </div>

          {/* 5. Device Selector (if multiple cameras detected) */}
          {availableDevices.length > 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "0.78rem", color: "#fbcfe8", fontWeight: 600 }}>Select Camera Hardware:</label>
              <select
                value={selectedDeviceId}
                onChange={(e) => {
                  setSelectedDeviceId(e.target.value);
                  stopTestStream();
                }}
                style={{
                  padding: "8px 12px",
                  borderRadius: "12px",
                  background: "rgba(24, 6, 18, 0.9)",
                  border: "1px solid rgba(255, 209, 102, 0.3)",
                  color: "#fff",
                  fontSize: "0.82rem",
                  outline: "none",
                }}
              >
                {availableDevices.map((d, i) => (
                  <option key={d.deviceId || i} value={d.deviceId}>
                    {d.label || `Camera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 6. Quick Troubleshooting & 127.0.0.1 Switcher */}
          <div
            style={{
              background: "rgba(255, 209, 102, 0.04)",
              border: "1px dashed rgba(255, 209, 102, 0.3)",
              borderRadius: "16px",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "#ffd166", fontWeight: 700 }}>
              💡 If Camera Does Not Open in Chrome:
            </div>
            <ol
              style={{
                margin: 0,
                paddingLeft: "20px",
                fontSize: "0.76rem",
                color: "#e2e8f0",
                lineHeight: "1.5",
              }}
            >
              <li>Click the <b>Tune / Lock icon (🎚️ / 🔒)</b> on the left of your URL bar.</li>
              <li>Toggle <b>Camera</b> to <b>Allow</b> (or click <i>Reset permissions</i>).</li>
              <li>Or click the button below to switch to <b>127.0.0.1</b> for a fresh permission prompt.</li>
            </ol>

            <a
              href="http://127.0.0.1:3000"
              style={{
                marginTop: "4px",
                padding: "8px 14px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(217, 119, 6, 0.2))",
                border: "1px solid rgba(255, 209, 102, 0.5)",
                color: "#ffd166",
                fontSize: "0.8rem",
                fontWeight: 700,
                textAlign: "center",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              🌐 Open on http://127.0.0.1:3000 (Fresh Origin)
            </a>
          </div>
        </div>

        {/* ── Modal Footer ── */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid rgba(255, 209, 102, 0.2)",
            background: "rgba(12, 2, 8, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: "0.76rem", color: "#94a3b8" }}>
            Microphone: {micAllowed ? "🎤 Active" : "🎤 Ready on blow"}
          </div>
          <button
            onClick={() => {
              stopTestStream();
              onClose();
            }}
            style={{
              padding: "8px 18px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "#fff",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
