"use client";

import React, { useState } from "react";
import Prism from "@/components/Prism";
import TicketDetailModal from "@/components/TicketDetailModal";
import { useRouter } from "next/navigation";
import PixelCard from "@/components/PixelCard";
import FuzzyText from "@/my_components/FuzzyText";
import Footer from "@/my_components/Footer";
import Image from "next/image";

import tier1Pic from "@/assets/tier1.gif";
import tier2Pic from "@/assets/tier2.gif";
import tier3Pic from "@/assets/tier3.gif";

import { TIERS } from "@/data/tiers";
import TierCard from "@/components/TierCard";

export default function TicketPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<(typeof TIERS)[0] | null>(
    null,
  );
  // Track hover state for each tier by ID/Index
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleBuy = () => {
    // Navigate to checkout with the selected tier
    if (selectedTier) {
      router.push(`/ticket/checkout?tier=${selectedTier.tier}`);
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col relative bg-black overflow-x-hidden">
      {/* Background Prism */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <Prism
          animationType="3drotate"
          timeScale={0.2}
          height={6}
          baseWidth={10}
          scale={1.5}
          hueShift={-0.34}
          colorFrequency={1.5}
          noise={0.1}
          glow={0.75}
        />
      </div>

      {/* Main Content */}
      <main className="flex-grow flex min-h-screen pb-32 lg:pb-auto items-center justify-center z-10 w-full p-4 md:p-8 md:pt-10">
        <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 w-full max-w-7xl">
          {TIERS.map((tier, index) => (
            <div
              key={tier.tier}
              onMouseEnter={() => setHoveredTier(tier.tier)}
              onMouseLeave={() => setHoveredTier(null)}
              className={`relative w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-2rem)] ${
                index === 2 ? "md:w-full lg:w-[calc(33.33%-2rem)]" : ""
              }`}
            >
              <div
                className={`w-full relative aspect-[3/5] md:aspect-[3/4.5] ${
                  index === 2 ? "md:aspect-[16/9] lg:aspect-[3/4.5]" : ""
                }`}
              >
                <TierCard
                  tier={tier.tier}
                  tierPic={
                    tier.tier === 1
                      ? tier1Pic
                      : tier.tier === 2
                        ? tier2Pic
                        : tier3Pic
                  }
                  title={tier.title}
                  price={tier.price}
                  onBuy={() => setSelectedTier(tier)}
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      <TicketDetailModal
        isOpen={!!selectedTier}
        onClose={() => setSelectedTier(null)}
        tierData={selectedTier}
        onBuy={handleBuy}
      />
    </div>
  );
}
