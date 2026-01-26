"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { garetBook, pressStart2P, unispace } from "@/fonts/fonts";

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tierData: {
    tier: number;
    title: string;
    price: string;
    description: string;
    features: string[];
  } | null;
  onBuy: () => void;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  onClose,
  tierData,
  onBuy,
}) => {
  if (!tierData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#E0E2D9]  p-8 overflow-hidden shadow-2xl z-10"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-6 right-6 text-black/50 hover:text-black transition-colors z-50 cursor-pointer p-2"
            >
              <X size={24} />
            </button>

            <div className="relative z-10 flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-start">
                  <span
                    className={`${unispace.className} text-xs text-black/60 uppercase tracking-widest`}
                  >
                    Selected Tier
                  </span>

                  {/* Tribal/Graphic Placeholder Mini */}
                  <div className="w-8 h-5 opacity-50">
                    <svg
                      viewBox="0 0 100 60"
                      fill="currentColor"
                      className="w-full h-full text-black"
                    >
                      <path d="M10,30 Q30,5 50,30 T90,30 Q70,55 50,30 T10,30" />
                    </svg>
                  </div>
                </div>

                <h2
                  className={`${pressStart2P.className} text-2xl mt-3 text-black uppercase tracking-tighter`}
                >
                  {tierData.title}
                </h2>
                <div className="flex items-baseline gap-2 mt-2">
                  <span
                    className={`${unispace.className} text-3xl font-bold text-black`}
                  >
                    {tierData.price}
                  </span>
                  <span className="text-[0.6rem] uppercase font-bold text-black/50">
                    INR
                  </span>
                </div>
              </div>

              <div className="h-px w-full bg-black/10"></div>

              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-widest text-black/80">
                  INCLUDES
                </h3>
                {tierData.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 text-black">
                    <div className="mt-0.5">
                      <Check size={16} className="text-black" strokeWidth={3} />
                    </div>
                    <span
                      className={`${garetBook.className} text-md leading-relaxed font-medium`}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-black/10 space-y-2">
                <h3 className="font-bold text-[0.6rem] uppercase tracking-widest text-black/40">
                  WARNING
                </h3>
                <p className="text-[0.6rem] leading-tight font-medium uppercase text-black/60 text-justify">
                  Non-refundable. Verify event dates.
                </p>
              </div>

              <button
                onClick={onBuy}
                className={`w-full cursor-pointer py-4 mt-2 bg-[#1a1a1a] text-white font-bold uppercase tracking-wider hover:bg-black transition-all duration-300 rounded-full flex items-center justify-center gap-2 shadow-lg ${unispace.className}`}
              >
                Proceed to Payment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TicketDetailModal;
