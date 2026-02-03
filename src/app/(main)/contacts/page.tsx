"use client";

import React from "react";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { contactDetails } from "@/data/info"; // Now returns Record<string, []>
import { unispace, pressStart2P } from "@/fonts/fonts";
import Footer from "@/my_components/Footer";

export default function ContactsPage() {
  return (
    <div className="min-h-screen w-screen bg-black text-white p-4 md:pt-42 md:p-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className=" mx-auto relative z-10 font-sans">
        {/* Grid of Teams */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {Object.entries(contactDetails).map(([teamName, members], idx) => (
            <TeamGroup
              key={teamName}
              teamName={teamName}
              members={members}
              index={idx}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function TeamGroup({
  teamName,
  members,
  index,
}: {
  teamName: string;
  members: { name: string; contact: string }[];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="w-full flex flex-col gap-4"
    >
      {/* Team Header */}
      <div
        className={`text-[#d4a574] text-lg uppercase tracking-widest border-b border-[#d4a574]/30 pb-2 ${unispace.className}`}
      >
        {teamName}
      </div>

      {/* Members List */}
      <div className="flex flex-col gap-3">
        {members.map((member, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-[#111] border border-white/5 p-4 hover:border-[#d4a574]/50 transition-colors group"
          >
            <div className="flex flex-col">
              <span className="text-white font-bold text-base tracking-wide">
                {member.name}
              </span>
              <span className="text-white/40 text-xs mt-1"> COORDINATOR </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`tel:${member.contact}`}
                className="w-10 h-10 flex items-center justify-center bg-[#222] text-[#d4a574] hover:bg-[#d4a574] hover:text-black transition-all"
                aria-label={`Call ${member.name}`}
              >
                <Phone size={18} />
              </a>
              <span
                className={`${unispace.className} text-xs text-white/60 tracking-wider hidden sm:block`}
              >
                {member.contact}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
