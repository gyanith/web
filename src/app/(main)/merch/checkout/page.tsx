"use client";

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

import { unispace, pressStart2P, garetBook } from "@/fonts/fonts";
import Footer from "@/components/Footer";
import Image from "next/image";
import testPic from "@/assets/merchPic1.jpg";
import bgImage from "@/assets/GlassBag.svg";

const CheckoutPage = ({
  qtySent = 1,
  price = 350.0,
  sizeSelected = "L",
}: {
  qtySent?: number;
  price?: number;
  sizeSelected?: string;
}) => {
  const [qty, setQty] = useState(qtySent);
  const [selectedMethod, setSelectedMethod] = useState("card");

  // Derived state for calculations
  const subtotal = price * qty;
  const taxes = 4.0;
  const total = subtotal + taxes;

  const handlePayment = async () => {};

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
    <div className="min-h-screen w-full flex flex-col relative overflow-x-hidden">
      <div className="flex flex-col md:flex-row w-full grow min-h-screen">
        {/* =======================
            LEFT SIDE: Product & Summary 
            ======================= */}
        {/* Added lg:pt-32 here to push content down below the navbar on large screens */}
        <div className="w-full md:w-1/2 flex flex-col p-6 md:p-12 lg:p-20 lg:pt-32 relative border-r border-white/5">
          {/* Inner Container to constrain width on huge screens */}
          <div className="flex flex-col h-full justify-center max-w-xl mx-auto w-full gap-10">
            {/* Top Section: Header & Product */}
            <div className="flex flex-col gap-8">
              <h1
                className={`text-[#d4a574] text-3xl md:text-4xl uppercase tracking-wider ${pressStart2P.className}`}
              >
                Checkout
              </h1>

              {/* Product Card */}
              <div className="w-full relative bg-[#d4a574]/10 border overflow-hidden border-[#d4a574]/20 rounded-xl p-2 h-64 flex backdrop-blur-sm">
                {/* Bg image - Fixed Positioning */}
                <div className="absolute top-0 right-0 w-120 h-120 z-0 pointer-events-none">
                  <Image
                    src={bgImage}
                    alt="Bg image"
                    fill
                    className="object-contain brightness-125 rotate-12 translate-x-30 -translate-y-5 opacity-25 md:opacity-50 lg:opacity-85"
                  />
                </div>

                <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/50 to-[#d4a574]/40 z-0" />
                <div className="flex z-10 w-full h-full gap-2 sm:gap-4 md:gap-6">
                  {/* Image Wrapper */}
                  <div className="relative w-1/3 h-full shrink-0 border border-[#d4a574]/40 rounded-lg overflow-hidden bg-black/50">
                    <Image
                      src={testPic}
                      alt="Product Image"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col w-2/3 justify-between p-1 z-10">
                    <div>
                      <h3
                        className={`${pressStart2P.className} text-sm md:text-lg lg:text-2xl text-white mb-2 leading-tight`}
                      >
                        Product <br />
                        Name
                      </h3>

                      <p className="text-white">Size: {sizeSelected}</p>
                    </div>

                    <div className="flex flex-col lg:flex-row flex-wrap justify-between items-start sm:items-end gap-3 mt-2">
                      <span
                        className={`${unispace.className} text-white text-lg md:text-xl mix-blend-difference`}
                      >
                        &#8377;{subtotal.toFixed(2)}
                      </span>

                      {/* Controls */}
                      <div className="flex gap-1 h-9 items-center">
                        <div className="flex items-center h-full backdrop-blur-xl border overflow-hidden text-black border-black rounded bg-white/20">
                          <button
                            className="px-3 h-full hover:bg-black hover:scale-110 group hover:text-white  flex items-center justify-center"
                            onClick={() => setQty(Math.max(1, qty - 1))}
                          >
                            <Minus
                              size={14}
                              className="group-active:scale-95"
                            />
                          </button>
                          <span
                            className={`w-8 text-center text-xs ${unispace.className} `}
                          >
                            {qty}
                          </span>
                          <button
                            className="px-3 h-full hover:bg-black hover:scale-110 group hover:text-white  flex items-center justify-center"
                            onClick={() => setQty(qty + 1)}
                          >
                            <Plus size={14} className="group-active:scale-95" />
                          </button>
                        </div>

                        <button className="h-full aspect-square hover:bg-red-500 backdrop-blur-xl border border-black flex items-center justify-center  hover:border-red-500/50 rounded  group bg-black/20">
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

            {/* Bottom Section: Order Summary */}
            <div className="w-full  pt-5">
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
                    <span>Taxes</span>
                    <span>&#8377;{taxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-zinc-500">At College</span>
                  </div>

                  <div className="h-px w-full bg-[#d4a574]/20 my-2"></div>

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

        {/* =======================
            RIGHT SIDE: Payment 
            ======================= */}
        {/* Added lg:pt-32 here as well to ensure the payment form doesn't get hidden under the navbar */}
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto flex flex-col gap-5 bg-[#d4a57410] rounded-2xl shadow-xl p-5">
            <div className="space-y-2">
              <h2 className="text-zinc-900 text-2xl lg:text-3xl font-bold">
                Choose payment method
              </h2>
              <p className="text-zinc-500 text-sm">
                Complete your purchase securely with Razorpay.
              </p>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group hover:border-[#d4a574] ${
                    selectedMethod === method.id
                      ? "border-[#d4a574] bg-[#d4a574]/5"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        selectedMethod === method.id
                          ? "bg-[#d4a574] text-white"
                          : "bg-zinc-100 text-zinc-600 group-hover:bg-[#d4a574]/10 group-hover:text-[#d4a574]"
                      }`}
                    >
                      {method.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-zinc-900">
                        {method.name}
                      </div>
                      <div className="text-xs text-zinc-500 hidden sm:flex">
                        {method.description}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedMethod === method.id
                        ? "border-[#d4a574] bg-[#d4a574]"
                        : "border-zinc-300"
                    }`}
                  >
                    {selectedMethod === method.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-zinc-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Subtotal</span>
                <span className="text-zinc-900 font-medium">
                  ₹{total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Processing Fee</span>
                <span className="text-zinc-900 font-medium">₹0.00</span>
              </div>
              <div className="border-t border-zinc-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-zinc-900">Total</span>
                  <span className="font-bold text-zinc-900 text-lg">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              className="mt-2 w-full bg-[#d4a574] hover:bg-[#b88d60] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#d4a574]/30 transition-all active:scale-[0.98] duration-200 flex items-center justify-center gap-2"
            >
              <span className="text-sm">PAY ₹{total.toFixed(2)}</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Secured by Razorpay
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
