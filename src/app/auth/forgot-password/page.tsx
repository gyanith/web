import { ComingSoon } from "@/components/ui/coming-soon";

export default function ForgotPasswordPage() {
  return (
    <ComingSoon
      title="Recovery Offline"
      message="Account recovery is disabled for this static archive."
      showBackButton={true}
    />
  );
}

/*
// Latent dynamic implementation:
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { account } from "@/backup/lib/appwrite/appwrite.client";
import { unispace, pressStart2P } from "@/fonts/fonts";
import { ChevronRight, Activity, Mail } from "lucide-react";
import Link from "next/link";

function LatentForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSendRecovery = async () => {
    if (!email) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      await account.createRecovery(email, redirectUrl);
      setSuccess(true);
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to send recovery email" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendRecovery();
  };

  if (success) {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-black text-white p-4">
        {/* Background SVGs * /}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            className="absolute top-0 left-0 w-full h-full opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#d4a574"
                strokeWidth="0.5"
              />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#d4a57450] blur-[90px] rounded-full" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#d4a57435] blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-full max-w-md"
        >
          <div
            className="bg-[#070a10]/95 backdrop-blur-xl border border-[#d4a574]/30 p-1 shadow-[0_0_50px_rgba(212,165,116,0.1)]"
            style={{
              clipPath:
                "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
            }}
          >
            <div
              className="border border-[#d4a574]/10 p-6 md:p-8 flex flex-col gap-8 bg-black/40 text-center"
              style={{
                clipPath:
                  "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
              }}
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-[#d4a574]/10 border border-[#d4a574]/50 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-[#d4a574]" />
                </div>
              </div>

              <div className="space-y-3">
                <h1
                  className={`${pressStart2P.className} text-xl text-white uppercase leading-relaxed`}
                >
                  Check Your Email
                </h1>
                <p
                  className={`${unispace.className} text-zinc-400 text-sm leading-relaxed`}
                >
                  Recovery instructions have been sent to:{" "}
                  <span className="text-[#d4a574] block mt-2">{email}</span>
                </p>
              </div>

              <div className="pt-6 border-t border-[#d4a574]/20">
                <Link
                  href="/auth/login"
                  className="text-zinc-400 text-sm hover:text-[#d4a574] transition-colors font-mono cursor-pointer"
                >
                  ← Back to Login
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-black text-white p-4">
      {/* Background SVGs * /}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute top-0 left-0 w-full h-full opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#d4a574"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#d4a57450] blur-[90px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-[#d4a57435] blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="bg-[#070a10]/95 backdrop-blur-xl border border-[#d4a574]/30 p-1 shadow-[0_0_50px_rgba(212,165,116,0.1)]"
          style={{
            clipPath:
              "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
          }}
        >
          <div
            className="border border-[#d4a574]/10 p-6 md:p-8 flex flex-col gap-8 bg-black/40"
            style={{
              clipPath:
                "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
            }}
          >
            {/* Header * /}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-[#d4a574]" />
                <div
                  className={`text-[#d4a574] text-xs tracking-[0.3em] uppercase ${unispace.className}`}
                >
                  System Access
                </div>
              </div>
              <h1
                className={`${pressStart2P.className} text-xl md:text-2xl text-white uppercase leading-relaxed`}
              >
                Recover Access
              </h1>
              <p
                className={`${unispace.className} text-zinc-400 text-xs leading-relaxed`}
              >
                Enter your email to receive reset instructions
              </p>
              <div className="h-[1px] w-full bg-linear-to-r from-transparent via-[#d4a574]/50 to-transparent" />
            </div>

            {/* Error Display * /}
            <AnimatePresence>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-900/20 border-l-2 border-red-500 p-3 text-red-400 text-xs font-mono"
                >
                  [ERROR]: {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form * /}
            <div onKeyDown={handleKeyDown} className="space-y-6">
              <div className="group">
                <label
                  className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                >
                  Identity // Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({});
                  }}
                  className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none transition-colors rounded-none placeholder-zinc-700 font-mono text-sm"
                  placeholder="user@gyanith.org"
                  autoFocus
                />
                {errors.email && (
                  <span className="text-red-500 text-[10px] mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSendRecovery}
                disabled={isLoading}
                className={`w-full bg-[#d4a574] text-black font-bold uppercase py-4 tracking-widest hover:bg-[#b88d5e] transition-colors relative overflow-hidden group disabled:opacity-50 disabled:cursor-wait cursor-pointer ${unispace.className}`}
                style={{
                  clipPath:
                    "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                }}
              >
                {isLoading ? (
                  <span className="animate-pulse">SENDING...</span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    SEND RECOVERY LINK
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              </button>
            </div>

            {/* Footer * /}
            <div className="pt-6 border-t border-[#d4a574]/20">
              <Link
                href="/auth/login"
                className="text-zinc-400 text-sm hover:text-[#d4a574] transition-colors font-mono cursor-pointer"
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
*/
