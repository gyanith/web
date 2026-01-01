"use client";
import React, { useState } from "react";

export default function FlipCardLogin() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return "#ef4444";
    if (strength === 2) return "#f59e0b";
    if (strength === 3) return "#eab308";
    return "#22c55e";
  };

  const getStrengthText = (strength: number) => {
    if (strength === 0) return "";
    if (strength <= 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!loginEmail) {
      newErrors.loginEmail = "Email is required";
    } else if (!validateEmail(loginEmail)) {
      newErrors.loginEmail = "Invalid email format";
    }

    if (!loginPassword) {
      newErrors.loginPassword = "Password is required";
    } else if (loginPassword.length < 6) {
      newErrors.loginPassword = "Password must be at least 6 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Login clicked", { loginEmail, loginPassword });
    }
  };

  const handleSignUp = (e: React.MouseEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!signupName) {
      newErrors.signupName = "Name is required";
    }

    if (!signupEmail) {
      newErrors.signupEmail = "Email is required";
    } else if (!validateEmail(signupEmail)) {
      newErrors.signupEmail = "Invalid email format";
    }

    if (!signupPassword) {
      newErrors.signupPassword = "Password is required";
    } else if (signupPassword.length < 8) {
      newErrors.signupPassword = "Password must be at least 8 characters";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Sign up clicked", {
        signupName,
        signupEmail,
        signupPassword,
      });
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
  };

  const passwordStrength = getPasswordStrength(signupPassword);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#D4A57430] w-full">
      <div className="flex flex-col items-center gap-8">
        {/* Switch */}
        <div className="relative w-[300px]">
          <input
            type="checkbox"
            id="toggle"
            className="sr-only"
            checked={isSignUp}
            onChange={(e) => setIsSignUp(e.target.checked)}
          />
          <label
            htmlFor="toggle"
            className="relative flex items-center justify-between cursor-pointer"
          >
            {/* Card side labels */}
            <span className="text-sm font-semibold text-gray-800">
              <span className={!isSignUp ? "underline" : ""}>Log in</span>
            </span>

            {/* Slider */}
            <div
              className={`relative w-12 h-5 rounded border-2 border-gray-800 transition-colors ${
                isSignUp ? "bg-blue-500" : "bg-white"
              }`}
              style={{ boxShadow: "4px 4px #323232" }}
            >
              <div
                className={`absolute w-5 h-5 bg-white border-2 border-gray-800 rounded -left-0.5 bottom-0.5 transition-transform ${
                  isSignUp ? "translate-x-7" : ""
                }`}
                style={{ boxShadow: "0 3px 0 #323232" }}
              />
            </div>

            <span className="text-sm font-semibold text-gray-800">
              <span className={isSignUp ? "underline" : ""}>Sign up</span>
            </span>
          </label>
        </div>

        {/* Card Container */}
        <div
          className="relative w-[500px] h-[500px]"
          style={{ perspective: "1000px" }}
        >
          <div
            className={`relative w-full h-full transition-transform duration-700`}
            style={{
              transformStyle: "preserve-3d",
              transform: isSignUp ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front - Login */}
            <div
              className="absolute w-full h-full p-5 flex flex-col justify-center gap-3 bg-gray-300 rounded border-2 border-gray-800"
              style={{
                backfaceVisibility: "hidden",
                boxShadow: isSignUp ? "none" : "4px 4px #323232",
              }}
            >
              <h2 className="text-2xl font-black text-white text-center mb-2">
                LOG IN
              </h2>
              <div className="flex flex-col items-center gap-3">
                <div className="w-full">
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      setErrors({ ...errors, loginEmail: "" });
                    }}
                    className="w-full h-10 rounded border-2 border-gray-800 bg-white px-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500"
                    style={{ boxShadow: "4px 4px #323232" }}
                  />
                  {errors.loginEmail && (
                    <p className="text-red-600 text-xs mt-1 ml-1">
                      {errors.loginEmail}
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      setErrors({ ...errors, loginPassword: "" });
                    }}
                    className="w-full h-10 rounded border-2 border-gray-800 bg-white px-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500"
                    style={{ boxShadow: "4px 4px #323232" }}
                  />
                  {errors.loginPassword && (
                    <p className="text-red-600 text-xs mt-1 ml-1">
                      {errors.loginPassword}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => console.log("Forgot password clicked")}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold self-end mr-1"
                >
                  Forgot password?
                </button>
                <button
                  onClick={handleLogin}
                  className="w-[120px] h-10 rounded border-2 border-gray-800 bg-white text-base font-semibold text-gray-800 cursor-pointer mt-2 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  style={{ boxShadow: "4px 4px #323232" }}
                >
                  Let's go!
                </button>

                <div className="w-full mt-3">
                  <p className="text-xs text-gray-700 text-center font-semibold mb-2">
                    Login with socials
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleSocialLogin("Google")}
                      className="w-12 h-12 rounded border-2 border-gray-800 bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                      style={{ boxShadow: "3px 3px #323232" }}
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleSocialLogin("GitHub")}
                      className="w-12 h-12 rounded border-2 border-gray-800 bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                      style={{ boxShadow: "3px 3px #323232" }}
                    >
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="#181717"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Back - Sign Up */}
            <div
              className="absolute w-full h-full p-5 flex flex-col justify-center gap-3 bg-gray-300 rounded border-2 border-gray-800"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                boxShadow: "4px 4px #323232",
              }}
            >
              <h2 className="text-2xl font-black text-gray-800 text-center mb-2">
                Sign up
              </h2>
              <div className="flex flex-col items-center gap-3">
                <div className="w-full">
                  <input
                    type="text"
                    placeholder="Name"
                    value={signupName}
                    onChange={(e) => {
                      setSignupName(e.target.value);
                      setErrors({ ...errors, signupName: "" });
                    }}
                    className="w-full h-10 rounded border-2 border-gray-800 bg-white px-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500"
                    style={{ boxShadow: "4px 4px #323232" }}
                  />
                  {errors.signupName && (
                    <p className="text-red-600 text-xs mt-1 ml-1">
                      {errors.signupName}
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <input
                    type="email"
                    placeholder="Email"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      setErrors({ ...errors, signupEmail: "" });
                    }}
                    className="w-full h-10 rounded border-2 border-gray-800 bg-white px-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500"
                    style={{ boxShadow: "4px 4px #323232" }}
                  />
                  {errors.signupEmail && (
                    <p className="text-red-600 text-xs mt-1 ml-1">
                      {errors.signupEmail}
                    </p>
                  )}
                </div>
                <div className="w-full">
                  <input
                    type="password"
                    placeholder="Password"
                    value={signupPassword}
                    onChange={(e) => {
                      setSignupPassword(e.target.value);
                      setErrors({ ...errors, signupPassword: "" });
                    }}
                    className="w-full h-10 rounded border-2 border-gray-800 bg-white px-2.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-500"
                    style={{ boxShadow: "4px 4px #323232" }}
                  />
                  {errors.signupPassword && (
                    <p className="text-red-600 text-xs mt-1 ml-1">
                      {errors.signupPassword}
                    </p>
                  )}
                  {signupPassword && (
                    <div className="mt-2 mx-1">
                      <div className="flex gap-1 mb-1">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded transition-all"
                            style={{
                              backgroundColor:
                                i < passwordStrength
                                  ? getStrengthColor(passwordStrength)
                                  : "#d1d5db",
                            }}
                          />
                        ))}
                      </div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: getStrengthColor(passwordStrength) }}
                      >
                        {getStrengthText(passwordStrength)}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSignUp}
                  className="w-[120px] h-10 rounded border-2 border-gray-800 bg-white text-base font-semibold text-gray-800 cursor-pointer mt-2 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  style={{ boxShadow: "4px 4px #323232" }}
                >
                  Confirm!
                </button>

                <div className="w-full mt-1">
                  <p className="text-xs text-gray-700 text-center font-semibold mb-2">
                    Login with socials
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleSocialLogin("Google")}
                      className="w-12 h-12 rounded border-2 border-gray-800 bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                      style={{ boxShadow: "3px 3px #323232" }}
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleSocialLogin("GitHub")}
                      className="w-12 h-12 rounded border-2 border-gray-800 bg-white flex items-center justify-center cursor-pointer hover:bg-gray-100 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                      style={{ boxShadow: "3px 3px #323232" }}
                    >
                      <svg
                        className="w-6 h-6"
                        viewBox="0 0 24 24"
                        fill="#181717"
                      >
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
