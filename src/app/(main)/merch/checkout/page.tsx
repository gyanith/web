"use client";

import React, { useState } from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { unispace, pressStart2P, garetBook } from "@/fonts/fonts";
import Footer from "@/components/Footer";
import Image from "next/image";
import testPic from "@/assets/merchPic1.jpg";
import bgImage from "@/assets/GlassBag.svg";

const CheckoutPage = ({
  qtySent = 1,
  price = 350.0,
}: {
  qtySent?: number;
  price?: number;
}) => {
  const [qty, setQty] = useState(qtySent);

  // Derived state for calculations
  const subtotal = price * qty;
  const taxes = 4.0;
  const total = subtotal + taxes;

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
                    className="object-contain brightness-125 rotate-12 translate-x-30 -translate-y-5 opacity-50"
                  />
                </div>

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
                  <div className="flex flex-col w-2/3 justify-between p-1">
                    <div>
                      <h3
                        className={`${pressStart2P.className} text-sm md:text-lg lg:text-2xl text-white mb-2 leading-tight`}
                      >
                        Product <br />
                        Name
                      </h3>
                    </div>

                    <div className="flex flex-col lg:flex-row flex-wrap justify-between items-start sm:items-end gap-3 mt-2">
                      <span
                        className={`${unispace.className} text-[#d4a574] text-lg md:text-xl`}
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
        <div className="w-full md:w-1/2 bg-white flex flex-col justify-center p-6 md:p-12 lg:p-20 lg:pt-32">
          <div className="max-w-md w-full mx-auto flex flex-col gap-8">
            <div className="space-y-2">
              <h2
                className={`${pressStart2P.className} text-zinc-900 text-2xl lg:text-3xl`}
              >
                Payment
              </h2>
              <p className={`${unispace.className} text-zinc-500 text-sm`}>
                Complete your purchase securely.
              </p>
            </div>

            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="space-y-2">
                <label
                  className={`${unispace.className} text-xs font-bold text-zinc-600 uppercase`}
                >
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="JOHN DOE"
                  className="w-full p-4 bg-zinc-100 rounded-lg border border-zinc-200 focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574] transition-all placeholder:text-zinc-400 font-medium text-zinc-800"
                />
              </div>

              <div className="space-y-2">
                <label
                  className={`${unispace.className} text-xs font-bold text-zinc-600 uppercase`}
                >
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full p-4 bg-zinc-100 rounded-lg border border-zinc-200 focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574] transition-all placeholder:text-zinc-400 font-medium text-zinc-800"
                />
              </div>

              <div className="flex gap-4">
                <div className="space-y-2 w-1/2">
                  <label
                    className={`${unispace.className} text-xs font-bold text-zinc-600 uppercase`}
                  >
                    Exp. Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-4 bg-zinc-100 rounded-lg border border-zinc-200 focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574] transition-all placeholder:text-zinc-400 font-medium text-zinc-800"
                  />
                </div>
                <div className="space-y-2 w-1/2">
                  <label
                    className={`${unispace.className} text-xs font-bold text-zinc-600 uppercase`}
                  >
                    CVC
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-4 bg-zinc-100 rounded-lg border border-zinc-200 focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574] transition-all placeholder:text-zinc-400 font-medium text-zinc-800"
                  />
                </div>
              </div>

              <button className="mt-4 w-full bg-[#d4a574] hover:bg-[#b88d60] text-white py-4 rounded-lg font-bold shadow-lg shadow-[#d4a574]/30 transition-all active:scale-[0.98] duration-200">
                <span className={`${pressStart2P.className} text-sm`}>
                  PAY &#8377;{total.toFixed(2)}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
