"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Trophy,
  Zap,
  Globe,
  CreditCard,
  Mic,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { unispace, garetBook, superRetro } from "@/fonts/fonts";
import { useToast } from "@/my_components/Toast";

// Actions
import { getLoggedInUser } from "@/lib/actions/auth.actions";
import {
  initiatePayment,
  verifyCashfreePayment,
  checkEventPaymentStatus,
} from "@/lib/actions/payment.actions"; // Generic Payment Actions

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICDTSES_EVENT_ID } from "@/lib/constants";

// Data & Config
const CONFERENCE_FEES = {
  STUDENT: 200,
  FACULTY: 400,
  ATTENDEE: 100,
};

// --- RETRO UI COMPONENTS (Copied from Orion) ---
const RetroCard = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative bg-black/80 border border-[#d4a574]/30 p-1 ${className}`}
  >
    {/* Corner Accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#d4a574]" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#d4a574]" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#d4a574]" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#d4a574]" />

    {/* Inner Content */}
    <div className="bg-[#111]/90 backdrop-blur-sm p-6 h-full relative z-10">
      {children}
    </div>
  </div>
);

export default function IcdtsesPage() {
  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("INITIALIZING CONNECTION...");
  const [hasPaid, setHasPaid] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    paperId: "",
    userType: "",
  });

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const loggedInUser = await getLoggedInUser();
        setUser(loggedInUser);

        if (loggedInUser) {
          // Pre-fill email if available
          setFormData((prev) => ({
            ...prev,
            email: loggedInUser.email,
            name: loggedInUser.name,
          }));

          const status = await checkEventPaymentStatus(
            loggedInUser.$id,
            ICDTSES_EVENT_ID,
          );
          setHasPaid(status);
        }
      } catch (error) {
        console.error("Failed to load user data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePayment = async () => {
    // Guest checkout allowed - removed user check
    // if (!user) return router.push("/auth/login");

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.paperId ||
      !formData.userType
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    setLoadingText("PROCESSING TRANSACTION...");
    try {
      const res = await initiatePayment(
        "EVENT",
        {
          eventId: ICDTSES_EVENT_ID,
          redirectUrl: `${window.location.origin}/icdtses`, // Return to this page
          ...formData,
        },
        user.$id,
      );

      if (res.success && res.paymentSessionId) {
        const { load } = await import("@cashfreepayments/cashfree-js");
        const cashfree = await load({
          mode:
            process.env.NEXT_PUBLIC_PAYMENT_ENV === "PRODUCTION"
              ? "production"
              : "sandbox",
        });

        await cashfree.checkout({
          paymentSessionId: res.paymentSessionId,
          returnUrl: `${window.location.origin}/icdtses?order_id=${res.orderId}`,
        });
      } else {
        toast.error(res.error || "Payment initiation failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed");
      setLoading(false);
    }
  };

  // Check for payment return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("order_id");
    if (orderId) {
      // Removed '&& user' check for guest verification
      const verify = async () => {
        setLoading(true);
        setLoadingText("VERIFYING TRANSACTION...");
        try {
          const res = await verifyCashfreePayment(orderId);
          if (res.success) {
            toast.success(
              "Payment Verified! Conference Registration Complete.",
            );
            setHasPaid(true); // Update state immediately
            router.replace("/icdtses"); // Clear URL
          } else {
            toast.error(
              "Payment Verification Failed: " + (res.error || "Unknown error"),
            );
          }
        } catch (error) {
          console.error(error);
          toast.error("Verification error occurred.");
        } finally {
          setLoading(false);
        }
      };
      verify();
    }
  }, [user, router]); // Dependency on user to ensure we don't verify before user is loaded (though verify action might not strictly need user on client side, flow feels safer)

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-[#d4a574]">
        <Loader2 className="animate-spin w-12 h-12" />
        <p
          className={`${unispace.className} text-lg tracking-widest animate-pulse text-center`}
        >
          {loadingText}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-[#d4a574] relative overflow-x-hidden selection:bg-[#d4a574] selection:text-black font-mono">
      {/* --- RETRO BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: `linear-gradient(#d4a574 1px, transparent 1px), linear-gradient(90deg, #d4a574 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_4px,3px_100%] pointer-events-none" />
        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-gradient(circle, transparent 60%, black 100%) opacity-80" />
      </div>

      {/* Navbar Placeholder / Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <Button
          variant="outline"
          className="border-[#d4a574]/30 text-[#d4a574] bg-black hover:bg-[#d4a574] hover:text-black transition-all duration-300 rounded-none uppercase tracking-widest font-bold"
          onClick={() => router.push("/")}
        >
          &lt; SYSTEM_EXIT
        </Button>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-20 flex flex-col gap-12">
        {/* Hero Section */}
        <section className="text-center flex flex-col items-center gap-6 mt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <h1
              className={`${superRetro.className} text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#d4a574] to-[#8a6a4b] drop-shadow-[0_0_10px_rgba(212,165,116,0.5)]`}
            >
              ICDTSES
            </h1>
            <p
              className={`${unispace.className} text-xl text-[#d4a574]/35 tracking-tighter mt-2`}
            >
              INTERNATIONAL_CONFERENCE_2026
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 bg-[#d4a574]/10 border border-[#d4a574] px-8 py-4 rounded-none mt-4 backdrop-blur-md"
          >
            <Globe className="w-12 h-12 text-[#d4a574] animate-spin-slow" />
            <div className="text-left">
              <p className="text-xs text-[#d4a574]/60 uppercase tracking-wider mb-2">
                Format
              </p>
              <p
                className={`${unispace.className} text-3xl font-bold text-[#d4a574]`}
              >
                VIRTUAL
              </p>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`${garetBook.className} max-w-2xl text-lg text-[#d4a574]/80 mt-6 text-justify`}
          >
            &gt; INITIATING PROTOCOL: ICDTSES. <br />
            Join the International Conference on Digital Transformation,
            Sustainable Engineering, and Science. Connect with global experts,
            explore cutting-edge research, and define the future.
          </motion.p>
        </section>

        {/* Event Details Section */}
        <section className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <RetroCard className="h-full hover:bg-[#d4a574]/5 transition-colors duration-300">
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-start">
                <span
                  className={`${unispace.className} text-4xl text-[#d4a574]/20 font-bold`}
                >
                  01
                </span>
                <Mic className="w-6 h-6 text-[#d4a574]" />
              </div>
              <h3 className={`${unispace.className} text-xl text-[#d4a574]`}>
                KEYNOTE SESSIONS
              </h3>
              <p className="text-[#d4a574]/70 text-sm leading-relaxed">
                Hear from industry leaders and visionaries discussing the latest
                trends and innovations.
              </p>
            </div>
          </RetroCard>

          {/* Feature 2 */}
          <RetroCard className="h-full hover:bg-[#d4a574]/5 transition-colors duration-300">
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-start">
                <span
                  className={`${unispace.className} text-4xl text-[#d4a574]/20 font-bold`}
                >
                  02
                </span>
                <Zap className="w-6 h-6 text-[#d4a574]" />
              </div>
              <h3 className={`${unispace.className} text-xl text-[#d4a574]`}>
                PAPER PRESENTATIONS
              </h3>
              <p className="text-[#d4a574]/70 text-sm leading-relaxed">
                Explore groundbreaking research papers presented by scholars
                from around the globe.
              </p>
            </div>
          </RetroCard>

          {/* Feature 3 */}
          <RetroCard className="h-full hover:bg-[#d4a574]/5 transition-colors duration-300">
            <div className="flex flex-col h-full gap-4">
              <div className="flex justify-between items-start">
                <span
                  className={`${unispace.className} text-4xl text-[#d4a574]/20 font-bold`}
                >
                  03
                </span>
                <Trophy className="w-6 h-6 text-[#d4a574]" />
              </div>
              <h3 className={`${unispace.className} text-xl text-[#d4a574]`}>
                CERTIFICATION
              </h3>
              <p className="text-[#d4a574]/70 text-sm leading-relaxed">
                Earn a prestigious certificate of participation to validate your
                engagement and learning.
              </p>
            </div>
          </RetroCard>
        </section>

        {/* Main Connect / Payment Action */}
        <div className="max-w-2xl mx-auto w-full">
          <RetroCard>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4 border-b border-[#d4a574]/20 pb-4">
                <CreditCard className="w-8 h-8 text-[#d4a574]" />
                <h3 className={`${unispace.className} text-2xl text-[#d4a574]`}>
                  REGISTRATION
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                {!hasPaid ? (
                  <>
                    <div className="flex flex-col gap-3">
                      <Input
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="bg-black/50 border-[#d4a574]/30 text-[#d4a574] placeholder:text-[#d4a574]/30 focus:border-[#d4a574] rounded-none h-12"
                      />
                      <Input
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="bg-black/50 border-[#d4a574]/30 text-[#d4a574] placeholder:text-[#d4a574]/30 focus:border-[#d4a574] rounded-none h-12"
                      />
                      <Input
                        placeholder="Paper ID (e.g. 123)"
                        value={formData.paperId}
                        onChange={(e) =>
                          setFormData({ ...formData, paperId: e.target.value })
                        }
                        className="bg-black/50 border-[#d4a574]/30 text-[#d4a574] placeholder:text-[#d4a574]/30 focus:border-[#d4a574] rounded-none h-12"
                      />
                      <Select
                        onValueChange={(val) =>
                          setFormData({ ...formData, userType: val })
                        }
                      >
                        <SelectTrigger className="bg-black/50 border-[#d4a574]/30 text-[#d4a574] focus:ring-[#d4a574] rounded-none h-12">
                          <SelectValue placeholder="Select User Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111] border-[#d4a574]/30 text-[#d4a574]">
                          <SelectItem value="STUDENT">
                            Student (₹{CONFERENCE_FEES.STUDENT})
                          </SelectItem>
                          <SelectItem value="FACULTY">
                            Faculty (₹{CONFERENCE_FEES.FACULTY})
                          </SelectItem>
                          <SelectItem value="ATTENDEE">
                            Attendee (₹{CONFERENCE_FEES.ATTENDEE})
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-[#d4a574]/10 border border-[#d4a574]/30 mt-2">
                      <span className="text-[#d4a574]/80 text-sm uppercase tracking-wider">
                        Total Fee
                      </span>
                      <span
                        className={`${unispace.className} text-3xl text-[#d4a574]`}
                      >
                        ₹
                        {formData.userType
                          ? CONFERENCE_FEES[
                              formData.userType as keyof typeof CONFERENCE_FEES
                            ]
                          : 0}
                      </span>
                    </div>

                    <Button
                      onClick={handlePayment}
                      disabled={loading}
                      className="w-full bg-[#d4a574] text-black hover:bg-[#c49a6b] font-bold h-14 text-lg tracking-widest rounded-none mt-4 transition-all duration-300 hover:shadow-[0_0_15px_rgba(212,165,116,0.4)]"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "[ PAY_&_REGISTER ]"
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="p-4 bg-green-900/20 border border-green-500/40 text-green-500 text-sm flex items-center justify-center gap-2 mt-4 font-mono">
                    <CheckCircle2 className="w-5 h-5" />[ REGISTRATION_COMPLETE
                    ]
                  </div>
                )}
              </div>
            </div>
          </RetroCard>
        </div>
      </main>
    </div>
  );
}
