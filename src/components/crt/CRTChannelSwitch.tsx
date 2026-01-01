// CRTChannelSwitch.tsx

"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
// If using Next.js router: import { usePathname } from 'next/navigation';
// If using React Router: import { useLocation } from 'react-router-dom';

// ---- Variants for the Main Content ----
const contentGlitchVariants: Variants = {
  initial: {
    opacity: 0.8,
    // 1. Vertical Stretch (V-Sync loss simulation)
    scaleY: 1.2,
    scaleX: 0.95,
    // 2. Horizontal Jitter (Signal instability)
    x: ["2%", "-2%", "1%", "-1%", "0%"],
    // 3. Brightness flash
    filter: [
      "brightness(2) contrast(0.8) blur(2px)",
      "brightness(1) contrast(1) blur(0px)",
    ],
  },
  animate: {
    opacity: 1,
    scaleY: 1,
    scaleX: 1,
    x: 0,
    filter: "brightness(1) contrast(1) blur(0px)",
    transition: {
      // The spring makes it "snap" back into place satisfyingly
      type: "spring" as const,
      stiffness: 400,
      damping: 20,
      mass: 0.5,
      // The jitter needs to happen fast
      x: { duration: 0.2, ease: "linear" },
      filter: { duration: 0.2 },
    },
  },
  // Optional: A quick squeeze on exit
  exit: {
    opacity: 0,
    scaleY: 0.9,
    filter: "brightness(1.5) blur(4px)",
    transition: { duration: 0.1 },
  },
};

// ---- Variants for the Static Overlay ----
const staticFlashVariants = {
  initial: { opacity: 0 },
  trigger: {
    opacity: [0, 1, 0.8, 0], // Flash in, flicker slightly, fade out
    transition: {
      duration: 0.3, // Total time for static burst
      times: [0, 0.1, 0.3, 1], // Control the flicker timing
      ease: "linear" as const,
    },
  },
};

const CRTChannelSwitch = ({ children }: { children: React.ReactNode }) => {
  // --- ROUTER INTEGRATION STEP ---
  // You need to get your current route path here to use as the key.
  // Example for Next.js 13+: const pathKey = usePathname();
  // Example for React Router: const location = useLocation(); const pathKey = location.pathname;

  // FOR DEMO PURPOSES, I will assume you pass the key in as a prop named 'routerKey'
  // In real usage, remove this line and uncomment the router hooks above.
  const pathKey = "REPLACE_WITH_ACTUAL_ROUTER_PATH";

  return (
    // AnimatePresence enables the 'exit' animations before the new one mounts
    <AnimatePresence mode="wait">
      <div
        key={pathKey}
        className="relative w-full h-full overflow-hidden bg-black"
      >
        {/* 1. The Static Overlay Layer (Flashes on top) */}
        <motion.div
          className="crt-static-overlay"
          variants={staticFlashVariants}
          initial="initial"
          animate="trigger"
          // Important: ensure it doesn't re-trigger on exit
          exit="initial"
        />

        {/* 2. The Actual Page Content (Distorts and settles) */}
        <motion.div
          className="w-full h-full relative z-10"
          variants={contentGlitchVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CRTChannelSwitch;
