/*  */
"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import techEvents from "@/assets/techEvents.png";
import workshopEvent from "@/assets/workshopEvent.png";
import funEvents from "@/assets/funEvents.png";

const columns = [
  { title: "Workshops", img: workshopEvent, href: "/events/workshop" },
  { title: "Tech Events", img: techEvents, href: "/events/tech" },
  { title: "Fun Events", img: funEvents, href: "/events/fun" },
];

/* New imports */
import { useState } from "react";
import SimpleSpinner from "@/my_components/SimpleSpinner";

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  return (
    <motion.div
      className="w-screen h-screen bg-black flex flex-col md:flex-row overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
      {/* Global Loader Overlay if desired, currently using per-column logic but blocking interaction */}
      {loading && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center cursor-wait">
          {/* Optional: Generic loader if not using the per-column one, 
                but based on design we might want to just show it over the clicked item or full screen.
                Let's do full screen simplified loader for clarity.
            */}
          <SimpleSpinner size={80} className="z-60" />
        </div>
      )}

      {columns.map((col, index) => (
        <motion.div
          key={index}
          className="relative w-full h-full flex-1 border-r border-white/10 last:border-r-0 group cursor-pointer"
          onClick={() => {
            if (loading) return;
            setLoading(true);
            setLoadingIndex(index);
            // Small delay to show the loader before navigating
            setTimeout(() => {
              router.push(col.href);
            }, 500);
          }}
        >
          {/* Gradient */}
          <div className="absolute inset-0 bg-linear-to-r md:from-transparent md:via-transparent md:to-black from-black via-transparent to-transparent h-full w-full z-10" />

          {/* Background Image */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <Image
              src={col.img}
              alt={col.title}
              fill
              objectPosition="top"
              className="object-cover brightness-60 group-hover:brightness-90 group-hover:scale-105 transform-all ease-in-out duration-300"
              priority
            />
          </div>

          {/* Text Container */}
          <h2
            className="
              absolute z-10 font-mono font-extrabold text-white mix-blend-color-dodge uppercase tracking-tighter leading-none whitespace-nowrap
              select-none cursor-pointer

              /* 1. Mobile (< md): Top Left, Horizontal */
              top-5 left-5

              /* 2. Tablet (md to lg): Top Right, Vertical */
              md:left-auto md:right-5 md:top-5 md:bottom-auto
              md:[writing-mode:vertical-rl] 
              md:rotate-180

              /* 3. Desktop (>= lg): Bottom Right, Vertical */
              lg:top-auto lg:bottom-0 lg:right-0
              lg:p-8

              
              transition-all
              duration-300

            "
            style={{
              fontSize: "clamp(3rem, 5vw, 6rem)",
            }}
          >
            {col.title}
          </h2>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Page;
