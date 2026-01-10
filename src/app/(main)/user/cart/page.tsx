"use client";
import { motion } from "framer-motion";
import { ledLight, unispace } from "@/fonts/fonts";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, X, RefreshCw } from "lucide-react";
import Footer from "@/components/Footer";

interface CartItem {
  id: string;
  name: string;
  description: string;
  image: string;
  oneTimePrice: number;
  subscriptionPrice: number;
  quantity: number;
  selectedOption: "oneTime" | "subscription";
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Simply Soluble Elev8 Doll CBD Bath Bomb",
      description: "Mint / 100 mg / x1",
      image: "/products/bath-bomb.jpg",
      oneTimePrice: 50.0,
      subscriptionPrice: 45.0,
      quantity: 1,
      selectedOption: "oneTime",
    },
    {
      id: "2",
      name: "Water Soluble CBD Powder",
      description: "100 mg / x1",
      image: "/products/cbd-powder.jpg",
      oneTimePrice: 50.0,
      subscriptionPrice: 45.0,
      quantity: 1,
      selectedOption: "oneTime",
    },
    {
      id: "3",
      name: "Water Soluble CBD Powder",
      description: "100 mg / x1",
      image: "/products/cbd-powder.jpg",
      oneTimePrice: 50.0,
      subscriptionPrice: 45.0,
      quantity: 1,
      selectedOption: "oneTime",
    },
    {
      id: "4",
      name: "Water Soluble CBD Powder",
      description: "100 mg / x1",
      image: "/products/cbd-powder.jpg",
      oneTimePrice: 50.0,
      subscriptionPrice: 45.0,
      quantity: 1,
      selectedOption: "oneTime",
    },
    {
      id: "5",
      name: "Water Soluble CBD Powder",
      description: "100 mg / x1",
      image: "/products/cbd-powder.jpg",
      oneTimePrice: 50.0,
      subscriptionPrice: 45.0,
      quantity: 1,
      selectedOption: "oneTime",
    },
  ]);

  const [couponCode, setCouponCode] = useState("");

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const updateOption = (id: string, option: "oneTime" | "subscription") => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, selectedOption: option } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const calculateItemTotal = (item: CartItem) => {
    const price =
      item.selectedOption === "oneTime"
        ? item.oneTimePrice
        : item.subscriptionPrice;
    return price * item.quantity;
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0
  );
  const shipping = 0; // Free shipping
  const tax = 0;
  const total = subtotal + shipping + tax;

  const handleApplyCoupon = () => {
    // Coupon logic here
    console.log("Applying coupon:", couponCode);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
      <div className="h-fit md:min-h-screen w-screen border-b border-b-[#d4a574]">
        {/* Main Content */}
        <div className=" ">
          {/* Main Content */}
          <div className="w-full lg:mt-16 mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-3 xs:py-4 sm:py-6 md:py-8">
            {/* Page Title */}
            <h1
              className={`text-3xl text-center lg:text-left xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light mb-4 xs:mb-6 text-[#d4a574] tracking-wider ${ledLight.className}`}
            >
              CART
            </h1>

            {/* Main Grid Layout - Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-7 gap-4 sm:gap-6 md:gap-8">
              {/* Cart Items Section */}
              <div className="lg:col-span-2 xl:col-span-5 space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 p-3 xs:p-4 sm:p-5 md:p-6 rounded-lg md:rounded-xl transition-all relative"
                  >
                    {/* Remove Button - Responsive positioning */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 xs:top-3 xs:right-3 p-1 xs:p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors z-10"
                    >
                      <X className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                    </button>

                    {/* Mobile & Small Tablet Layout (< 768px) */}
                    <div className="flex gap-3 xs:gap-4 md:hidden">
                      {/* Product Image */}
                      <div className="w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 bg-zinc-800 rounded flex items-center justify-center shrink-0">
                        <div className="w-11 h-11 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-zinc-700 rounded-full" />
                      </div>

                      <div className="flex-1 min-w-0 pr-6 xs:pr-8">
                        {/* Product Name */}
                        <h3 className="font-medium text-sm xs:text-base sm:text-lg text-white truncate mb-1">
                          {item.name}
                        </h3>
                        {/* Description - Hidden on xs */}
                        <p className="hidden xs:block text-xs sm:text-sm text-zinc-400 mb-2 xs:mb-3 truncate">
                          {item.description}
                        </p>

                        {/* Price and Quantity Row */}
                        <div className="flex items-center justify-between mt-2 xs:mt-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 xs:gap-2 bg-zinc-800 border border-zinc-700 rounded px-1 xs:px-2 py-0.5 xs:py-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="text-white hover:text-[#d4a574] px-1.5 xs:px-2 py-0.5 text-sm xs:text-base"
                            >
                              -
                            </button>
                            <span className="text-white text-xs xs:text-sm min-w-4 xs:min-w-[20px] text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="text-white hover:text-[#d4a574] px-1.5 xs:px-2 py-0.5 text-sm xs:text-base"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-base xs:text-lg sm:text-xl font-bold text-[#d4a574]">
                              ${calculateItemTotal(item).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tablet & Desktop Layout (≥ 768px) */}
                    <div className="hidden md:flex gap-4 md:gap-5 lg:gap-6">
                      {/* Product Image */}
                      <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-zinc-700 rounded-full" />
                      </div>

                      <div className="flex-1 space-y-3 md:space-y-4">
                        {/* Product Info */}
                        <div>
                          <h3 className="font-medium text-base md:text-lg lg:text-xl text-white">
                            {item.name}
                          </h3>
                          <p className="text-xs md:text-sm lg:text-base text-zinc-400 mt-1">
                            {item.description}
                          </p>
                        </div>

                        {/* Purchase Options */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name={`option-${item.id}`}
                              checked={item.selectedOption === "oneTime"}
                              onChange={() => updateOption(item.id, "oneTime")}
                              className="w-3.5 h-3.5 md:w-4 md:h-4 accent-[#d4a574]"
                            />
                            <span className="text-xs md:text-sm lg:text-base font-medium text-white group-hover:text-[#d4a574] transition-colors">
                              ${item.oneTimePrice.toFixed(2)}
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                              type="radio"
                              name={`option-${item.id}`}
                              checked={item.selectedOption === "subscription"}
                              onChange={() =>
                                updateOption(item.id, "subscription")
                              }
                              className="w-3.5 h-3.5 md:w-4 md:h-4 accent-[#d4a574]"
                            />
                            <span className="text-xs md:text-sm lg:text-base text-zinc-400 group-hover:text-[#d4a574] transition-colors">
                              ${item.subscriptionPrice.toFixed(2)} / month
                            </span>
                          </label>
                        </div>

                        {/* Quantity and Total */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 md:gap-3 bg-zinc-800 border border-zinc-700 rounded px-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-white hover:text-[#d4a574] transition-colors"
                            >
                              -
                            </button>
                            <span className="px-1 md:px-2 text-sm md:text-base text-white font-medium min-w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-white hover:text-[#d4a574] transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-lg md:text-xl lg:text-2xl font-bold text-[#d4a574]">
                              ${calculateItemTotal(item).toFixed(2)}
                            </div>
                            <div className="text-xs md:text-sm text-zinc-500 mt-0.5">
                              ${(calculateItemTotal(item) * 1.1).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Coupon Section */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg md:rounded-xl p-3 xs:p-4 sm:p-5 md:p-6">
                  <p className="text-xs xs:text-sm md:text-base text-zinc-400 mb-2 xs:mb-3">
                    Have a coupon? Enter your code.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Coupon code"
                      className="flex-1 px-3 xs:px-4 py-2 xs:py-2.5 md:py-3 text-sm md:text-base bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574] transition-all"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 xs:px-6 py-2 xs:py-2.5 md:py-3 text-xs xs:text-sm md:text-base bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-[#d4a574] text-white font-medium transition-all whitespace-nowrap"
                    >
                      APPLY
                    </button>
                  </div>
                </div>
              </div>

              {/* Cart Totals Section - Sidebar on large screens, bottom on mobile */}
              <div className="lg:col-span-1 xl:col-span-2">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg md:rounded-xl p-3 xs:p-4 sm:p-5 md:p-6 space-y-3 xs:space-y-4 md:space-y-5 lg:space-y-6 lg:sticky lg:top-44">
                  <h2
                    className={`text-lg xs:text-xl sm:text-2xl md:text-3xl font-light text-[#d4a574] ${unispace.className}`}
                  >
                    CART TOTAL
                  </h2>

                  <div className="space-y-2 xs:space-y-3 text-xs xs:text-sm md:text-base">
                    {/* Tax - Hidden on mobile */}
                    <div className="hidden sm:flex justify-between py-1.5 xs:py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">TAX (estimated)</span>
                      <span className="font-medium text-white">
                        ${tax.toFixed(2)}
                      </span>
                    </div>

                    {/* Subtotal */}
                    <div className="flex justify-between py-1.5 xs:py-2 border-b border-zinc-800">
                      <span className="text-zinc-400">Subtotal</span>
                      <span className="font-medium text-white">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between pt-2 xs:pt-3 md:pt-4 text-sm xs:text-base md:text-lg">
                      <span className="font-medium text-white">Total</span>
                      <span className="font-bold text-[#d4a574] text-lg xs:text-xl md:text-2xl lg:text-3xl">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    className="block w-full bg-[#d4a574] hover:bg-[#b88d60] text-white text-center py-2.5 xs:py-3 md:py-4 rounded-lg md:rounded-xl font-bold shadow-lg shadow-[#d4a574]/20 transition-all active:scale-[0.98] text-xs xs:text-sm md:text-base"
                  >
                    PROCEED TO CHECKOUT
                  </Link>

                  {/* Continue Shopping - Hidden on mobile */}
                  <button className="hidden md:flex items-center justify-center gap-2 w-full text-xs md:text-sm text-zinc-400 hover:text-[#d4a574] transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </motion.div>
  );
}
