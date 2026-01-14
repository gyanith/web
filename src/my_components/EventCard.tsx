"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

import testPic from "@/assets/techEvents.png";
import ShinyText from "./ShinyText";
import { unispace, blueScreen } from "@/fonts/fonts";

type EventCardProps = {
  eventId: string;
  eventName: string;
  eventType: "FUN" | "TECH";
  description: string;
  day: string;
  location: string;
  prizePool: string;
  imageUrl?: string;
};

const EventCard: React.FC<EventCardProps> = ({
  eventId,
  eventName,
  eventType,
  description,
  day,
  location,
  prizePool,
  imageUrl,
}) => {
  const router = useRouter();

  // console.log("EventCard imageUrl:", imageUrl);

  return (
    <motion.div
      id={eventId}
      className="w-full max-w-[90vw] sm:max-w-[50vw] lg:max-w-full bg-[#1b1b1b] cursor-pointer border group border-[#d4a574]/40 p-4 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      whileTap={{
        scale: 0.97,
      }}
      onClick={() => {
        router.push(`/events/${eventType.toLowerCase()}/${eventId}`);
      }}
    >
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={eventName}
            fill
            className="object-cover group-hover:scale-100 scale-103 transition-all duration-300 ease-in-out"
            objectPosition="top"
            priority
            onError={(e) => {
              console.error("Image failed to load:", imageUrl);
              // Optional: Set a fallback image
              e.currentTarget.src = "/placeholder-event.png";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#d4a574]/50">
            No Image Available
          </div>
        )}

        {/* PRIZE TAG */}
        {prizePool && (
          <motion.div
            className="absolute top-0 flex items-end justify-end right-0 text-[#d4a574] text-lg"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <span className=" top-0 right-0 flex flex-col items-end h-fit rounded-bl-2xl px-4 py-2 bg-[#1b1b1b] z-10">
              <span className="text-sm text-nowrap">Prize Pool</span>
              <span className="font-extrabold text-nowrap">
                {" "}
                Rs. {prizePool}
              </span>
            </span>
          </motion.div>
        )}
      </div>

      {/* CONTENT */}
      <motion.div
        className="mt-4 space-y-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h3
          className={`text-[#d4a574] text-2xl tracking-wider font-semibold ${blueScreen.className}`}
        >
          {eventName}
        </h3>

        <p className="text-[#d4a574]/80 text-sm line-clamp-2 leading-relaxed min-h-[2lh] text-ellipsis">
          {description}
        </p>
      </motion.div>

      {/* FOOTER */}
      <motion.div
        className="mt-4 flex gap-2"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <motion.div
          className={`flex-1 border border-[#d4a574]/60 text-[#d4a574] text-sm py-2 text-center bg-[#d4a57450] ${unispace.className}`}
        >
          DAY {day}
        </motion.div>

        <motion.div
          className={`flex-1 border border-[#d4a574]/60 text-[#d4a574] text-sm py-2 text-center bg-[#d4a57450] ${unispace.className}`}
        >
          {location}
        </motion.div>

        <motion.button className="flex-1 bg-[#d4a574] cursor-pointer text-black text-sm font-semibold py-2 relative overflow-hidden">
          <motion.span
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          <ShinyText
            text="Register"
            className={`text-black ${unispace.className}`}
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
