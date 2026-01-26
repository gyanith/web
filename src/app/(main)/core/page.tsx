"use client";
import LiquidEther from "@/components/LiquidEther";
import { garetBook, pressStart2P, superRetro } from "@/fonts/fonts";
import Image from "next/image";
import { motion } from "framer-motion";
import { User } from "lucide-react";

import coreBg1 from "@/assets/coreBg1.png";
import coreBg2 from "@/assets/coreBg2.png";

import AnimatedStripes from "@/my_components/AnimatedStripes";
import SpotlightCard from "@/components/SpotlightCard";
import Footer from "@/my_components/Footer";
import SparklesCore from "@/my_components/SparklesCore";
import { allTeam, coreTeam } from "@/lib/info";
import {
  getImageUrl,
  getOptimizedImageUrl,
} from "@/lib/helpers/imageStorage.helper";

export default function CorePage() {
  return (
    <div className="w-screen h-fit overflow-x-hidden relative">
      <div className="w-screen h-screen absolute inset-0">
        <SparklesCore
          id="tsparticlesfullpa"
          speed={5}
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={75}
          className="w-full h-full"
          particleColor="#fefefe"
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
            {coreTeam.map((member, index) => (
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
                  <div className="relative w-full aspect-square overflow-hidden bg-neutral-900 flex items-center justify-center">
                    {member.imageId ? (
                      <Image
                        src={getImageUrl(
                          process.env.NEXT_PUBLIC_APPWRITE_COREPICS_BUCKET_ID!,
                          member.imageId,
                        )}
                        alt={member.name}
                        fill
                        unoptimized
                        objectPosition="top"
                        className="object-cover contrast-125 transition-transform duration-500"
                      />
                    ) : (
                      <User className="w-24 h-24 text-neutral-700" />
                    )}
                  </div>
                  <div className="p-4  bg-zinc-950/80 backdrop-blur-sm absolute bottom-0 w-full border-t border-white/10">
                    <h3
                      className={`select-none text-xl md:text-2xl ${pressStart2P.className} mb-2 text-[#D4A574] uppercase`}
                    >
                      {member.name}
                    </h3>
                    <span
                      className={` flex justify-between text-sm md:text-base ${garetBook.className} text-[#D4A574] tracking-wide`}
                    >
                      <span className="select-none font-bold uppercase">
                        {member.team}
                      </span>
                      <span
                        className={`${garetBook.className} font-bold uppercase`}
                      >
                        {member.role}
                      </span>
                    </span>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Teams Section */}
      <div className="w-screen min-h-screen flex flex-col items-center">
        <div
          className={`w-screen sticky top-16 h-fit z-10 relative items-center justify-center flex bg-[#D4A574] text-black overflow-hidden border-b-4 border-black`}
        >
          <div className="absolute inset-0 w-full h-full">
            <AnimatedStripes />
          </div>
          <span
            className={`z-20 font-black text-white bg-[#070a10] px-4 py-5 text-2xl md:text-4xl lg:text-5xl text-center uppercase ${pressStart2P.className}`}
          >
            TEAMS
          </span>
        </div>

        <div className="w-full h-full flex flex-col justify-center items-center p-8">
          <div className="w-full grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(450px,1fr))] gap-8">
            {allTeam.map((member, index) => (
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
                  <div className="relative w-full aspect-square overflow-hidden bg-neutral-900 flex items-center justify-center">
                    {member.imageId ? (
                      <Image
                        src={getImageUrl(
                          process.env.NEXT_PUBLIC_APPWRITE_COREPICS_BUCKET_ID!,
                          member.imageId,
                        )}
                        alt={member.name}
                        fill
                        unoptimized
                        objectPosition="top"
                        className="object-cover contrast-125 transition-transform duration-500"
                      />
                    ) : (
                      <User className="w-24 h-24 text-neutral-700" />
                    )}
                  </div>
                  <div className="p-4  bg-zinc-950/80 backdrop-blur-sm absolute bottom-0 w-full border-t border-white/10">
                    <h3
                      className={`select-none text-xl md:text-2xl ${pressStart2P.className} mb-2 text-[#D4A574] uppercase`}
                    >
                      {member.name}
                    </h3>
                    <span
                      className={` flex justify-between text-sm md:text-base ${garetBook.className} text-[#D4A574] tracking-wide`}
                    >
                      <span className="select-none font-bold uppercase">
                        {member.team}
                      </span>
                      <span
                        className={`${garetBook.className} font-bold uppercase`}
                      >
                        {member.role}
                      </span>
                    </span>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
