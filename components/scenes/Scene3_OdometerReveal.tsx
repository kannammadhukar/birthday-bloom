"use client";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface Props { onNext: () => void; onReplay?: () => void; }

const ROLL_NUMBERS = [15, 16, 17, 18, 19, 20, 21, 22, 23];

export default function Scene3_OdometerReveal({ onNext }: Props) {
  const controls = useAnimationControls();
  const fired = useRef(false);

  useEffect(() => {
    controls.start({
      y: [0, -80, -160, -240, -320, -400, -480, -560, -640],
      transition: {
        duration: 3.5,
        ease: [0.25, 1, 0.5, 1],
        times: [0, 0.1, 0.2, 0.32, 0.46, 0.62, 0.76, 0.9, 1],
      },
    }).then(() => {
      if (!fired.current) {
        fired.current = true;
        // Firework burst
        confetti({ particleCount: 120, spread: 80, origin: { x: 0.2, y: 0.3 }, colors: ["#FFB703","#FF6B6B","#C2185B","#fff","#gold"] });
        confetti({ particleCount: 120, spread: 80, origin: { x: 0.8, y: 0.3 }, colors: ["#FFB703","#FF6B6B","#C2185B","#fff"] });
        setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.2 } }), 300);
      }
    });
  }, [controls]);

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #050514 0%, #0a0a2e 60%, #12063a 100%)" }}
    >
      <div className="stars" />

      {/* Subtitle */}
      <motion.p
        className="text-yellow-300/70 text-sm tracking-[0.3em] uppercase mb-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Turning
      </motion.p>

      {/* Odometer */}
      <div className="overflow-hidden z-10" style={{ height: 160 }}>
        <motion.div animate={controls} className="flex flex-col items-center">
          {ROLL_NUMBERS.map((n) => (
            <div
              key={n}
              className="font-playfair font-bold text-center leading-none"
              style={{ height: 80, fontSize: "clamp(80px, 20vw, 140px)", color: "#FFB703", textShadow: "0 0 40px #FFB703" }}
            >
              {n}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Label */}
      <motion.p
        className="font-playfair italic text-white/70 text-2xl mt-6 z-10"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.8 }}
      >
        Years of pure magic ✨
      </motion.p>

      {/* Sparkle ring */}
      <motion.div
        className="absolute z-10 rounded-full border-2 border-yellow-400/20"
        style={{ width: 220, height: 220 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.6, 0] }}
        transition={{ delay: 3.5, duration: 1.5 }}
      />
    </div>
  );
}
