"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Wallet,
  ShoppingCart,
  ArrowRight,
  Phone,
  X,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  FileText,
} from "lucide-react";
import ShinyText from "@/my_components/ShinyText";
import { unispace, superRetro, garetBook } from "@/fonts/fonts";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";

import {
  initiatePayment,
  verifyCashfreePayment,
  cancelPayment,
} from "@/lib/actions/payment.actions";

import { Event } from "@/types/db";
import { useToast } from "@/my_components/Toast";

type EventDetailsClientProps = {
  eventData: Event & {
    coordinators: any[];
    imageUrl?: string;
  };
  eventType: string;
  user: any;
  initialIsRegistered: boolean;
  initialUserTeam?: any;
};

export default function EventDetailsClient({
  eventData,
  eventType,
  user,
  initialIsRegistered,
  initialUserTeam,
}: EventDetailsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync state with server prop
  useEffect(() => {
    setIsRegistered(initialIsRegistered);
  }, [initialIsRegistered]);

  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const handleRegisterClick = () => {
    if (!user) {
      router.push("/auth?redirect=/events/" + eventType + "/" + eventData.$id);
      return;
    }

    if (isRegistered) {
      // If already registered, confirm unregister
      setShowConfirmModal(true);
    } else {
      // Confirm register
      setShowConfirmModal(true);
    }
  };

  // Handle Cashfree Return
  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (orderId && !isRegistered) {
      const verify = async () => {
        setLoading(true);
        try {
          const result = await verifyCashfreePayment(orderId);
          if (result.success) {
            setIsRegistered(true);
            setIsRegistered(true);
            if (isWorkshop) {
              toast.success(
                "Successfully registered! 1 Tech Credit added to your account. You get to register for 1 tech event",
              );
            } else {
              toast.success("Successfully registered!");
            }
            router.replace(window.location.pathname); // Clear Query Params
            router.refresh();
          } else {
            toast.error(result.error || "Payment verification failed");
            router.replace(window.location.pathname);
            router.refresh(); // Sync with server state
          }
        } catch (error) {
          console.error(error);
          toast.error("Error verifying payment");
          router.replace(window.location.pathname);
          router.refresh();
        } finally {
          setLoading(false);
        }
      };
      verify();
    }
  }, [searchParams, isRegistered, router, toast]);

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);
    setShowConfirmModal(false);

    try {
      const amount = Number(eventData.fee);

      // Step 1: Initiate Payment
      const initResult = await initiatePayment(
        isWorkshop ? "WORKSHOP" : "EVENT",
        {
          eventId: eventData.$id,
          redirectUrl: window.location.href,
        },
        user.$id,
        amount,
      );

      if (!initResult.success) {
        throw new Error(initResult.error || "Failed to initiate payment");
      }

      // Cashfree Flow (Default)
      const cashfree = await load({
        mode:
          process.env.NEXT_PUBLIC_PAYMENT_ENV === "PRODUCTION"
            ? "production"
            : "sandbox",
      });

      await cashfree.checkout({
        paymentSessionId: initResult.paymentSessionId || "",
        returnUrl: window.location.href,
        redirectTarget: "_modal",
      });

      // Verify payment status after modal closes or redirects
      // Note: Cashfree modal redirect usually reloads the page or hits the returnUrl.
      // If using '_modal' with correct setup, it might just close.
      // However, usually returnURL handles the verification via useEffect.

      setLoading(false);
      router.refresh();
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment");
      setLoading(false);
      router.refresh();
    }
  };

  const confirmAction = async (paymentId?: string) => {
    setShowConfirmModal(false);
    if (!paymentId) setLoading(true); // If paymentId exists, we are already loading

    try {
      const method = isRegistered ? "DELETE" : "POST";
      const body: any = {};
      if (paymentId) body.paymentId = paymentId;

      const response = await fetch(
        `/api/events/${eventType}/${eventData.$id}/register`,
        {
          method: method,
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Action failed");
      }

      if (isRegistered) {
        setIsRegistered(false);
        toast.success("Successfully unregistered!");
      } else {
        setIsRegistered(true);
        toast.success("Successfully registered!");
      }

      router.refresh();
    } catch (error: any) {
      console.error("Action error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const isWorkshop = eventType.toLowerCase().includes("workshop");
  const isTech = eventType.toLowerCase().includes("tech");
  const isFree = !eventData.fee || Number(eventData.fee) === 0;

  return (
    <div className="relative min-h-screen w-full text-[#d4a574]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={eventData.imageUrl || "/api/placeholder/1920/1080"}
          alt="Background"
          fill
          className="object-cover opacity-20 blur-2xl contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070a10] via-[#070a10]/90 to-[#070a10]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-48 pb-20">
        {/* HEADER SECTION - Hero Style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 space-y-4 flex items-center justify-center flex-col"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#d4a574]/30 bg-[#d4a574]/5 backdrop-blur text-sm font-medium tracking-widest uppercase mb-4">
            <motion.span
              className="w-2.5 h-2.5 bg-red-600"
              animate={{
                opacity: [1, 0.2, 1],
                boxShadow: [
                  "0 0 15px #ff0000",
                  "0 0 5px #aa0000",
                  "0 0 15px #ff0000",
                ],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            {eventData.type || eventType} Event
          </div>

          <h1
            className={`${superRetro.className} text-4xl sm:text-6xl md:text-8xl text-white leading-none mix-blend-overlay opacity-90 max-w-full break-words text-center px-4`}
          >
            {eventData.name}
          </h1>

          <p className="max-w-2xl mx-5 text-lg text-white/50 leading-relaxed font-light tracking-wide text-justify">
            {eventData.description}
          </p>

          {/* MAIN CTA */}
          <motion.div
            className="pt-8 flex flex-col items-center justify-center gap-4 w-full max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {/* Row 1: Register + Rulebook Side by Side */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Register Button */}
              <div className="group relative">
                <button
                  disabled={loading}
                  className={`relative flex items-center justify-center gap-3 border transition-all  py-4 overflow-hidden group/btn cursor-pointer w-full ${
                    isRegistered
                      ? "bg-red-900/10 border-red-500/50 hover:bg-red-900/30"
                      : "bg-[#0a0a0a] border-[#d4a574]/50 hover:bg-[#d4a574]/10"
                  }`}
                  onClick={handleRegisterClick}
                >
                  <motion.div className="flex items-center gap-3 relative z-10">
                    {isRegistered ? (
                      <X className="w-5 h-5 text-red-500" />
                    ) : isWorkshop && !isRegistered ? (
                      <CreditCard className="w-5 h-5 text-[#d4a574]" />
                    ) : (
                      <ShoppingCart className="w-5 h-5 text-[#d4a574]" />
                    )}
                    <ShinyText
                      text={
                        loading
                          ? "Processing..."
                          : isRegistered
                            ? "Unregister"
                            : isWorkshop && !isFree
                              ? "Pay & Register"
                              : "Register"
                      }
                      className={`text-base md:text-lg ${unispace.className}`}
                      color={isRegistered ? "#ef4444" : "#d4a574"}
                      shineColor={isRegistered ? "#fca5a5" : "#ffffff"}
                      delay={1}
                    />
                    {!isRegistered && !loading && (
                      <ArrowRight className="w-5 h-5 text-[#d4a574] group-hover/btn:translate-x-1 transition-transform" />
                    )}
                  </motion.div>

                  {/* Button shine effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r skew-x-12 ${
                      isRegistered
                        ? "from-transparent via-red-500/10 to-transparent"
                        : "from-transparent via-white/10 to-transparent"
                    }`}
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "200%" }}
                    transition={{ duration: 0.3 }}
                  />
                </button>
              </div>

              {/* Rulebook Button */}
              <a
                href={eventData.rulebook_link ? eventData.rulebook_link : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="relative flex items-center justify-center gap-3 border border-[#d4a574]/50 bg-[#0a0a0a] hover:bg-[#d4a574]/10 transition-all px-6 py-4 overflow-hidden group/btn cursor-pointer"
              >
                <motion.div className="flex items-center gap-3 relative z-10">
                  <FileText className="w-5 h-5 text-[#d4a574]" />
                  <span
                    className={`text-base md:text-lg ${unispace.className} text-[#d4a574]`}
                  >
                    Rulebook
                  </span>
                  <ArrowRight className="w-5 h-5 text-[#d4a574] group-hover/btn:translate-x-1 transition-transform" />
                </motion.div>

                {/* Button shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.3 }}
                />
              </a>
            </div>

            {/* Row 2: Join/Create Team Button (Full Width, Team Events Only) */}
            {eventData.is_team_event && (
              <button
                className="relative flex items-center justify-center gap-3 border border-purple-500/50 bg-purple-900/10 hover:bg-purple-900/30 transition-all px-6 py-4 overflow-hidden group/btn cursor-pointer w-full"
                onClick={() => {
                  if (!user) {
                    router.push(
                      "/auth?redirect=/events/" +
                        eventType +
                        "/" +
                        eventData.$id,
                    );
                    return;
                  }
                  router.push(`/events/${eventType}/${eventData.$id}/team`);
                }}
              >
                <motion.div className="flex items-center gap-3 relative z-10">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span
                    className={`text-base md:text-lg ${unispace.className} text-purple-400 uppercase`}
                  >
                    {initialUserTeam ? "View Team" : "Join / Create Team"}
                  </span>
                  <ArrowRight className="w-5 h-5 text-purple-400 group-hover/btn:translate-x-1 transition-transform" />
                </motion.div>

                {/* Button shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent skew-x-12"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "200%" }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            )}

            {/* Status Messages */}
            {isRegistered && (
              <p
                className={`text-xs text-center text-green-500 uppercase tracking-widest border-b border-green-500/20 pb-0.5 ${unispace.className}`}
              >
                <CheckCircle className="inline w-3 h-3 mr-1" /> Registered
              </p>
            )}
            <p className="text-xs text-center text-white/30 uppercase tracking-widest border-b border-[#d4a574]/20 pb-0.5">
              *Exclusive to Combos
            </p>
          </motion.div>
        </motion.div>

        {/* BENTO GRID */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6"
        >
          {/* 1. Date Card (Large Square) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-3 lg:col-span-4 bg-black/20 backdrop-blur-md border border-[#d4a574]/20 p-5 md:p-8 flex flex-col justify-between group transition-colors"
          >
            <div className="space-y-2 mb-6">
              <div className="p-3 w-fit bg-[#d4a574]/10 text-[#d4a574]">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h3 className="text-white/40 text-sm uppercase tracking-wider font-semibold mb-1">
                When
              </h3>
              <p className={`text-2xl text-white ${garetBook.className}`}>
                {new Date(eventData.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="text-[#d4a574] text-sm mt-1">
                {(() => {
                  const day = eventData.day;
                  if (Array.isArray(day)) {
                    return day.length > 0
                      ? `Day ${day.sort().join(" & ")}`
                      : "Day 1";
                  }
                  return `Day ${day || "1"}`;
                })()}
                {eventData.start_time && (
                  <span className="block text-white/50 text-xs mt-1 font-medium">
                    {(() => {
                      const formatTime = (time: string) => {
                        if (!time) return "";
                        if (/^\d{4}$/.test(time)) {
                          let hours = parseInt(time.substring(0, 2));
                          const mins = time.substring(2, 4);
                          const period = hours >= 12 ? "PM" : "AM";
                          if (hours > 12) hours -= 12;
                          if (hours === 0) hours = 12;
                          return `${hours}:${mins} ${period}`;
                        }
                        return time;
                      };
                      return `${formatTime(eventData.start_time)}${eventData.end_time ? ` - ${formatTime(eventData.end_time)}` : ""}`;
                    })()}
                  </span>
                )}
              </p>
            </div>
          </motion.div>

          {/* 2. Fee Card (Wide) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-3 lg:col-span-4 bg-black/20 backdrop-blur-md border border-[#d4a574]/20 p-5 md:p-8 flex flex-col justify-between group transition-colors bg-gradient-to-br from-black/20 to-[#d4a574]/5"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 w-fit bg-[#d4a574]/10 text-[#d4a574]">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
            <div>
              <h3 className="text-white/40 text-sm uppercase tracking-wider font-semibold mb-1">
                Entry Fee
              </h3>
              <div className="flex items-baseline gap-2">
                {isFree ? (
                  isTech ? (
                    <span className="text-xl md:text-2xl font-bold text-white uppercase">
                      Included in Combo
                    </span>
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      FREE ENTRY
                    </span>
                  )
                ) : (
                  <>
                    <span className="text-4xl font-bold text-white">
                      ₹{eventData.fee}
                    </span>
                    <span className="text-white/30 text-sm">/person</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* 3. Prize Card (Vertical) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-3 lg:col-span-4 lg:row-span-2 bg-[#d4a574] p-8 flex flex-col justify-between relative overflow-hidden group"
          >
            <div
              className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`,
              }}
            />
            <div className="relative z-10 text-black">
              <div className="flex justify-between items-start mb-10">
                <div className="p-3 w-fit bg-black/10">
                  <Trophy className="w-10 h-10" />
                </div>
                <ArrowRight className="-rotate-45 w-8 h-8 opacity-50 group-hover:rotate-0 transition-transform" />
              </div>
              <div>
                <h3 className="text-black/60 text-sm uppercase tracking-wider font-bold mb-2">
                  {!eventData.prize_pool || Number(eventData.prize_pool) === 0
                    ? "Benefits"
                    : "Grand Prize Pool"}
                </h3>
                {!eventData.prize_pool || Number(eventData.prize_pool) === 0 ? (
                  <p
                    className={`text-3xl font-black tracking-tighter ${garetBook.className}`}
                  >
                    Certification Provided
                  </p>
                ) : (
                  <p
                    className={`text-6xl font-black tracking-tighter ${unispace.className}`}
                  >
                    ₹{eventData.prize_pool}
                  </p>
                )}
                <p className="mt-4 text-black/70 font-medium">
                  {!eventData.prize_pool || Number(eventData.prize_pool) === 0
                    ? `Participate in this ${eventData.type} event and earn a certificate of achievement.`
                    : `Win big in this ${eventData.type} showdown. Top 3 teams take home prizes.`}
                </p>
              </div>
            </div>
            {/* Decorative Circle removed */}
          </motion.div>

          {/* 4. Location Card (Small) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-3 lg:col-span-4 bg-black/20 backdrop-blur-md border border-[#d4a574]/20 p-5 md:p-8 flex flex-col justify-between group transition-colors"
          >
            <div className="p-3 w-fit bg-[#d4a574]/10 text-[#d4a574] mb-6">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-white/40 text-sm uppercase tracking-wider font-semibold mb-1">
                Where
              </h3>
              <p className="text-xl text-white font-medium">
                {eventData.location || "TBA"}
              </p>
            </div>
          </motion.div>

          {/* 5. Coordinators Card (Wide) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-6 lg:col-span-4 bg-black/20 backdrop-blur-md border border-[#d4a574]/20 p-5 md:p-8 flex flex-col justify-between group transition-colors"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 w-fit bg-[#d4a574]/10 text-[#d4a574]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl text-white font-medium">Coordinators</h3>
            </div>
            <div className="space-y-4">
              {eventData.coordinators &&
                eventData.coordinators.map((coordinator: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-white/70">
                      {coordinator.name || coordinator.email || "Coordinator"}
                    </span>
                    <span className="flex items-center gap-2 text-white/50 text-sm font-mono tracking-wider select-all">
                      <Phone className="w-3 h-3" />
                      {coordinator.phone
                        ? coordinator.phone.replace(/^(\+91|91)/, "").slice(-10)
                        : "Contact"}
                    </span>
                  </div>
                ))}
              {(!eventData.coordinators ||
                eventData.coordinators.length === 0) && (
                <p className="text-white/30">No coordinators assigned.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#0a0a0a] border border-[#d4a574]/30 p-6 rounded-lg shadow-2xl relative"
            >
              <h2 className={`text-xl text-white mb-4 ${unispace.className}`}>
                {isRegistered ? "Confirm Cancel?" : "Confirm Registration?"}
              </h2>
              <div className="text-white/60 mb-8">
                {(() => {
                  if (isRegistered) {
                    if (isWorkshop) {
                      return (
                        <>
                          Are you sure you want to unregister from this
                          workshop?
                          <span className="text-red-400 block mt-2 font-bold">
                            NOTE: No refunds are applicable for this
                            cancellation.
                          </span>
                        </>
                      );
                    }
                    return "Are you sure you want to unregister? 1 Credit will be refunded.";
                  } else {
                    if (isWorkshop && !isFree) {
                      return (
                        <>
                          Register for this workshop? You will be redirected to
                          pay ₹{eventData.fee}.
                          <span className="text-red-400 block mt-2 font-bold">
                            NOTE: This payment is non-refundable.
                          </span>
                        </>
                      );
                    }
                    return "Are you sure you want to register? 1 Credit will be deducted from your account.";
                  }
                })()}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-sm text-white/40 hover:text-white transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    if (!isRegistered && isWorkshop && !isFree) {
                      handlePayment();
                    } else {
                      confirmAction();
                    }
                  }}
                  className={`px-6 py-2 text-black font-bold uppercase tracking-wider ${
                    isRegistered
                      ? "bg-red-500 hover:bg-red-400"
                      : "bg-[#d4a574] hover:bg-[#d4a574]/80"
                  }`}
                >
                  {isRegistered
                    ? "Unregister"
                    : isWorkshop && !isFree
                      ? "Pay Now"
                      : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
