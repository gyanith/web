"use client";

import { motion } from "framer-motion";
import { garetBook, pressStart2P, unispace } from "@/fonts/fonts";
import Footer from "@/my_components/Footer";
import Noise from "@/my_components/Noise";
import { ReactNode } from "react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div
      className={`${garetBook.className} min-h-screen w-full bg-[#05070a] text-zinc-300 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200`}
    >
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16 space-y-6"
        >
          <div className="inline-block relative">
            <h1
              className={`${pressStart2P.className} text-3xl md:text-5xl lg:text-6xl bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent leading-relaxed py-2`}
            >
              {title}
            </h1>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full" />
          </div>

          <p
            className={`${unispace.className} text-sm md:text-base text-cyan-400 tracking-widest uppercase opacity-80`}
          >
            Last Updated: {lastUpdated}
          </p>
        </motion.div>

        {/* Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Glass Border */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-3xl blur-[1px]" />

          <div className="relative bg-[#0a0c12]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-12 shadow-2xl">
            <div
              className="prose prose-invert prose-lg max-w-none 
              prose-headings:font-normal prose-headings:text-white prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mb-6 prose-h2:mt-12 prose-h2:border-l-4 prose-h2:border-cyan-500 prose-h2:pl-4
              prose-p:text-zinc-400 prose-p:leading-relaxed
              prose-strong:text-cyan-200
              prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:text-cyan-300 hover:prose-a:underline
              prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-cyan-500"
            >
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
