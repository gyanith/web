"use client";
import CRTMonitor from "@/components/crt/TestCRT";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.div
      className="flex h-full w-full flex-col items-center justify-center bg-[#1a1a1a] text-amber-500 relative"
      initial={{
        opacity: 0,
        scaleX: 0, // Start closed horizontally
        scaleY: 0.005, // Start as a thin line vertically
        filter: "brightness(5) contrast(2)", // Start extremely bright (flash)
      }}
      animate={{
        opacity: 1,
        scaleX: [0, 1, 1], // 1. Open width
        scaleY: [0.005, 0.005, 1], // 2. Then open height
        filter: [
          "brightness(5) contrast(2)", // Flash
          "brightness(2) contrast(1.5)", // Dimming
          "brightness(1) contrast(1)", // Normal
        ],
      }}
      transition={{
        duration: 0.8,
        ease: "easeInOut",
        times: [0, 0.6, 1], // Timing split: 60% for width, 40% for height
      }}
    >
      <div className="w-screen h-screen flex items-center justify-center ">
        <CRTMonitor />
        <div className="z-50  absolute top-[50%]"></div>
      </div>
    </motion.div>
  );
}
