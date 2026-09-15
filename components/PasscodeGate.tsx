"use client";
import React, { useState, useEffect } from "react";

interface PasscodeGateProps {
  onUnlock: (auth: { isAdmin: boolean; code: string }) => void;
}

const VALID_CODES = ["2006", "2003", "1109", "0911"];

export default function PasscodeGate({ onUnlock }: PasscodeGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [showDigits, setShowDigits] = useState(true);

  function unlock(pass: string) {
    try {
      localStorage.setItem("divija_passcode_auth", "unlocked");
      localStorage.setItem("divija_auth_role", pass === "2006" ? "admin" : "guest");
    } catch {}
    onUnlock({ isAdmin: pass === "2006", code: pass });
  }

  function pressKey(val: string) {
    setError("");
    if (val === "DEL") {
      setCode((c) => c.slice(0, -1));
      return;
    }
    if (val === "CLR") {
      setCode("");
      return;
    }
    if (code.length >= 4) return;
    const next = code + val;
    setCode(next);
    if (next.length === 4) {
      if (VALID_CODES.includes(next)) {
        setTimeout(() => unlock(next), 150);
      } else {
        setShake(true);
        setError("Incorrect passcode. Please try again.");
        setTimeout(() => {
          setShake(false);
          setCode("");
        }, 750);
      }
    }
  }

  // Physical keyboard support for desktop & laptop users
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        pressKey(e.key);
      } else if (e.key === "Backspace") {
        pressKey("DEL");
      } else if (e.key === "Escape") {
        pressKey("CLR");
      } else if (e.key === "Enter") {
        if (code.length === 4) {
          if (VALID_CODES.includes(code)) {
            unlock(code);
          } else {
            setShake(true);
            setError("Incorrect passcode. Please try again.");
            setTimeout(() => {
              setShake(false);
              setCode("");
            }, 750);
          }
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code]);

  const digits = [0, 1, 2, 3].map((i) => code[i] ?? "");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999999,
        background: "radial-gradient(ellipse 80% 70% at 50% 40%, #1a0410 0%, #0c0208 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        touchAction: "manipulation",
      }}
    >
      <div
        className={shake ? "passcode-shake" : ""}
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "linear-gradient(145deg, #2a0a18 0%, #120408 100%)",
          border: "2px solid rgba(212,175,55,0.6)",
          borderRadius: "24px",
          padding: "32px 24px 28px",
          textAlign: "center",
          position: "relative",
          boxShadow: "0 25px 80px rgba(0, 0, 0, 0.95), 0 0 45px rgba(212, 175, 55, 0.2)",
        }}
      >
        {/* Crown Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(122, 21, 38, 0.4))",
            border: "1.5px solid #f6d896",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
            margin: "0 auto 14px",
            boxShadow: "0 0 24px rgba(212, 175, 55, 0.35)",
          }}
        >
          👑
        </div>

        {/* Title */}
        <h2
          style={{
            color: "#f6d896",
            fontSize: "1.5rem",
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            margin: "0 0 6px",
            letterSpacing: "0.02em",
          }}
        >
          The Royal Premiere 🎬
        </h2>
        <p
          style={{
            color: "rgba(243,237,225,0.8)",
            fontSize: "0.85rem",
            margin: "0 0 20px",
            lineHeight: 1.4,
          }}
        >
          Divija’s 23rd Birthday Gala<br />
          <span style={{ color: "rgba(212,175,55,0.9)", fontSize: "0.78rem" }}>
            🔒 Private Invitation · Enter 4-Digit Passcode
          </span>
        </p>

        {/* 4 Digit Display Boxes */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginBottom: "10px",
          }}
        >
          {digits.map((d, i) => {
            const isCurrent = code.length === i;
            return (
              <div
                key={i}
                style={{
                  width: 54,
                  height: 60,
                  borderRadius: "14px",
                  background: d ? "rgba(140,20,45,0.5)" : "rgba(255,255,255,0.05)",
                  border: isCurrent
                    ? "2px solid #ffd166"
                    : d
                    ? "1.8px solid #f6d896"
                    : "1.5px solid rgba(212,175,55,0.3)",
                  color: "#fff",
                  fontSize: showDigits ? "1.6rem" : "1.8rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: isCurrent
                    ? "0 0 16px rgba(255, 209, 102, 0.45)"
                    : d
                    ? "0 0 12px rgba(212, 175, 55, 0.3)"
                    : "none",
                  transition: "all 0.18s ease",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              >
                {d ? (showDigits ? d : "●") : isCurrent ? "|" : ""}
              </div>
            );
          })}
        </div>

        {/* Show/Hide digits toggle */}
        <div style={{ marginBottom: "12px" }}>
          <button
            type="button"
            onClick={() => setShowDigits((s) => !s)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(212, 175, 55, 0.75)",
              fontSize: "0.74rem",
              cursor: "pointer",
              padding: "2px 8px",
            }}
          >
            {showDigits ? "👁️ Hide numbers" : "👁️ Show numbers"}
          </button>
        </div>

        {/* Error message slot */}
        <div style={{ minHeight: "22px", marginBottom: "14px" }}>
          {error && (
            <p style={{ color: "#fca5a5", fontSize: "0.82rem", margin: 0, fontWeight: 600 }}>
              {error}
            </p>
          )}
        </div>

        {/* 3x4 On-Screen Numpad */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
            maxWidth: "270px",
            margin: "0 auto",
          }}
        >
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "DEL"].map((btn) => {
            const isSpecial = btn === "DEL" || btn === "CLR";
            return (
              <button
                key={btn}
                type="button"
                onClick={() => pressKey(btn)}
                style={{
                  height: "52px",
                  borderRadius: "14px",
                  fontSize: isSpecial ? "0.92rem" : "1.32rem",
                  fontWeight: 700,
                  background: isSpecial ? "rgba(180,40,60,0.22)" : "rgba(255,255,255,0.08)",
                  border: isSpecial
                    ? "1.2px solid rgba(239,68,68,0.4)"
                    : "1.2px solid rgba(212,175,55,0.35)",
                  color: isSpecial ? "#fca5a5" : "#fce8b2",
                  cursor: "pointer",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.1s ease, background 0.15s ease",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              >
                {btn === "DEL" ? "⌫ DEL" : btn}
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes passcodeShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .passcode-shake { animation: passcodeShake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}
