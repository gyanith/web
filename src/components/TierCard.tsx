"use client";

import React from "react";
import PixelCard from "./PixelCard";
import { ArrowUpRight, MoveRight, QrCode } from "lucide-react";
import { pressStart2P, unispace } from "@/fonts/fonts";
import { StaticImageData } from "next/image";
import Image from "next/image";

interface TierCardProps {
  tier: number;
  tierPic: StaticImageData;
  title: string;
  price: string;
  onBuy: () => void;
  className?: string;
  buttonText?: string;
}

const TierCard: React.FC<TierCardProps> = ({
  tier,
  tierPic,
  title,
  price,
  onBuy,
  className = "",
  buttonText = "Buy A Ticket",
}) => {
  return (
    <div className={`relative w-full h-full group ${className}`}>
      <PixelCard
        variant="default"
        gap={10}
        speed={15}
        colors="#000000,#d4da57,#a3a3a3" // Grayscale/Silver-ish sparkles
        noFocus={false}
        className="w-full h-full rounded-none bg-[#E0E2D9] border-none" // Beige/Off-white background matching the ref
      >
        <div className="absolute inset-0 p-6 flex flex-col gap-2 justify-between text-black z-10 pointer-events-none">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <h2
              className={`text-4xl font-bold uppercase tracking-tighter ${unispace.className}`}
            >
              {title}
            </h2>
            {/* Tribal/Graphic Placeholder */}
            <div className="w-12 h-8">
              <svg
                viewBox="0 0 100 60"
                fill="currentColor"
                className="w-full h-full text-black"
              >
                <path d="M10,30 Q30,5 50,30 T90,30 Q70,55 50,30 T10,30" />
                <path
                  d="M20,30 Q40,15 50,30 T80,30"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>

          <div className="w-full relative h-full bg-[#070A10] flex items-center justify-center">
            <Image
              src={tierPic}
              alt="tier pic"
              fill
              unoptimized
              className="w-full absolute object-cover h-full mix-blend-difference"
            />
          </div>

          {/* Tech Specs & ID Section */}
          <div className="flex flex-col gap-2 mt-auto mb-4">
            {/* Tech Specs Line */}
            <div
              className={`flex justify-between text-[10px] uppercase text-black ${unispace.className} tracking-widest font-semibold`}
            >
              <span>2000x2000PX</span>
              <span>PNG</span>
              <span>RGB8</span>
              <span className="bg-[#FFFF00] text-black px-1 rounded font-bold">
                AMO22
              </span>
            </div>

            {/* Bottom ID Section */}
            <div className="flex items-center gap-2 z-10 border border-black/20 backdrop-blur-lg p-2 bg-black/20">
              {/* Holographic Sticker Simulation */}
              <div className="w-10 h-10 rounded bg-gradient-to-br from-cyan-300 via-purple-300 to-yellow-300 opacity-80 animate-pulse shrink-0"></div>

              <div className="flex flex-col grow min-w-0">
                <span
                  className={`${pressStart2P.className} text-xl text-black leading-none`}
                >
                  00{tier}
                </span>
                <span
                  className={`${unispace.className} text-[10px] text-black/70 tracking-widest uppercase truncate`}
                >
                  "{title}"
                </span>
              </div>

              {/* QR Code */}
              <div className="bg-white p-1 rounded shrink-0">
                <QrCode size={24} className="text-black" />
              </div>
            </div>

            <div className="flex justify-between items-center text-[8px] text-black uppercase">
              <span>prototype#01</span>
              <span>AAC22011000{tier}S</span>
            </div>
          </div>

          {/* Footer Price & Button */}
          <div className="relative pointer-events-auto">
            <div className="bg-[#1a1a1a] rounded-full p-1.5  flex items-center justify-between shadow-2xl">
              <span
                className={`text-white text-md ml-2 font-medium ${unispace.className}`}
              >
                {price}
              </span>

              <button
                onClick={onBuy}
                className="bg-white cursor-pointer text-black px-4 py-2 rounded-full text-sm font-bold uppercase flex items-center gap-2 hover:bg-[#E0E2D9] transition-colors"
              >
                {buttonText}
                <MoveRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};

export default TierCard;
