"use client";

import React from "react";
import Image from "next/image";
import { pressStart2P, unispace } from "@/fonts/fonts";
import { QrCode } from "lucide-react";

interface TicketCardProps {
  tier: number;
  title: string;
  price: string;
  accentColor: string;
  onClick: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  tier,
  title,
  price,
  accentColor,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="group absolute w-full max-w-[320px] aspect-[3/4.5] rounded-3xl bg-black border-[3px] p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
      style={{ borderColor: "white" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-2xl uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 ${pressStart2P.className}`}
          style={{
            textShadow: `0 0 10px ${accentColor}`,
          }}
        >
          {title}
        </h2>
      </div>

      {/* Main Visual - Portal/Sphere Effect */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-white/20">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>

        {/* Abstract shape in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-1/2 h-1/2 rounded-full blur-xl"
            style={{ backgroundColor: accentColor }}
          ></div>
          <div className="w-1/3 h-1/3 rounded-full bg-black relative z-10 border border-white/50 shadow-[0_0_20px_inset_rgba(255,255,255,0.2)]"></div>
        </div>

        {/* Scan lines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30"></div>
      </div>

      {/* Footer / Info Area */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Tech Specs Line */}
        <div
          className={`flex justify-between text-[10px] uppercase text-white/70 ${unispace.className} tracking-widest`}
        >
          <span>2000x2000PX</span>
          <span>PNG</span>
          <span>RGB8</span>
          <span className="bg-[#FFFF00] text-black px-1 rounded font-bold">
            AMO22
          </span>
        </div>

        {/* Bottom ID Section */}
        <div className="flex items-center gap-3 border-2 border-white/20 rounded-xl p-2 bg-white/5">
          {/* Holographic Sticker Simulation */}
          <div className="w-12 h-12 rounded bg-gradient-to-br from-cyan-300 via-purple-300 to-yellow-300 opacity-80 animate-pulse"></div>

          <div className="flex flex-col grow">
            <span
              className={`${pressStart2P.className} text-3xl text-white leading-none`}
            >
              00{tier}
            </span>
            <span
              className={`${unispace.className} text-xs text-white/80 tracking-widest uppercase`}
            >
              "{title}"
            </span>
          </div>

          {/* QR Code */}
          <div className="bg-white p-1 rounded">
            <QrCode size={32} className="text-black" />
          </div>
        </div>

        <div className="flex justify-between items-center text-[8px] text-white/40 uppercase">
          <span>prototype#01</span>
          <span>AAC22011000{tier}S</span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
