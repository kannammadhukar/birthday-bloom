"use client";
import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import BirthdayGiftAnimation from "./BirthdayGiftAnimation";

interface Props {
  onDone: (audioTime?: number) => void;
}

export default function ShinchanIntro({ onDone }: Props) {
  const [screen, setScreen] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [boxPopped, setBoxPopped] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 600);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Per-screen dialogue indices
  const [idx1, setIdx1] = useState(0);
  const [idx2, setIdx2] = useState(0);
  const [idx3, setIdx3] = useState(0);
  const [idx4, setIdx4] = useState(0);
  const [idx5, setIdx5] = useState(0);

  // Bounce animation triggers on tap
  const [isPoked, setIsPoked] = useState(false);

  // Audio References for Real Approved Tracks
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const dlgAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCacheRef = useRef<{ [url: string]: HTMLAudioElement }>({});
  const audioPlayingRef = useRef<boolean>(true);
  audioPlayingRef.current = audioPlaying;

  // ── Authentic Telugu Mannerism Dialogues (Clean Text Captions) ──
  const quipsScreen1 = [
    "Divija akka! Memu mee kosam oka bumper surprise chesam! 😉✨",
    "Arey Divija akka, ala gelikithe siggochesthondi! 🙈",
    "Nannu chusi jealous ga undha? Naa dance steps super kadha! 💃",
    "Chocobi biscuit lu isthe inka baaga dance vestha! 🍪",
    "Twaraga YES kottu akka, surprise wait chesthondi! ✨"
  ];

  const quipsScreen2 = [
    "Emantivi emantivi!? Maaku NO antava!? Enthakani dhairyam meeku Divija akka!? 😤💢",
    "Action Kamen ki cheppi neeku pedda punishment istha choodu! 🦸‍♂️💥",
    "Chocobi biscuits anni nene tinestha, neeku okkati kooda ivvanu po! 🍪😤",
    "Malli TRY AGAIN kottu akka, ledhante nenu inka gattiga edustha! 😭",
    "Asalu ikkada NO ane option ye ledhu akka! Naa maata vinava!? 😤"
  ];

  const quipsScreen3 = [
    "Nijamga excited ga unnara? Ammo... naku abbo entha siggochesthondo! Hehehe! 🙈💛",
    "Ammo! Nalo unna siggu motham chusesthunnara! Hehehe! 🙈",
    "Nijamga promise cheyyi akka, nannu chusi navvavu kadha? 🙈",
    "Divija akka pogidithe naku kalla ninda aanandabashpaalu vasthunnayi! 🥺",
    "Both buttons YES ye akka! Nuvvu eppatiki escape avvalevu! 😜"
  ];

  const quipsScreen4 = [
    "Idhigo akka mana special birthday gift box! Tap cheyyi, magic chudu! 🎁✨",
    "Idhe akka mana super-duper surprise box! Nenu daachi pettanu, tap cheyyi! 🎁",
    "Box lopala emundho telsa? 23 years of pure sweetness! 🍯",
    "Nenu daachi pettanu akka, twaraga tap cheyyi, naku aagatledu! 🤩",
    "Okkasari touch cheyyi akka, bomb explosion kadhu, super surprise!"
  ];

  const quipsScreen5 = [
    "Tadaaa! Divija akka 23rd Birthday! 👑🎉 Ippudu asalu celebration modhalu!",
    "Happy 23rd Birthday Divija Akka! 23 looks gorgeous on you! 💖",
    "Enter Gala button kottu akka! Lopala 3D cake, Jugraafiya video and memories ready ga unnayi! 🎂👑"
  ];

  // ── Original Authentic Shinchan Screen BGM Tracks ──
  const SCREEN_BGMS: { [s: number]: string } = {
    1: "/audio/shinchan_approved/bgm_sc1_naughty.mp3",          // Screen 1: Naughty / Mischief Dancing BGM
    2: "/audio/shinchan_approved/bgm_sc2_crying_melodrama.mp3",  // Screen 2: Melodrama Crying BGM
    3: "/audio/shinchan_approved/bgm_sc3_romantic_waltz.mp3",   // Screen 3: Romantic Comedy Waltz BGM
    4: "/audio/shinchan_approved/bgm_sc4_curious_box.mp3",      // Screen 4: Curious Surprise Box Ticking BGM
    5: "/audio/samajavaragamana.mp3"                           // Screen 5: Samajavaragamana from 23s!
  };

  const DLG_SCREEN3_LAUGH = "/audio/shinchan_approved/dlg_sc3_blush_laugh.mp3"; // Shy Blushing Giggle ("Hehehehe!")

  // Preload all approved audio tracks
  useEffect(() => {
    const urls = Object.values(SCREEN_BGMS).concat([DLG_SCREEN3_LAUGH]);
    urls.forEach((u) => {
      if (!audioCacheRef.current[u]) {
        const a = new Audio(u);
        a.preload = "auto";
        audioCacheRef.current[u] = a;
      }
    });
  }, []);

  // Lock document scroll to (0,0) when Shinchan intro is active
  useEffect(() => {
    window.scrollTo(0, 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Stop and completely kill any Shinchan dialogue or giggle audio
  function stopDialogueAudio() {
    if (dlgAudioRef.current) {
      try {
        dlgAudioRef.current.pause();
        dlgAudioRef.current.currentTime = 0;
        dlgAudioRef.current.onended = null;
      } catch {}
      dlgAudioRef.current = null;
    }
    const cachedLaugh = audioCacheRef.current[DLG_SCREEN3_LAUGH];
    if (cachedLaugh) {
      try {
        cachedLaugh.pause();
        cachedLaugh.currentTime = 0;
        cachedLaugh.onended = null;
      } catch {}
    }
  }

  // Play screen-specific BGM
  function playScreenBgm(screenNum: number) {
    // When leaving Screen 3 or entering Screen 4/5, kill any laugh audio immediately!
    if (screenNum !== 3) {
      stopDialogueAudio();
    }

    const trackUrl = SCREEN_BGMS[screenNum];
    if (!trackUrl) return;

    // Stop current BGM
    if (bgmAudioRef.current) {
      try {
        bgmAudioRef.current.pause();
        bgmAudioRef.current.currentTime = 0;
      } catch {}
    }

    if (!audioPlayingRef.current) return;

    let a = audioCacheRef.current[trackUrl];
    if (!a) {
      a = new Audio(trackUrl);
      audioCacheRef.current[trackUrl] = a;
    }
    bgmAudioRef.current = a;
    a.loop = true;
    a.volume = screenNum === 5 ? 0.9 : 0.85;
    if (screenNum === 5) {
      a.currentTime = 0.0;
    }
    a.play().catch(() => {});
  }

  // Play Screen 3 Shy Blushing Giggle
  function playScreen3Giggle() {
    if (!audioPlayingRef.current) return;
    // Strictly guard: giggle is ONLY allowed on Screen 3!
    if (screenRef.current !== 3) return;

    // Duck BGM volume slightly while giggle is playing
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = 0.3;
    }

    let a = audioCacheRef.current[DLG_SCREEN3_LAUGH];
    if (!a) {
      a = new Audio(DLG_SCREEN3_LAUGH);
      audioCacheRef.current[DLG_SCREEN3_LAUGH] = a;
    }
    dlgAudioRef.current = a;
    try {
      a.pause();
      a.currentTime = 0;
    } catch {}
    a.volume = 1.0;
    a.play().catch(() => {});
    a.onended = () => {
      // Only restore BGM volume if still on Screen 3
      if (screenRef.current === 3 && bgmAudioRef.current) {
        bgmAudioRef.current.volume = 0.85;
      }
    };
  }

  // Switch BGM whenever screen changes
  useEffect(() => {
    if (screen !== 3) {
      stopDialogueAudio();
    }
    playScreenBgm(screen);
  }, [screen]);

  // Toggle Music On / Off
  function toggleMusic() {
    if (audioPlaying) {
      setAudioPlaying(false);
      stopDialogueAudio();
      if (bgmAudioRef.current) {
        try {
          bgmAudioRef.current.pause();
        } catch {}
      }
      if (dlgAudioRef.current) {
        try {
          dlgAudioRef.current.pause();
        } catch {}
      }
    } else {
      setAudioPlaying(true);
      playScreenBgm(screen);
    }
  }

  // Start BGM on first user click or touch anywhere
  useEffect(() => {
    const handleFirstGesture = () => {
      try {
        playScreenBgm(screen);
      } catch {}
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
    };
    window.addEventListener("click", handleFirstGesture, { once: true });
    window.addEventListener("touchstart", handleFirstGesture, { once: true });
    return () => {
      window.removeEventListener("click", handleFirstGesture);
      window.removeEventListener("touchstart", handleFirstGesture);
      if (bgmAudioRef.current) {
        try {
          bgmAudioRef.current.pause();
        } catch {}
      }
    };
  }, []);

  const screenRef = useRef<number>(1);
  screenRef.current = screen;

  // ── Universal Poke Handler ──
  function handlePoke(screenNum: number) {
    setIsPoked(true);
    setTimeout(() => setIsPoked(false), 240);

    if (screenNum === 1) {
      setIdx1((prev) => (prev + 1) % quipsScreen1.length);
    } else if (screenNum === 2) {
      setIdx2((prev) => (prev + 1) % quipsScreen2.length);
    } else if (screenNum === 3) {
      // Screen 3: Play approved shy blushing giggle "Hehehehe!"
      playScreen3Giggle();
      setIdx3((prev) => (prev + 1) % quipsScreen3.length);
    } else if (screenNum === 4) {
      setIdx4((prev) => (prev + 1) % quipsScreen4.length);
    } else if (screenNum === 5) {
      setIdx5((prev) => (prev + 1) % quipsScreen5.length);
    }
  }

  // ── Navigation Transitions ──
  function handleNo() {
    setScreen(2);
    setIdx2(0);
  }

  function handleTryAgain() {
    setScreen(1);
    setIdx1(0);
  }

  function handleYes() {
    setScreen(3);
    setIdx3(0);
  }

  function handleNext() {
    stopDialogueAudio();
    setScreen(4);
    setIdx4(0);
  }

  function handleOpenGrandBox() {
    if (boxPopped) return;
    setBoxPopped(true);
    stopDialogueAudio(); // Instantly kill any residual Shinchan laugh when opening gift!

    // Stop "Chilipi Baalude"
    if (bgmAudioRef.current) {
      try {
        bgmAudioRef.current.pause();
      } catch {}
    }

    // Immediately trigger Samajavaragamana starting from 23 seconds right as gift box opens!
    if (audioPlayingRef.current) {
      let a = audioCacheRef.current[SCREEN_BGMS[5]];
      if (!a) {
        a = new Audio(SCREEN_BGMS[5]);
        audioCacheRef.current[SCREEN_BGMS[5]] = a;
      }
      bgmAudioRef.current = a;
      a.loop = true;
      a.volume = 0.9;
      a.currentTime = 0.0;
      a.play().catch(() => {});
    }

    try {
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.55 },
        colors: ["#d62839", "#ffd166", "#06d6a0", "#118ab2", "#ff9f1c", "#f72585"]
      });
    } catch {}

    setTimeout(() => {
      setScreen(5);
      setIdx5(0);
      try {
        confetti({
          particleCount: 140,
          spread: 110,
          origin: { y: 0.5 },
          colors: ["#ffd700", "#ff69b4", "#00f0ff", "#ff3366"]
        });
      } catch {}
    }, 700);
  }

  function handleEnterCelebration() {
    stopDialogueAudio();
    const activeAudioTime = bgmAudioRef.current?.currentTime || 0.0;
    if (bgmAudioRef.current) {
      try {
        bgmAudioRef.current.pause();
      } catch {}
    }
    setExiting(true);
    setTimeout(() => {
      onDone(activeAudioTime);
    }, 500);
  }

  // Active theme title for indicator pill
  const musicMoodTitle =
    screen === 1 ? "Naughty Dance" :
    screen === 2 ? "Melodrama Crying" :
    screen === 3 ? "Romantic Waltz" :
    screen === 4 ? "Curious Mystery" : "Samajavaragamana (23s Vocals)";

  // ── Screen 5: Viral Birthday Gift Animation with Divija's Royal Grace Photo ──
  if (screen === 5) {
    return (
      <BirthdayGiftAnimation
        onContinueToGala={handleEnterCelebration}
        audioPlaying={audioPlaying}
        onToggleMusic={toggleMusic}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100dvh",
        minHeight: "-webkit-fill-available",
        zIndex: 99999,
        background: "radial-gradient(circle at 50% 30%, #3d0d24 0%, #1f0414 55%, #0a0107 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(8px, 1.5vh, 20px) clamp(10px, 2.5vw, 24px)",
        fontFamily: "'Fredoka', 'Mali', sans-serif",
        userSelect: "none",
        overflow: "hidden",
        opacity: exiting ? 0 : 1,
        transition: "opacity 0.6s ease"
      }}
    >
      {/* Ambient Floating Golden Stars in Background */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${(i * 17) % 96}%`,
              left: `${(i * 23) % 94}%`,
              width: `${(i % 3) * 2 + 3}px`,
              height: `${(i % 3) * 2 + 3}px`,
              borderRadius: "50%",
              backgroundColor: i % 2 === 0 ? "#ffd166" : "#ffffff",
              boxShadow: "0 0 10px rgba(255, 209, 102, 0.8)",
              opacity: 0.35 + (i % 5) * 0.12
            }}
          />
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          GRAND ROYAL PAVILION CARD (RESPONSIVE FOR LAPTOPS & PHONES)
          ══════════════════════════════════════════════════════════════ */}
      <div
        className="pavilion-card"
        style={{
          width: "min(960px, 94vw)",
          maxHeight: "92vh",
          minHeight: "min(580px, 86vh)",
          backgroundColor: "rgba(26, 8, 14, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          position: "relative",
          overflowY: "auto",
          overflowX: "hidden",
          border: "1px solid rgba(230, 202, 133, 0.42)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.75), 0 0 25px rgba(230, 202, 133, 0.22)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "auto",
          padding: "clamp(16px, 2.8vh, 28px) clamp(16px, 4vw, 36px)",
          boxSizing: "border-box"
        }}
      >
        {/* Subtle Decorative Golden Border Accent Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(230, 202, 133, 0.4), rgba(230, 202, 133, 0.85), rgba(230, 202, 133, 0.4), transparent)"
          }}
        />

        {/* Top Control Bar: Royal Badge + Audio & Skip Controls */}
        <div
          className="pavilion-topbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "clamp(6px, 1.4vh, 14px)",
            position: "relative",
            zIndex: 20,
            flexShrink: 0,
            flexWrap: "wrap",
            gap: "6px",
          }}
        >
          {/* Royal Pill Badge */}
          <div
            className="pavilion-badge"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 12px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, rgba(68, 13, 33, 0.7) 0%, rgba(28, 5, 14, 0.8) 100%)",
              border: "1px solid rgba(212, 175, 55, 0.5)",
              color: "#fce8b2",
              fontSize: "clamp(0.68rem, 1.1vw, 0.78rem)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            <span>👑</span>
            <span>Divija&apos;s Birthday</span>
            <span>✨</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            {/* Music Control Pill Button */}
            <button
              type="button"
              onClick={toggleMusic}
              className="pavilion-music-btn"
              style={{
                background: "#1e050c",
                border: "1px solid rgba(230, 202, 133, 0.4)",
                borderRadius: "24px",
                padding: "5px 11px",
                fontSize: "clamp(0.70rem, 1.1vw, 0.80rem)",
                fontWeight: 600,
                color: "#e6ca85",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span>{audioPlaying ? "🎵" : "🔇"}</span>
              <span>{audioPlaying ? (isMobile ? "Music" : `Music: ${musicMoodTitle}`) : "Muted"}</span>
            </button>

            {/* Skip to Gala Button */}
            <button
              type="button"
              onClick={handleEnterCelebration}
              className="pavilion-skip-btn"
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(120, 18, 40, 0.35) 100%)",
                border: "1.5px solid rgba(255, 215, 0, 0.55)",
                borderRadius: "24px",
                padding: "5px 10px",
                fontSize: "clamp(0.68rem, 1.0vw, 0.76rem)",
                fontWeight: 800,
                color: "#ffd700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              title="Skip directly to the celebration gala"
            >
              <span>{isMobile ? "Skip ➔" : "Skip to Gala ➔"}</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SCREEN 1: WELCOME & ARE YOU EXCITED? (Dancing Shin Chan GIF)
            ══════════════════════════════════════════════════════════════ */}
        {screen === 1 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "center",
              gap: "8px",
              width: "100%"
            }}
          >
            {/* Header Text */}
            <div className="screen-header" style={{ marginTop: "4px" }}>
              <p
                className="screen-subtitle"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.0rem, 2.2vw, 1.35rem)",
                  color: "#e6ca85",
                  fontWeight: 700,
                  letterSpacing: "0.5px"
                }}
              >
                ✨ We have made ✨
              </p>
              <h1
                className="screen-title"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.7rem, 4.2vw, 2.6rem)",
                  fontWeight: 900,
                  color: "#e6ca85",
                  textShadow: "0 2px 12px rgba(230, 202, 133, 0.25)",
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  margin: "2px 0 4px"
                }}
              >
                Something For You!
              </h1>
              <p
                className="screen-prompt"
                style={{
                  fontSize: "clamp(1.1rem, 2.4vw, 1.45rem)",
                  fontWeight: 600,
                  color: "#fdf6e2"
                }}
              >
                Are you excited?
              </p>
            </div>

            {/* Interactive Dancing Shin Chan GIF + Speech Bubble */}
            <div
              className="shinchan-container"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                margin: "4px 0"
              }}
              onClick={() => handlePoke(1)}
              onTouchEnd={() => handlePoke(1)}
            >
              {/* Speech Bubble */}
              <div
                className="speech-bubble"
                style={{
                  background: "rgba(40, 10, 20, 0.7)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  border: "1px solid rgba(230, 202, 133, 0.35)",
                  borderRadius: "20px",
                  padding: "10px 18px",
                  maxWidth: "min(520px, 90vw)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 10px rgba(230, 202, 133, 0.15)",
                  marginBottom: "8px",
                  position: "relative"
                }}
              >
                <p
                  className="speech-text"
                  style={{
                    fontSize: "clamp(0.92rem, 1.9vw, 1.12rem)",
                    fontWeight: 600,
                    color: "#fdf6e2",
                    lineHeight: 1.35
                  }}
                >
                  {quipsScreen1[idx1]}
                </p>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid rgba(230, 202, 133, 0.45)"
                  }}
                />
              </div>

              {/* Looping Dancing Shin Chan GIF */}
              <div
                style={{
                  position: "relative",
                  transform: isPoked ? "scale(1.14) rotate(7deg)" : "scale(1)",
                  transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                <img
                  className="shinchan-img"
                  src="/images/shinchan_dance.gif"
                  alt="Shin Chan Dancing"
                  style={{
                    width: "clamp(150px, 24vh, 210px)",
                    height: "clamp(150px, 24vh, 210px)",
                    objectFit: "contain",
                    filter: "drop-shadow(0 10px 24px rgba(230, 202, 133, 0.2))"
                  }}
                />
                <div
                  className="shinchan-tap-badge"
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #3d0d1e, #20050e)",
                    border: "1px solid rgba(230, 202, 133, 0.35)",
                    color: "#e6ca85",
                    fontSize: "clamp(0.65rem, 1.1vw, 0.75rem)",
                    fontWeight: 700,
                    padding: "3px 12px",
                    borderRadius: "14px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.4)"
                  }}
                >
                  👆 TAP SHIN CHAN
                </div>
              </div>
            </div>

            {/* SIDE-BY-SIDE CANVA PILL BUTTONS [ YES ] and [ NO ] */}
            <div
              className="action-btn-group"
              style={{
                width: "100%",
                maxWidth: "480px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(10px, 2vw, 18px)",
                marginTop: "6px",
                marginBottom: "4px"
              }}
            >
              <button
                type="button"
                className="action-btn"
                onClick={handleYes}
                style={{
                  flex: 1,
                  padding: "clamp(11px, 2vh, 15px) clamp(16px, 3vw, 28px)",
                  borderRadius: "32px",
                  background: "linear-gradient(135deg, #f5e1a4 0%, #b8860b 100%)",
                  border: "1px solid rgba(255, 235, 170, 0.5)",
                  color: "#1a0509",
                  fontSize: "clamp(1.05rem, 2.2vw, 1.3rem)",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(218, 165, 32, 0.35)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                YES
              </button>

              <button
                type="button"
                className="action-btn"
                onClick={handleNo}
                style={{
                  flex: 1,
                  padding: "clamp(11px, 2vh, 15px) clamp(16px, 3vw, 28px)",
                  borderRadius: "32px",
                  background: "linear-gradient(180deg, #4a101d 0%, #25050c 100%)",
                  border: "1px solid rgba(230, 202, 133, 0.35)",
                  color: "#e6ca85",
                  fontSize: "clamp(1.05rem, 2.2vw, 1.3rem)",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                NO
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SCREEN 2: TANTRUM ON "NO" (Crying Shin Chan GIF + Melodrama BGM)
            ══════════════════════════════════════════════════════════════ */}
        {screen === 2 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "center",
              gap: "8px",
              width: "100%"
            }}
          >
            {/* Header */}
            <div className="screen-header" style={{ marginTop: "4px" }}>
              <p
                className="screen-subtitle"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.0rem, 2.2vw, 1.3rem)",
                  color: "#e6ca85",
                  fontWeight: 700
                }}
              >
                💔 How dare you say NO?!
              </p>
              <h1
                className="screen-title"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.65rem, 4.0vw, 2.5rem)",
                  fontWeight: 900,
                  color: "#e6ca85",
                  textShadow: "0 2px 12px rgba(230, 202, 133, 0.25)",
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                  margin: "2px 0 4px"
                }}
              >
                Look What You Did!
              </h1>
              <p
                className="screen-prompt"
                style={{
                  fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)",
                  fontWeight: 600,
                  color: "#fdf6e2"
                }}
              >
                Shin Chan is crying now!
              </p>
            </div>

            {/* Interactive Crying Tantrum Shin Chan GIF */}
            <div
              className="shinchan-container"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                margin: "4px 0"
              }}
              onClick={() => handlePoke(2)}
              onTouchEnd={() => handlePoke(2)}
            >
              {/* Speech Bubble */}
              <div
                className="speech-bubble"
                style={{
                  background: "rgba(40, 10, 20, 0.7)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  border: "1px solid rgba(230, 202, 133, 0.35)",
                  borderRadius: "20px",
                  padding: "10px 18px",
                  maxWidth: "min(520px, 90vw)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 10px rgba(230, 202, 133, 0.15)",
                  marginBottom: "8px",
                  position: "relative"
                }}
              >
                <p
                  className="speech-text"
                  style={{
                    fontSize: "clamp(0.92rem, 1.9vw, 1.12rem)",
                    fontWeight: 600,
                    color: "#fdf6e2",
                    lineHeight: 1.35
                  }}
                >
                  {quipsScreen2[idx2]}
                </p>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid rgba(230, 202, 133, 0.45)"
                  }}
                />
              </div>

              {/* Looping Crying Tantrum GIF */}
              <div
                style={{
                  position: "relative",
                  transform: isPoked ? "scale(1.14) rotate(-7deg)" : "scale(1)",
                  transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                <img
                  className="shinchan-img"
                  src="/images/shinchan_tantrum.gif"
                  alt="Shin Chan Crying Tantrum"
                  style={{
                    width: "clamp(150px, 24vh, 210px)",
                    height: "clamp(150px, 24vh, 210px)",
                    objectFit: "contain",
                    filter: "drop-shadow(0 10px 24px rgba(230, 202, 133, 0.2))"
                  }}
                />
                <div
                  className="shinchan-tap-badge"
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #3d0d1e, #20050e)",
                    border: "1px solid rgba(230, 202, 133, 0.35)",
                    color: "#e6ca85",
                    fontSize: "clamp(0.65rem, 1.1vw, 0.75rem)",
                    fontWeight: 700,
                    padding: "3px 12px",
                    borderRadius: "14px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.4)"
                  }}
                >
                  😭 TAP CRYING SHIN CHAN
                </div>
              </div>
            </div>

            {/* Try Again Canva Pill Button */}
            <div
              className="action-btn-group"
              style={{
                width: "100%",
                maxWidth: "480px",
                display: "flex",
                justifyContent: "center",
                marginTop: "6px",
                marginBottom: "4px"
              }}
            >
              <button
                type="button"
                className="action-btn"
                onClick={handleTryAgain}
                style={{
                  width: "100%",
                  padding: "clamp(11px, 2vh, 15px) clamp(16px, 3vw, 28px)",
                  borderRadius: "32px",
                  background: "linear-gradient(180deg, #4a101d 0%, #25050c 100%)",
                  border: "1px solid rgba(230, 202, 133, 0.35)",
                  color: "#e6ca85",
                  fontSize: "clamp(1.05rem, 2.2vw, 1.3rem)",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                TRY AGAIN ↺
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SCREEN 3: BLUSHING ON "YES" (Shy Coy Shin Chan + Waltz BGM + Giggle)
            ══════════════════════════════════════════════════════════════ */}
        {screen === 3 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "center",
              gap: "8px",
              width: "100%"
            }}
          >
            {/* Header */}
            <div className="screen-header" style={{ marginTop: "4px" }}>
              <p
                className="screen-subtitle"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.0rem, 2.2vw, 1.3rem)",
                  color: "#e6ca85",
                  fontWeight: 700
                }}
              >
                🌸 Awww yay! 🌸
              </p>
              <h1
                className="screen-title"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.65rem, 4.0vw, 2.5rem)",
                  fontWeight: 900,
                  color: "#e6ca85",
                  textShadow: "0 2px 12px rgba(230, 202, 133, 0.25)",
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                  margin: "2px 0 4px"
                }}
              >
                Are You Really Excited?
              </h1>
              <p
                className="screen-prompt"
                style={{
                  fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)",
                  fontWeight: 600,
                  color: "#fdf6e2"
                }}
              >
                Shin Chan is blushing so hard!
              </p>
            </div>

            {/* Interactive Shy Blushing Shin Chan GIF */}
            <div
              className="shinchan-container"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                margin: "4px 0"
              }}
              onClick={() => handlePoke(3)}
              onTouchEnd={() => handlePoke(3)}
            >
              {/* Speech Bubble */}
              <div
                className="speech-bubble"
                style={{
                  background: "rgba(40, 10, 20, 0.7)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  border: "1px solid rgba(230, 202, 133, 0.35)",
                  borderRadius: "20px",
                  padding: "10px 18px",
                  maxWidth: "min(520px, 90vw)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 10px rgba(230, 202, 133, 0.15)",
                  marginBottom: "8px",
                  position: "relative"
                }}
              >
                <p
                  className="speech-text"
                  style={{
                    fontSize: "clamp(0.92rem, 1.9vw, 1.12rem)",
                    fontWeight: 600,
                    color: "#fdf6e2",
                    lineHeight: 1.35
                  }}
                >
                  {quipsScreen3[idx3]}
                </p>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid rgba(230, 202, 133, 0.45)"
                  }}
                />
              </div>

              {/* Looping Shy Blushing GIF */}
              <div
                style={{
                  position: "relative",
                  transform: isPoked ? "scale(1.14) rotate(7deg)" : "scale(1)",
                  transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                <img
                  className="shinchan-img"
                  src="/images/shinchan_shy.gif"
                  alt="Shin Chan Blushing Shy"
                  style={{
                    width: "clamp(150px, 24vh, 210px)",
                    height: "clamp(150px, 24vh, 210px)",
                    objectFit: "contain",
                    filter: "drop-shadow(0 10px 24px rgba(230, 202, 133, 0.2))"
                  }}
                />
                <div
                  className="shinchan-tap-badge"
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #3d0d1e, #20050e)",
                    border: "1px solid rgba(230, 202, 133, 0.35)",
                    color: "#e6ca85",
                    fontSize: "clamp(0.65rem, 1.1vw, 0.75rem)",
                    fontWeight: 700,
                    padding: "3px 12px",
                    borderRadius: "14px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.4)"
                  }}
                >
                  🙈 TAP FOR SHY GIGGLE
                </div>
              </div>
            </div>

            {/* SIDE-BY-SIDE BUTTONS (BOTH ARE YES!) */}
            <div
              className="action-btn-group"
              style={{
                width: "100%",
                maxWidth: "480px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(10px, 2vw, 18px)",
                marginTop: "6px",
                marginBottom: "4px"
              }}
            >
              <button
                type="button"
                className="action-btn"
                onClick={handleNext}
                style={{
                  flex: 1,
                  padding: "clamp(11px, 2vh, 15px) clamp(14px, 2.5vw, 24px)",
                  borderRadius: "32px",
                  background: "linear-gradient(135deg, #f5e1a4 0%, #b8860b 100%)",
                  border: "1px solid rgba(255, 235, 170, 0.5)",
                  color: "#1a0509",
                  fontSize: "clamp(0.98rem, 2.0vw, 1.25rem)",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(218, 165, 32, 0.35)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                YES!
              </button>

              <button
                type="button"
                className="action-btn"
                onClick={handleNext}
                style={{
                  flex: 1,
                  padding: "clamp(11px, 2vh, 15px) clamp(14px, 2.5vw, 24px)",
                  borderRadius: "32px",
                  background: "linear-gradient(135deg, #ffd782 0%, #d4af37 50%, #996515 100%)",
                  border: "1px solid rgba(255, 235, 170, 0.5)",
                  color: "#1a0509",
                  fontSize: "clamp(0.98rem, 2.0vw, 1.25rem)",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(218, 165, 32, 0.35)",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                OF COURSE YES!
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SCREEN 4: EXACTLY 1 GRAND GIFT BOX + Cheering Shin Chan GIF
            ══════════════════════════════════════════════════════════════ */}
        {screen === 4 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "center",
              gap: "6px",
              width: "100%"
            }}
          >
            {/* Header */}
            <div className="screen-header" style={{ marginTop: "4px" }}>
              <p
                className="screen-subtitle"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.0rem, 2.2vw, 1.3rem)",
                  color: "#e6ca85",
                  fontWeight: 700
                }}
              >
                🎁 Here is your special 🎁
              </p>
              <h1
                className="screen-title"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: "clamp(1.65rem, 4.0vw, 2.5rem)",
                  fontWeight: 900,
                  color: "#e6ca85",
                  textShadow: "0 2px 12px rgba(230, 202, 133, 0.25)",
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                  margin: "2px 0 4px"
                }}
              >
                Grand Birthday Gift!
              </h1>
              <p
                className="screen-prompt"
                style={{
                  fontSize: "clamp(1.05rem, 2.2vw, 1.35rem)",
                  fontWeight: 600,
                  color: "#fdf6e2"
                }}
              >
                Tap the Gift Box to unwrap!
              </p>
            </div>

            {/* Cheering Shin Chan GIF + Speech Bubble */}
            <div
              className="shinchan-container"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                margin: "2px 0"
              }}
              onClick={() => handlePoke(4)}
              onTouchEnd={() => handlePoke(4)}
            >
              {/* Speech Bubble */}
              <div
                className="speech-bubble"
                style={{
                  background: "rgba(40, 10, 20, 0.7)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  border: "1px solid rgba(230, 202, 133, 0.35)",
                  borderRadius: "18px",
                  padding: "8px 18px",
                  maxWidth: "min(520px, 90vw)",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4), 0 0 10px rgba(230, 202, 133, 0.15)",
                  marginBottom: "6px",
                  position: "relative"
                }}
              >
                <p
                  className="speech-text"
                  style={{
                    fontSize: "clamp(0.9rem, 1.8vw, 1.08rem)",
                    fontWeight: 600,
                    color: "#fdf6e2",
                    lineHeight: 1.35
                  }}
                >
                  {quipsScreen4[idx4]}
                </p>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 0,
                    height: 0,
                    borderLeft: "8px solid transparent",
                    borderRight: "8px solid transparent",
                    borderTop: "8px solid rgba(230, 202, 133, 0.45)"
                  }}
                />
              </div>

              {/* Looping Cheering Shin Chan GIF */}
              <div
                style={{
                  position: "relative",
                  transform: isPoked ? "scale(1.14) rotate(-7deg)" : "scale(1)",
                  transition: "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                <img
                  className="shinchan-img"
                  src="/images/shinchan_cheer.gif"
                  alt="Shin Chan Cheering"
                  style={{
                    width: "clamp(120px, 18vh, 160px)",
                    height: "clamp(120px, 18vh, 160px)",
                    objectFit: "contain",
                    filter: "drop-shadow(0 8px 20px rgba(230, 202, 133, 0.2))"
                  }}
                />
                <div
                  className="shinchan-tap-badge"
                  style={{
                    position: "absolute",
                    bottom: "-2px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #3d0d1e, #20050e)",
                    border: "1px solid rgba(230, 202, 133, 0.35)",
                    color: "#e6ca85",
                    fontSize: "clamp(0.62rem, 1.0vw, 0.72rem)",
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: "12px",
                    whiteSpace: "nowrap",
                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.4)"
                  }}
                >
                  ✨ TAP SHIN CHAN
                </div>
              </div>
            </div>

            {/* Exactly 1 Grand Gift Box (Golden Satin Ribbon & Shimmer Glow) */}
            <div
              className="grand-box-stage"
              onClick={handleOpenGrandBox}
              onTouchEnd={handleOpenGrandBox}
              style={{
                cursor: "pointer",
                position: "relative",
                margin: "4px 0 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: boxPopped ? "scale(1.2) rotate(6deg)" : "scale(1)",
                transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)"
              }}
            >
              <div
                className="grand-box-cube"
                style={{
                  width: "clamp(125px, 19vh, 160px)",
                  height: "clamp(125px, 19vh, 160px)",
                  background: "radial-gradient(circle at 35% 35%, #4a101d 0%, #2a0810 60%, #120206 100%)",
                  borderRadius: "28px",
                  position: "relative",
                  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(230, 202, 133, 0.3)",
                  border: "2.5px solid #e6ca85",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {/* Vertical Golden Ribbon */}
                <div
                  style={{
                    position: "absolute",
                    width: "28px",
                    height: "100%",
                    background: "linear-gradient(90deg, #f5e1a4 0%, #b8860b 50%, #996515 100%)",
                    boxShadow: "0 0 10px rgba(230, 202, 133, 0.4)"
                  }}
                />
                {/* Horizontal Golden Ribbon */}
                <div
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "28px",
                    background: "linear-gradient(180deg, #f5e1a4 0%, #b8860b 50%, #996515 100%)",
                    boxShadow: "0 0 10px rgba(230, 202, 133, 0.4)"
                  }}
                />
                {/* Center Bow */}
                <div
                  className="grand-box-bow"
                  style={{
                    position: "absolute",
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, #f5e1a4 0%, #d4af37 60%, #854d0e 100%)",
                    border: "2px solid #e6ca85",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
                    zIndex: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem"
                  }}
                >
                  🎀
                </div>
              </div>

              <div
                className="grand-box-btn"
                style={{
                  marginTop: "8px",
                  background: "linear-gradient(135deg, #f5e1a4 0%, #b8860b 100%)",
                  border: "1px solid rgba(255, 235, 170, 0.5)",
                  color: "#1a0509",
                  fontSize: "clamp(0.82rem, 1.5vw, 0.95rem)",
                  fontWeight: 700,
                  padding: "6px 18px",
                  borderRadius: "20px",
                  boxShadow: "0 4px 15px rgba(218, 165, 32, 0.35)"
                }}
              >
                🎁 TAP BOX TO OPEN
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Responsive CSS Rules for Phones & Small Screens ── */}
      <style jsx>{`
        /* Responsive adjustments for mobile smartphones (max-width: 640px) */
        @media (max-width: 640px) {
          .pavilion-card {
            width: min(440px, 94vw) !important;
            height: clamp(520px, 88dvh, 760px) !important;
            max-height: 92dvh !important;
            min-height: min(490px, 85dvh) !important;
            margin: auto !important;
            padding: 16px 16px 18px !important;
            border-radius: 24px !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          .pavilion-topbar {
            margin-bottom: 6px !important;
            width: 100% !important;
          }
          .pavilion-badge {
            padding: 4px 12px !important;
            font-size: 0.70rem !important;
          }
          .pavilion-music-btn {
            padding: 4px 12px !important;
            font-size: 0.72rem !important;
          }
          .screen-header {
            margin-top: 2px !important;
          }
          .screen-subtitle {
            font-size: clamp(0.95rem, 2.4vw, 1.20rem) !important;
            margin: 0 !important;
            letter-spacing: 0.3px !important;
          }
          .screen-title {
            font-size: clamp(1.50rem, 4.4vw, 2.10rem) !important;
            margin: 2px 0 4px !important;
            line-height: 1.18 !important;
          }
          .screen-prompt {
            font-size: clamp(0.98rem, 2.5vw, 1.25rem) !important;
            margin: 0 !important;
          }
          .shinchan-container {
            margin: 6px 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
          }
          .speech-bubble {
            padding: 9px 18px !important;
            margin-bottom: 6px !important;
            max-width: 92% !important;
            border-radius: 18px !important;
          }
          .speech-text {
            font-size: clamp(0.88rem, 2.2vw, 1.05rem) !important;
            line-height: 1.35 !important;
          }
          .shinchan-img {
            width: clamp(125px, 18vh, 165px) !important;
            height: clamp(125px, 18vh, 165px) !important;
          }
          .shinchan-tap-badge {
            font-size: 0.66rem !important;
            padding: 3px 10px !important;
            bottom: -4px !important;
          }
          .action-btn-group {
            margin-top: 8px !important;
            margin-bottom: 2px !important;
            gap: 12px !important;
            width: 100% !important;
            max-width: 420px !important;
          }
          .action-btn {
            padding: 12px 20px !important;
            font-size: clamp(1.02rem, 2.6vw, 1.22rem) !important;
            border-radius: 30px !important;
            font-weight: 700 !important;
          }
          /* Screen 4 Gift Box */
          .grand-box-stage {
            margin: 4px 0 6px !important;
          }
          .grand-box-cube {
            width: clamp(100px, 14vh, 135px) !important;
            height: clamp(100px, 14vh, 135px) !important;
            border-radius: 20px !important;
          }
          .grand-box-bow {
            width: 44px !important;
            height: 44px !important;
            font-size: 1.35rem !important;
          }
          .grand-box-btn {
            margin-top: 8px !important;
            padding: 8px 20px !important;
            font-size: 0.90rem !important;
          }
        }

        /* Extra small portrait screens (height <= 600px) */
        @media (max-height: 600px) and (max-width: 640px) {
          .pavilion-card {
            height: 94dvh !important;
            max-height: 96dvh !important;
            padding: 10px 12px 12px !important;
          }
          .screen-title {
            font-size: 1.25rem !important;
          }
          .shinchan-img {
            width: clamp(85px, 13vh, 105px) !important;
            height: clamp(85px, 13vh, 105px) !important;
          }
          .action-btn {
            padding: 8px 14px !important;
            font-size: 0.92rem !important;
          }
        }
      `}</style>
    </div>
  );
}
