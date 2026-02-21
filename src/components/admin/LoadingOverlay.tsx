"use client";

import { motion } from "framer-motion";
import { unispace } from "@/fonts/fonts";

export default function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
    >
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Rings */}
        <div className="relative w-24 h-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-t-slate-400 border-r-transparent border-b-transparent border-l-transparent rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border border-t-transparent border-r-slate-400/40 border-b-transparent border-l-transparent rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-8 bg-slate-400/20 blur-xl rounded-full"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-2">
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`${unispace.className} text-slate-400 text-xs tracking-[0.4em] uppercase font-bold`}
          >
            Accessing Data
          </motion.span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-1 h-1 bg-slate-400 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
