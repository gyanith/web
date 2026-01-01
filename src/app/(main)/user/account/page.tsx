"use client";
import { motion } from "framer-motion";
import Dither from "@/components/Dither";

import { account } from "@/lib/appwrite/appwrite.client";

const page = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
      className="w-screen h-screen flex items-center justify-center "
    >
      <div className="absolute inset-0 w-screen h-screen -z-10">
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>

      <div className="w-120 flex h-120 rounded-2xl bg-black">
        <button
          className="m-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          onClick={() => {
            account
              .deleteSession({
                sessionId: "current",
              })
              .then(() => {
                window.location.href = "/auth";
              });
          }}
        >
          LOG OUT
        </button>
      </div>
    </motion.div>
  );
};

export default page;
