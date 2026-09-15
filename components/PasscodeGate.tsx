"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface PasscodeGateProps {
  onUnlock: (auth: { isAdmin: boolean; code: string }) => void;
}

export default function PasscodeGate({ onUnlock }: PasscodeGateProps) {
  const [code, setCode] = useState<string>("");
  const [showDigits, setShowDigits] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [shake, setShake] = useState<boolean>(false);

  const handleUnlockNow = useCallback((pass: string = "2006") => {
    setSuccessMsg("Welcome to the Gala! 👑 Opening celebration...");
    try {
      localStorage.setItem("divija_passcode_auth", "unlocked");
      localStorage.setItem("divija_auth_role", pass === "2006" ? "admin" : "guest");
    } catch {}
    onUnlock({ isAdmin: pass === "2006", code: pass });
  }, [onUnlock]);

  const verifyCode = useCallback((codeToVerify: string) => {
    const cleaned = codeToVerify.trim();
    if (cleaned === "2006" || cleaned === "2003" || cleaned === "1109" || cleaned === "0911") {
      handleUnlockNow(cleaned);
    } else {
      setShake(true);
      setErrorMsg("Incorrect code. Tap 'Enter Gala Directly' above to enter!");
      setTimeout(() => {
        setShake(false);
        setCode("");
      }, 700);
    }
  }, [handleUnlockNow]);

  // Handle numpad digit press (synchronous, instant, zero latency)
  const handleNumpadPress = useCallback((val: string) => {
    setErrorMsg("");
    if (val === "⌫") {
      setCode((prev) => prev.slice(0, -1));
      return;
    }
    if (val === "C") {
      setCode("");
      return;
    }
    setCode((prev) => {
      if (prev.length >= 4) return prev;
      const next = prev + val;
      if (next.length === 4) {
        setTimeout(() => verifyCode(next), 80);
      }
      return next;
    });
  }, [verifyCode]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleNumpadPress(e.key);
      } else if (e.key === "Backspace") {
        handleNumpadPress("⌫");
      } else if (e.key === "Delete" || e.key === "Escape") {
        handleNumpadPress("C");
      } else if (e.key === "Enter") {
        handleUnlockNow("2006");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNumpadPress, handleUnlockNow]);

  // Lock page scroll on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const digitsArray = [0, 1, 2, 3].map((idx) => code[idx] || "");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        minHeight: "-webkit-fill-available",
        zIndex: 9999999,
        background:
          "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(55, 10, 26, 0.97) 0%, rgba(18, 4, 11, 0.98) 65%, rgba(6, 1, 4, 1) 100%)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
        pointerEvents: "auto",
        touchAction: "manipulation",
      }}
    >
      {/* Luxury Velvet & Gold Card */}
      <div
        className={shake ? "passcode-shake" : ""}
        style={{
          width: "100%",
          maxWidth: "400px",
          margin: "auto",
          background: "linear-gradient(145deg, rgba(42, 10, 24, 0.95) 0%, rgba(18, 4, 11, 0.98) 100%)",
          border: "2px solid rgba(212, 175, 55, 0.55)",
          borderRadius: "24px",
          padding: "clamp(20px, 4.5vw, 32px) clamp(16px, 4vw, 24px)",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.95), 0 0 45px rgba(212, 175, 55, 0.25)",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Corner Skip Button */}
        <button
          type="button"
          onClick={() => handleUnlockNow("2006")}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "rgba(212, 175, 55, 0.2)",
            border: "1px solid rgba(212, 175, 55, 0.6)",
            borderRadius: "16px",
            padding: "4px 12px",
            color: "#ffd700",
            fontSize: "0.76rem",
            fontWeight: 700,
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          Skip ➔
        </button>

        {/* Decorative corner brackets */}
        <div style={{ position: "absolute", top: 10, left: 10, width: 16, height: 16, borderTop: "2px solid #d4af37", borderLeft: "2px solid #d4af37" }} />
        <div style={{ position: "absolute", bottom: 10, left: 10, width: 16, height: 16, borderBottom: "2px solid #d4af37", borderLeft: "2px solid #d4af37" }} />
        <div style={{ position: "absolute", bottom: 10, right: 10, width: 16, height: 16, borderBottom: "2px solid #d4af37", borderRight: "2px solid #d4af37" }} />

        {/* Crown Icon */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(122, 21, 38, 0.4))",
            border: "1.5px solid #f6d896",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.7rem",
            margin: "0 auto 12px",
            boxShadow: "0 0 20px rgba(212, 175, 55, 0.4)",
          }}
        >
          👑
        </div>

        {/* Title */}
        <h2
          style={{
            color: "#f6d896",
            fontSize: "clamp(1.25rem, 4vw, 1.65rem)",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            margin: "0 0 4px",
            textShadow: "0 0 20px rgba(212, 175, 55, 0.35)",
          }}
        >
          The Royal Premiere 🎬
        </h2>

        <p
          style={{
            color: "rgba(243, 237, 225, 0.8)",
            fontSize: "0.85rem",
            margin: "0 0 16px",
            fontFamily: "'Outfit', sans-serif",
            lineHeight: 1.3,
          }}
        >
          Divija’s 23rd Birthday Gala<br />
          <span style={{ fontSize: "0.78rem", color: "rgba(212, 175, 55, 0.85)" }}>
            Enter your 4-digit invitation passcode
          </span>
        </p>

        {/* 4 Visual Digit Boxes */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            gap: "clamp(8px, 2.5vw, 12px)",
            marginBottom: "12px",
          }}
        >

          {/* 4 Visual Luxury Gold Cells */}
          {digitsArray.map((digit, idx) => {
            const isFilled = digit !== "";
            const isCurrent = code.length === idx;
            return (
              <div
                key={idx}
                style={{
                  width: "clamp(46px, 12vw, 56px)",
                  height: "clamp(52px, 13vw, 60px)",
                  borderRadius: "14px",
                  background: isFilled ? "rgba(140, 20, 45, 0.45)" : "rgba(255, 255, 255, 0.05)",
                  border: isCurrent
                    ? "2px solid #ffd166"
                    : isFilled
                    ? "1.8px solid #f6d896"
                    : "1.5px solid rgba(212, 175, 55, 0.3)",
                  color: "#fff",
                  fontSize: showDigits ? "clamp(1.4rem, 4vw, 1.75rem)" : "1.8rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  boxShadow: isCurrent
                    ? "0 0 16px rgba(255, 209, 102, 0.5)"
                    : isFilled
                    ? "0 0 14px rgba(212, 175, 55, 0.35)"
                    : "none",
                  transition: "all 0.18s ease",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              >
                {isFilled ? (showDigits ? digit : "●") : isCurrent ? <span className="passcode-blink">|</span> : ""}
              </div>
            );
          })}
        </div>

        {/* Visibility Toggle & Helper */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
          <button
            type="button"
            onClick={() => setShowDigits((prev) => !prev)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(212, 175, 55, 0.75)",
              fontSize: "0.76rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "2px 6px",
            }}
          >
            <span>{showDigits ? "👁️ Hide Code" : "👁️ Show Code"}</span>
          </button>
          {code.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setCode("");
                setErrorMsg("");
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#fca5a5",
                fontSize: "0.76rem",
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Messages */}
        <div style={{ minHeight: "24px", marginBottom: "8px" }}>
          {errorMsg && (
            <p style={{ color: "#fca5a5", fontSize: "0.82rem", margin: 0, fontWeight: 600 }}>
              {errorMsg}
            </p>
          )}
          {successMsg && (
            <p style={{ color: "#86efac", fontSize: "0.88rem", margin: 0, fontWeight: 700, textShadow: "0 0 12px rgba(34, 197, 94, 0.5)" }}>
              {successMsg}
            </p>
          )}
        </div>

        {/* Big Direct 1-Tap Entry Button (Guaranteed instant access) */}
        <button
          type="button"
          onClick={() => handleUnlockNow("2006")}
          style={{
            width: "100%",
            padding: "13px 18px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #d4af37 0%, #ffd700 45%, #b38728 100%)",
            color: "#18040d",
            fontSize: "0.98rem",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(212, 175, 55, 0.5), 0 0 12px rgba(255, 215, 0, 0.4)",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "transform 0.15s, box-shadow 0.15s",
            touchAction: "manipulation",
          }}
        >
          <span>👑 Enter Gala Directly (Open Site) ✨</span>
        </button>

        {/* Touch-Safe On-Screen Numpad */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "9px",
            maxWidth: "270px",
            margin: "0 auto 16px",
          }}
        >
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"].map((btn) => {
            const isSpecial = btn === "⌫" || btn === "C";
            return (
              <button
                key={btn}
                type="button"
                onClick={() => handleNumpadPress(btn)}
                className="numpad-key"
                style={{
                  height: "48px",
                  borderRadius: "14px",
                  background: isSpecial ? "rgba(180, 40, 60, 0.22)" : "rgba(255, 255, 255, 0.08)",
                  border: isSpecial ? "1.2px solid rgba(239, 68, 68, 0.4)" : "1.2px solid rgba(212, 175, 55, 0.35)",
                  color: isSpecial ? "#fca5a5" : "#fce8b2",
                  fontSize: btn === "⌫" ? "1.25rem" : "1.28rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.1s ease, background 0.15s ease",
                  touchAction: "manipulation",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  outline: "none",
                }}
              >
                {btn}
              </button>
            );
          })}
        </div>

        {/* 1-Tap Quick Unlock Badges */}
        <div
          style={{
            borderTop: "1px solid rgba(212, 175, 55, 0.2)",
            paddingTop: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "0.74rem", color: "rgba(212, 175, 55, 0.8)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
            Instant 1-Tap Access
          </span>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              type="button"
              onClick={() => handleUnlockNow("2006")}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(122, 21, 38, 0.35) 100%)",
                border: "1.5px solid rgba(212, 175, 55, 0.6)",
                color: "#ffd166",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              👑 Divija (2006)
            </button>
            <button
              type="button"
              onClick={() => handleUnlockNow("2003")}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1.2px solid rgba(212, 175, 55, 0.35)",
                color: "#fce8b2",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              ✨ Guest (2003)
            </button>
          </div>
          <div style={{ fontSize: "0.72rem", color: "rgba(243, 237, 225, 0.55)", marginTop: "2px" }}>
            (Tap above to enter instantly, or type code 2006 / 2003 / 1109)
          </div>
        </div>
      </div>

      <style>{`
        @keyframes passcodeShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-9px); }
          40%, 80% { transform: translateX(9px); }
        }
        .passcode-shake {
          animation: passcodeShake 0.4s ease-in-out;
        }
        .passcode-blink {
          animation: caretBlink 1s infinite;
          color: #ffd166;
          font-weight: 300;
        }
        @keyframes caretBlink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .numpad-key:active {
          transform: scale(0.92) !important;
          background: rgba(212, 175, 55, 0.35) !important;
          border-color: #ffd166 !important;
        }
      `}</style>
    </div>
  );
}
