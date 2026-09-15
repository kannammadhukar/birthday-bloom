"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props { onNext: () => void; onReplay?: () => void; }

function getTimeLeft(target: string) {
  const now = Date.now();
  const end = new Date(target).getTime();
  const diff = Math.max(0, end - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s, done: diff <= 0 };
}

export default function Scene1_NowShowing({ onNext }: Props) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, done: true });

  useEffect(() => {
    setTime(getTimeLeft("2026-09-10T00:00:00"));
    const t = setInterval(() => setTime(getTimeLeft("2026-09-10T00:00:00")), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="curtain-stripes w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/60 pointer-events-none" />

      {/* Golden film reel dots top */}
      <div className="absolute top-0 left-0 right-0 flex justify-around py-2">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="w-5 h-7 rounded-sm border-2 border-yellow-400/60 bg-black/30" />
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="flex flex-col items-center gap-4 z-10 px-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Tagline */}
        <motion.p
          className="text-yellow-300/80 text-xs tracking-[0.35em] uppercase font-outfit"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          A Special Birthday Presentation · Thursday, 11 Sep 2026
        </motion.p>

        {/* NOW SHOWING */}
        <motion.h1
          className="font-playfair text-5xl sm:text-7xl text-white flicker tracking-widest"
          style={{ textShadow: "0 0 30px #FFB703, 0 2px 0 #8B0000" }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
        >
          NOW SHOWING
        </motion.h1>

        {/* Divider */}
        <motion.div
          className="w-48 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        />

        {/* Subtitle */}
        <motion.p
          className="text-yellow-100/90 font-playfair italic text-xl sm:text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Happy Birthday, Divija 👑
        </motion.p>

        {/* Countdown */}
        <motion.div
          className="flex gap-2 mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          {time.done ? (
            <div className="px-6 py-3 bg-black/50 border border-yellow-400/60 rounded text-yellow-400 font-outfit font-bold text-lg tracking-widest">
              🎉 TODAY IS THE DAY!
            </div>
          ) : (
            [
              { label: "D", val: time.d },
              { label: "H", val: time.h },
              { label: "M", val: time.m },
              { label: "S", val: time.s },
            ].map(({ label, val }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/70 border border-yellow-400/40 rounded flex items-center justify-center">
                  <span className="text-yellow-400 font-outfit font-bold text-2xl">
                    {String(val).padStart(2, "0")}
                  </span>
                </div>
                <span className="text-yellow-300/60 text-[9px] tracking-widest mt-1">{label}</span>
              </div>
            ))
          )}
        </motion.div>

        {/* Tap hint */}
        <motion.p
          className="text-white/40 text-xs tracking-widest mt-4"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          TAP TO BEGIN ✦
        </motion.p>
      </motion.div>

      {/* Film reel dots bottom */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around py-2">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="w-5 h-7 rounded-sm border-2 border-yellow-400/60 bg-black/30" />
        ))}
      </div>
    </div>
  );
}
