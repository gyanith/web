import { ComingSoon } from "@/components/ui/coming-soon";

export default function ResetPasswordPage() {
  return (
    <ComingSoon
      title="Reset Offline"
      message="Password reset is disabled for this static archive."
      showBackButton={true}
    />
  );
}

/*
// Latent dynamic implementation:
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/backup/lib/appwrite/appwrite.client";
import { unispace, pressStart2P } from "@/fonts/fonts";
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!userId || !secret) {
      setStatus("error");
      setErrorMessage("Invalid recovery link. Please request a new one.");
    }
  }, [userId, secret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setStatus("error");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      setStatus("error");
      return;
    }

    if (!userId || !secret) return;

    setStatus("loading");
    setErrorMessage("");

    try {
      await account.updateRecovery(userId, secret, password);
      setStatus("success");
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error: any) {
      console.error("Reset Error:", error);
      setStatus("error");
      setErrorMessage(error.message || "Failed to reset password");
    }
  };

  if (status === "success") {
    return (
      <div
        className="w-full max-w-md bg-[#070a10]/95 backdrop-blur-xl border border-[#d4a574]/30 p-1 shadow-[0_0_50px_rgba(212,165,116,0.1)]"
        style={{
          clipPath:
            "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
        }}
      >
        <div
          className="border border-[#d4a574]/10 p-8 flex flex-col gap-6 bg-black/40 text-center"
          style={{
            clipPath:
              "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
          }}
        >
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#d4a574]/10 border border-[#d4a574]/50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-[#d4a574]" />
            </div>
          </div>
          <h1
            className={`${pressStart2P.className} text-xl text-white uppercase leading-relaxed`}
          >
            Access Restored
          </h1>
          <p className={`${unispace.className} text-zinc-400 text-sm`}>
            Your password has been successfully updated. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-md bg-[#070a10]/95 backdrop-blur-xl border border-[#d4a574]/30 p-1 shadow-[0_0_50px_rgba(212,165,116,0.1)]"
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
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div
              className={`text-[#d4a574] text-xs tracking-[0.3em] uppercase ${unispace.className}`}
            >
              System Access
            </div>
          </div>
          <h1
            className={`${pressStart2P.className} text-xl md:text-2xl text-white uppercase leading-relaxed`}
          >
            Reset Password
          </h1>
          <div className="h-[1px] w-full bg-linear-to-r from-transparent via-[#d4a574]/50 to-transparent" />
        </div>

        {status === "error" && errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-red-900/20 border-l-2 border-red-500 p-3 text-red-400 text-xs font-mono"
          >
            [ERROR]: {errorMessage}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
            >
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none transition-colors rounded-none placeholder-zinc-700 font-mono text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none transition-colors rounded-none placeholder-zinc-700 font-mono text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading" || !userId}
            className={`w-full bg-[#d4a574] text-black font-bold uppercase py-4 tracking-widest hover:bg-[#b88d5e] transition-colors relative overflow-hidden group disabled:opacity-50 disabled:cursor-wait cursor-pointer ${unispace.className}`}
            style={{
              clipPath:
                "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
            }}
          >
            {status === "loading" ? (
              <span className="flex items-center justify-center gap-2 animate-pulse">
                UPDATING...
              </span>
            ) : (
              <span className="relative z-10 flex items-center justify-center gap-2">
                UPDATE CREDENTIALS
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black text-white p-4">
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 50%, #070a10 40%, #d4a57415 70%, #d4a57430 100%)",
        }}
      />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />

      <Suspense
        fallback={
          <div className="text-[#d4a574]">Initializing Secure Channel...</div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
*/
