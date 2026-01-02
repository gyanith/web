"use client";
import { motion } from "framer-motion";
import { ledLight } from "@/fonts/fonts";

const page = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
      <span className={` text-6xl text-white ${ledLight.className}`}>CART</span>
    </motion.div>
  );
};

export default page;
