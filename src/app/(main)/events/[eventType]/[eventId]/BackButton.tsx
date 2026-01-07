// components/BackButton.tsx
"use client"; // 👈 This marks it as a Client Component

import { useRouter } from "next/navigation";
import { pressStart2P } from "@/fonts/fonts";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      className={`hover:bg-[#D4A574]  hover:text-black cursor-pointer text-right text-[#D4A574] border-[#D4A574] border p-2 rounded-lg text-[12px] ${pressStart2P.className}`}
      onClick={() => router.back()} // ✅ Safe to use here
    >
      <span className={`mr-2 ${pressStart2P.className}`}>←</span>
      <span className={` ${pressStart2P.className}`}>GO BACK</span>
    </button>
  );
}
