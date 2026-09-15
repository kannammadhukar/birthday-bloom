"use client";
import { motion, AnimatePresence } from "framer-motion";
import { content } from "@/content";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface Props { onNext: () => void; onReplay: () => void; }

export default function Scene9_PhoneMessage({ onNext, onReplay }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showCard, setShowCard] = useState(false);
  const msgs = content.chatMessages;

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= msgs.length) {
        clearInterval(t);
        setTimeout(() => {
          setShowCard(true);
          confetti({ particleCount: 150, spread: 100, origin: { x: 0.5, y: 0.4 }, colors: ["#FFB703","#FF6B9D","#C2185B","#fff"] });
        }, 800);
      }
    }, 900);
    return () => clearInterval(t);
  }, [msgs.length]);

  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a0030 0%, #3d0070 50%, #1a0050 100%)" }}
    >
      {/* BG bokeh */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: 80 + i * 30,
            height: 80 + i * 30,
            background: i % 2 === 0 ? "#FFB703" : "#C2185B",
            left: `${10 + i * 11}%`,
            top: `${20 + (i % 3) * 25}%`,
            filter: "blur(40px)",
          }}
        />
      ))}

      {/* Phone mockup */}
      <motion.div
        className="relative z-10 rounded-[40px] overflow-hidden border-4 border-gray-700 shadow-2xl"
        style={{
          width: 280,
          height: 560,
          background: "#000",
          boxShadow: "0 0 0 2px #222, 0 30px 80px rgba(0,0,0,0.8)",
        }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl z-20" />

        {/* Screen */}
        <div className="w-full h-full bg-gray-100 flex flex-col pt-6">
          {/* Status bar */}
          <div className="flex justify-between px-4 py-1 text-[10px] text-gray-500">
            <span>9:41</span><span>●●● WiFi 🔋</span>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">D</div>
            <div>
              <p className="font-outfit font-semibold text-sm text-gray-900">Divija ❤️</p>
              <p className="text-xs text-green-500">online now</p>
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 overflow-hidden px-3 py-3 flex flex-col gap-2">
            <p className="text-center text-[10px] text-gray-400 font-outfit">Today · Just Now</p>
            {msgs.slice(0, visibleCount).map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`bubble-them px-3 py-2 text-xs font-outfit max-w-[85%] leading-relaxed`}
              >
                {msg.text}
              </motion.div>
            ))}
          </div>

          {/* Input bar */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-200 bg-white">
            <div className="flex-1 bg-gray-100 rounded-full px-3 py-1.5 text-xs text-gray-400 font-outfit">iMessage</div>
            <div className="w-7 h-7 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-xs">↑</div>
          </div>
        </div>
      </motion.div>

      {/* Closing card overlay */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8 text-center"
            style={{ background: "linear-gradient(135deg, rgba(26,0,48,0.96) 0%, rgba(61,0,112,0.98) 100%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
            >
              <p className="text-6xl mb-4">🎂</p>
              <h2 className="font-playfair text-4xl text-white mb-2">Happy Birthday</h2>
              <h1 className="font-playfair italic text-5xl text-yellow-400 glow-gold mb-3">Divija</h1>
              <p className="font-dancing text-xl text-pink-300 mb-8">
                — With love, from everyone who adores you 👑❤️
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); onReplay(); }}
                  className="px-6 py-3 rounded-full bg-white/10 border border-white/30 text-white font-outfit text-sm hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  🔁 Replay
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onNext(); }}
                  className="px-6 py-3 rounded-full font-outfit text-sm font-semibold transition-colors"
                  style={{ background: "linear-gradient(135deg, #FFB703, #FF8C00)", color: "#000" }}
                >
                  💛 Thank you!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
