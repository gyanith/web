"use client";
import LiquidEther from "@/components/LiquidEther";
import { garetBook, pressStart2P, superRetro } from "@/fonts/fonts";
import Image from "next/image";
import { motion } from "framer-motion";

import coreBg1 from "@/assets/coreBg1.png";
import coreBg2 from "@/assets/coreBg2.png";

import samplePic from "@/assets/funEvents.png";

import AnimatedStripes from "@/my_components/AnimatedStripes";
import SpotlightCard from "@/components/SpotlightCard";

export default function core() {
  return (
    <div className="w-screen h-fit overflow-x-hidden relative">
      <div className="w-screen h-screen absolute inset-0">
        <LiquidEther
          colors={["#FFFFFF", "#070A10", "#D4A574"]}
          mouseForce={40}
          cursorSize={120}
          isViscous={false}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={false}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      <div className="absolute inset-0 z-0 w-screen h-screen overflow-hidden">
        <motion.div
          className="absolute md:-top-[25vw] lg:-top-[15vw] -top-[10vw] sm:-top-[20vw] -right-[10%] z-0"
          initial={{ opacity: 0, y: -100, rotate: 10 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <motion.div
            animate={{
              rotate: [-11, -9, -11],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 5,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <Image
              src={coreBg2}
              width={950}
              height={950}
              alt="Background"
              className="object-cover"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute md:-bottom-[32vw] lg:-bottom-[15vw] -bottom-10 sm:-bottom-[20vw] -left-[5%] z-0"
          initial={{ opacity: 0, y: 100, rotate: -10 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        >
          <motion.div
            animate={{
              rotate: [-11, -9, -11],
              y: [0, 20, 0],
            }}
            transition={{
              duration: 6,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1,
            }}
          >
            <Image
              src={coreBg1}
              width={900}
              height={900}
              alt="Background"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* <nav className="fixed z-100 w-screen h-16 bg-[#070A1075] backdrop-blur-md flex items-center justify-center px-8 ">
        <div>
          <ul className="flex gap-8 text-white">
            <li className="hover:text-zinc-400 transition-colors cursor-pointer">
              HOME
            </li>
            <li className="hover:text-zinc-400 transition-colors cursor-pointer">
              CONTACT
            </li>
            <li className="hover:text-zinc-400 transition-colors cursor-pointer">
              PARTNERS
            </li>
          </ul>
        </div>
      </nav> */}

      <div className="w-screen h-screen  z-50 flex justify-center items-center">
        <span
          className={`select-none mix-blend-difference flex items-center justify-center  w-full text-5xl lg:text-7xl text-center lg:text-left font-bold tracking-wider text-white ${superRetro.className}`}
        >
          MEET
          <br />
          THE
          <br />
          TEAM
        </span>
      </div>

      {/* Core Section */}
      <div className="w-screen min-h-screen flex flex-col items-center">
        <div
          className={`w-screen sticky top-16 h-fit z-10 relative items-center justify-center flex bg-[#D4A574]  text-black overflow-hidden border-b-4 border-black`}
        >
          <div className="absolute inset-0 w-full h-full">
            <AnimatedStripes />
          </div>
          <span
            className={`z-20 font-black text-white bg-[#070a10] text-3xl md:text-5xl lg:text-7xl  px-4 py-5 ${pressStart2P.className}`}
          >
            CORE
          </span>
        </div>

        <div className="w-full h-full flex flex-col justify-center items-center p-8">
          <div className="w-full grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(450px,1fr))] gap-8">
            {[...Array(7)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <SpotlightCard
                  glowRadius={250}
                  className=" rounded-none overflow-hidden relative group transition-colors duration-300 p-0"
                >
                  <div className="relative w-full aspect-square overflow-hidden">
                    <Image
                      src={samplePic}
                      alt={`Team Member ${index + 1}`}
                      fill
                      className="object-cover contrast-125 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4  bg-zinc-950/80 backdrop-blur-sm absolute bottom-0 w-full border-t border-white/10">
                    <h3
                      className={`select-none text-xl md:text-2xl ${pressStart2P.className} mb-2 text-[#D4A574]`}
                    >
                      ATHUL KESAV
                    </h3>
                    <span
                      className={` flex justify-between text-sm md:text-base ${garetBook.className} text-[#D4A574] tracking-wide`}
                    >
                      <span className="select-none font-bold">
                        WEB TEAM LEAD
                      </span>
                      <span className={`${garetBook.className}`}>
                        +91 9159775325
                      </span>
                    </span>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Other Sections */}
      <div className="w-screen min-h-screen flex flex-col items-center">
        <div
          className={`w-screen sticky top-16 h-fit z-10 relative items-center justify-center flex bg-[#D4A574] text-7xl text-black overflow-hidden border-b-4 border-black`}
        >
          <div className="absolute inset-0 w-full h-full">
            <AnimatedStripes />
          </div>
          <span
            className={`z-20 font-black text-white bg-[#070a10] px-4 py-5 ${pressStart2P.className}`}
          >
            ACCOMMODATION
          </span>
        </div>
        <span
          className={`text-5xl lg:text-7xl text-center font-bold tracking-wider text-white ${superRetro.className}`}
        >
          MEET
          <br />
          THE
          <br />
          TEAM
        </span>
      </div>
    </div>
  );
}
