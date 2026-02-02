"use client";

import Script from "next/script";
import React, { useState } from "react";
import {
  Trash2,
  Plus,
  Minus,
  Wallet,
  Smartphone,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  initiatePayment,
  verifyCashfreePayment,
  cancelPayment,
} from "@/lib/actions/payment.actions";
import { load } from "@cashfreepayments/cashfree-js";

import { unispace, pressStart2P } from "@/fonts/fonts";
import Footer from "@/my_components/Footer";
import { TIERS } from "@/data/tiers";

import tier1Pic from "@/assets/tier1.gif";
import tier2Pic from "@/assets/tier2.gif";
import tier3Pic from "@/assets/tier3.gif";
import bgImage from "@/assets/GlassBag.svg";
import { useToast } from "@/my_components/Toast";

interface CheckoutClientProps {
  user: any; // Using any for now to avoid extensive type definitions, or strictly: Models.User<Models.Preferences>
}

export default function CheckoutClient({ user }: CheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierId = searchParams.get("tier");
  const selectedTier = TIERS.find((t) => t.tier.toString() === tierId);

  const upgradeFromId = searchParams.get("upgradeFrom");
  const upgradeFromTier = upgradeFromId
    ? TIERS.find((t) => t.tier.toString() === upgradeFromId)
    : null;

  // Default to 1 qty
  const [qty, setQty] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  React.useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (orderId) {
      const verify = async () => {
        setIsProcessing(true);
        try {
          const result = await verifyCashfreePayment(orderId);
          if (result.success) {
            toast.success(
              "TRANSACTION PROTOCOL COMPLETE. WELCOME TO THE FUTURE.",
              "SYSTEM UPDATE: TICKET SECURED",
            );
            router.push("/events");
          } else {
            toast.error("Payment verification failed! Please contact support.");
            router.replace(window.location.pathname); // Clear params
          }
        } catch (error) {
          console.error(error);
          toast.error("Error verifying payment");
          router.replace(window.location.pathname);
        } finally {
          setIsProcessing(false);
        }
      };
      verify();
    }
  }, [searchParams, toast, router]);

  if (!selectedTier) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <div className={`${unispace.className} text-xl text-red-500`}>
          Invalid tier selected
        </div>
      </div>
    );
  }

  // Determine image and price
  const tierImages: Record<number, any> = {
    1: tier1Pic,
    2: tier2Pic,
    3: tier3Pic,
  };
  const tierImage = tierImages[selectedTier.tier] || tier1Pic;

  // Parse price: "₹100" -> 100
  const numericPrice = parseInt(selectedTier.price.replace(/[^0-9]/g, "")) || 0;

  // Calculate discount if upgrading
  let upgradeDiscount = 0;
  if (upgradeFromTier) {
    upgradeDiscount =
      parseInt(upgradeFromTier.price.replace(/[^0-9]/g, "")) || 0;
  }

  // Derived state
  const pricePerUnit = Math.max(0, numericPrice - upgradeDiscount);
  const subtotal = pricePerUnit * qty;
  const taxes = subtotal * 0.18;
  const total = subtotal + taxes;

  // Main payment handler with Cashfree integration
  const handlePayment = async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      // Step 1: Initiate Payment
      const initResult = await initiatePayment(
        "TICKET",
        {
          tier: selectedTier.tier,
          upgradeFrom: upgradeFromTier ? upgradeFromTier.tier : null,
          redirectUrl: window.location.href,
        },
        user.$id,
        total, // This is the calculated total
      );

      if (!initResult.success) {
        throw new Error(initResult.error || "Failed to initiate payment");
      }

      // Cashfree Flow
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
      // Note: Cashfree usually handles this via returnUrl redirect.

      setIsProcessing(false);
      return;
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(
        error.message || "Failed to initiate payment. Please try again.",
      );
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI",
      description: "Pay via Google Pay, PhonePe, Paytm",
      icon: <Smartphone className="w-6 h-6" />,
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      description: "Visa, Mastercard, Rupay",
      icon: <CreditCard className="w-6 h-6" />,
    },
    {
      id: "wallet",
      name: "Wallet",
      description: "Paytm, PhonePe, Amazon Pay",
      icon: <Wallet className="w-6 h-6" />,
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden bg-black">
      <div className="flex flex-col md:flex-row w-full grow min-h-screen">
        {/* LEFT SIDE: Product & Summary */}
        <div className="w-full md:w-1/2 flex flex-col p-6 md:p-12 lg:p-20 lg:pt-36 relative border-r border-white/10">
          {/* Inner Container */}
          <div className="flex flex-col h-full justify-center max-w-xl mx-auto w-full gap-10">
            {/* Header */}
            <div className="flex flex-col gap-8">
              <h1
                className={`text-[#d4a574] text-3xl md:text-4xl uppercase tracking-wider ${pressStart2P.className}`}
              >
                Checkout
              </h1>

              {/* Product Card */}
              <div className="w-full relative bg-[#d4a574]/10 border overflow-hidden border-[#d4a574]/20 rounded-xl p-2 h-64 flex backdrop-blur-sm">
                {/* Bg Image */}
                <div className="absolute top-0 right-0 w-120 h-120 z-0 pointer-events-none">
                  <Image
                    src={bgImage}
                    alt="Bg"
                    fill
                    className="object-contain brightness-125 rotate-12 translate-x-30 -translate-y-5 opacity-25 md:opacity-50 lg:opacity-85"
                  />
                </div>
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/50 to-[#d4a574]/40 z-0" />

                <div className="flex z-10 w-full h-full gap-2 sm:gap-4 md:gap-6">
                  {/* Image Wrapper */}
                  <div className="relative w-1/3 h-full shrink-0 border border-[#d4a574]/40 rounded-lg overflow-hidden bg-black/50">
                    <Image
                      src={tierImage}
                      alt={selectedTier.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col w-2/3 justify-between p-1 z-10">
                    <div>
                      <h3
                        className={`${pressStart2P.className} text-sm md:text-lg lg:text-xl text-white mb-2 leading-tight uppercase`}
                      >
                        {upgradeFromTier
                          ? `Upgrade to ${selectedTier.title}`
                          : selectedTier.title}{" "}
                        <br /> Ticket
                      </h3>
                      <p className="text-white/80 text-xs">
                        Tier {selectedTier.tier}
                      </p>
                    </div>

                    <div className="flex flex-col lg:flex-row flex-wrap justify-between items-start sm:items-end gap-3 mt-2">
                      <span
                        className={`${unispace.className} text-white text-lg md:text-xl mix-blend-difference`}
                      >
                        &#8377;{subtotal.toFixed(2)}
                      </span>

                      {/* Controls */}
                      <div className="flex gap-1 h-9 items-center">
                        <button className="h-full aspect-square hover:bg-red-500 backdrop-blur-xl border border-black flex items-center justify-center hover:border-red-500/50 rounded group bg-black/20">
                          <Trash2
                            size={16}
                            className="text-black group-hover:scale-110"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full pt-5">
              <div className="border-t border-[#d4a574]/20 pt-6">
                <h3
                  className={`${unispace.className} text-[#d4a574] mb-6 text-xl uppercase tracking-widest`}
                >
                  Order Summary
                </h3>
                <div
                  className={`flex flex-col gap-4 text-sm md:text-base ${unispace.className} text-zinc-400`}
                >
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>&#8377;{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (18%)</span>
                    <span>&#8377;{taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-zinc-500">Digital</span>
                  </div>
                  <div className="h-px w-full bg-[#d4a574]/20 my-2" />
                  <div className="flex justify-between text-white text-lg md:text-xl font-bold">
                    <span>Total</span>
                    <span className="text-[#d4a574]">
                      &#8377;{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Payment */}
        <div
          className="w-full md:w-1/2 lg:pt-36 bg-black flex flex-col justify-center border-l border-white/5"
          style={{
            background:
              "radial-gradient(175% 145% at 50% 10%, #070a10 30%, #d4a57425 60%, #d4a57450 100%)",
          }}
        >
          <div className="max-w-md w-full mx-auto flex flex-col gap-5 bg-[#d4a57410] shadow-xl p-5 backdrop-blur-sm border border-[#d4a574]/10 rounded-xl">
            <div className="space-y-2">
              <h2 className="text-white text-2xl lg:text-3xl font-bold">
                Choose payment method
              </h2>
              <p className="text-white/45 text-sm">
                Complete your purchase securely with Cashfree.
              </p>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 border transition-all cursor-pointer duration-200 flex items-center justify-between group rounded-lg ${
                    selectedMethod === method.id
                      ? "border-[#d4a574] bg-[#d4a574]/20"
                      : "border-white/10 hover:border-[#d4a574]/50 bg-black/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        selectedMethod === method.id
                          ? "bg-[#d4a574] text-black"
                          : "text-[#d4a574] bg-white/5"
                      }`}
                    >
                      {method.icon}
                    </div>
                    <div className="text-left">
                      <div
                        className={`font-semibold ${selectedMethod === method.id ? "text-[#d4a574]" : "text-white"}`}
                      >
                        {method.name}
                      </div>
                      <div className="text-xs text-white/50 hidden sm:block">
                        {method.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-[#070a1085] p-4 space-y-2 text-white rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span className="font-medium">₹{taxes.toFixed(2)}</span>
              </div>
              <div className="border-t border-zinc-200/20 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg text-[#d4a574]">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className={`flex items-center font-bold justify-center gap-2 text-black cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 py-3 text-center bg-[#d4a574] rounded-lg shadow-lg hover:shadow-[#d4a574]/20 ${unispace.className} ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span className="text-lg">
                {isProcessing
                  ? "PROCESSING..."
                  : upgradeFromTier
                    ? `UPGRADE ₹${total.toFixed(2)}`
                    : `PAY ₹${total.toFixed(2)}`}
              </span>
              {!isProcessing && <ChevronRight className="w-5 h-5" />}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
              Secured Payment
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
