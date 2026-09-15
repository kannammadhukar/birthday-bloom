"use client";
import { motion } from "framer-motion";
import { content } from "@/content";
import Image from "next/image";

interface Props { onNext: () => void; onReplay?: () => void; }

const letters = "Happy Birthday".split("");

const BalloonSVG = ({ color, delay }: { color: string; delay: number }) => (
  <motion.div
    className="absolute bottom-0 z-20"
    style={{ left: `${20 + Math.random() * 60}%` }}
    initial={{ y: "100vh", opacity: 0 }}
    animate={{ y: "-30vh", opacity: [0, 1, 1, 0] }}
    transition={{ delay, duration: 6, ease: "easeOut" }}
  >
    <svg width="50" height="70" viewBox="0 0 50 70" className="balloon-sway">
      <ellipse cx="25" cy="25" rx="20" ry="23" fill={color} opacity="0.9" />
      <path d="M25 48 Q28 58 25 68" stroke={color} strokeWidth="1.5" fill="none" />
      <ellipse cx="18" cy="18" rx="5" ry="6" fill="white" opacity="0.3" />
    </svg>
  </motion.div>
);

export default function Scene4_HeroBalloons({ onNext }: Props) {
  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col items-center justify-center">
      {/* Blurred hero photo background */}
      <div className="absolute inset-0">
        <Image
          src={content.heroPhotoUrl}
          alt="Divija"
          fill
          style={{ objectFit: "cover", filter: "blur(8px) brightness(0.45)", transform: "scale(1.1)" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      </div>

      {/* Age */}
      <motion.div
        className="z-10 relative flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* HB letters stagger */}
        <div className="flex gap-1 flex-wrap justify-center">
          {letters.map((l, i) => (
            <motion.span
              key={i}
              className="font-playfair font-bold text-white text-3xl sm:text-4xl drop-shadow-lg"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.06, type: "spring", stiffness: 200 }}
            >
              {l === " " ? "\u00A0" : l}
            </motion.span>
          ))}
        </div>

        {/* Big age number */}
        <motion.div
          className="font-playfair font-bold glow-gold leading-none"
          style={{ fontSize: "clamp(100px,28vw,200px)", color: "#FFB703" }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
        >
          {content.age}
        </motion.div>

        {/* Divija name */}
        <motion.p
          className="font-playfair italic text-white text-2xl sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          Divija 🎂
        </motion.p>
      </motion.div>

      {/* Balloons */}
      <BalloonSVG color="#FF6B9D" delay={0.2} />
      <BalloonSVG color="#FFB703" delay={0.8} />
      <BalloonSVG color="#C2185B" delay={1.4} />
      <BalloonSVG color="#FF8C00" delay={0.5} />
      <BalloonSVG color="#9C27B0" delay={1.1} />
    </div>
  );
}
