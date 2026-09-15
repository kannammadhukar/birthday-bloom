"use client";
import { motion } from "framer-motion";
import { content } from "@/content";
import Image from "next/image";

interface Props { onNext: () => void; onReplay?: () => void; }

export default function Scene5_MessageRing({ onNext }: Props) {
  const photos = content.ringPhotos;
  const count = photos.length;

  return (
    <div
      className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-6 px-6 py-8 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FEF9F0 0%, #FFF0F5 100%)" }}
    >
      {/* Left — Message */}
      <motion.div
        className="flex-1 max-w-sm z-10"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="font-playfair text-3xl sm:text-4xl text-[#C2185B] mb-4 leading-tight">
          Happy Birthday,<br />
          <span className="italic font-light">{content.petName} 💛</span>
        </h2>
        <p className="font-outfit text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {content.paragraphMessage}
        </p>
      </motion.div>

      {/* Right — Photo Ring */}
      <div className="relative flex-shrink-0" style={{ width: 300, height: 300 }}>
        {photos.map((p, i) => {
          const angle = (i / count) * 360;
          const rad = (angle * Math.PI) / 180;
          const radius = 110;
          const cx = Math.cos(rad - Math.PI / 2) * radius;
          const cy = Math.sin(rad - Math.PI / 2) * radius;
          return (
            <motion.div
              key={i}
              className="absolute rounded-full overflow-hidden border-4 border-white shadow-lg"
              style={{
                width: 72,
                height: 72,
                left: 150 + cx - 36,
                top: 150 + cy - 36,
              }}
              initial={{ scale: 0, opacity: 0, rotate: angle }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                delay: 0.3 + i * 0.12,
                type: "spring",
                stiffness: 180,
                damping: 14,
              }}
            >
              <Image src={p.src} alt={p.caption} fill style={{ objectFit: "cover" }} />
            </motion.div>
          );
        })}
        {/* Center heart */}
        <motion.div
          className="absolute text-4xl"
          style={{ left: 150 - 24, top: 150 - 24 }}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          👑
        </motion.div>
      </div>
    </div>
  );
}
