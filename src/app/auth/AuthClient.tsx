"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  loginWithEmail,
  signUpWithEmail,
  completeOAuthSignup,
  setSessionCookie, // ADD THIS IMPORT
} from "@/lib/actions/auth";

import { account } from "@/lib/appwrite/appwrite.client";
import { OAuthProvider } from "appwrite";

import { useRouter } from "next/navigation";

import { z } from "zod";

import GlowButton from "@/my_components/GlowButton";
import ColorBends from "@/my_components/ColorBends";

import googleIcon from "@/assets/googleIcon.svg";
import FormField from "@/my_components/FormField";
import GenderDropdown from "@/my_components/Dropdown";

import { useNavigate } from "@/hooks/useNavigate";

// Zod Schemas
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

const oAuthSignup = async (
  authProvider: "google" | "github",
  isSignup: boolean,
  redirectUrl: string = "/",
) => {
  document.cookie = `oauth_is_signup=${
    isSignup ? "1" : ""
  }; path=/; max-age=600`;

  if (redirectUrl && redirectUrl !== "/") {
    sessionStorage.setItem("authRedirect", redirectUrl);
  }

  console.log("DEBUG: env SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL);
  console.log(
    "DEBUG: window origin:",
    typeof window !== "undefined" ? window.location.origin : "N/A",
    typeof window !== "undefined" ? window.location.origin : "N/A",
  );

  /* const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : ""); */

  // LOGIC: Use window.location.origin by default for Client Side to ensure localhost works.
  // Fallback to NEXT_PUBLIC_APP_URL if window is not available or for SSR consistency.
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "";

  console.log("DEBUG: OAuth Origin:", origin);

  account.createOAuth2Session({
    provider:
      authProvider === "google" ? OAuthProvider.Google : OAuthProvider.Github,
    success: `${origin}/auth/oauth/callback`,
    failure: `${origin}/auth/oauth/callback?error=provider_failure`,
  });
};

// ADD PROPS TYPE
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
  const [isOAuthComplete, setIsOAuthComplete] = useState(oauthCompleteMode); // ADD THIS

  const router = useRouter();
  const navigate = useNavigate();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "/";
  const mode = searchParams.get("mode"); // ADD THIS

  // ADD THIS EFFECT - Check if we need to show OAuth completion
  useEffect(() => {
    if (mode === "oauth_complete" || oauthCompleteMode) {
      setIsLogin(false);
      setSignupStep(2); // Go directly to Step 2
      setIsOAuthComplete(true);
    }
  }, [mode, oauthCompleteMode]);

  // State for OTP
  const [userId, setUserId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    collegeName: "",
  });

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  type LoginMethod = "email";

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
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
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
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
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
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleEmailAuth = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // ===========================
      // 🔐 LOGIN FLOW
      // ===========================
      if (isLogin) {
        if (!validateLogin()) {
          setIsLoading(false);
          return;
        }

        const result = await loginWithEmail({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          setErrors({ general: result.error || "Login failed" });
          setIsLoading(false);
          return;
        }

        console.log("Login success, redirecting...");
        router.refresh();
        navigate(redirectUrl);
        return;
      }

      // ===========================
      // 📝 SIGNUP FLOW
      // ===========================

      // STEP 1: Basic Info
      if (signupStep === 1 && !isOAuthComplete) {
        if (!validateStep1()) {
          setIsLoading(false);
          return;
        }
        setSignupStep(2);
        setIsLoading(false);
        return;
      }

      // STEP 2: Additional Info & Send OTP
      if (signupStep === 2 && !isOAuthComplete) {
        if (!validateStep2()) {
          setIsLoading(false);
          return;
        }

        // Send OTP
        try {
          // IMPORTANT: Create ID here so we know the userId
          const newUserId = "user_" + Date.now(); // or let Appwrite generate one, but ID.unique() is better if imported.
          // Since we can't easily import ID.unique here without conflicts or extra imports,
          // let's trust account.createEmailToken return value or rely on "unique" string.
          // The SDK says: createEmailToken(userId, email)

          const sessionToken = await account.createEmailToken(
            "unique()",
            formData.email,
          );

          setUserId(sessionToken.userId);
          setSignupStep(3); // Move to OTP
        } catch (error: any) {
          console.error("OTP Error:", error);
          setErrors({
            general:
              error.message || "Failed to send OTP. Please check your email.",
          });
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // STEP 3: Verify OTP & Finalize
      if (signupStep === 3) {
        if (!otp || otp.length < 4) {
          setErrors({ otp: "Please enter a valid OTP" });
          setIsLoading(false);
          return;
        }

        if (!userId) {
          setErrors({ general: "Session lost. Please try again." });
          setIsLoading(false);
          return;
        }

        console.log("Verifying OTP for:", userId, "OTP:", otp);

        // 1. Verify OTP -> Creates Session
        try {
          // 🚨 Ensure no active session conflicts
          await account.deleteSession("current").catch(() => {});

          await account.createSession(userId, otp);
        } catch (error: any) {
          console.error("OTP Verification Error:", error);
          throw new Error(error.message || "Invalid OTP or expired.");
        }

        // 2. Set Password
        await account.updatePassword(formData.password);

        // 3. Set Name
        await account.updateName(`${formData.firstName} ${formData.lastName}`);

        // 4. Create Profile (DB) via Server Action
        const result = await import("@/lib/actions/auth").then((mod) =>
          mod.createUserProfile({
            userId,
            email: formData.email,
            phone: formData.phone,
            gender: formData.gender,
            collegeName: formData.collegeName,
            isNITPY,
          }),
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        console.log("Signup success, redirecting...");
        router.refresh();
        navigate(redirectUrl);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrors({ general: err.message || "Authentication failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (isOAuthComplete) return;
    if (signupStep > 1) {
      setSignupStep((prev) => prev - 1);
      setErrors({});
    }
  };

  const handleModeSwitch = (mode: boolean) => {
    setIsLogin(mode);
    setSignupStep(1);
    setErrors({});
  };

  const slideVariants = {
    enter: () => ({
      x: 1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
      className={`w-screen h-screen overflow-clip grid grid-cols-5 relative transition-all duration-300`}
    >
      <div className="w-screen h-screen absolute">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1", "#d4a574", "#ffffff"]}
          rotation={180}
          speed={0.5}
          scale={0.4}
          frequency={2}
          warpStrength={1.2}
          mouseInfluence={0}
          parallax={0.6}
          noise={0.08}
        />
      </div>

      {/* Left section */}
      <div
        className="hidden sm:flex sm:col-span-2 lg:col-span-3 transition-all duration-300 w-full h-full"
        style={{
          color: "#d4a574",
          filter: "contrast(1.3) brightness(1.2)",
        }}
      ></div>

      <div className="w-full h-full p-5 sm:p-7  flex flex-col items-center justify-center sm:justify-end bg-black/30 backdrop-blur-2xl md:backdrop-blur-lg lg:backdrop-blur-md z-10 col-span-full sm:col-span-3 lg:col-span-2 transition-all duration-300">
        {/* Auth Form */}
        <motion.div
          className="w-full flex flex-col gap-5 pt-5 md:pt-40 items-center justify-center h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: "circInOut" }}
        >
          <motion.span
            key={
              isLogin
                ? "login"
                : isOAuthComplete
                  ? "oauth-complete"
                  : signupStep === 3
                    ? "verify"
                    : `signup-${signupStep}`
            }
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-[#FFFFFF] text-4xl text-center w-full mb-7 font-extrabold uppercase"
          >
            {isLogin
              ? "Log In"
              : isOAuthComplete
                ? `Complete Your Profile`
                : signupStep === 3
                  ? "Verify OTP"
                  : signupStep === 1
                    ? "Sign Up"
                    : "Almost There"}
          </motion.span>

          {/* General Error Message */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full px-4 py-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm"
            >
              {errors.general}
            </motion.div>
          )}

          <AnimatePresence mode="wait" custom={signupStep}>
            {!isLogin && signupStep === 1 ? (
              // Sign Up Step 1
              <motion.div
                key="signup-step-1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="h-full w-full grid grid-rows-5 grow"
              >
                <div className="row-span-1 gap-5 flex w-full justify-between">
                  <div className="w-full">
                    <FormField
                      label="First Name"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                    />
                    {errors.firstName && (
                      <span className="text-red-500 text-xs mt-1 block px-4">
                        {errors.firstName}
                      </span>
                    )}
                  </div>
                  <div className="w-full">
                    <FormField
                      label="Last Name"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                    />
                    {errors.lastName && (
                      <span className="text-red-500 text-xs mt-1 block px-4">
                        {errors.lastName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row-span-1 flex w-full">
                  <div className="w-full">
                    <FormField
                      label="Email"
                      type="email"
                      placeholder="hello@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                    {errors.email && (
                      <span className="text-red-500 text-xs mt-1 block px-4">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row-span-1 flex w-full">
                  <div className="w-full">
                    <FormField
                      label="Password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                    />
                    {errors.password && (
                      <span className="text-red-500 text-xs mt-1 block px-4">
                        {errors.password}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row-span-2 justify-center gap-2 md:gap-5 flex flex-col w-full h-full">
                  <div className="flex-row-reverse flex w-full">
                    <span className="text-white font-normal">
                      Already have an account?{" "}
                      <span
                        className="hover:underline cursor-pointer"
                        onClick={() => handleModeSwitch(true)}
                      >
                        Log in
                      </span>
                    </span>
                  </div>
                  <GlowButton
                    style={{
                      fontFamily: "Montserrat, 'Consolas', monospace",
                    }}
                    onClick={() => handleEmailAuth()}
                    className="group w-full h-fit px-10"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <span className="">Next</span>
                    </div>
                  </GlowButton>
                </div>
              </motion.div>
            ) : !isLogin && signupStep === 2 ? (
              // Sign Up Step 2
              <motion.div
                key="signup-step-2"
                custom={2}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="h-full w-full grid grid-rows-5 grow"
              >
                <div className="row-span-1 gap-5 flex w-full justify-between items-start">
                  <div className="w-full">
                    <FormField
                      label="Phone"
                      type="text"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                    {errors.phone && (
                      <span className="text-red-500 text-xs mt-1 block px-4">
                        {errors.phone}
                      </span>
                    )}
                  </div>
                  <div className="w-full h-full">
                    <GenderDropdown
                      value={formData.gender}
                      onChange={(value) => handleInputChange("gender", value)}
                    />
                    {errors.gender && (
                      <span className="text-red-500 text-xs mt-1 block px-4">
                        {errors.gender}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row-span-1 flex w-full">
                  <div className="w-full">
                    <FormField
                      label="College Name"
                      type="text"
                      placeholder="Your College"
                      value={formData.collegeName}
                      onChange={(e) =>
                        handleInputChange("collegeName", e.target.value)
                      }
                      disabled={isNITPY}
                    />
                    {errors.collegeName && (
                      <span className="text-red-500 text-xs mt-1 block px-4">
                        {errors.collegeName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="row-span-1 flex w-full items-start">
                  <label className="flex items-center gap-2 cursor-pointer text-white px-4">
                    <input
                      type="checkbox"
                      checked={isNITPY}
                      onChange={(e) => {
                        setIsStudent(e.target.checked);
                        if (e.target.checked) {
                          handleInputChange("collegeName", "NIT Puducherry");
                        } else {
                          handleInputChange("collegeName", "");
                        }
                      }}
                      className="w-4 h-4 accent-[#8a5cff]"
                    />
                    <span>I am a student at NIT Puducherry</span>
                  </label>
                </div>

                <div className="row-span-2 justify-center gap-2 md:gap-5 flex flex-col w-full h-full">
                  {!isOAuthComplete && (
                    <div className="flex w-full justify-between px-4">
                      <span
                        className="text-white font-normal hover:underline cursor-pointer"
                        onClick={handleBack}
                      >
                        ← Back
                      </span>
                    </div>
                  )}
                  <GlowButton
                    style={{
                      fontFamily: "Montserrat, 'Consolas', monospace",
                    }}
                    onClick={() => handleEmailAuth()}
                    className="group w-full h-fit px-10"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <span className="">
                        {isLoading ? "Sending..." : "Send OTP"}
                      </span>
                    </div>
                  </GlowButton>
                </div>
              </motion.div>
            ) : !isLogin && signupStep === 3 ? (
              // Sign Up Step 3 (OTP)
              <motion.div
                key="signup-step-3"
                custom={3}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="h-full w-full flex flex-col gap-10 justify-center grow"
              >
                <div className="flex flex-col gap-4 items-center">
                  <p className="text-white/70 text-center">
                    We've sent a 6-digit code to <br />
                    <span className="text-white font-semibold">
                      {formData.email}
                    </span>
                  </p>
                  <div className="w-full max-w-xs">
                    <FormField
                      label="Enter OTP"
                      type="text"
                      placeholder="123456"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                    />
                    {errors.otp && (
                      <span className="text-red-500 text-xs mt-1 block px-4">
                        {errors.otp}
                      </span>
                    )}
                  </div>
                </div>

                <div className="justify-center gap-2 md:gap-5 flex flex-col w-full h-fit">
                  <div className="flex w-full justify-between px-4">
                    <span
                      className="text-white font-normal hover:underline cursor-pointer"
                      onClick={() => setSignupStep(2)}
                    >
                      ← Change Email/Back
                    </span>
                  </div>

                  <GlowButton
                    style={{
                      fontFamily: "Montserrat, 'Consolas', monospace",
                    }}
                    onClick={() => handleEmailAuth()}
                    className="group w-full h-fit px-10"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <span className="">
                        {isLoading ? "Verifying..." : "Verify & Sign Up"}
                      </span>
                    </div>
                  </GlowButton>
                </div>
              </motion.div>
            ) : (
              // Login - UNCHANGED
              <motion.div
                key="login"
                custom={0}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="h-full w-full flex flex-col gap-10 justify-between grow"
              >
                <div className="gap-10 flex flex-col">
                  <div className="flex w-full">
                    <div className="w-full">
                      <FormField
                        label="Email"
                        type="email"
                        placeholder="hello@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                      />
                      {errors.email && (
                        <span className="text-red-500 text-xs mt-1 block px-4">
                          {errors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex w-full">
                    <div className="w-full">
                      <FormField
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                      />
                      {errors.password && (
                        <span className="text-red-500 text-xs mt-1 block px-4">
                          {errors.password}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="justify-center gap-2 md:gap-5 flex flex-col w-full h-fit">
                  <div className="flex-row-reverse flex w-full">
                    <span className="text-white font-normal">
                      Don't have an account?{" "}
                      <span
                        className="hover:underline cursor-pointer"
                        onClick={() => handleModeSwitch(false)}
                      >
                        Sign up
                      </span>
                    </span>
                  </div>
                  <GlowButton
                    style={{
                      fontFamily: "Montserrat, 'Consolas', monospace",
                    }}
                    onClick={() => handleEmailAuth()}
                    className="group w-full h-fit px-10"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <span className="">
                        {isLoading ? "Logging in..." : "Log In"}
                      </span>
                    </div>
                  </GlowButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthClient;
