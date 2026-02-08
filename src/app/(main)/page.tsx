"use client";
import CRTMonitor from "@/my_components/crt/TestCRT";
import GlassSurface from "@/my_components/GlassSurface";
import { motion } from "framer-motion";
import Link from "next/link";

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
      <div className="w-screen h-screen flex items-center overflow-hidden justify-center ">
        <div className="w-fit z-10 h-auto absolute flex flex-col gap-4 top-24 lg:bottom-52 lg:top-auto items-center">
          <Link href="/orion">
            <GlassSurface
              borderRadius={10}
              backgroundOpacity={0.75}
              className="cursor-pointer border border-amber-700/30 transition-all duration-300 px-3 py-2"
            >
              <span className="text-white flex flex-col items-center justify-center lg:text-base tracking-wide">
                <span className="font-medium text-base leading-tight text-center lg:text-lg">
                  Orion AI <br /> Hackathon
                </span>
              </span>
            </GlassSurface>
          </Link>
          <Link
            href="https://gyanith-conference.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GlassSurface
              borderRadius={10}
              backgroundOpacity={0.75}
              className="cursor-pointer border border-amber-700/30  transition-all duration-300 px-3 py-2"
            >
              <span className="text-white flex flex-col items-center justify-center   lg:text-base tracking-wide ">
                <span className="font-medium text-base leading-tight text-center lg:text-lg">
                  International <br /> Conference
                </span>
              </span>
            </GlassSurface>
          </Link>
        </div>
        <CRTMonitor />
        <div className="z-50  absolute top-[50%]"></div>
      </div>
    </motion.div>
  );
}
