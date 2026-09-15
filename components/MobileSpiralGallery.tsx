"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { PhotoItem } from "@/content/photos";

export interface MilestoneSpiralItem {
  id: number;
  chapter: string;
  badge: string;
  title: string;
  subtitle: string;
  color: string;
  glowColor: string;
  photo: PhotoItem;
}

export const SPIRAL_MILESTONES: MilestoneSpiralItem[] = [
  {
    id: 1,
    chapter: "CHAPTER I",
    badge: "1",
    title: "Childhood",
    subtitle: "Baby Dimples 🪔",
    color: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.75)",
    photo: {
      src: "/images/journey_01_childhood.jpg",
      tagline: "Baby Dimples & Joy 🪔✨",
      shortLabel: "Childhood 👶",
      caption: "Carefree childhood smiles & family warmth in Telangana ✨",
      tag: "divija_solo",
      storyTitle: "Chapter I · A Little Girl with Big Dimples 🪔",
      storyNarrative:
        "Before the heavy medical books and stethoscopes, Divija's story began in a warm Telangana home. A bright, observant girl with an infectious laugh and trademark deep cheek dimples that lit up the whole house.",
      milestoneEra: "The Beginning · Childhood",
    },
  },
  {
    id: 2,
    chapter: "CHAPTER II",
    badge: "2",
    title: "SR Prime",
    subtitle: "School Days 🎒",
    color: "#ef4444",
    glowColor: "rgba(239, 68, 68, 0.75)",
    photo: {
      src: "/images/journey_02_schooldays.jpg",
      tagline: "SR Prime Classroom Smiles 🎒✨",
      shortLabel: "School Days 🎒",
      caption: "Attentive for science in front, queen of backbench giggles 🎒😂",
      tag: "divija_solo",
      storyTitle: "Chapter II · Classroom Lessons & Backbench Laughter 🎒",
      storyNarrative:
        "At SR Prime School in Karimnagar, Divija was the attentive student in the front row who loved science and kept neat notes. Yet school was never just about books — backbench giggles, shared tiffins, and humming favorite Telugu tunes made every day memorable.",
      milestoneEra: "SR Prime School Days",
    },
  },
  {
    id: 3,
    chapter: "CHAPTER III",
    badge: "3",
    title: "Intermediate",
    subtitle: "Bio & Dreams 🔬",
    color: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.75)",
    photo: {
      src: "/images/journey_03_biolab.jpg",
      tagline: "Botany, Zoology & Big Dreams 🌿🔬",
      shortLabel: "College Days 🌿",
      caption: "Balancing intense coaching with canteen laughs & biology charts 🔬✨",
      tag: "divija_solo",
      storyTitle: "Chapter III · Botany, Zoology & College Shenanigans 🌿",
      storyNarrative:
        "Junior college brought thick Botany and Zoology charts, Organic Chemistry reactions, and nonstop tests. Here, her fascination with human biology sparked the dream to become a doctor and heal people.",
      milestoneEra: "Intermediate · Junior College",
    },
  },
  {
    id: 4,
    chapter: "CHAPTER IV",
    badge: "4",
    title: "NEET Prep",
    subtitle: "The Grind 📚",
    color: "#3b82f6",
    glowColor: "rgba(59, 130, 246, 0.75)",
    photo: {
      src: "/images/journey_04_the_grind.jpg",
      tagline: "Late Night Revision & Grit 📚☕",
      shortLabel: "NEET Odyssey 📚",
      caption: "Silent late-night coffee mugs, highlighted pages & unshakable grit ☕📖",
      tag: "divija_solo",
      storyTitle: "Chapter IV · The NEET Odyssey & Pure Determination ☕",
      storyNarrative:
        "Countless hours of revision, high-yield flashcards, and mock tests. With quiet discipline and the unwavering belief of her family, she turned late-night exhaustion into triumphs of courage.",
      milestoneEra: "NEET Preparation Days",
    },
  },
  {
    id: 5,
    chapter: "CHAPTER V",
    badge: "5",
    title: "KMC Warangal",
    subtitle: "White Coat 🩺",
    color: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.8)",
    photo: {
      src: "/images/journey_05_whitecoat.jpg",
      tagline: "Kakatiya Medical College & White Coat 🩺✨",
      shortLabel: "White Coat 🩺",
      caption: "Stepping into KMC Warangal — the dream realized with stethoscope in hand 🩺🏛️",
      tag: "divija_solo",
      storyTitle: "Chapter V · Kakatiya Medical College & The White Coat 🩺",
      storyNarrative:
        "Walking into the historic gates of Kakatiya Medical College (KMC) in Warangal. Slipping on that crisp white coat and placing the stethoscope around her neck for the very first time was a moment of pure triumph.",
      milestoneEra: "KMC Warangal · MBBS",
    },
  },
  {
    id: 6,
    chapter: "CHAPTER VI",
    badge: "6",
    title: "Dr. Divija",
    subtitle: "Healing Hearts 💖",
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.8)",
    photo: {
      src: "/images/photo_18.jpg",
      tagline: "Medico Divija · Pediatric Rounds 🩺👶",
      shortLabel: "Dr. Divija 🩺",
      caption: "Pediatric ward rounds — gentle warmth for the tiniest smiles 🩺👶💕",
      tag: "divija_solo",
      storyTitle: "Chapter VI · Dr. Divija & Compassionate Care 💖",
      storyNarrative:
        "During hospital rounds, Divija's warmth, gentle empathy, and bright dimpled smile melt away fears. A healer not only through clinical excellence, but through genuine human kindness.",
      milestoneEra: "MBBS Clinical Rounds",
    },
  },
  {
    id: 7,
    chapter: "MILESTONE 23",
    badge: "👑 23",
    title: "23rd Birthday",
    subtitle: "Gala Queen 👑",
    color: "#ffd700",
    glowColor: "rgba(255, 215, 0, 0.95)",
    photo: {
      src: "/images/photo_25.jpg",
      tagline: "Royal Grace in Pattu Saree 👑✨",
      shortLabel: "Gala Queen 👑",
      caption: "Timeless royalty in sea-green pattu saree & gold jewelry 👑🪔",
      tag: "divija_solo",
      storyTitle: "The Crown Milestone · Divija's 23rd Birthday Gala 👑",
      storyNarrative:
        "Celebrating 23 magnificent years of beauty, grace, resilience, and boundless kindness. Surrounded by love and golden stardust, our birthday queen shines brighter than ever before.",
      milestoneEra: "23rd Birthday Gala",
    },
  },
];

export interface MobileSpiralGalleryProps {
  onSelectPhoto: (photo: PhotoItem) => void;
}

export default function MobileSpiralGallery({ onSelectPhoto }: MobileSpiralGalleryProps) {
  const [rotationAngle, setRotationAngle] = useState(0); // in radians
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number>(7);
  const [isInteracting, setIsInteracting] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const velocityRef = useRef<number>(0);
  const lastAngleRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPointerDownRef = useRef(false);

  // Stage boundaries suited for mobile phone viewports
  const STAGE_WIDTH = 375;
  const STAGE_HEIGHT = 440;
  const CENTER_X = STAGE_WIDTH / 2;
  const CENTER_Y = STAGE_HEIGHT / 2 - 10;

  // Auto-rotation + inertial momentum decay
  useEffect(() => {
    let lastTs = performance.now();

    const loop = (ts: number) => {
      const dt = Math.min((ts - lastTs) / 1000, 0.1);
      lastTs = ts;

      if (!isInteracting && !isPointerDownRef.current) {
        if (Math.abs(velocityRef.current) > 0.0008) {
          velocityRef.current *= 0.94;
          setRotationAngle((prev) => prev + velocityRef.current);
        } else {
          // Serene hypnotic golden rotation
          setRotationAngle((prev) => (prev + dt * 0.16) % (Math.PI * 2));
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isInteracting]);

  const getRelativePos = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: CENTER_X, y: CENTER_Y };
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = STAGE_WIDTH / rect.width;
    const scaleY = STAGE_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }, [CENTER_X, CENTER_Y, STAGE_WIDTH, STAGE_HEIGHT]);

  const handlePointerStart = (clientX: number, clientY: number) => {
    isPointerDownRef.current = true;
    setIsInteracting(true);
    velocityRef.current = 0;

    const pos = getRelativePos(clientX, clientY);
    const dx = pos.x - CENTER_X;
    const dy = pos.y - CENTER_Y;
    lastAngleRef.current = Math.atan2(dy, dx);
    lastTimeRef.current = performance.now();
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isPointerDownRef.current) return;

    const pos = getRelativePos(clientX, clientY);
    const dx = pos.x - CENTER_X;
    const dy = pos.y - CENTER_Y;
    const currentAngle = Math.atan2(dy, dx);
    const now = performance.now();

    let deltaAngle = currentAngle - lastAngleRef.current;
    if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
    if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;

    velocityRef.current = deltaAngle * 0.85;
    setRotationAngle((prev) => prev + deltaAngle);

    lastAngleRef.current = currentAngle;
    lastTimeRef.current = now;
  };

  const handlePointerEnd = () => {
    isPointerDownRef.current = false;

    if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    autoPlayTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 2500);
  };

  const handleMilestoneClick = (item: MilestoneSpiralItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMilestoneId(item.id);
    onSelectPhoto(item.photo);
  };

  const handleJumpToMilestone = (item: MilestoneSpiralItem) => {
    setSelectedMilestoneId(item.id);
    const idx = item.id - 1;
    const u = idx / 6;
    const baseTheta = u * 3.2 * Math.PI;
    const targetRotation = Math.PI * 0.5 - baseTheta;

    setRotationAngle(targetRotation);
    setIsInteracting(true);
    if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    autoPlayTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 3000);
  };

  const spiralPathString = useMemo(() => {
    const points: string[] = [];
    const steps = 140;
    const maxRadius = 168;
    const minRadius = 36;

    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      const r = minRadius + u * (maxRadius - minRadius);
      const theta = u * 3.2 * Math.PI + rotationAngle;
      const x = CENTER_X + r * Math.cos(theta);
      const y = CENTER_Y + r * Math.sin(theta);
      if (s === 0) {
        points.push(`M ${x.toFixed(1)} ${y.toFixed(1)}`);
      } else {
        points.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`);
      }
    }
    return points.join(" ");
  }, [CENTER_X, CENTER_Y, rotationAngle]);

  const milestonePositions = useMemo(() => {
    return SPIRAL_MILESTONES.map((item, idx) => {
      const u = idx / 6;
      const radius = 38 + u * 128;
      const size = Math.round(44 + u * 44);
      const theta = u * 3.2 * Math.PI + rotationAngle;

      const x = CENTER_X + radius * Math.cos(theta);
      const y = CENTER_Y + radius * Math.sin(theta);

      return {
        ...item,
        x,
        y,
        size,
        radius,
        u,
      };
    });
  }, [CENTER_X, CENTER_Y, rotationAngle]);

  const activeMilestone =
    SPIRAL_MILESTONES.find((m) => m.id === selectedMilestoneId) || SPIRAL_MILESTONES[6];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "440px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        userSelect: "none",
        WebkitUserSelect: "none",
        padding: "0 0 1.2rem",
      }}
    >
      {/* ── Top Header Badge ── */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "linear-gradient(135deg, rgba(34, 8, 20, 0.94) 0%, rgba(18, 4, 12, 0.98) 100%)",
          border: "1.5px solid rgba(255, 215, 0, 0.65)",
          borderRadius: "20px",
          padding: "5px 14px",
          marginBottom: "10px",
          boxShadow: "0 4px 18px rgba(0, 0, 0, 0.7), 0 0 14px rgba(212, 175, 55, 0.3)",
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: "0.85rem" }}>🌀</span>
        <span
          style={{
            color: "#ffd700",
            fontSize: "0.76rem",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {activeMilestone.chapter} · {activeMilestone.title}
        </span>
      </div>

      {/* ── Interactive Touch Golden Spiral Stage ── */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: `${STAGE_WIDTH}px`,
          height: `${STAGE_HEIGHT}px`,
          borderRadius: "28px",
          overflow: "hidden",
          background: "radial-gradient(circle at 50% 48%, #200517 0%, #11020c 60%, #080106 100%)",
          border: "1.5px solid rgba(212, 175, 55, 0.35)",
          boxShadow: "0 14px 40px rgba(0, 0, 0, 0.85), inset 0 0 35px rgba(255, 209, 102, 0.08)",
          touchAction: "none",
          cursor: "grab",
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          handlePointerStart(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          handlePointerMove(t.clientX, t.clientY);
        }}
        onTouchEnd={() => handlePointerEnd()}
        onMouseDown={(e) => handlePointerStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={() => handlePointerEnd()}
        onMouseLeave={() => handlePointerEnd()}
      >
        {/* Hypnotic Central Golden Aura Glow */}
        <div
          style={{
            position: "absolute",
            top: `${CENTER_Y}px`,
            left: `${CENTER_X}px`,
            transform: "translate(-50%, -50%)",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255, 215, 0, 0.18) 0%, rgba(225, 29, 72, 0.12) 40%, transparent 70%)",
            filter: "blur(28px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* ── SVG Golden Stardust Spiral Ribbon ── */}
        <svg
          viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <defs>
            <linearGradient id="spiralGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd700" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#fb7185" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#c084fc" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.85" />
            </linearGradient>
            <filter id="spiralGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Broad glowing spiral track */}
          <path
            d={spiralPathString}
            fill="none"
            stroke="url(#spiralGoldGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#spiralGlow)"
            opacity="0.82"
          />

          {/* Golden stardust dashed accent line */}
          <path
            d={spiralPathString}
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeDasharray="3 8"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>

        {/* ── 7 Milestone Circular Photo Medallions ── */}
        {milestonePositions.map((item) => {
          const isSelected = item.id === selectedMilestoneId;
          const isOuterCrown = item.id === 7;

          return (
            <div
              key={item.id}
              onClick={(e) => handleMilestoneClick(item, e)}
              style={{
                position: "absolute",
                top: `${item.y}px`,
                left: `${item.x}px`,
                transform: "translate(-50%, -50%)",
                width: `${item.size}px`,
                height: `${item.size}px`,
                zIndex: isSelected ? 30 : Math.round(10 + item.u * 15),
                cursor: "pointer",
                transition: isInteracting ? "none" : "box-shadow 0.25s ease",
              }}
            >
              {/* Vibrant Colorful Jewel Ring */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  padding: "3px",
                  background: `linear-gradient(135deg, ${item.color}, #ffffff 50%, ${item.color})`,
                  boxShadow: `0 0 16px ${item.glowColor}, 0 6px 14px rgba(0, 0, 0, 0.7)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: isSelected ? "scale(1.14)" : "scale(1)",
                  transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {/* Photo Circle */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "relative",
                    background: "#18040d",
                  }}
                >
                  <img
                    src={item.photo.src}
                    alt={item.title}
                    width={180}
                    height={180}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Subtle gloss sheen */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, transparent 55%)",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                {/* Milestone Badge (#1 .. #7 or 👑 23) */}
                <div
                  style={{
                    position: "absolute",
                    top: isOuterCrown ? "-8px" : "-4px",
                    right: isOuterCrown ? "-8px" : "-4px",
                    background: item.color,
                    color: item.id === 7 ? "#12020a" : "#ffffff",
                    fontWeight: 900,
                    fontSize: isOuterCrown ? "0.68rem" : "0.58rem",
                    padding: isOuterCrown ? "2px 6px" : "1px 5px",
                    borderRadius: "10px",
                    border: "1.5px solid #ffffff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  {item.badge}
                </div>
              </div>

              {/* Title Tooltip for larger outer rings */}
              {item.size >= 65 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "-18px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    background: "rgba(18, 4, 12, 0.88)",
                    backdropFilter: "blur(6px)",
                    border: `1px solid ${item.color}`,
                    borderRadius: "8px",
                    padding: "1px 6px",
                    color: "#fef08a",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    pointerEvents: "none",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.6)",
                  }}
                >
                  {item.title}
                </div>
              )}
            </div>
          );
        })}

        {/* Center Golden Core Icon */}
        <div
          style={{
            position: "absolute",
            top: `${CENTER_Y}px`,
            left: `${CENTER_X}px`,
            transform: "translate(-50%, -50%)",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            background: "#ffd700",
            boxShadow: "0 0 14px #ffd700, 0 0 24px #ff4d79",
            zIndex: 5,
            pointerEvents: "none",
          }}
        />

        {/* Floating Instruction Hint */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15, 3, 10, 0.82)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 209, 102, 0.4)",
            borderRadius: "16px",
            padding: "4px 14px",
            color: "rgba(254, 240, 138, 0.95)",
            fontSize: "0.68rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 15,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.6)",
          }}
        >
          👆 Swipe or spin with touch · Tap any photo to zoom ✨
        </div>
      </div>

      {/* ── Quick Milestone Navigation Pills ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          marginTop: "12px",
          maxWidth: "380px",
        }}
      >
        {SPIRAL_MILESTONES.map((m) => {
          const isSel = m.id === selectedMilestoneId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleJumpToMilestone(m)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: isSel
                  ? `linear-gradient(135deg, ${m.color}, #b45309)`
                  : "rgba(26, 8, 18, 0.85)",
                border: `1.5px solid ${isSel ? "#ffffff" : m.color}`,
                borderRadius: "14px",
                padding: "4px 10px",
                color: isSel ? "#ffffff" : "#fef08a",
                fontSize: "0.68rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: isSel ? `0 0 10px ${m.glowColor}` : "0 2px 6px rgba(0,0,0,0.4)",
                transition: "all 0.2s ease",
              }}
            >
              <span>{m.id === 7 ? "👑" : `#${m.id}`}</span>
              <span>{m.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
