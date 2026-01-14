"use client";

import Image from "next/image";

import SparklesCore from "@/my_components/SparklesCore";
import { ledLight, pressStart2P, pixel, montserrat } from "@/fonts/fonts";
import "@/my_components/crt/TestCRT.css";

import playstoreLogo from "@/assets/playstore.svg";
import appstoreLogo from "@/assets/appstore.svg";
import linkedInLogo from "@/assets/linkedin.svg";
import instagramLogo from "@/assets/instagram.svg";
import facebookLogo from "@/assets/facebook.svg";

const Footer = () => {
  return (
    <footer className="flex max-w-screen overflow-hidden h-full p-7 flex-col relative justify-center items-center select-none max-lg:border-t max-lg:border-t-[#d4a574]/40">
      <div className="flex  items-center w-screen z-10 mb-25 md:mb-0 px-7">
        <div className="w-2/3 flex flex-col items-start justify-between h-full gap-5 ">
          <div className="flex flex-col items-start">
            <span
              className={`text-[5px] sm:text-[10px]  text-left text-[#D4A574] ${pressStart2P.className}`}
            >
              Made with{" "}
              <span className="text-red-500 text-[10px] sm:text-[15px] shadow-[0_0_50px_#ff0000]">
                &#10084;
              </span>{" "}
              and minimal chaos by
              <span className={`font-bold ${pressStart2P.className}`}>
                {" "}
                Web Team
              </span>
            </span>
            <span
              className={`mix-blend-color-dodge main-text-display text-[#D4A574] -mb-2 sm:-mb-5 text-5xl sm:text-7xl lg:text-9xl leading-none font-normal ${ledLight.className}`}
            >
              GYANITH
            </span>

            <span
              className={`mix-blend-color-dodge flex justify-between text-left  p-1 w-full  text-[#D4A574] text-[5px] sm:text-[10px]  `}
            >
              <span className={` ${pressStart2P.className}`}>
                All rights reserved <br /> © GYANITH 2026
              </span>
              <span className={`text-right ${pressStart2P.className}`}>
                NIT <br /> Puducherry
              </span>
            </span>
          </div>

          <div className="">
            <div className="w-full flex gap-2 h-fit group">
              <Image
                src={linkedInLogo}
                alt="LinkedIn Logo"
                width={35}
                height={35}
                className="object-contain w-5 sm:w-7 md:w-9 cursor-pointer group-hover:brightness-50 hover:brightness-125 hover:rotate-2 origin-bottom-right transition-all duration-500 ease-in-out"
              />

              <Image
                src={instagramLogo}
                alt="Instagram Logo"
                width={35}
                height={35}
                className="object-contain w-5 sm:w-7 md:w-9 cursor-pointer group-hover:brightness-50 hover:brightness-125 hover:rotate-2 origin-bottom-right transition-all duration-500 ease-in-out"
              />

              <Image
                src={facebookLogo}
                alt="Facebook Logo"
                width={35}
                height={35}
                className="object-contain w-5 sm:w-7 md:w-9 cursor-pointer group-hover:brightness-50 hover:brightness-125 hover:rotate-2 origin-bottom-right transition-all duration-500 ease-in-out"
              />
            </div>
          </div>
        </div>

        <div className="w-1/3 flex h-full b">
          <div className="w-full flex flex-col justify-between relative h-full ">
            <div className="">
              <div className="flex justify-end gap-2 md:gap-10 items-center my-2">
                <Image
                  src={appstoreLogo}
                  alt="Appstore Logo"
                  width={50}
                  height={50}
                  className="w-7 sm:w-10 md:w-15 lg:w-13 object-contain self-center cursor-pointer hover:brightness-125 hover:rotate-2 origin-bottom-right "
                />
                <Image
                  src={playstoreLogo}
                  alt="Playstore Logo"
                  width={50}
                  height={50}
                  className="w-7 sm:w-10 md:w-15 lg:w-13 object-contain self-center  cursor-pointer hover:brightness-125 hover:rotate-2 origin-bottom-right "
                  onClick={() => {}}
                />
              </div>

              <span
                className={` text-[10px] sm:text-[15px] flex justify-end items-center text-right text-[#D4A574] ${pixel.className}`}
              >
                Get the <br /> Official <br /> App
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          speed={5}
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={75}
          className="w-full h-full"
          particleColor="#fefefe"
        />
      </div>
    </footer>
  );
};

export default Footer;
