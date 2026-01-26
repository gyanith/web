"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { pressStart2P, unispace } from "@/fonts/fonts";

interface ToastProps {
  isVisible: boolean;
  title: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({
  isVisible,
  title,
  description,
  buttonText,
  onButtonClick,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "backOut" }}
          className="fixed bottom-8 right-4 md:right-8 z-[9999] max-w-sm w-full"
        >
          <div className="bg-[#070a10] border-l-4 border-[#d4a574] rounded-lg shadow-[0_0_30px_rgba(212,165,116,0.15)] overflow-hidden relative">
            {/* Background Gradient */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                background:
                  "linear-gradient(45deg, transparent 0%, #d4a574 100%)",
              }}
            />

            <div className="p-5 relative z-10 flex gap-4">
              {/* Content */}
              <div className="flex-1 space-y-2">
                <h3
                  className={`${pressStart2P.className} text-[#d4a574] text-xs leading-5 uppercase tracking-wide`}
                >
                  {title}
                </h3>
                {description && (
                  <p
                    className={`${unispace.className} text-white/70 text-xs leading-relaxed`}
                  >
                    {description}
                  </p>
                )}

                {/* Action Button */}
                {buttonText && onButtonClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onButtonClick();
                    }}
                    className={`mt-2 flex items-center gap-2 text-[10px] bg-[#d4a574]/10 hover:bg-[#d4a574]/20 border border-[#d4a574]/30 hover:border-[#d4a574] text-[#d4a574] px-3 py-2 rounded transition-all active:scale-95 ${unispace.className}`}
                  >
                    {buttonText}
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-white/30 hover:text-white h-6 w-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress Bar (Optional, simpler to just have auto-dismiss logic in context) */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-1 bg-[#d4a574] absolute bottom-0 left-0"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
