"use client";
import { motion } from "framer-motion";
import { content } from "@/content";
import Image from "next/image";

interface Props { onNext: () => void; onReplay?: () => void; }

export default function Scene8_StarryDrift({ onNext }: Props) {
  const photos = content.driftPhotos;

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #020210 0%, #0a0a1a 50%, #050514 100%)" }}
    >
      <div className="stars" />

      {/* Title */}
      <motion.p
        className="absolute top-8 left-1/2 -translate-x-1/2 text-white/60 font-outfit text-sm tracking-[0.3em] uppercase z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        ✦ Moments drifting through the stars ✦
      </motion.p>

      {/* Drifting photo cards */}
      {photos.map((src, i) => {
        const startX = 5 + (i % 3) * 30 + Math.random() * 10;
        const rotDeg = (Math.random() - 0.5) * 24;
        const delay = i * 0.7;
        return (
          <motion.div
            key={i}
            className="absolute bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden shadow-2xl"
            style={{
              width: 160,
              height: 200,
              left: `${startX}%`,
              top: "110%",
              rotate: rotDeg,
            }}
            animate={{
              y: [0, -window.innerHeight * 1.4],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              delay,
              duration: 5,
              ease: "easeInOut",
              times: [0, 0.08, 0.85, 1],
            }}
          >
            <div className="relative w-full h-full">
              <Image src={src} alt={`Memory ${i + 1}`} fill style={{ objectFit: "cover" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </motion.div>
        );
      })}

      {/* Big bottom text */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <p className="font-playfair italic text-yellow-300/80 text-2xl">College days, forever in the heart 🏫💛</p>
      </motion.div>
    </div>
  );
}
