"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { unispace, pressStart2P } from "@/fonts/fonts";
import { ChevronRight, Home, CheckCircle } from "lucide-react";
import RetroSelect from "@/my_components/RetroSelect";
import { initiatePayment } from "@/lib/actions/payment.actions";
import { useToast } from "@/my_components/Toast";

const accommodationSchema = z.object({
  hostel: z.string().min(1, "Please select a hostel"),
  day: z.array(z.number()).min(1, "Select at least one day"),
});

interface AccommodationClientProps {
  userId: string;
  initialAccommodation?: any;
  gender: string;
}

export default function AccommodationClient({
  userId,
  initialAccommodation,
  gender,
}: AccommodationClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accommodation, setAccommodation] = useState(initialAccommodation);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    hostel: gender.toLowerCase() === "female" ? "BHAVANI" : "BHARANI",
    day: [] as number[],
  });

  useEffect(() => {
    const checkStatus = async () => {
      const status = searchParams.get("status");
      const orderId = searchParams.get("order_id");

      if (status === "SUCCESS" && orderId) {
        setIsLoading(true);
        const { verifyCashfreePayment } =
          await import("@/lib/actions/payment.actions");
        const result = await verifyCashfreePayment(orderId);

        if (result.success) {
          success("Accommodation Confirmed!", "Payment Successful");
          // Refresh to get the latest data
          router.refresh();
          // In a real scenario, we might want to refetch the accommodation here or optimistically update
          // We can also just set a flag to show the success state immediately if we trust the flow
          // But resetting the URL is good practice
        } else {
          toastError(
            "Payment Verification Failed",
            result.error || "Unknown error",
          );
        }
        // Remove params
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
        setIsLoading(false);
      } else if (status === "FAILURE") {
        toastError("Payment Failed", "Please try again.");
      }
    };

    if (searchParams.get("status")) {
      checkStatus();
    }
  }, [searchParams, success, toastError, router]);

  // If accommodation exists (either initial or fetched), show the booked state
  if (accommodation) {
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

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 w-screen max-w-md"
        >
          <div className="bg-[#070a10]/95 backdrop-blur-xl border border-green-500/30 p-1 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative">
            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-green-500" />
            <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-green-500" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-green-500" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-green-500" />

            <div className="border border-green-500/10 p-8 flex flex-col gap-6 bg-black/40 text-center items-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>

              <h2
                className={`${pressStart2P.className} text-xl text-green-400 uppercase leading-relaxed`}
              >
                Accommodation
                <br />
                Confirmed
              </h2>

              <div className="w-full space-y-4 font-mono text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-zinc-500">HOSTEL</span>
                  <span className="text-white font-bold tracking-wider">
                    {accommodation.hostel}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-zinc-500">DAYS</span>
                  <span className="text-white font-bold tracking-wider">
                    {accommodation.day.join(", ")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-zinc-500">STATUS</span>
                  <span className="text-green-500 font-bold tracking-wider">
                    BOOKED
                  </span>
                </div>
              </div>

              <div className="p-3 bg-green-900/20 border border-green-500/30 text-green-400 text-xs font-mono w-full">
                Please show this confirmation at the registration desk.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleDayToggle = (day: number) => {
    setFormData((prev) => {
      const currentDays = prev.day;
      if (currentDays.includes(day)) {
        return { ...prev, day: currentDays.filter((d) => d !== day) };
      } else {
        return { ...prev, day: [...currentDays, day].sort() };
      }
    });
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      accommodationSchema.parse(formData);
      setIsLoading(true);
      setError(null);

      const response = await initiatePayment(
        "ACCOMM",
        {
          hostel: formData.hostel,
          day: formData.day,
          redirectUrl: window.location.origin + "/residence", // Updated to correct path
        },
        userId,
      );

      console.log("Payment Initiation Response:", response); // Debug log

      if (response.success && response.paymentSessionId) {
        // Load Cashfree
        const cashfree = await import("@cashfreepayments/cashfree-js");
        const cf = await cashfree.load({ mode: "production" }); // or production based on env

        cf.checkout({
          paymentSessionId: response.paymentSessionId,
          redirectTarget: "_modal", // or _blank
          returnUrl:
            window.location.origin +
            "/residence?status={status}&order_id={order_id}",
        });
      } else {
        setError(response.error || "Failed to initiate payment");
        setIsLoading(false);
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0].message);
      } else {
        setError(err.message || "Something went wrong");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden bg-black text-white p-4">
      {/* Background SVGs - reused from Signup */}
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
            className="border border-[#d4a574]/10 p-6 md:p-8 flex flex-col gap-8 bg-black/40 min-h-[400px]"
            style={{
              clipPath:
                "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
            }}
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Home className="w-5 h-5 text-[#d4a574]" />
                <div
                  className={`text-[#d4a574] text-xs tracking-[0.3em] uppercase ${unispace.className}`}
                >
                  Residence Access
                </div>
              </div>
              <h1
                className={`${pressStart2P.className} text-xl md:text-2xl text-white uppercase leading-relaxed`}
              >
                Book Stay
              </h1>
              <div className="h-[1px] w-full bg-linear-to-r from-transparent via-[#d4a574]/50 to-transparent" />
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-900/20 border-l-2 border-red-500 p-3 text-red-400 text-xs font-mono"
                >
                  [ERROR]: {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Fields */}
            <div className="space-y-6 shrink-0">
              <div className="space-y-2 relative">
                <label
                  className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider ${unispace.className}`}
                >
                  Assigned Hostel
                </label>
                <div className="w-full p-3 bg-black/50 border border-zinc-700 text-white font-mono text-sm">
                  {formData.hostel}
                  <span className="ml-2 text-xs text-zinc-500">
                    (
                    {gender.toLowerCase() === "female"
                      ? "Bhavani"
                      : "Bharani/Ganga"}
                    )
                  </span>
                </div>
              </div>

              <div>
                <label
                  className={`block text-[#d4a574]/70 text-[10px] uppercase tracking-wider mb-2 ${unispace.className}`}
                >
                  Select Days
                </label>
                <div className="flex gap-4">
                  {[1, 2, 3].map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`flex-1 py-3 border ${
                        formData.day.includes(day)
                          ? "border-[#d4a574] bg-[#d4a574]"
                          : "border-zinc-700 bg-black/50 hover:border-[#d4a574]/50"
                      } transition-all duration-300 relative group overflow-hidden`}
                      style={{
                        clipPath:
                          "polygon(10px 0, 100% 0, 100% calc(100% - 10px), 0 100%, 0 0)", // customized slant
                      }}
                    >
                      <span
                        className={`${unispace.className} text-sm ${
                          formData.day.includes(day)
                            ? "text-black font-bold"
                            : "text-zinc-400 group-hover:text-white"
                        }`}
                      >
                        DAY {day}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#d4a574]/5 border border-[#d4a574]/20 rounded-sm">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-zinc-400 font-mono">BASE PRICE</span>
                  <span className="text-[#d4a574] font-mono">₹200</span>
                </div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-zinc-400 font-mono">
                    CAUTION DEPOSIT
                  </span>
                  <span className="text-[#d4a574] font-mono">₹150</span>
                </div>
                <div className="h-[1px] w-full bg-[#d4a574]/20 my-2" />
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-white font-mono">TOTAL</span>
                  <span className="text-[#d4a574] font-mono">₹350</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSubmit}
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
                    INITIATE PAYMENT
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
