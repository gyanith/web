"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { proshows, Proshow } from "@/data/info";
import { unispace, superRetro, garetBook } from "@/fonts/fonts";
import { getImageUrl } from "@/backup/lib/helpers/imageStorage.helper";

const PROSHOW_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_PROSHOWS_BUCKET_ID;

function ProshowSection({ show, index }: { show: Proshow; index: number }) {
  const accent = show.accentColor ?? "#d4a574";
  const imageUrl = getImageUrl(PROSHOW_BUCKET_ID!, show.imageId);

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={imageUrl}
            alt={show.title}
            fill
            priority={index === 0}
            className="object-cover object-center"
            sizes="100vw"
            // Tip: If using Appwrite, Next.js optimization usually helps
            // smoothness more than "unoptimized" does due to smaller file sizes.
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = "0";
            }}
          />
        </div>
      </div>

      {/* Visual Overlays */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, #000000 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 60%, transparent 100%)",
        }}
      />

      {/* Accent Glow Decoration */}
      <div
        className="absolute z-10 pointer-events-none opacity-50"
        style={{
          top: "-5%",
          right: "-5%",
          width: "50vw",
          height: "50vw",
          maxWidth: 500,
          background: `radial-gradient(circle at center, ${accent}40 0%, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Info Badge */}
      <div className="absolute top-8 left-0 right-0 lg:left-auto lg:right-10 z-20 flex items-center justify-center lg:justify-end px-6">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex items-center gap-4 py-2 px-5 backdrop-blur-md"
          style={{
            border: `1px solid ${accent}44`,
            background: `linear-gradient(135deg, ${accent}15 0%, rgba(0,0,0,0.6) 100%)`,
            clipPath:
              "polygon(0 0, 95% 0, 100% 25%, 100% 100%, 5% 100%, 0 75%)",
          }}
        >
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          <div className="flex flex-col">
            <span
              className={`${unispace.className} text-[10px] tracking-[0.3em] uppercase opacity-50`}
              style={{ color: accent }}
            >
              GYANITH 2K25
            </span>
            <span
              className={`${unispace.className} text-xl tracking-[0.2em] font-bold uppercase`}
              style={{ color: accent }}
            >
              Day {show.day}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className="absolute inset-0 z-20 flex flex-col items-start justify-end px-6 sm:px-12 lg:px-20 pb-16 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} // Custom cubic-bezier for "slick" reveal
          className="w-full max-w-2xl text-left"
        >
          <h2
            className={`${superRetro.className} text-3xl sm:text-5xl md:text-8xl text-white mb-4 uppercase`}
          >
            {show.title}
          </h2>

          <motion.div
            className="h-1 w-16 mb-6"
            style={{ backgroundColor: accent }}
            initial={{ width: 0 }}
            whileInView={{ width: 64 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />

          <p
            className={`${garetBook.className} text-base sm:text-lg text-white/60 leading-relaxed max-w-xl`}
          >
            {show.description}
          </p>
        </motion.div>
      </div>

      {/* Bottom Divider */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 h-px opacity-20"
        style={{ backgroundColor: accent }}
      />
    </section>
  );
}

export default function ProshowsPage() {
  return (
    <main className="bg-[#070a10] selection:bg-white/20">
      {proshows.map((show, i) => (
        <ProshowSection key={show.id} show={show} index={i} />
      ))}
    </main>
  );
}
