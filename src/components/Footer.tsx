import Image from "next/image";

import SparklesCore from "@/components/SparklesCore";
import { ledLight, pressStart2P, pixel } from "@/fonts/fonts";
import "@/components/crt/TestCRT.css";

import playstoreLogo from "@/assets/playstore.svg";
import appstoreLogo from "@/assets/appstore.svg";
import linkedInLogo from "@/assets/linkedin.svg";
import instagramLogo from "@/assets/instagram.svg";
import facebookLogo from "@/assets/facebook.svg";

const Footer = () => {
  return (
    <div className="flex max-w-screen overflow-hidden h-fit p-7 flex-col relative justify-center items-center select-none">
      <div className="flex items-center w-screen z-10 mb-25 md:mb-0">
        <div className="w-2/3 flex flex-col items-start justify-between h-full gap-5 px-7 ">
          <div className="flex flex-col items-start">
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

          <div className="text-white">
            <div className="w-full flex gap-2 h-fit group">
              <Image
                src={linkedInLogo}
                alt="LinkedIn Logo"
                width={35}
                height={35}
                className="object-contain cursor-pointer group-hover:brightness-50 hover:brightness-125 hover:rotate-2 origin-bottom-right transition-all duration-500 ease-in-out"
              />

              <Image
                src={instagramLogo}
                alt="Instagram Logo"
                width={35}
                height={35}
                className="object-contain cursor-pointer group-hover:brightness-50 hover:brightness-125 hover:rotate-2 origin-bottom-right transition-all duration-500 ease-in-out"
              />

              <Image
                src={facebookLogo}
                alt="Facebook Logo"
                width={35}
                height={35}
                className="object-contain cursor-pointer group-hover:brightness-50 hover:brightness-125 hover:rotate-2 origin-bottom-right transition-all duration-500 ease-in-out"
              />
            </div>
          </div>
        </div>

        <div className="h-1/3 rounded-full w-2 bg-[#D4A574]  z-10" />

        <div className="w-1/3 flex h-full">
          <div className="w-full flex flex-col justify-center relative h-full  px-7">
            <div className="flex justify-end gap-2 md:gap-10 items-center mb-5">
              <Image
                src={appstoreLogo}
                alt="Appstore Logo"
                width={50}
                height={50}
                className="w-7 sm:w-10 md:w-15 lg:w-20 object-contain self-center cursor-pointer hover:brightness-125 hover:rotate-2 origin-bottom-right transition-all duration-500 ease-in-out"
              />
              <Image
                src={playstoreLogo}
                alt="Playstore Logo"
                width={50}
                height={50}
                className="w-7 sm:w-10 md:w-15 lg:w-20 object-contain self-center  cursor-pointer hover:brightness-125 hover:rotate-2 origin-bottom-right transition-all duration-500 ease-in-out"
                onClick={() => {}}
              />
            </div>
            <span
              className={` text-[15px] flex justify-end items-center text-right text-[#D4A574] ${pixel.className}`}
            >
              Get the Official App
            </span>
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
    </div>
  );
};

export default Footer;
