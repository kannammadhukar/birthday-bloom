"use client";
import React, { useState } from "react";

interface PasscodeGateProps {
  onUnlock: (auth: { isAdmin: boolean; code: string }) => void;
}

const VALID_CODES = ["2006", "2003", "1109", "0911"];

export default function PasscodeGate({ onUnlock }: PasscodeGateProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

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
        setTimeout(() => unlock(next), 120);
      } else {
        setShake(true);
        setError("Wrong code! Tap the gold button below to enter directly.");
        setTimeout(() => { setShake(false); setCode(""); }, 800);
      }
    }
  }

  const digits = [0, 1, 2, 3].map((i) => code[i] ?? "");

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999999,
      background: "radial-gradient(ellipse 80% 70% at 50% 40%, #1a0410 0%, #0c0208 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "16px", touchAction: "manipulation",
    }}>
      <div
        className={shake ? "passcode-shake" : ""}
        style={{
          width: "100%", maxWidth: "360px",
          background: "linear-gradient(145deg, #2a0a18 0%, #120408 100%)",
          border: "2px solid rgba(212,175,55,0.6)", borderRadius: "24px",
          padding: "28px 20px", textAlign: "center", position: "relative",
        }}
      >
        {/* Skip button top-right */}
        <button
          type="button"
          onClick={() => unlock("2006")}
          style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(212,175,55,0.2)", border: "1px solid rgba(212,175,55,0.6)",
            borderRadius: "12px", padding: "4px 12px", color: "#ffd700",
            fontSize: "0.76rem", fontWeight: 700, cursor: "pointer",
          }}
        >Skip ➔</button>

        {/* Crown */}
        <div style={{ fontSize: "2.2rem", marginBottom: "8px" }}>👑</div>

        {/* Title */}
        <h2 style={{ color: "#f6d896", fontSize: "1.5rem", fontFamily: "Georgia, serif", margin: "0 0 4px" }}>
          The Royal Premiere 🎬
        </h2>
        <p style={{ color: "rgba(243,237,225,0.75)", fontSize: "0.85rem", margin: "0 0 20px" }}>
          Divija's 23rd Birthday Gala<br />
          <span style={{ color: "rgba(212,175,55,0.85)", fontSize: "0.78rem" }}>Enter your 4-digit passcode</span>
        </p>

        {/* Big direct entry button */}
        <button
          type="button"
          onClick={() => unlock("2006")}
          style={{
            width: "100%", padding: "13px", borderRadius: "14px",
            background: "linear-gradient(135deg, #d4af37, #ffd700, #b38728)",
            color: "#18040d", fontSize: "1rem", fontWeight: 800,
            border: "none", cursor: "pointer", marginBottom: "20px",
            boxShadow: "0 6px 20px rgba(212,175,55,0.5)",
            touchAction: "manipulation",
          }}
        >
          👑 Enter Gala Directly ✨
        </button>

        {/* 4 digit boxes */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "16px" }}>
          {digits.map((d, i) => (
            <div key={i} style={{
              width: 54, height: 60, borderRadius: "12px",
              background: d ? "rgba(140,20,45,0.5)" : "rgba(255,255,255,0.06)",
              border: code.length === i ? "2px solid #ffd166" : d ? "1.5px solid #f6d896" : "1.5px solid rgba(212,175,55,0.3)",
              color: "#fff", fontSize: "1.6rem", fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {d || (code.length === i ? "|" : "")}
            </div>
          ))}
        </div>

        {/* Error message */}
        <div style={{ minHeight: "24px", marginBottom: "12px" }}>
          {error && <p style={{ color: "#fca5a5", fontSize: "0.82rem", margin: 0 }}>{error}</p>}
        </div>

        {/* Numpad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", maxWidth: "260px", margin: "0 auto 16px" }}>
          {["1","2","3","4","5","6","7","8","9","CLR","0","DEL"].map((btn) => (
            <button
              key={btn}
              type="button"
              onClick={() => pressKey(btn)}
              style={{
                height: "52px", borderRadius: "12px", fontSize: "1.3rem", fontWeight: 700,
                background: (btn === "DEL" || btn === "CLR") ? "rgba(180,40,60,0.25)" : "rgba(255,255,255,0.09)",
                border: (btn === "DEL" || btn === "CLR") ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(212,175,55,0.35)",
                color: (btn === "DEL" || btn === "CLR") ? "#fca5a5" : "#fce8b2",
                cursor: "pointer", touchAction: "manipulation",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {btn === "DEL" ? "⌫" : btn}
            </button>
          ))}
        </div>

        {/* Quick-tap guest entry */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button type="button" onClick={() => unlock("2003")}
            style={{
              flex: 1, padding: "10px", borderRadius: "12px",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(212,175,55,0.35)",
              color: "#fce8b2", fontSize: "0.82rem", fontWeight: 600,
              cursor: "pointer", touchAction: "manipulation",
            }}
          >✨ Guest (2003)</button>
          <button type="button" onClick={() => unlock("1109")}
            style={{
              flex: 1, padding: "10px", borderRadius: "12px",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(212,175,55,0.35)",
              color: "#fce8b2", fontSize: "0.82rem", fontWeight: 600,
              cursor: "pointer", touchAction: "manipulation",
            }}
          >🌸 Guest (1109)</button>
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
