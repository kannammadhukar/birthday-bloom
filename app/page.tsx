"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import CinemaIntro from "@/components/CinemaIntro";
import ShinchanIntro from "@/components/ShinchanIntro";
import JourneySection from "@/components/JourneySection";
import BirthdayLetter from "@/components/BirthdayLetter";
import PasscodeGate from "@/components/PasscodeGate";
import HeroPhotoStars from "@/components/HeroPhotoStars";
import CameraSettingsModal from "@/components/CameraSettingsModal";
import SectionButterfly from "@/components/SectionButterfly";
import PhotoZoomModal from "@/components/PhotoZoomModal";
import { smoothAlign } from "@/lib/autoAlign";
// SSR-safe dynamic imports for all 3D components
const LiveCakeExperience = dynamic(() => import("@/components/LiveCakeExperience"), { ssr: false });
const StarfieldBackground = dynamic(() => import("@/components/three/StarfieldBackground"), { ssr: false });
const BalloonScene = dynamic(() => import("@/components/three/BalloonScene"), { ssr: false });

import photoDataset from "@/content/photos";
const MemoryReel = dynamic(() => import("@/components/MemoryReel"), { ssr: false });

const FILTERS = [
  { label: "🌟 All Memories", value: "all" },
  { label: "👑 Divija's Glow", value: "divija_solo" },
  { label: "👭 Sister", value: "sister" },
  { label: "💛 Krushni (Bestie)", value: "bestie" },
  { label: "🏠 Sai Prathima & Bhavana", value: "roommates" },
  { label: "🩺 College & Fest Life", value: "college" },
];

export interface WishItem {
  id?: string;
  name: string;
  text: string;
  createdAt?: string;
  hidden?: boolean;
}

const DEFAULT_WISHES: WishItem[] = [
  { id: "wish_seed_sister", name: "Sister 👭", text: "Happy Birthday to my favourite person in the whole world! Keep shining, mowa! 💖❤️", hidden: false },
  { id: "wish_seed_krushni", name: "Krushni 💛 Best Friend", text: "Happy Birthday Divija! From every laugh to every cry — I'm always your constant! 🥺💛", hidden: false },
  { id: "wish_seed_roommates", name: "Roommates — Sai Prathima & Bhavana 🏠", text: "Happy Birthday Divija! Room feels magical because of you! 🎉💕", hidden: false },
];



function formatAudioTime(sec: number) {
  if (!sec || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export interface AudioTrack {
  id: string;
  title: string;
  subtitle: string;
  artist: string;
  movie: string;
  src: string;
  icon: string;
  badge: string;
}

export const PLAYLIST: AudioTrack[] = [
  {
    id: "samajavaragamana",
    title: "Samajavaragamana 👑",
    subtitle: "Sid Sriram & Thaman S · Acoustic Classical-Fusion",
    artist: "Sid Sriram · Thaman S",
    movie: "Ala Vaikunthapurramuloo",
    src: "/audio/samajavaragamana.mp3",
    icon: "👑",
    badge: "Entire Website Theme",
  },
];

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function Home() {
  const [introShown, setIntroShown] = useState(false);
  const [passcodeUnlocked, setPasscodeUnlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPreviewAsGuest, setAdminPreviewAsGuest] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [lightboxSrc, setLightboxSrc] = useState("");
  const [lightboxTagline, setLightboxTagline] = useState("");
  const [lightboxCaption, setLightboxCaption] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [showCameraSettings, setShowCameraSettings] = useState(false);
  const [isArActive, setIsArActive] = useState(false);
  const [shareUrl, setShareUrl] = useState("http://localhost:3000");
  const [wishes, setWishes] = useState<WishItem[]>(DEFAULT_WISHES);
  const [wishName, setWishName] = useState("");
  const [wishText, setWishText] = useState("");
  const [isPostingWish, setIsPostingWish] = useState(false);
  const [wishStatus, setWishStatus] = useState("");
  const [blowTrigger, setBlowTrigger] = useState(0);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [micStatus, setMicStatus] = useState("🎂 Click 'Blow Candles' or tap the cake to make a wish! ✨");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMedleyPlaying, setIsMedleyPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [medleyTime, setMedleyTime] = useState(0);
  const [medleyDuration, setMedleyDuration] = useState(0);

  const currentTrack = PLAYLIST[currentTrackIndex];

  function switchTrack(index: number, autoPlay: boolean = true, targetTime?: number) {
    const nextIndex = (index + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
    if (medleyAudioRef.current) {
      medleyAudioRef.current.src = PLAYLIST[nextIndex].src;
      const startTime = targetTime !== undefined ? targetTime : 0.0;
      medleyAudioRef.current.currentTime = startTime;
      setMedleyTime(startTime);
      if (autoPlay) {
        stopTributeVideo();
        medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
      }
    }
  }
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const playingRef = useRef(false);
  const medleyAudioRef = useRef<HTMLAudioElement | null>(null);
  const tributeVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);

      // Reset any saved unlock tokens so the Royal Premiere Passcode screen always shows
      try {
        localStorage.removeItem("divija_passcode_auth");
        localStorage.removeItem("divija_auth_role");
      } catch {}

      // Intelligent Background Asset Preloader (Keeps website assets ready in memory before user reaches them)
      try {
        const audioPreload = new Audio();
        audioPreload.src = "/audio/samajavaragamana.mp3";
        audioPreload.preload = "auto";
      } catch {}

      const keyPhotos = [
        "/images/photo_25.jpg",
        "/images/gift_animation/balloon1.png",
        "/images/gift_animation/balloon2.png",
        "/images/gift_animation/hat.png",
        "/images/gift_animation/smiley_icon.png",
        "/images/gift_animation/1.png",
        "/images/gift_animation/heart_letter.gif",
        "/images/gift_animation/love_img.gif",
        "/images/gift_animation/mewmew.gif",
      ];
      keyPhotos.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }
  }, []);

  // Sync AR camera state across header settings and cake experience
  useEffect(() => {
    function handleArCameraState(e: any) {
      if (e.detail) {
        setIsArActive(Boolean(e.detail.active));
      }
    }
    function handleOpenSettings() {
      setShowCameraSettings(true);
    }
    window.addEventListener("ar-camera-state-changed", handleArCameraState);
    window.addEventListener("open-camera-settings", handleOpenSettings);
    return () => {
      window.removeEventListener("ar-camera-state-changed", handleArCameraState);
      window.removeEventListener("open-camera-settings", handleOpenSettings);
    };
  }, []);

  // Stop tribute video and immediately halt its music
  function stopTributeVideo(resumeWebsiteMusic: boolean | React.SyntheticEvent = false) {
    if (tributeVideoRef.current) {
      tributeVideoRef.current.pause();
      tributeVideoRef.current.currentTime = 0;
    }
    const modalVid = document.getElementById("theater-modal-video") as HTMLVideoElement | null;
    if (modalVid) {
      modalVid.pause();
      modalVid.currentTime = 0;
    }
    setIsVideoPlaying(false);
    setIsTheaterOpen(false);
    if (resumeWebsiteMusic === true) {
      smoothAlign("#tribute-video-section");
      if (medleyAudioRef.current && introShown) {
        medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
      }
    }
  }

  // Prevent background scrolling while Cinema Intro is active
  useEffect(() => {
    if (!introShown) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [introShown]);

  // Samajavaragamana plays continuously across the entire website without pausing on scroll

  // Auto-pause Tribute Video when scrolling away, closing native mobile fullscreen, or switching tabs
  useEffect(() => {
    const videoSection = document.getElementById("tribute-video-section");
    const videoEl = tributeVideoRef.current;

    // 1. Auto-pause video when scrolling away from tribute video section
    let observer: IntersectionObserver | null = null;
    if (videoSection) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            if (tributeVideoRef.current && !tributeVideoRef.current.paused) {
              tributeVideoRef.current.pause();
              setIsVideoPlaying(false);
              if (medleyAudioRef.current && medleyAudioRef.current.paused && introShown) {
                medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
              }
            }
          }
        });
      }, { threshold: 0.08 });
      observer.observe(videoSection);
    }

    // 2. iOS Safari / Mobile: when user closes the native video player ("Done" tapped)
    const handleWebkitEndFullscreen = () => {
      if (tributeVideoRef.current) {
        tributeVideoRef.current.pause();
      }
      setIsVideoPlaying(false);
    };

    // 3. Tab visibility change (minimize browser or switch tab)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (tributeVideoRef.current && !tributeVideoRef.current.paused) {
          tributeVideoRef.current.pause();
          setIsVideoPlaying(false);
        }
      }
    };

    // 4. Escape key closes theater modal and stops video
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        stopTributeVideo();
      }
    };

    if (videoEl) {
      videoEl.addEventListener("webkitendfullscreen", handleWebkitEndFullscreen);
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      if (observer && videoSection) observer.unobserve(videoSection);
      if (videoEl) {
        videoEl.removeEventListener("webkitendfullscreen", handleWebkitEndFullscreen);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Realistic candle blow whoosh sound effect
  function playBlowWhoosh() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const bufferSize = Math.floor(ctx.sampleRate * 0.55);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.5);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.52);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch {}
  }

  // Handle blow candles: snuff flame, whoosh sound, confetti cannon & keep playing Samajavaragamana!
  function handleBlowCandles() {
    setBlowTrigger(t => t + 1);
    setCandlesBlown(prev => {
      const next = !prev;
      if (next) {
        stopTributeVideo();
        playBlowWhoosh();
        setMicStatus("🎉 Wishes made! Divija's Birthday Gala celebration in full bloom! 🎂👑✨");
        if (medleyAudioRef.current && medleyAudioRef.current.paused) {
          medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
        }
      } else {
        setMicStatus("🕯️ Candles relit! Make another wish! ✨");
      }
      return next;
    });
  }

  // Live-sync wishes: instant local cache + fetch from server + periodic background poll
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("divija_wishes") || "[]");
      if (saved.length) {
        setWishes(saved);
      }
    } catch {}

    async function syncCommunityWishes() {
      try {
        const activeAdmin = isAdmin && !adminPreviewAsGuest;
        const headers: Record<string, string> = {};
        if (activeAdmin) {
          headers["x-admin-key"] = "2006";
        }
        const res = await fetch("/api/wishes" + (activeAdmin ? "?adminKey=2006" : ""), { headers });
        if (res.ok) {
          const serverWishes: WishItem[] = await res.json();
          if (Array.isArray(serverWishes) && serverWishes.length > 0) {
            setWishes(serverWishes);
            localStorage.setItem("divija_wishes", JSON.stringify(serverWishes));
          }
        }
      } catch (err) {
        console.warn("Could not sync live wishes:", err);
      }
    }

    syncCommunityWishes();
    const pollTimer = setInterval(syncCommunityWishes, 6000);
    return () => clearInterval(pollTimer);
  }, [isAdmin, adminPreviewAsGuest]);

  // Top Header Audio Control: Mute / Unmute Samajavaragamana seamlessly
  function toggleAudio() {
    if (!medleyAudioRef.current) return;
    if (medleyAudioRef.current.paused || medleyAudioRef.current.muted) {
      medleyAudioRef.current.muted = false;
      stopTributeVideo();
      medleyAudioRef.current.play().then(() => {
        setIsMedleyPlaying(true);
        setIsPlaying(true);
      }).catch(() => {});
    } else {
      medleyAudioRef.current.muted = true;
      medleyAudioRef.current.pause();
      setIsMedleyPlaying(false);
      setIsPlaying(false);
    }
  }

  // Divija's Admin Controls: Lock Website
  function handleLockWebsite() {
    try {
      localStorage.removeItem("divija_passcode_auth");
      localStorage.removeItem("divija_auth_role");
    } catch {}
    setIsAdmin(false);
    setAdminPreviewAsGuest(false);
    setPasscodeUnlocked(false);
  }

  // Divija's Admin Controls: Hide / Unhide Wish
  async function handleToggleHideWish(targetWish: WishItem) {
    if (!isAdmin) return;
    const newHidden = !targetWish.hidden;

    // Optimistic UI update
    setWishes(prev => prev.map(w => {
      if ((targetWish.id && w.id === targetWish.id) || (w.name === targetWish.name && w.text === targetWish.text)) {
        return { ...w, hidden: newHidden };
      }
      return w;
    }));

    try {
      const res = await fetch("/api/wishes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "2006",
        },
        body: JSON.stringify({
          id: targetWish.id,
          createdAt: targetWish.createdAt,
          text: targetWish.text,
          hidden: newHidden,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.allWishes && Array.isArray(data.allWishes)) {
          setWishes(data.allWishes);
          localStorage.setItem("divija_wishes", JSON.stringify(data.allWishes));
        }
      }
    } catch (err) {
      console.error("Failed to toggle hide wish:", err);
    }
  }

  // Divija's Admin Controls: Delete Wish Forever
  async function handleDeleteWish(targetWish: WishItem) {
    if (!isAdmin) return;
    const ok = window.confirm(`Permanently delete wish by "${targetWish.name}"?\n\n"${targetWish.text}"\n\nThis will remove it completely from the Wishes Wall.`);
    if (!ok) return;

    // Optimistic UI remove
    setWishes(prev => prev.filter(w => {
      if (targetWish.id && w.id === targetWish.id) return false;
      if (w.name === targetWish.name && w.text === targetWish.text) return false;
      return true;
    }));

    try {
      const res = await fetch("/api/wishes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": "2006",
        },
        body: JSON.stringify({
          id: targetWish.id,
          createdAt: targetWish.createdAt,
          text: targetWish.text,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.allWishes && Array.isArray(data.allWishes)) {
          setWishes(data.allWishes);
          localStorage.setItem("divija_wishes", JSON.stringify(data.allWishes));
        }
      }
    } catch (err) {
      console.error("Failed to delete wish:", err);
    }
  }

  async function submitWish(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = wishName.trim();
    const trimmedText = wishText.trim();
    if (!trimmedName || !trimmedText || isPostingWish) return;

    smoothAlign("#wishes-section");
    setIsPostingWish(true);
    setWishStatus("💌 Sharing your wish with everyone...");

    const optimisticWish: WishItem = {
      name: trimmedName,
      text: trimmedText,
      createdAt: new Date().toISOString(),
      hidden: false,
    };

    setWishes(prev => [...prev, optimisticWish]);
    setWishName("");
    setWishText("");

    try {
      const activeAdmin = isAdmin && !adminPreviewAsGuest;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (activeAdmin) {
        headers["x-admin-key"] = "2006";
      }
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers,
        body: JSON.stringify({ name: trimmedName, text: trimmedText })
      });

      if (res.ok) {
        const data = await res.json();
        setWishStatus("✨ Live! Your wish has been posted for everyone to see! 🎉");
        if (data.allWishes && Array.isArray(data.allWishes)) {
          setWishes(data.allWishes);
          localStorage.setItem("divija_wishes", JSON.stringify(data.allWishes));
        }
      } else {
        setWishStatus("✨ Wish saved!");
      }
    } catch {
      setWishStatus("✨ Wish saved!");
    } finally {
      setIsPostingWish(false);
      setTimeout(() => setWishStatus(""), 6000);
    }
  }

  const filtered = activeFilter === "all" ? photoDataset : photoDataset.filter(p => p.tag === activeFilter);

  return (
    <>
      {/* ── Passcode Gate (2003 = Guest, 2006 = Divija Admin) ── */}
      {!passcodeUnlocked && (
        <PasscodeGate
          onUnlock={({ isAdmin: unlockedAsAdmin }) => {
            setIsAdmin(unlockedAsAdmin);
            setPasscodeUnlocked(true);
          }}
        />
      )}

      {/* ── 3D Starfield background (Active when celebrating in Gala) ── */}
      {introShown && <StarfieldBackground />}

      {/* ── Shinchan Birthday Interactive Intro ── */}
      {passcodeUnlocked && !introShown && (
        <ShinchanIntro
          onDone={(audioTime?: number) => {
            setIntroShown(true);
            try {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioContextClass) {
                const ctx = new AudioContextClass();
                if (ctx.state === "suspended") ctx.resume().catch(() => {});
                ctx.close().catch(() => {});
              }
            } catch {}

            // Seamlessly continue Samajavaragamana on the main celebration website!
            if (medleyAudioRef.current) {
              medleyAudioRef.current.src = PLAYLIST[0].src;
              const startAt = audioTime || 0.0;
              medleyAudioRef.current.currentTime = startAt;
              setMedleyTime(startAt);
              stopTributeVideo();
              medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
            }
          }}
        />
      )}



      {/* ══════════════════════════════════════════════
          MAIN APP
      ══════════════════════════════════════════════ */}
      <div
        id="main-celebration-app"
        style={{
          position: "relative",
          zIndex: 2,
          opacity: introShown ? 1 : 0,
          visibility: introShown ? "visible" : "hidden",
          height: introShown ? "auto" : "0px",
          maxHeight: introShown ? "none" : "0px",
          overflow: introShown ? "visible" : "hidden",
          transition: "opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: introShown ? "translateY(0)" : "translateY(18px)",
          pointerEvents: introShown ? "auto" : "none",
        }}
      >

        {/* ── Header ── */}
        <header className="header-nav">
          <div className="brand-badge">
            🎂 <span>Divija&apos;s 23rd Birthday Celebration 👑</span>
          </div>
          <div className="nav-actions">
            <button
              type="button"
              className="icon-btn camera-header-btn"
              onClick={() => setShowCameraSettings(true)}
              title="Camera & AR Settings"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "24px",
                background: isArActive 
                  ? "linear-gradient(135deg, rgba(34, 197, 94, 0.35) 0%, rgba(20, 83, 45, 0.5) 100%)" 
                  : "linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(128, 24, 42, 0.35) 100%)",
                border: `1.5px solid ${isArActive ? "#4ade80" : "rgba(255, 215, 0, 0.65)"}`,
                color: isArActive ? "#86efac" : "#fff3cf",
                fontSize: "0.85rem",
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: isArActive 
                  ? "0 0 16px rgba(74, 222, 128, 0.5)" 
                  : "0 4px 15px rgba(0, 0, 0, 0.6), 0 0 14px rgba(212, 175, 55, 0.3)",
                transition: "all 0.25s ease",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>📸</span>
              <span className="camera-header-label" style={{ fontSize: "0.82rem", letterSpacing: "0.4px" }}>
                {isArActive ? "AR Active 🪄" : "Camera & AR ✨"}
              </span>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isArActive ? "#22c55e" : "#ffd700",
                  boxShadow: `0 0 10px ${isArActive ? "#22c55e" : "#ffd700"}`,
                  display: "inline-block",
                }}
              />
            </button>
            <button className="icon-btn" onClick={toggleAudio} title="Toggle Music">
              {isPlaying ? "🔊" : "🔇"}
            </button>
            <button className="icon-btn" onClick={() => setShowQR(true)} title="Share QR Code">
              📱
            </button>
          </div>
        </header>

        {/* ── Hero: Bio + Simple Elegant Cake ── */}
        <section className="hero-section" style={{ position: "relative" }}>
          {/* Section Fluttering Butterflies (Natural scroll with page content) */}
          <SectionButterfly id="hero-pink" top="15%" right="7%" size={48} theme="pink" tilt={14} floatDelay={0} />
          <SectionButterfly id="hero-gold" top="40%" left="5%" size={40} theme="gold" tilt={-18} floatDelay={0.8} />

          {/* ── Divija Universe Photo-Stars (Curated Glowing Celestial Photo Stars) ── */}
          <HeroPhotoStars />

          <div className="hero-text">
            <span className="hero-tag">✦ CELEBRATING 23 BEAUTIFUL YEARS ✦</span>
            <h1 className="hero-title">
              Happy Birthday,
              <span className="script-sub">Divija! 👑</span>
            </h1>
            <p className="hero-subtitle">Celebrating a very special chapter ✨</p>
          </div>

          {/* 3D Artisan Birthday Cake & Live Camera Experience */}
          <div id="cake-experience-card" className="cake-card" style={{ position: "relative", background: "rgba(24, 10, 18, 0.76)", borderColor: "rgba(251, 113, 133, 0.35)" }}>
            <SectionButterfly id="cake-gold" top="14px" left="18px" size={44} theme="gold" tilt={-12} floatDelay={0.4} />
            <SectionButterfly id="cake-rose" top="22px" right="22px" size={42} theme="rose" tilt={16} floatDelay={1.2} />
            <div id="cake-canvas-container" className="cake-canvas-container-box">
              <LiveCakeExperience
                candlesBlown={candlesBlown}
                onToggleBlow={handleBlowCandles}
                confettiTrigger={confettiTrigger}
                blowTrigger={blowTrigger}
                onCakeCut={() => {
                  stopTributeVideo();
                  setMicStatus("🎂 Cake cut! Happy 23rd Birthday Divija! 👑🎉");
                  if (medleyAudioRef.current && medleyAudioRef.current.paused) {
                    medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
                  }
                }}
              />
            </div>

            {/* Audio element: Samajavaragamana for entire website */}
            <audio
              ref={medleyAudioRef}
              src={currentTrack.src}
              preload="auto"
              loop={false}
              onPlay={() => setIsMedleyPlaying(true)}
              onPause={() => setIsMedleyPlaying(false)}
              onEnded={() => {
                // If Samajavaragamana completes, loop and keep playing continuously from start!
                if (medleyAudioRef.current) {
                  medleyAudioRef.current.currentTime = 0.0;
                  setMedleyTime(0.0);
                  medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
                }
              }}
              onTimeUpdate={() => {
                if (medleyAudioRef.current) {
                  setMedleyTime(medleyAudioRef.current.currentTime);
                  if (medleyAudioRef.current.duration) {
                    setMedleyDuration(medleyAudioRef.current.duration);
                  }
                }
              }}
              onLoadedMetadata={() => {
                if (medleyAudioRef.current && medleyAudioRef.current.duration) {
                  setMedleyDuration(medleyAudioRef.current.duration);
                }
              }}
            />

            {/* Celebration Audio Player Bar */}
            <div style={{
              background: "linear-gradient(135deg, rgba(28, 8, 16, 0.94), rgba(12, 4, 8, 0.98))",
              borderTop: "1.5px solid rgba(212, 175, 55, 0.45)",
              padding: "14px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: "inset 0 1px 0 rgba(255, 235, 170, 0.2)",
            }}>
              {/* Soundtrack Switcher Ribbon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                  borderBottom: "1px solid rgba(212, 175, 55, 0.18)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.14em",
                    color: "rgba(243, 229, 171, 0.65)",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    marginRight: "4px",
                  }}
                >
                  Soundtrack:
                </span>
                {PLAYLIST.map((track, idx) => {
                  const isSelected = idx === currentTrackIndex;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        smoothAlign("#cake-experience-card");
                        switchTrack(idx, isMedleyPlaying);
                      }}
                      style={{
                        background: isSelected
                          ? "linear-gradient(135deg, rgba(212, 175, 55, 0.38) 0%, rgba(128, 24, 42, 0.65) 100%)"
                          : "rgba(255, 255, 255, 0.06)",
                        border: isSelected
                          ? "1.5px solid rgba(255, 215, 0, 0.85)"
                          : "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "16px",
                        padding: "4px 12px",
                        color: isSelected ? "#ffffff" : "rgba(243, 229, 171, 0.75)",
                        fontSize: "0.72rem",
                        fontWeight: isSelected ? 800 : 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        whiteSpace: "nowrap",
                        boxShadow: isSelected
                          ? "0 0 14px rgba(212, 175, 55, 0.45)"
                          : "none",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span>{track.icon}</span>
                      <span>{track.title}</span>
                      {isSelected && (
                        <span
                          style={{
                            fontSize: "0.58rem",
                            background: "rgba(255, 215, 0, 0.25)",
                            border: "1px solid rgba(255, 215, 0, 0.6)",
                            padding: "1px 6px",
                            borderRadius: "10px",
                            color: "#ffe082",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          Playing
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="medley-player-row" style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "10px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: isMedleyPlaying 
                      ? "radial-gradient(circle, #fcd34d 0%, #d4af37 55%, #80182a 100%)" 
                      : "rgba(212, 175, 55, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.3rem",
                    boxShadow: isMedleyPlaying ? "0 0 22px rgba(212, 175, 55, 0.8)" : "none",
                    animation: isMedleyPlaying ? "spin 4s linear infinite" : "none",
                    border: "1.5px solid rgba(212, 175, 55, 0.6)",
                    flexShrink: 0
                  }}>
                    {isMedleyPlaying ? currentTrack.icon : "🎶"}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <p style={{ margin: 0, fontSize: "0.94rem", color: "#fce7ea", fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                        {currentTrack.title}
                      </p>
                      <span
                        style={{
                          fontSize: "0.62rem",
                          background: "rgba(212, 175, 55, 0.18)",
                          border: "1px solid rgba(212, 175, 55, 0.45)",
                          color: "#ffd700",
                          padding: "1px 7px",
                          borderRadius: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                        }}
                      >
                        {currentTrack.badge}
                      </span>
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "rgba(251, 113, 133, 0.9)" }}>
                      {currentTrack.subtitle}
                    </p>
                  </div>
                </div>

                <div className="medley-controls-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {/* Play / Pause Button */}
                  <button
                    onClick={() => {
                      if (!medleyAudioRef.current) return;
                      smoothAlign("#cake-experience-card");
                      if (isMedleyPlaying) {
                        medleyAudioRef.current.pause();
                      } else {
                        stopTributeVideo();
                        medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
                      }
                    }}
                    style={{
                      background: isMedleyPlaying 
                        ? "linear-gradient(135deg, rgba(212, 175, 55, 0.4) 0%, rgba(128, 24, 42, 0.6) 100%)" 
                        : "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(128, 24, 42, 0.35) 100%)",
                      border: "1.5px solid rgba(255, 215, 0, 0.75)",
                      borderRadius: "20px",
                      color: "#fff6d6",
                      padding: "10px 22px",
                      fontSize: "0.85rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                      minHeight: "44px",
                      touchAction: "manipulation",
                      boxShadow: isMedleyPlaying ? "0 0 16px rgba(212, 175, 55, 0.4)" : "none",
                    }}
                  >
                    {isMedleyPlaying ? "⏸️ Pause Song" : "▶️ Play Song"}
                  </button>
                </div>
              </div>

              {/* Contained Thematic Scrubber Bar */}
              <div style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                paddingTop: "6px",
                borderTop: "1px solid rgba(212, 175, 55, 0.15)",
              }}>
                <input
                  type="range"
                  min={0}
                  max={medleyDuration || 100}
                  step={0.1}
                  value={medleyTime}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setMedleyTime(val);
                    if (medleyAudioRef.current) {
                      medleyAudioRef.current.currentTime = val;
                    }
                  }}
                  aria-label="Birthday Medley progress scrubber"
                  style={{ flex: 1, cursor: "pointer" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Divija's Story Journey (The Living Sketchbook) ── */}
        <JourneySection />

        {/* ── Wax-Sealed Birthday Letter ── */}
        <div style={{ position: "relative" }}>
          <SectionButterfly id="letter-pink" top="35px" left="8%" size={46} theme="pink" tilt={12} floatDelay={0.2} />
          <SectionButterfly id="letter-gold" bottom="45px" right="8%" size={44} theme="gold" tilt={-15} floatDelay={1.0} />
          <BirthdayLetter />
        </div>

        {/* ── Melodic Tribute Video Dedicated to Divija ── */}
        <section id="tribute-video-section" className="tribute-section">
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 18px",
              borderRadius: "24px",
              background: "rgba(212, 175, 55, 0.12)",
              border: "1px solid rgba(212, 175, 55, 0.38)",
              color: "#f3e5ab",
              fontSize: "0.84rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: "1.2rem"
            }}>
              <span>🌼</span>
              <span>A Song Dedicated to Divija</span>
              <span>🌼</span>
            </div>

            <h2 style={{
              fontSize: "clamp(1.9rem, 4.5vw, 3rem)",
              fontFamily: "'Iowan Old Style', Georgia, serif",
              color: "#f3ede1",
              fontStyle: "italic",
              marginBottom: "0.6rem",
              textShadow: "0 0 35px rgba(217, 169, 79, 0.3)"
            }}>
              Her Melodic Tribute ✨
            </h2>

            <p style={{
              color: "rgba(243, 237, 225, 0.72)",
              fontSize: "1rem",
              maxWidth: 580,
              margin: "0 auto 1.8rem",
              lineHeight: 1.6,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            }}>
              Choreographed frame-by-frame to <em>Jugraafiya</em> with blooming sunflower transitions, kinetic lyrics, and celebrating that pure, radiant smile.
            </p>

            {/* Cinema Video Player Container */}
            <div className="tribute-video-container">
              <video
                ref={tributeVideoRef}
                src="/videos/divija_jugraafiya_exact.mp4"
                controls
                playsInline
                preload="metadata"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onPlay={() => {
                  smoothAlign("#tribute-video-section");
                  setIsVideoPlaying(true);
                  if (medleyAudioRef.current && !medleyAudioRef.current.paused) {
                    medleyAudioRef.current.pause();
                    setIsMedleyPlaying(false);
                  }
                  if (playingRef.current) {
                    toggleAudio();
                  }
                }}
                onPause={() => {
                  setIsVideoPlaying(false);
                  if (medleyAudioRef.current && medleyAudioRef.current.paused && introShown) {
                    medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
                  }
                }}
                onEnded={() => {
                  setIsVideoPlaying(false);
                  if (tributeVideoRef.current) tributeVideoRef.current.currentTime = 0;
                  if (medleyAudioRef.current && medleyAudioRef.current.paused && introShown) {
                    medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
                  }
                }}
              />
            </div>

            {/* Quick Action Control Dock */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "1.2rem",
              padding: "10px 18px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(212, 175, 55, 0.25)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <button
                  onClick={() => {
                    if (!tributeVideoRef.current) return;
                    smoothAlign("#tribute-video-section");
                    if (isVideoPlaying) {
                      tributeVideoRef.current.pause();
                    } else {
                      tributeVideoRef.current.play();
                    }
                  }}
                  style={{
                    background: isVideoPlaying 
                      ? "linear-gradient(135deg, rgba(212, 175, 55, 0.35), rgba(128, 24, 42, 0.5))" 
                      : "linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(128, 24, 42, 0.3))",
                    border: "1px solid rgba(212, 175, 55, 0.45)",
                    borderRadius: "20px",
                    color: "#f3e5ab",
                    padding: "7px 16px",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {isVideoPlaying ? "⏸️ Pause Video" : "▶️ Play Video"}
                </button>

                <button
                  onClick={stopTributeVideo}
                  style={{
                    background: "rgba(180, 40, 60, 0.25)",
                    border: "1px solid rgba(212, 80, 100, 0.45)",
                    borderRadius: "20px",
                    color: "#fecdd3",
                    padding: "7px 16px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                  title="Stop video and immediately halt music"
                >
                  ⏹️ Stop Video & Music
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <span style={{
                  fontSize: "0.82rem",
                  color: isVideoPlaying ? "#e8c988" : "rgba(243, 237, 225, 0.45)",
                  fontStyle: "italic",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  {isVideoPlaying ? (
                    <>
                      <span>🎵</span>
                      <span>Playing: Jugraafiya • Super 30</span>
                    </>
                  ) : (
                    <span>🔇 Music Stopped</span>
                  )}
                </span>

                <button
                  onClick={() => {
                    smoothAlign("#tribute-video-section");
                    setIsTheaterOpen(true);
                  }}
                  style={{
                    background: "rgba(212, 175, 55, 0.12)",
                    border: "1px solid rgba(212, 175, 55, 0.35)",
                    borderRadius: "20px",
                    color: "#f3e5ab",
                    padding: "6px 14px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  🎭 Expand Cinema Mode
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Birthday Ribbon ── */}
        <div className="birthday-ribbon">
          <span className="ribbon-divider">★</span>
          <span className="ribbon-text">DIVIJA · CELEBRATING 23 BEAUTIFUL YEARS · RADIANT SMILES &amp; MEMORIES · KMC WARANGAL</span>
          <span className="ribbon-divider">★</span>
        </div>

        {/* ── 3D Champagne Memory Spheres ── */}
        <section className="game-section" id="gala-spheres-section">
          <h2 className="section-title">23rd Birthday Gala Spheres 🍾✨</h2>
          <p className="section-subtitle">Tap the jewel-toned glass spheres to reveal heartfelt birthday blessings!</p>
          <div className="balloon-canvas-wrap">
            <BalloonScene />
          </div>
        </section>

        {/* ── 35mm Rollercoaster Memory Reel (Circular Loop) ── */}
        <div style={{ position: "relative" }}>
          <SectionButterfly id="memory-pink" top="20px" right="6%" size={44} theme="pink" tilt={-10} floatDelay={0.6} />
          <SectionButterfly id="memory-violet" bottom="25px" left="6%" size={40} theme="violet" tilt={15} floatDelay={1.4} />
          <MemoryReel />
        </div>

        {/* ── Polaroid gallery ── */}
        <section id="gallery-section" className="gallery-section">
          <h2 className="section-title" style={{ textAlign:"center", marginBottom:8 }}>Memory Vault 📸</h2>
          <p className="section-subtitle" style={{ textAlign:"center" }}>Click any photo to view in full screen!</p>
          <div className="filter-bar">
            {FILTERS.map(f => (
              <button
                key={f.value}
                className={`filter-btn${activeFilter === f.value ? " active" : ""}`}
                onClick={() => {
                  smoothAlign("#gallery-section");
                  setActiveFilter(f.value);
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="photo-grid">
            {filtered.map((p, i) => (
              <div
                key={p.src}
                className="photo-card"
                style={{ "--i": i } as React.CSSProperties}
                onClick={() => {
                  smoothAlign("#gallery-section");
                  setLightboxSrc(p.src);
                  setLightboxTagline(p.tagline);
                  setLightboxCaption(p.caption);
                }}
              >
                <div className="photo-img-box">
                  <img src={p.src} alt={p.shortLabel || p.tagline} loading="lazy"
                    onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250'%3E%3Crect fill='%23374151' width='200' height='250'/%3E%3Ctext x='50%25' y='50%25' fill='%236b7280' font-size='14' text-anchor='middle' dy='.3em'%3EPhoto%3C/text%3E%3C/svg%3E"; }}
                  />
                  {/* Chic 1-2 words representation badge - clean photo view */}
                  <div className="photo-short-badge">
                    <span>{p.shortLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Wishes wall ── */}
        <section id="wishes-section" className="wishes-section">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
            <h2 className="section-title" style={{ margin: 0 }}>Wishes Wall & Live Guestbook ✍️</h2>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.35)",
              color: "#86efac",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", display: "inline-block" }} />
              Live Shared Board · Visible to Everyone
            </div>
          </div>

          {/* Divija's Exclusive VIP Admin Banner (Passcode 2006) */}
          {isAdmin && (
            <div style={{
              background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(122, 21, 38, 0.22) 100%)",
              border: "1.5px solid rgba(212, 175, 55, 0.6)",
              borderRadius: "16px",
              padding: "14px 18px",
              marginBottom: "18px",
              boxShadow: "0 0 30px rgba(212, 175, 55, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "1.6rem", filter: "drop-shadow(0 0 10px rgba(212, 175, 55, 0.6))" }}>👑</span>
                <div>
                  <div style={{ color: "#f6d896", fontWeight: 700, fontSize: "0.95rem", letterSpacing: "0.02em" }}>
                    {adminPreviewAsGuest ? "Divija · Previewing Guest View (Moderation Controls Hidden)" : "Divija's VIP Admin Mode Active"}
                  </div>
                  <div style={{ color: "rgba(243, 237, 225, 0.72)", fontSize: "0.78rem", marginTop: "2px" }}>
                    {adminPreviewAsGuest 
                      ? "You are seeing what your guests see. Switch back anytime to moderate wishes." 
                      : "You have full super-powers to hide unwanted wishes or delete them permanently."}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    smoothAlign("#wishes-section");
                    setAdminPreviewAsGuest(prev => !prev);
                  }}
                  style={{
                    background: adminPreviewAsGuest ? "rgba(34, 197, 94, 0.2)" : "rgba(255, 255, 255, 0.08)",
                    border: adminPreviewAsGuest ? "1px solid rgba(34, 197, 94, 0.5)" : "1px solid rgba(212, 175, 55, 0.4)",
                    borderRadius: "12px",
                    color: adminPreviewAsGuest ? "#86efac" : "#f6d896",
                    padding: "7px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  {adminPreviewAsGuest ? "👑 Switch back to Admin" : "👁️ Preview as Guest"}
                </button>

                <button
                  type="button"
                  onClick={handleLockWebsite}
                  style={{
                    background: "rgba(180, 40, 60, 0.25)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "12px",
                    color: "#fca5a5",
                    padding: "7px 14px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  🔒 Exit / Lock
                </button>
              </div>
            </div>
          )}

          <p className="section-subtitle">
            Leave your birthday wishes for Divija below — visible to her and all friends across every device! 💌✨
          </p>
          <form className="wishes-form" onSubmit={submitWish}>
            <input
              className="input-field"
              placeholder="Your Name & Relationship (e.g., Krushni, Batchmate, Cousin)..."
              value={wishName}
              onChange={e => setWishName(e.target.value)}
              onFocus={() => smoothAlign("#wishes-section")}
              maxLength={60}
              required
            />
            <textarea
              className="input-field"
              placeholder="Write your heartfelt wish for Divija..."
              value={wishText}
              onChange={e => setWishText(e.target.value)}
              onFocus={() => smoothAlign("#wishes-section")}
              rows={3}
              maxLength={500}
              style={{ resize: "vertical", minHeight: 84, fontFamily: "'Outfit', sans-serif" }}
              required
            />
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <button
                type="submit"
                className="btn-post"
                disabled={isPostingWish}
                style={{
                  opacity: isPostingWish ? 0.7 : 1,
                  minHeight: "48px",
                  touchAction: "manipulation",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {isPostingWish ? "Posting for Everyone... ✨" : "Post Wish for Everyone 💌"}
              </button>
              {wishStatus && (
                <span style={{
                  color: "#f6d896",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  background: "rgba(217, 169, 79, 0.15)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  border: "1px solid rgba(217, 169, 79, 0.35)",
                }}>
                  {wishStatus}
                </span>
              )}
            </div>
          </form>
          <div className="wishes-board">
            {wishes
              .filter(w => {
                if (!isAdmin || adminPreviewAsGuest) {
                  return !w.hidden;
                }
                return true;
              })
              .map((w, i) => (
                <div
                  key={w.id || i}
                  className="wish-card"
                  style={{
                    border: w.hidden ? "1.5px dashed rgba(239, 68, 68, 0.65)" : undefined,
                    background: w.hidden ? "rgba(45, 10, 20, 0.7)" : undefined,
                    opacity: w.hidden ? 0.82 : 1,
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="wish-author">{w.name}</div>
                      {isAdmin && !adminPreviewAsGuest && w.hidden && (
                        <span style={{
                          background: "rgba(239, 68, 68, 0.25)",
                          border: "1px solid rgba(239, 68, 68, 0.5)",
                          color: "#fca5a5",
                          fontSize: "0.7rem",
                          padding: "2px 8px",
                          borderRadius: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                        }}>
                          🙈 Hidden from Guests
                        </span>
                      )}
                    </div>
                    {w.createdAt && (
                      <span suppressHydrationWarning style={{ fontSize: "0.76rem", color: "rgba(243, 229, 171, 0.6)", letterSpacing: "0.04em" }}>
                        {(() => {
                          try {
                            const d = new Date(w.createdAt);
                            return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
                          } catch {
                            return "";
                          }
                        })()}
                      </span>
                    )}
                  </div>
                  <div className="wish-text" style={{ fontStyle: w.hidden ? "italic" : "normal" }}>
                    {w.text}
                  </div>

                  {/* Divija's Moderation Controls (Only visible in active admin mode) */}
                  {isAdmin && !adminPreviewAsGuest && (
                    <div style={{
                      marginTop: "12px",
                      paddingTop: "10px",
                      borderTop: "1px solid rgba(212, 175, 55, 0.2)",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}>
                      <button
                        type="button"
                        onClick={() => {
                          smoothAlign("#wishes-section");
                          handleToggleHideWish(w);
                        }}
                        style={{
                          background: w.hidden ? "rgba(34, 197, 94, 0.18)" : "rgba(234, 179, 8, 0.18)",
                          border: w.hidden ? "1px solid rgba(34, 197, 94, 0.45)" : "1px solid rgba(234, 179, 8, 0.45)",
                          color: w.hidden ? "#86efac" : "#fde047",
                          borderRadius: "8px",
                          padding: "5px 12px",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {w.hidden ? "👁️ Unhide for Guests" : "👁️ Hide from Guests"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          smoothAlign("#wishes-section");
                          handleDeleteWish(w);
                        }}
                        style={{
                          background: "rgba(239, 68, 68, 0.18)",
                          border: "1px solid rgba(239, 68, 68, 0.45)",
                          color: "#fca5a5",
                          borderRadius: "8px",
                          padding: "5px 12px",
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        🗑️ Delete Forever
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Discreet footer link to re-enter passcode or switch accounts */}
          <div style={{
            textAlign: "center",
            marginTop: "28px",
            paddingTop: "16px",
            borderTop: "1px solid rgba(212, 175, 55, 0.15)",
          }}>
            <button
              type="button"
              onClick={handleLockWebsite}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(212, 175, 55, 0.55)",
                fontSize: "0.78rem",
                fontFamily: "'Outfit', sans-serif",
                cursor: "pointer",
                textDecoration: "underline",
                letterSpacing: "0.03em",
              }}
            >
              🔒 Passcode Protected ({isAdmin ? "VIP Mode" : "Guest Mode"}) · Lock Site
            </button>
          </div>
        </section>
      </div>

      {/* ── High-Definition Photo Zoom Modal for Polaroid Gallery / Memory Vault ── */}
      <PhotoZoomModal
        isOpen={Boolean(lightboxSrc)}
        onClose={() => {
          setLightboxSrc("");
          setLightboxTagline("");
          setLightboxCaption("");
          smoothAlign("#gallery-section");
        }}
        src={lightboxSrc}
        title={lightboxTagline || "Divija's Birthday Keepsake"}
        subtitle="✦ Memory Vault Gallery · Touch & Drag to Pan ✦"
        caption={lightboxCaption || lightboxTagline || ""}
      />

      {/* ── QR Modal ── */}
      {showQR && (
        <div className="modal-overlay active" onClick={() => setShowQR(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background:"rgba(18,8,14,0.97)", padding:32, borderRadius:24,
            border:"1px solid #d4af37", boxShadow: "0 0 50px rgba(107,20,34,0.5)", textAlign:"center",
          }}>
            <span className="close-modal" style={{ position:"static", display:"block", textAlign:"right", marginBottom:8 }}
              onClick={() => setShowQR(false)}>×</span>
            <h3 style={{ color:"#f3e5ab", fontSize:"1.4rem", marginBottom:12, fontFamily: "'Playfair Display', serif" }}>Scan to Share! 📲</h3>
            <div style={{ background:"#fff", padding:12, borderRadius:12, display:"inline-block" }}>
              <div style={{ width:160, height:160, display:"flex", alignItems:"center", justifyContent:"center", color:"#374151", fontSize:"0.85rem", wordBreak: "break-all", padding: "8px" }}>
                QR: {shareUrl}
              </div>
            </div>
            <p style={{ color:"#d5c7b8", marginTop:12, fontSize:"0.85rem" }}>Share the gala premiere with Divija!</p>
          </div>
        </div>
      )}

      {/* ── Cinema Theater Video Modal ── */}
      {isTheaterOpen && (
        <div
          className="modal-overlay active theater-modal-overlay"
          onClick={() => stopTributeVideo(true)}
        >
          {/* Header Bar with explicit Close button */}
          <div
            className="theater-header-bar"
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>🌼</span>
              <span style={{
                color: "#f3ede1",
                fontFamily: "'Iowan Old Style', Georgia, serif",
                fontSize: "clamp(0.95rem, 3.5vw, 1.15rem)",
                fontStyle: "italic",
                textShadow: "0 0 20px rgba(217, 169, 79, 0.3)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                A Song Dedicated to Divija — Jugraafiya ✨
              </span>
            </div>

            <button
              onClick={() => stopTributeVideo(true)}
              style={{
                background: "linear-gradient(135deg, rgba(212, 175, 55, 0.35), rgba(180, 40, 60, 0.55))",
                border: "1.8px solid #ffd700",
                borderRadius: "26px",
                color: "#fff3cf",
                padding: "10px 20px",
                fontSize: "0.92rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                minHeight: "48px",
                touchAction: "manipulation",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 215, 0, 0.45)",
                transition: "all 0.2s ease",
                flexShrink: 0,
                whiteSpace: "nowrap"
              }}
            >
              ✕ Close Video
            </button>
          </div>

          {/* Modal Video Player Container */}
          <div
            onClick={e => e.stopPropagation()}
            className="theater-video-box"
          >
            <video
              id="theater-modal-video"
              src="/videos/divija_jugraafiya_exact.mp4"
              controls
              autoPlay
              playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              onPlay={() => {
                setIsVideoPlaying(true);
                if (medleyAudioRef.current && !medleyAudioRef.current.paused) {
                  medleyAudioRef.current.pause();
                  setIsMedleyPlaying(false);
                }
                if (playingRef.current) {
                  toggleAudio();
                }
              }}
              onPause={() => {
                setIsVideoPlaying(false);
                if (medleyAudioRef.current && medleyAudioRef.current.paused && introShown) {
                  medleyAudioRef.current.play().then(() => setIsMedleyPlaying(true)).catch(() => {});
                }
              }}
              onEnded={() => stopTributeVideo(true)}
            />
          </div>

          {/* Mobile Fullscreen & Orientation Hint */}
          <div className="theater-mobile-hint" onClick={e => e.stopPropagation()}>
            <span>📱 Tip: Rotate your phone sideways for full-screen theater 🎬✨</span>
          </div>
        </div>
      )}

      {/* ── AR Camera & Permissions Settings Modal ── */}
      <CameraSettingsModal
        isOpen={showCameraSettings}
        onClose={() => setShowCameraSettings(false)}
        isCakeCameraActive={isArActive}
        onOpenCakeCamera={() => {
          setIsArActive(true);
        }}
        onCloseCakeCamera={() => {
          setIsArActive(false);
        }}
      />
    </>
  );
}
