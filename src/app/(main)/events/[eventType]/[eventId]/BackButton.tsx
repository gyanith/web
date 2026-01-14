
"use client";

import { useRouter } from "next/navigation";
import { pressStart2P } from "@/fonts/fonts";

export default function BackButton({eventType}: {eventType: string}) {
  const router = useRouter();

  return (
    <button
      className={`hover:bg-[#D4A574] backdrop-blur-md hover:text-black cursor-pointer text-[#D4A574] border-[#D4A574] border p-2 text-[12px] ${pressStart2P.className} rounded-none min-w-[40px] min-h-[40px] flex items-center justify-center aspect-square md:aspect-auto md:px-4`}
      onClick={() => router.push(`/events/${eventType}`)} // ✅ Safe to use here
    >
      <span className={`mr-0 md:mr-2 ${pressStart2P.className}`}>←</span>
      <span className={`hidden md:inline ${pressStart2P.className}`}>GO BACK</span>
    </button>
  );
}
