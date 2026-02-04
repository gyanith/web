"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { loginWithEmail } from "@/lib/actions/auth.actions";
import { z } from "zod";
import { unispace, pressStart2P } from "@/fonts/fonts";
import { useNavigate } from "@/hooks/useNavigate";
import { ChevronRight, Activity } from "lucide-react";
import BiometricScanner from "@/my_components/BiometricScanner";
import Link from "next/link";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateLogin = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    setIsLoading(true);
    setErrors({});
    setShowScanner(true);

    try {
      const result = await loginWithEmail({
        email: formData.email,
        password: formData.password,
      });

      if (!result.success) {
        setErrors({ general: result.error || "Login failed" });
        setIsLoading(false);
        setShowScanner(false);
        return;
      }

      setTimeout(() => {
        router.refresh();
        navigate(redirectUrl);
      }, 1500);
    } catch (err: any) {
      setErrors({ general: err.message || "Authentication failed" });
      setIsLoading(false);
      setShowScanner(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-black text-white p-4">
      {/* Background SVGs */}
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

      {showScanner && <BiometricScanner />}

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
            {/* Header */}
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
                Welcome User
              </h1>
              <div className="h-[1px] w-full bg-linear-to-r from-transparent via-[#d4a574]/50 to-transparent" />
            </div>

            {/* Error Display */}
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

            {/* Form Fields */}
            <div onKeyDown={handleKeyDown} className="space-y-6 shrink-0">
              <div className="group">
                <label
                  className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                >
                  Identity // Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none transition-colors rounded-none placeholder-zinc-700 disabled:opacity-50 font-mono text-sm"
                  placeholder="user@gyanith.org"
                />
                {errors.email && (
                  <span className="text-red-500 text-[10px] mt-1 block">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="group">
                <label
                  className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                >
                  Security // Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none transition-colors rounded-none placeholder-zinc-700 font-mono text-sm"
                  placeholder="********"
                />
                {errors.password && (
                  <span className="text-red-500 text-[10px] mt-1 block">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-zinc-500 hover:text-[#d4a574] transition-colors font-mono hover:underline decoration-[#d4a574] cursor-pointer"
                >
                  [ Recover Access ]
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className={`w-full bg-[#d4a574] text-black font-bold uppercase py-4 tracking-widest hover:bg-[#b88d5e] transition-colors relative overflow-hidden group disabled:opacity-50 disabled:cursor-wait cursor-pointer ${unispace.className}`}
                style={{
                  clipPath:
                    "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                }}
              >
                {isLoading ? (
                  <span className="animate-pulse">PROCESSING...</span>
                ) : (
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    INITIATE SESSION
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              </button>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-[#d4a574]/20 flex justify-between items-center">
              <Link
                href="/auth/signup"
                className="text-zinc-400 text-xs md:text-sm hover:text-[#d4a574] transition-colors font-mono cursor-pointer"
              >
                [ New User? ]
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
