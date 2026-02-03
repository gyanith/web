"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GridScan } from "@/components/GridScan";
import { unispace, montserrat } from "@/fonts/fonts";
import { motion } from "framer-motion";

interface ComingSoonProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export function ComingSoon({
  title = "Coming Soon",
  message = "This feature will be available shortly. Stay tuned!",
  showBackButton = true,
}: ComingSoonProps) {
  return (
    <motion.div
      className={`relative w-screen h-screen flex flex-col items-center justify-center min-h-[60vh] p-4 text-center space-y-6 overflow-hidden ${montserrat.className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
      <div className="w-full h-full absolute inset-0 z-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={0.75}
          linesColor="#392e4e"
          gridScale={0.08}
          scanColor="#D4A574"
          scanOpacity={0.5}
          enablePost
          bloomIntensity={0.7}
          chromaticAberration={0.007}
          noiseIntensity={0}
          scanSoftness={3}
          enableGyro={true}
          scanDuration={5}
          scanDirection="forward"
        />
      </div>

      <div className="space-y-4 relative z-10">
        <h1
          className={`text-4xl font-bold tracking-widest sm:text-5xl md:text-6xl text-[#d4a574] uppercase ${unispace.className}`}
          style={{ textShadow: "0 0 20px rgba(212,165,116,0.3)" }}
        >
          {title}
        </h1>
        <p className="max-w-[600px] text-white/60 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto tracking-wide">
          {message}
        </p>
      </div>

      {showBackButton && (
        <Link href="/" className="relative z-10">
          <Button
            variant="outline"
            className="gap-2 border-[#d4a574]/30 text-[#d4a574] hover:bg-[#d4a574] hover:text-black transition-all duration-300 bg-black/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      )}
    </motion.div>
  );
}
