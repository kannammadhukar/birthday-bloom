"use client";
import { motion } from "framer-motion";

interface Props { onNext: () => void; onReplay?: () => void; }

export default function Scene2_CurtainClose({ onNext }: Props) {
  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
      {/* Left curtain panel */}
      <motion.div
        className="curtain-stripes absolute top-0 left-0 h-full w-1/2"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
      {/* Right curtain panel */}
      <motion.div
        className="curtain-stripes absolute top-0 right-0 h-full w-1/2"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
      {/* White flash on close */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0, 1] }}
        transition={{ duration: 1.5, times: [0, 0.5, 0.7, 1] }}
      />
    </div>
  );
}
