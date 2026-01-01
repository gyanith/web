"use client";
import { motion } from "framer-motion";

const page = () => {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
      RESIDENCE
    </motion.div>
  );
};

export default page;
