"use client";

import React, { useState } from "react";
import Prism from "@/components/Prism";
import TicketDetailModal from "@/components/TicketDetailModal";
import { useRouter } from "next/navigation";

import tier1Pic from "@/assets/tier1.gif";
import tier2Pic from "@/assets/tier2.gif";
import tier3Pic from "@/assets/tier3.gif";

import { TIERS } from "@/data/tiers";
import TierCard from "@/components/TierCard";
import { motion } from "framer-motion";
import { getTicket } from "@/lib/actions/ticket.actions";
import { pressStart2P, unispace } from "@/fonts/fonts";

export default function TicketPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<(typeof TIERS)[0] | null>(
    null,
  );
  // Track hover state for each tier by ID/Index
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userTier, setUserTier] = useState<number | null>(null);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  React.useEffect(() => {
    const fetchUserTicket = async () => {
      const ticket = await getTicket();
      if (ticket && ticket.tier) {
        setUserTier(ticket.tier);
      }
    };
    fetchUserTicket();
  }, []);

  const handleBuy = (tier?: (typeof TIERS)[0]) => {
    const targetTier = tier || selectedTier;
    // Navigate to checkout with the selected tier
    if (targetTier) {
      const query = userTier
        ? `?tier=${targetTier.tier}&upgradeFrom=${userTier}`
        : `?tier=${targetTier.tier}`;
      router.push(`/ticket/checkout${query}`);
    }
  };

  // Filter tiers if user has one
  const visibleTiers = userTier
    ? TIERS.filter((t) => t.tier > userTier)
    : TIERS;

  return (
    <motion.div
      className="w-screen min-h-screen flex flex-col relative bg-black overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
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
        {visibleTiers.length === 0 && userTier ? (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-6 animate-in fade-in zoom-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-[#d4a574] blur-[100px] opacity-20 animate-pulse" />
              <h2
                className={`relative z-10 ${pressStart2P.className} text-2xl md:text-4xl text-[#d4a574] leading-relaxed`}
              >
                MAXIMUM SYNC <br /> REACHED
              </h2>
            </div>

            <p
              className={`${unispace.className} text-white/70 text-sm md:text-xl max-w-2xl tracking-widest leading-loose`}
            >
              YOU HAVE ASCENDED TO THE HIGHEST TIER. <br />
              YOUR NEURAL LINK IS OPTIMIZED FOR FULL PROTOCOL ACCESS.
            </p>

            <div className="mt-8 p-6 border border-[#d4a574]/30 bg-black/50 backdrop-blur-md rounded-xl shadow-[0_0_30px_-5px_#d4a57440]">
              <div className="flex flex-row gap-2 items-center">
                <span className="w-2 h-2 rounded-full bg-[#d4a574] animate-ping" />
                <span
                  className={`${unispace.className} text-[#d4a574] text-xs md:text-sm tracking-[0.3em]`}
                >
                  STATUS: COSMOS // UNLOCKED
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-wrap justify-center gap-8 w-full max-w-7xl">
            {visibleTiers.map((tier, index) => {
              // Calculate upgrade price diff
              let displayPrice = tier.price;
              let isUpgrade = false;

              if (userTier) {
                const currentTierData = TIERS.find((t) => t.tier === userTier);
                if (currentTierData) {
                  const currentPrice =
                    parseInt(currentTierData.price.replace(/[^0-9]/g, "")) || 0;
                  const targetPrice =
                    parseInt(tier.price.replace(/[^0-9]/g, "")) || 0;
                  const diff = targetPrice - currentPrice;
                  displayPrice = `₹${diff}`;
                  isUpgrade = true;
                }
              }

              return (
                <div
                  key={tier.tier}
                  onMouseEnter={() => setHoveredTier(tier.tier)}
                  onMouseLeave={() => setHoveredTier(null)}
                  className={`relative w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-2rem)] ${
                    // Adjust sizing logic based on visible item count if needed, or keep generic
                    ""
                  }`}
                >
                  <div
                    className={`w-full relative aspect-[3/5] md:aspect-[3/4.5]`}
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
                      price={displayPrice}
                      buttonText={isUpgrade ? "UPGRADE" : "Buy A Ticket"}
                      onBuy={() => {
                        setSelectedTier(tier);
                        // If it's a direct buy from card (not modal), we might want to open modal?
                        // The original code passed `setSelectedTier(tier)` which opens the modal.
                        // The modal then calls `handleBuy`.
                        // We need to make sure the modal also shows the correct price/upgrade status?
                        // For now, let's assuming modal shows static info, but `handleBuy` handles the flow.
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <TicketDetailModal
        isOpen={!!selectedTier}
        onClose={() => setSelectedTier(null)}
        tierData={selectedTier}
        onBuy={() => handleBuy()}
      />
    </motion.div>
  );
}
