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

import GlowButton from "@/components/GlowButton";
import ColorBends from "@/components/ColorBends";

import googleIcon from "@/assets/googleIcon.svg";
import FormField from "@/components/FormField";
import GenderDropdown from "@/components/Dropdown";

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

const oAuthSignup = (
  authProvider: "google" | "github",
  isSignup: boolean,
  redirectUrl: string = "/"
) => {
  document.cookie = `oauth_is_signup=${
    isSignup ? "1" : ""
  }; path=/; max-age=600`;

  if (redirectUrl && redirectUrl !== "/") {
    sessionStorage.setItem("authRedirect", redirectUrl);
  }

  const origin = window.location.origin;
  console.log("This is the origin ", origin);

  const s = account.createOAuth2Session({
    provider:
      authProvider === "google" ? OAuthProvider.Google : OAuthProvider.Github,
    success: `${origin}/auth/oauth/callback`,
    failure: `${origin}/auth?error=oauth_failed`,
  });

  console.log("this is a test: " + s);
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

  type LoginMethod = "email" | "google" | "github";

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

  // MODIFIED - Handle Email/Password Authentication
  const handleEmailAuth = async () => {
    try {
      // ===========================
      // 🔐 LOGIN FLOW
      // ===========================
      if (isLogin) {
        if (!validateLogin()) return;

        // ✅ Call Server Action
        const result = await loginWithEmail({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          setErrors({ general: result.error || "Login failed" });
          return;
        }

        console.log("Login success, redirecting...");
        router.refresh(); // Update server components
        navigate(redirectUrl);
        return;
      }

      // ===========================
      // 📝 SIGNUP FLOW
      // ===========================
      if (signupStep === 1 && !isOAuthComplete) {
        if (!validateStep1()) return;
        setSignupStep(2);
      } else {
        if (!validateStep2()) return;

        if (isOAuthComplete) {
          // ... OAuth Completion Logic (Unchanged) ...

          const result = await completeOAuthSignup({
            phone: formData.phone,
            gender: formData.gender,
            collegeName: formData.collegeName,
            isNITPY,
          });

          if (!result.success) {
            setErrors({ general: result.error || "Failed" });
            return;
          }
          router.push(sessionStorage.getItem("authRedirect") || "/");
        } else {
          // ✅ Call Server Action
          const result = await signUpWithEmail({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            gender: formData.gender,
            collegeName: formData.collegeName,
            isNITPY,
          });

          if (!result.success) {
            setErrors({ general: result.error || "Signup failed" });
            return;
          }

          console.log("Signup success, redirecting...");
          router.refresh();
          navigate(redirectUrl);
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrors({ general: err.message || "Authentication failed" });
    }
  };

  // MODIFIED - Handle OAuth Authentication
  const handleOAuth = async (provider: "google" | "github") => {
    try {
      if (isOAuthComplete) {
        if (!validateStep2()) return;

        const result = await completeOAuthSignup({
          phone: formData.phone,
          gender: formData.gender,
          collegeName: formData.collegeName,
          isNITPY,
        });

        if (!result.success) {
          setErrors({ general: result.error || "Failed to complete profile" });
          return;
        }

        const storedRedirect = sessionStorage.getItem("authRedirect") || "/";
        sessionStorage.removeItem("authRedirect");
        navigate(storedRedirect);
      } else {
        // START OAuth — browser redirect happens HERE
        oAuthSignup(provider, !isLogin, redirectUrl);
      }
    } catch (error) {
      console.error("OAuth error:", error);
      setErrors({ general: "OAuth authentication failed. Please try again." });
    }
  };

  const handleLogin = (method: LoginMethod) => {
    if (method === "email") {
      handleEmailAuth();
    } else if (method === "google") {
      handleOAuth("google");
    } else if (method === "github") {
      handleOAuth("github");
    }
  };

  // MODIFIED - Handle back button
  const handleBack = () => {
    if (isOAuthComplete) {
      // Can't go back from OAuth completion
      return;
    }
    setSignupStep(1);
    setErrors({});
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
          {/* MODIFIED - Dynamic title based on mode */}
          <motion.span
            key={
              isLogin
                ? "login"
                : isOAuthComplete
                ? "oauth-complete"
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
              ? `Complete Your Profile${
                  userName ? `, ${userName.split(" ")[0]}` : ""
                }`
              : signupStep === 1
              ? "Sign Up"
              : "Almost There"}
          </motion.span>

          {/* ADD THIS - Show user email if OAuth completion */}
          {isOAuthComplete && userEmail && (
            <p className="text-white/50 text-sm -mt-4 mb-2">{userEmail}</p>
          )}

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
              // Sign Up Step 1 - UNCHANGED
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
                {/* ... your existing Step 1 JSX ... */}
                {/* (keeping it the same) */}
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
                    onClick={() => handleLogin("email")}
                    className="group w-full h-fit px-10"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <span className="">Next</span>
                    </div>
                  </GlowButton>
                </div>
              </motion.div>
            ) : !isLogin && signupStep === 2 ? (
              // Sign Up Step 2 - UNCHANGED (works for both regular and OAuth)
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
                {/* ... your existing Step 2 JSX ... */}
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
                  {/* MODIFIED - Hide back button for OAuth completion */}
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
                    onClick={() => handleLogin("email")}
                    className="group w-full h-fit px-10"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <span className="">
                        {isOAuthComplete ? "Complete Profile" : "Sign Up"}
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
                {/* ... your existing Login JSX ... */}
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
                    onClick={() => handleLogin("email")}
                    className="group w-full h-fit px-10"
                  >
                    <div className="flex gap-2 items-center justify-center">
                      <span className="">Log In</span>
                    </div>
                  </GlowButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MODIFIED - Hide OAuth buttons during completion */}
          {!isOAuthComplete && (
            <>
              <div className="flex items-center justify-between w-full gap-2">
                <div className="w-full h-px rounded-full bg-[#FFFFFF50]" />
                <span className="text-[#FFFFFF50]">or</span>
                <div className="w-full h-px rounded-full bg-[#FFFFFF50]" />
              </div>

              <div className="flex w-full gap-5 justify-between max-sm:justify-around">
                <GlowButton
                  style={{
                    fontFamily: "Montserrat, 'Consolas', monospace",
                  }}
                  onClick={() => handleLogin("google")}
                  className="group w-full max-w-40"
                >
                  <div className="flex w-full gap-2 justify-center max-sm:justify-around">
                    <Image
                      src={googleIcon}
                      alt="google logo"
                      className="w-4 group-hover:brightness-150 transition-all duration-750"
                      style={{
                        textShadow:
                          "0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 20px #ffffff",
                      }}
                    />
                    <span className="">Google</span>
                  </div>
                </GlowButton>

                <GlowButton
                  style={{
                    fontFamily: "Montserrat, 'Consolas', monospace",
                  }}
                  onClick={() => handleLogin("github")}
                  className="group w-full max-w-40"
                >
                  <div className="flex w-full gap-2 justify-center max-sm:justify-around">
                    <div className="flex items-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 transition-colors duration-300"
                        aria-hidden
                      >
                        <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.42 7.86 10.95.58.11.79-.25.79-.56 0-.27-.01-1-.02-1.97-3.2.7-3.87-1.54-3.87-1.54-.53-1.35-1.3-1.71-1.3-1.71-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.2 1.78 1.2 1.04 1.79 2.73 1.27 3.4.97.1-.75.4-1.27.73-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.3 1.2-3.11-.12-.3-.52-1.52.12-3.17 0 0 .97-.31 3.18 1.19a11.1 11.1 0 0 1 5.8 0c2.21-1.5 3.18-1.19 3.18-1.19.64 1.65.24 2.87.12 3.17.75.81 1.2 1.85 1.2 3.11 0 4.43-2.7 5.41-5.27 5.7.41.35.78 1.05.78 2.13 0 1.54-.02 2.78-.02 3.16 0 .31.21.67.8.56 4.57-1.53 7.85-5.85 7.85-10.95C23.5 5.74 18.27.5 12 .5z" />
                      </svg>
                    </div>
                    <span className="">GitHub</span>
                  </div>
                </GlowButton>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AuthClient;
