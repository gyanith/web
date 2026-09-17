"use client";

import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import {
  loginWithEmail,
  signUpWithEmail,
  completeOAuthSignup,
  setSessionCookie,
} from "@/backup/lib/actions/auth.actions";

import { account } from "@/backup/lib/appwrite/appwrite.client";
import { OAuthProvider } from "appwrite";
import { z } from "zod";

import { unispace, pressStart2P } from "@/fonts/fonts";
import FormField from "@/my_components/FormField";
import GenderDropdown from "@/my_components/Dropdown";
import { useNavigate } from "@/hooks/useNavigate";
import {
  ChevronRight,
  Loader2,
  ScanLine,
  Fingerprint,
  Activity,
} from "lucide-react";
import RetroSelect from "@/my_components/RetroSelect";

// --- Zod Schemas ---
const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const step2Schema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  gender: z.string().min(1, "Please select a gender"),
  collegeName: z.string().min(2, "College name must be at least 2 characters"),
});

const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// --- Biometric Scanner Component ---
const BiometricScanner = () => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#070a10]/95 backdrop-blur-sm">
      <div className="relative w-48 h-64 border-2 border-[#d4a574]/30 rounded-lg overflow-hidden flex items-center justify-center">
        {/* HUD Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#d4a574]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#d4a574]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#d4a574]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#d4a574]" />

        {/* Fingerprint Icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Fingerprint
            className="w-32 h-32 text-[#d4a574]/20"
            strokeWidth={1}
          />
        </motion.div>

        {/* Scanning Laser */}
        <motion.div
          className="absolute top-0 left-0 w-full h-1 bg-[#d4a574] shadow-[0_0_15px_rgba(212,165,116,0.8)]"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
      </div>

      {/* Loading Text */}
      <div className="mt-8 space-y-2 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={`text-[#d4a574] text-sm tracking-[0.2em] uppercase ${unispace.className}`}
        >
          Authenticating
        </motion.div>
        <div className="flex gap-1 justify-center">
          <motion.div
            className="w-1 h-1 bg-[#d4a574]"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-1 h-1 bg-[#d4a574]"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-1 h-1 bg-[#d4a574]"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
};

// --- Types ---
type AuthClientProps = {
  oauthCompleteMode?: boolean;
  userName?: string;
  userEmail?: string;
};

const AuthClient = ({
  oauthCompleteMode = false,
  userName,
  userEmail,
}: AuthClientProps) => {
  const [isLogin, setIsLogin] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [isNITPY, setIsStudent] = useState(false);
  const [isOAuthComplete, setIsOAuthComplete] = useState(oauthCompleteMode);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const router = useRouter();
  const navigate = useNavigate();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "/";
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (mode === "login") setIsLogin(true);
    else if (mode === "signup") setIsLogin(false);
  }, [mode]);

  useEffect(() => {
    if (mode === "oauth_complete" || oauthCompleteMode) {
      setIsLogin(false);
      setSignupStep(2);
      setIsOAuthComplete(true);
    }
  }, [mode, oauthCompleteMode]);

  const [userId, setUserId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false); // Controls the scanner visibility

  const [formData, setFormData] = useState({
    firstName: userName?.split(" ")[0] || "",
    lastName: userName?.split(" ")[1] || "",
    email: userEmail || "",
    password: "",
    phone: "",
    gender: "",
    collegeName: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Account created! Please login to get access.");
      // Clear the param from URL without refresh if possible, or just leave it.
      // Leaving it is fine for now, or we can use router.replace to clean it up.
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("registered");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [searchParams]);

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

  const validateStep1 = () => {
    try {
      step1Schema.parse(formData);
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

  const validateStep2 = () => {
    try {
      step2Schema.parse(formData);
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

  const validateLogin = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      console.log("ValidateLogin Catch Block Hit", error);
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        console.log("Validation Failed:", newErrors);
        setErrors(newErrors);
      } else {
        console.error("Unknown Validation Error:", error);
      }
      return false;
    }
  };

  const handleEmailAuth = async () => {
    console.log("Email Auth Triggered", {
      isLogin,
      signupStep,
      isOAuthComplete,
      formData,
    });
    // Basic validation first
    if (isLogin) {
      const isValid = validateLogin();
      if (!isValid) {
        console.log("Login Validation Failed");
        return;
      }
      console.log("Login Validation Success!");
    }
    if (signupStep === 1 && !isOAuthComplete && !validateStep1()) return;
    if (signupStep === 2 && !isOAuthComplete && !validateStep2()) return;
    if (signupStep === 3 && otp.length < 6) {
      setErrors({ otp: "Please enter a valid 6-digit OTP" });
      return;
    }

    console.log("Processing Auth...");
    setIsLoading(true);
    setErrors({});

    // If it's the final step (Login OR Signup Final Step), show scanner
    const isFinalStep = isLogin || (signupStep === 3 && !isForgotPassword);
    if (isFinalStep) {
      setShowScanner(true);
    }

    try {
      if (isLogin) {
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

        return;
      }

      if (signupStep === 1 && !isOAuthComplete) {
        const { checkUserExists } =
          await import("@/backup/lib/actions/auth.actions");
        const existsResult = await checkUserExists(formData.email);

        if (existsResult.exists) {
          setErrors({ general: "User already exists. Please login." });
          setIsLoading(false);
          return;
        }

        setSignupStep(2);
        setIsLoading(false);
        return;
      }

      if (signupStep === 2 && !isOAuthComplete) {
        try {
          const sessionToken = await account.createEmailToken(
            "unique()",
            formData.email,
          );
          setUserId(sessionToken.userId);
          setSignupStep(3);
        } catch (error: any) {
          setErrors({ general: error.message || "Failed to send OTP." });
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (signupStep === 3) {
        if (!userId) {
          setErrors({ general: "Session lost. Please try again." });
          setIsLoading(false);
          setShowScanner(false);
          return;
        }

        const { completeSignupWithOtp } =
          await import("@/backup/lib/actions/auth.actions");
        const result = await completeSignupWithOtp(userId, otp, {
          ...formData,
          isNITPY,
        });

        if (!result.success) throw new Error(result.error);

        // Success
        setTimeout(() => {
          // Redirect to Login with success message
          window.location.href = "/auth?mode=login&registered=true";
        }, 2000);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMsg = err.message || "Authentication failed";
      if (
        errorMsg.includes("Invalid token") ||
        errorMsg.includes("user_invalid_token")
      ) {
        errorMsg =
          "Invalid or expired OTP. Please use the most recent code sent to your email.";
      }
      setErrors({ general: errorMsg });
      setIsLoading(false);
      setShowScanner(false);
    }
  };

  const handleModeSwitch = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setIsForgotPassword(false);
    setSignupStep(1);
    setIsOAuthComplete(false);
    setErrors({});
    setFormData((prev) => ({ ...prev, password: "" }));
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: "Please enter your email address" });
      return;
    }
    setIsLoading(true);
    setErrors({});
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      await account.createRecovery(formData.email, redirectUrl);
      setErrors({ general: "Recovery email sent! Check your inbox." });
    } catch (error: any) {
      setErrors({ general: error.message || "Failed to send recovery email" });
    } finally {
      setIsLoading(false);
    }
  };

  /* Manual Key Handler since we removed the form tag */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isForgotPassword) handleForgotPassword();
      else handleEmailAuth();
    }
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
        {/* Retro Sci-Fi Card Container - No Rounded Corners */}
        <div
          className="bg-[#070a10]/95 backdrop-blur-xl border border-[#d4a574]/30 p-1 shadow-[0_0_50px_rgba(212,165,116,0.1)]"
          style={{
            clipPath:
              "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
          }}
        >
          <div
            className="border border-[#d4a574]/10 p-6 md:p-8 flex flex-col gap-8 bg-black/40 min-h-[500px]"
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
                {isLogin
                  ? "Welcome User"
                  : signupStep === 3
                    ? "Verification"
                    : "Initialize"}
              </h1>
              <div className="h-[1px] w-full bg-linear-to-r from-transparent via-[#d4a574]/50 to-transparent" />
            </div>

            {/* Success/Error Display */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-green-900/20 border-l-2 border-green-500 p-3 text-green-400 text-xs font-mono mb-4"
                >
                  [SUCCESS]: {successMessage}
                </motion.div>
              )}
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

            {/* Form Fields - Using div with key handler instead of form for reliability */}
            <div onKeyDown={handleKeyDown} className="space-y-6 shrink-0">
              {/* LOGIN */}
              {isLogin && (
                <>
                  <div className="group">
                    <label
                      className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                    >
                      Identity // Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
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
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setIsLogin(false);
                      }}
                      className="text-xs text-zinc-500 hover:text-[#d4a574] transition-colors font-mono hover:underline decoration-[#d4a574] cursor-pointer"
                    >
                      [ Recover Access ]
                    </button>
                  </div>
                </>
              )}

              {/* SIGNUP STEP 1 */}
              {!isLogin && !isForgotPassword && signupStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none rounded-none font-mono text-sm"
                      />
                      {errors.firstName && (
                        <span className="text-red-500 text-[10px] mt-1 block">
                          {errors.firstName}
                        </span>
                      )}
                    </div>
                    <div>
                      <label
                        className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none rounded-none font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none rounded-none font-mono text-sm"
                    />
                    {errors.email && (
                      <span className="text-red-500 text-[10px] mt-1 block">
                        {errors.email}
                      </span>
                    )}
                  </div>
                  <div>
                    <label
                      className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                    >
                      Create Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none rounded-none font-mono text-sm"
                    />
                    {errors.password && (
                      <span className="text-red-500 text-[10px] mt-1 block">
                        {errors.password}
                      </span>
                    )}
                  </div>
                </>
              )}

              {/* SIGNUP STEP 2 */}
              {!isLogin && !isForgotPassword && signupStep === 2 && (
                <>
                  <div>
                    <label
                      className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                    >
                      Un-encrypted Comms // Phone
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none rounded-none font-mono text-sm"
                      placeholder="10 Digits"
                    />
                    {errors.phone && (
                      <span className="text-red-500 text-[10px] mt-1 block">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 relative">
                    <label
                      className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider ${unispace.className}`}
                    >
                      Gender
                    </label>
                    <RetroSelect
                      value={formData.gender}
                      onChange={(val) => handleInputChange("gender", val)}
                      options={[
                        { value: "MALE", label: "MALE" },
                        { value: "FEMALE", label: "FEMALE" },
                        { value: "OTHER", label: "OTHER" },
                      ]}
                      placeholder="Select Specimen Type..."
                    />
                  </div>

                  <div>
                    <label
                      className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                    >
                      Affiliation // College
                    </label>
                    <input
                      type="text"
                      value={formData.collegeName}
                      onChange={(e) =>
                        handleInputChange("collegeName", e.target.value)
                      }
                      className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none rounded-none font-mono text-sm disabled:text-zinc-500"
                      disabled={isNITPY}
                    />
                    <label className="flex items-center gap-2 mt-4 cursor-pointer group">
                      <div
                        className={`w-4 h-4 border ${isNITPY ? "bg-[#d4a574] border-[#d4a574]" : "border-zinc-600 group-hover:border-[#d4a574]"} flex items-center justify-center transition-colors`}
                      >
                        <input
                          type="checkbox"
                          checked={isNITPY}
                          onChange={(e) => {
                            setIsStudent(e.target.checked);
                            if (e.target.checked)
                              handleInputChange(
                                "collegeName",
                                "NIT Puducherry",
                              );
                            else handleInputChange("collegeName", "");
                          }}
                          className="hidden"
                        />
                        {isNITPY && (
                          <span className="text-black text-[10px]">✓</span>
                        )}
                      </div>
                      <span
                        className={`text-xs ${unispace.className} text-zinc-400 group-hover:text-zinc-300`}
                      >
                        NIT Puducherry Student
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* OTP */}
              {signupStep === 3 && !isForgotPassword && (
                <div className="text-center space-y-8">
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className="w-10 h-12 border border-[#d4a574] bg-[#d4a574]/10 flex items-center justify-center text-xl font-bold font-mono"
                      >
                        {otp[idx] || ""}
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="absolute opacity-0 inset-0 h-full w-full cursor-pointer"
                    autoFocus
                  />
                  <p className="text-zinc-500 text-xs font-mono">
                    SECURE CODE SENT TO:{" "}
                    <span className="text-[#d4a574]">{formData.email}</span>
                  </p>
                </div>
              )}

              {/* Forgot Password */}
              {isForgotPassword && (
                <div>
                  <label
                    className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                  >
                    Recovery Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full bg-black/50 border-b border-zinc-700 text-white py-3 px-2 focus:border-[#d4a574] focus:outline-none rounded-none font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setIsLogin(true);
                    }}
                    className="text-xs text-zinc-500 mt-4 hover:text-white transition-colors block cursor-pointer"
                  >
                    &lt; Return to Login
                  </button>
                </div>
              )}

              {/* MAIN ACTION BUTTON */}
              <button
                type="button"
                onClick={
                  isForgotPassword ? handleForgotPassword : handleEmailAuth
                }
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
                    {isLogin
                      ? "INITIATE SESSION"
                      : signupStep === 3
                        ? "VERIFY IDENTITY"
                        : "PROCEED"}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              </button>
            </div>

            {/* Footer Links */}
            <div className="mt-auto pt-6 border-t border-[#d4a574]/20 flex justify-between items-center">
              {!isForgotPassword && (
                <>
                  {signupStep > 1 && !isLogin && !isOAuthComplete ? (
                    <button
                      type="button"
                      onClick={() => setSignupStep((prev) => prev - 1)}
                      className="text-[#d4a574] text-sm md:text-base font-mono hover:scale-105 transition-transform"
                    >
                      [ BACK ]
                    </button>
                  ) : (
                    <span className="text-zinc-600 text-sm md:text-base font-mono uppercase">
                      {isLogin ? "No Access?" : "Has Access?"}
                    </span>
                  )}

                  <button
                    onClick={() => handleModeSwitch(!isLogin)}
                    className="text-[#d4a574] text-sm md:text-base font-bold font-mono uppercase hover:underline decoration-2 underline-offset-4"
                  >
                    {isLogin ? "REGISTER" : "LOGIN"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthClient;
