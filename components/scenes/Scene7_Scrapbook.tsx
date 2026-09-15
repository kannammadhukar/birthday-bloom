"use client";
import { motion } from "framer-motion";
import { content } from "@/content";
import Image from "next/image";

interface Props { onNext: () => void; onReplay?: () => void; }

const WASHI_COLORS = ["#FF6B9D", "#FFB703", "#4FC3F7", "#AED581", "#CE93D8"];

export default function Scene7_Scrapbook({ onNext }: Props) {
  const photos = content.scrapbookPhotos;

  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #F5E6D3 0%, #EDD5B3 100%)" }}
    >
      {/* Book spread */}
      <motion.div
        className="relative flex shadow-2xl rounded-lg overflow-hidden"
        style={{ width: "min(90vw,700px)", height: "min(80vh,480px)" }}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Left page */}
        <div className="paper-bg flex-1 p-6 relative border-r-2 border-amber-200/60 flex flex-col gap-4">
          <p className="font-dancing text-[#C2185B] text-2xl">Our Story 💕</p>
          {photos.slice(0, 2).map((p, i) => (
            <motion.div
              key={i}
              className="relative bg-white p-2 shadow-md"
              style={{ rotate: i % 2 === 0 ? -2 : 3, width: "80%" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.2 }}
            >
              {/* Washi tape */}
              <div
                className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2"
                style={{ background: WASHI_COLORS[i] }}
              />
              <div className="relative w-full" style={{ height: 110 }}>
                <Image src={p.src} alt={p.caption} fill style={{ objectFit: "cover" }} />
              </div>
              <p className="font-dancing text-gray-600 text-center text-xs mt-1">{p.caption}</p>
            </motion.div>
          ))}
          {/* Sticker */}
          <motion.div
            className="absolute bottom-4 right-4 text-3xl"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 15 }}
            transition={{ delay: 0.9, type: "spring" }}
          >
            🌸
          </motion.div>
        </div>

        {/* Spine */}
        <div className="w-6 bg-amber-800/40 flex flex-col justify-around items-center py-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-amber-900/50" />
          ))}
        </div>

        {/* Right page */}
        <div className="paper-bg flex-1 p-6 relative flex flex-col gap-3">
          <p className="font-dancing text-[#C2185B] text-2xl text-right">Always together ✨</p>
          {photos.slice(2).map((p, i) => (
            <motion.div
              key={i}
              className="relative bg-white p-2 shadow-md self-end"
              style={{ rotate: i % 2 === 0 ? 2 : -3, width: "80%" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.2 }}
            >
              <div
                className="washi-tape absolute -top-3 left-1/2 -translate-x-1/2"
                style={{ background: WASHI_COLORS[i + 2] }}
              />
              <div className="relative w-full" style={{ height: 110 }}>
                <Image src={p.src} alt={p.caption} fill style={{ objectFit: "cover" }} />
              </div>
              <p className="font-dancing text-gray-600 text-center text-xs mt-1">{p.caption}</p>
            </motion.div>
          ))}
          {/* Birthday note */}
          <motion.div
            className="absolute bottom-4 left-4 bg-yellow-200/80 p-3 rounded shadow text-xs font-dancing text-gray-700 max-w-[140px]"
            style={{ rotate: -4 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
          >
            23 years of being absolutely amazing 🎂❤️
          </motion.div>
          <motion.div
            className="absolute bottom-4 right-4 text-3xl"
            initial={{ scale: 0, rotate: 20 }}
            animate={{ scale: 1, rotate: -10 }}
            transition={{ delay: 1.1, type: "spring" }}
          >
            🎀
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
