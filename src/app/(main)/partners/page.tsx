"use client";
import React, { useState, useRef } from "react";
import { useSpring, motion } from "framer-motion";
import Image from "next/image";

import handshakeImage from "@/assets/handshake-partner.svg";
import Footer from "@/components/Footer";
import DecayCard from "@/components/DecayCard";
import "@/components/crt/TestCRT.css";

const page = () => {
  // Spring animations for smooth magnetic effect
  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
      <div className="relative h-screen w-screen bg-gray-900 flex items-center justify-center overflow-hidden">
        {/* Monitor Frame */}
        <div
          className="relative h-full w-full rounded-xl shadow-inner"
          style={{
            background: "linear-gradient(to bottom, #2d1810, #1a0f08, #0a0503)",
          }}
        >
          {/* CRT Screen Container */}
          <div className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center">
            {/* Background glow - Orange/Amber tint */}
            <div
              className="absolute inset-0 z-0"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(212, 165, 116, 0.15) 0%, rgba(139, 69, 19, 0.3) 50%, rgba(0, 0, 0, 0.95) 100%)",
              }}
            ></div>

            {/* Scanlines overlay */}
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-40 scanline-effect" // Added 'scanline-effect' class
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0px, rgba(0, 0, 0, 0.6) 1px, transparent 1px, transparent 3px)",
              }}
            ></div>

            {/* Pixelation grid overlay */}
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-15"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(212, 165, 116, 0.1) 2px, rgba(212, 165, 116, 0.1) 3px), repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(212, 165, 116, 0.1) 2px, rgba(212, 165, 116, 0.1) 3px)",
              }}
            ></div>

            {/* Main Content Layer */}
            <div
              className="absolute inset-0 z-10 flex items-center  p-12"
              style={{
                filter: "blur(0.3px)",
              }}
            >
              {/* Top border decoration */}
              <div
                className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center select-none"
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontWeight: "bold",
                }}
              >
                <div
                  className="text-lg mb-2"
                  style={{
                    color: "#d4a574",
                    textShadow: "0 0 10px rgba(212, 165, 116, 0.8)",
                  }}
                >
                  ✶ NIT Puducherry's ✶
                </div>
                <div
                  className="h-px mx-auto"
                  style={{
                    width: "500px",
                    background:
                      "linear-gradient(to right, transparent, #d4a574, transparent)",
                    boxShadow: "0 0 8px rgba(212, 165, 116, 0.6)",
                  }}
                ></div>
              </div>

              {/* Decorative corner elements */}
              <div
                className="absolute top-6 left-6  text-sm select-none opacity-15 md:opacity-100"
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "#d4a574",
                  textShadow: "0 0 8px rgba(212, 165, 116, 0.6)",
                }}
              >
                ▓▒░ B-15 ░▒▓
              </div>
              <div
                className="absolute top-6 right-6  text-sm select-none opacity-15 md:opacity-100"
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "#d4a574",
                  textShadow: "0 0 8px rgba(212, 165, 116, 0.6)",
                }}
              >
                NITPY-2026
              </div>

              {/* Side panel decorations */}
              <div
                className="absolute left-8 top-1/4 select-none"
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  color: "#d4a574",
                  opacity: 0.7,
                  textShadow: "0 0 5px rgba(212, 165, 116, 0.5)",
                }}
              >
                <div className="mb-2 px-2 py-1 border border-current opacity-25 md:opacity-100">
                  F1
                </div>
                <div className="mb-2 px-2 py-1 border border-current bg-black bg-opacity-40 opacity-25 md:opacity-100">
                  ON
                </div>
                <div className="mb-2 px-2 py-1 border border-current opacity-25 md:opacity-100">
                  F5
                </div>
                <div className="mb-2 px-2 py-1 border border-current opacity-25 md:opacity-100">
                  OFF
                </div>
              </div>

              <div
                className="absolute right-8 top-1/4 text-right select-none "
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "#d4a574",
                  opacity: 0.8,
                  textShadow: "0 0 5px rgba(212, 165, 116, 0.5)",
                }}
              >
                <div className="mb-1 opacity-25 md:opacity-100">
                  <span className="opacity-60">BLM</span>{" "}
                  <span className="ml-2">F-VAR</span>{" "}
                  <span className="ml-2">K-VAR</span>
                </div>
                <div className="mb-1 opacity-25 md:opacity-100">
                  <span className="opacity-60">L5</span>{" "}
                  <span className="ml-2">F2</span>{" "}
                  <span className="ml-2">L4</span>
                </div>
                <div className="mb-1 opacity-25 md:opacity-100">
                  <span className="opacity-60">F22+</span>{" "}
                  <span className="ml-2">V.09</span>{" "}
                  <span
                    className="ml-2 px-1 opacity-25 md:opacity-100"
                    style={{ backgroundColor: "rgba(212, 165, 116, 0.3)" }}
                  >
                    L0
                  </span>
                </div>
                <div className="mb-1 opacity-25 md:opacity-100">
                  <span className="opacity-60">-</span>{" "}
                  <span
                    className="ml-2 px-1 opacity-25 md:opacity-100"
                    style={{ backgroundColor: "rgba(212, 165, 116, 0.3)" }}
                  >
                    Nul
                  </span>{" "}
                  <span className="ml-2 opacity-25 md:opacity-100">L4</span>
                </div>
              </div>

              {/* Main Text Display */}
              <div className="relative md:mx-26 flex flex-col w-full">
                <div
                  className="font-bold main-text-display leading-none md:mb-8 whitespace-pre-line select-none  text-left" // Added 'main-text-display' class
                  style={{
                    fontSize: "7rem",
                    color: "#d4a574",
                    letterSpacing: "0.15em",
                    fontFamily: "Montserrat, 'Consolas', monospace",
                    fontWeight: 900,
                    filter: "contrast(1.3) brightness(1.2)",
                  }}
                >
                  <span className="max-md:text-[3rem] flex tracking-tighter ">
                    POWER A <br /> FUTURE <br /> ONCE <br /> IMAGINED
                  </span>
                </div>

                {/* Handshake */}
                <div
                  className="relative lg:right-5 lg:-top-30 lg:absolute lg:flex hidden shrink-0"
                  style={{ width: "50vw", height: "80vh" }}
                >
                  <Image src={handshakeImage} alt="Handshake Image" />
                </div>
              </div>

              {/* Bottom right corner logo */}
              <div
                className="absolute bottom-8 right-12 text-2xl font-bold select-none"
                style={{
                  color: "#d4a574",
                  textShadow: "0 0 15px rgba(212, 165, 116, 0.9)",
                  fontFamily: "serif",
                  letterSpacing: "0.1em",
                }}
              >
                <div>P△</div>
                <div>V▽</div>
              </div>
            </div>

            {/* Vignette effect */}
            <div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.35) 100%)",
              }}
            ></div>
          </div>
        </div>

        {/* Explore Gyanith 2K24 */}
        <div className="flex absolute bottom-0 items-center justify-center w-full h-1/3 ">
          {/* Image cards to the left */}
          <div className="absolute top-10 md:-bottom-96 md:left-0 flex gap-2">
            <DecayCard
              seed={0}
              width={300}
              seedAngle={-5}
              dampness={0.08}
              offsetY={-50}
              proximityRadius={400}
              image="https://picsum.photos/300/400?random=1"
            />

            <DecayCard
              seed={0}
              width={300}
              seedAngle={10}
              dampness={0.08}
              proximityRadius={400}
              image="https://picsum.photos/300/400?random=5"
            />

            <DecayCard
              seed={1}
              offsetY={100}
              seedAngle={-15}
              dampness={0.12}
              proximityRadius={500}
              image="https://picsum.photos/300/400?random=2"
            />
          </div>

          {/* Image cards to the right */}
          <div className="absolute -bottom-50 right-0 flex gap-2">
            <DecayCard
              seed={0}
              offsetY={100}
              seedAngle={-5}
              dampness={0.08}
              proximityRadius={400}
              image="https://picsum.photos/300/400?random=3"
            />

            <DecayCard
              seed={0}
              seedAngle={5}
              dampness={0.08}
              proximityRadius={400}
              image="https://picsum.photos/300/400?random=6"
            />

            <DecayCard
              offsetY={-100}
              seed={1}
              seedAngle={15}
              dampness={0.12}
              proximityRadius={500}
              image="https://picsum.photos/300/400?random=4"
            />
          </div>
        </div>
      </div>
      <div className="h-screen w-screen"></div>
      <Footer />
    </motion.div>
  );
};

export default page;
