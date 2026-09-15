"use client";
import { motion } from "framer-motion";
import { content } from "@/content";
import Image from "next/image";

interface Props { onNext: () => void; onReplay?: () => void; }

const PIN_COLORS = ["#E53935","#FF7043","#E91E63","#8E24AA","#1E88E5","#43A047"];

export default function Scene6_PolaroidGallery({ onNext }: Props) {
  const polaroids = content.polaroids;

  return (
    <div className="corkboard w-full h-full relative overflow-hidden flex items-center justify-center">
      {/* Title pin */}
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-100 px-5 py-2 rounded shadow-md font-dancing text-[#C2185B] text-xl z-20"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ rotate: -1 }}
      >
        📌 Memories Board — Divija's Universe
      </motion.div>

      {/* Polaroids */}
      {polaroids.map((p, i) => {
        // Scattered positions
        const positions = [
          { top: "8%",  left: "3%"  },
          { top: "6%",  left: "32%" },
          { top: "5%",  left: "62%" },
          { top: "40%", left: "2%"  },
          { top: "42%", left: "35%" },
          { top: "38%", left: "65%" },
          { top: "70%", left: "8%"  },
          { top: "68%", left: "42%" },
        ];
        const pos = positions[i % positions.length];

        return (
          <motion.div
            key={i}
            className="absolute bg-white polaroid-shadow flex flex-col"
            style={{
              top: pos.top,
              left: pos.left,
              rotate: p.rotation,
              width: 140,
              padding: "8px 8px 28px",
            }}
            initial={{ opacity: 0, scale: 0.6, rotate: p.rotation - 10 }}
            animate={{ opacity: 1, scale: 1, rotate: p.rotation }}
            transition={{ delay: 0.15 * i, type: "spring", stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.08, zIndex: 30 }}
          >
            {/* Pin */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-sm z-10 border border-white/50"
              style={{ background: PIN_COLORS[i % PIN_COLORS.length] }}
            />
            {/* Photo */}
            <div className="relative w-full" style={{ height: 110 }}>
              <Image src={p.src} alt={p.caption} fill style={{ objectFit: "cover" }} />
            </div>
            {/* Caption */}
            <p className="font-dancing text-gray-700 text-center text-xs mt-1 leading-tight">
              {p.caption}
            </p>
          </motion.div>
        );
      })}

      {/* Quote card */}
      <motion.div
        className="absolute bottom-6 right-6 bg-white/90 rounded-xl p-4 max-w-[200px] shadow-lg z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.6 }}
        style={{ rotate: 2 }}
      >
        <p className="font-dancing text-[#C2185B] text-sm text-center leading-relaxed">
          "Every photo a memory, every memory a treasure 💛"
        </p>
      </motion.div>
    </div>
  );
}
