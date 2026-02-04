"use client";

import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { pressStart2P } from "@/fonts/fonts";

export default function BiometricScanner() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#070a10]/95 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <Fingerprint className="w-32 h-32 text-[#d4a574]" strokeWidth={1} />

        {/* Scanning Laser Effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-[#d4a574] shadow-[0_0_15px_rgba(212,165,116,0.8)]"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`mt-8 text-[#d4a574] text-sm tracking-widest ${pressStart2P.className}`}
      >
        AUTHENTICATING...
      </motion.p>

      {/* Pulsing Dots */}
      <div className="flex gap-2 mt-4">
        <motion.div
          className="w-1 h-1 bg-[#d4a574]"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        <motion.div
          className="w-1 h-1 bg-[#d4a574]"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.div
          className="w-1 h-1 bg-[#d4a574]"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  );
}
