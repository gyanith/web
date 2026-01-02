import React from "react";
import { motion, scale } from "framer-motion";
import Image from "next/image";

import testPic from "@/assets/techEvents.png";
import ShinyText from "./ShinyText";
import { unispace, blueScreen } from "@/fonts/fonts";

type EventCardProps = {
  eventName: string;
  description: string;
  day: string;
  location: string;
  prizePool: string;
};

const EventCard: React.FC<EventCardProps> = ({
  eventName,
  description,
  day,
  location,
  prizePool,
}) => {
  return (
    <motion.div
      className="w-full max-w-[90vw] bg-[#1b1b1b] cursor-pointer border group border-[#d4a574]/40 p-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileTap={{
        scale: 0.97,
      }}
    >
      {/* Scanline effect */}
      {/* <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 50%, rgba(212, 165, 116, 0.03) 50%)",
          backgroundSize: "100% 4px",
        }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      /> */}

      {/* IMAGE / CUTOUT SECTION */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
        <Image
          src={testPic}
          alt="Event image"
          fill
          className="object-cover  group-hover:scale-100 scale-103 transition-all duration-300 ease-in-out overflow-hidden"
          objectPosition="top"
          priority
        />

        {/* PRIZE TAG */}
        <motion.div
          className="absolute top-0  flex items-end justify-end  right-0    text-[#d4a574] text-lg "
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="absolute top-0 right-0 flex flex-col items-end h-fit rounded-bl-2xl px-4 py-2 bg-[#1b1b1b]">
            <span className="text-sm text-nowrap">Prize Pool</span>
            <span className="font-extrabold text-nowrap"> Rs. {prizePool}</span>
          </span>
        </motion.div>
      </div>

      {/* CONTENT */}
      <motion.div
        className="mt-4 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h3
          className={`text-[#d4a574] text-2xl tracking-wider font-semibold ${blueScreen.className}`}
        >
          {eventName}
        </h3>

        <p className="text-[#d4a574]/80 text-sm line-clamp-4 text-ellipsis">
          {description}
        </p>
      </motion.div>

      {/* FOOTER */}
      <motion.div
        className="mt-4 flex gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.div
          className={`flex-1 border border-[#d4a574]/60  text-[#d4a574] text-sm py-2 text-center bg-[#d4a57450] ${unispace.className}`}
        >
          {day}
        </motion.div>

        <motion.div
          className={`flex-1 border border-[#d4a574]/60  text-[#d4a574] text-sm py-2 text-center bg-[#d4a57450] ${unispace.className}`}
        >
          {location}
        </motion.div>

        <motion.button className="flex-1 bg-[#d4a574]  cursor-pointer text-black text-sm font-semibold py-2 relative overflow-hidden">
          <motion.span
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          <ShinyText
            text="Register"
            className={`text-black ${unispace.className} `}
            color="black"
            shineColor="#d4a574"
            delay={2}
          />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default EventCard;
