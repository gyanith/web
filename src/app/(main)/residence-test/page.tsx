"use client";
import { GridScan } from "@/components/GridScan";
import {
  blueScreen,
  creatoDisplay,
  garetBook,
  montserrat,
  pixel,
  pressStart2P,
} from "@/fonts/fonts";
import { motion } from "framer-motion";

const page = () => {
  return (
    <motion.div
      className="flex flex-col items-center w-screen h-screen justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
      {/* <div className="w-screen h-screen absolute inset-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={0.75}
          linesColor="#392e4e"
          gridScale={0.08}
          scanColor="#D4A574"
          scanOpacity={0.5}
          enablePost
          bloomIntensity={0.7}
          chromaticAberration={0.007}
          noiseIntensity={0}
          scanSoftness={3}
          enableGyro={true}
          scanDuration={5}
          scanDirection="forward"
        />
      </div> */}

      <div className="z-10 w-full h-full lg:w-2/3 lg:h-2/3 bg-[#070A1080] backdrop-blur-xl shadow-2xl shadow-[#D4A57430] border border-[#D4A57430] p-7 px-10">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`text-7xl uppercase ${blueScreen.className} text-[#D4A574]`}
        >
          Accommodations
        </motion.h1>
        <motion.h3
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "circInOut", delay: 0.5 }}
          className={` text-xl font-thin ${montserrat.className} text-[#D4A574]`}
        >
          Fill out this form to avail accommodations.
        </motion.h3>
      </div>
    </motion.div>
  );
};

export default page;
