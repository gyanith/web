"use client";
import { motion } from "framer-motion";

const page = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
      <span className=" text-6xl text-white">CART</span>
    </motion.div>
  );
};

export default page;
