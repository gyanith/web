"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import merchPic from "@/assets/merchPic.jpg";
import Footer from "@/components/Footer";

import ScrollFloat from "@/components/ScrollFloat";

const page = () => {
  return (
    <motion.div
    /* initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }} */
    >
      {/* Hero Product Image */}
      <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-[#070a10]">
        <Image
          src={merchPic}
          alt="Merchandise"
          objectFit="cover"
          layout="fill"
          objectPosition="top"
          className="contrast-125"
        />
      </div>

      {/* Product Description */}
      <div className="w-screen min-h-screen sm:h-screen flex flex-col lg:flex-row overflow-hidden  items-center justify-center bg-white">
        {/* Image Container */}
        <div className="flex h-[60vh]  z-10 w-full lg:h-full lg:w-2/3 ">
          {/* Showcase */}
          <div className="w-full h-full relative overflow-x-auto">
            <div className="flex h-full">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className=" min-w-5/6 relative h-full bg-gray-200 shrink-0  overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-black/5 via-black/10 to-black" />
                  <Image
                    src={merchPic}
                    alt={`Product View ${item}`}
                    objectFit="cover"
                    layout="fill"
                    objectPosition="center"
                    className="h-full w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-around lg:justify-center p-3 lg:p-7 h-2/5 w-full lg:h-full lg:w-1/3 ">
          <span className="text-3xl text-justify lg:text-6xl font-bold tracking-tighter">
            PRODUCT NAME
          </span>
          <p>
            This is a detailed description of the product, highlighting its
            features, materials used, and any other relevant information that
            would entice customers to make a purchase.
          </p>
          <span className="font-semibold md:font-bold text-[clamp(1.5rem,2vw,2rem)] mt-1 lg:mt-5">
            $49.99
          </span>

          {/* Sizes */}
          <div className="mt-4">
            <span className="font-semibold mr-4">Sizes</span>
            <button className="border border-black px-3 py-1 mr-2 hover:bg-black hover:text-white transition">
              S
            </button>
            <button className="border border-black px-3 py-1 mr-2 hover:bg-black hover:text-white transition">
              M
            </button>
            <button className="border border-black px-3 py-1 mr-2 hover:bg-black hover:text-white transition">
              L
            </button>
            <button className="border border-black px-3 py-1 mr-2 hover:bg-black hover:text-white transition">
              XL
            </button>
          </div>
          {/* Action Buttons */}

          <div className="mt-4 flex items-center">
            <span className="font-semibold mr-4 ">Quantity</span>
            <input
              type="number"
              defaultValue={1}
              min={1}
              className="w-16 border border-black px-2 py-1"
            />
          </div>

          <div className="w-full flex  gap-5">
            <button className="mt-4 w-full bg-black cursor-pointer text-white px-4 py-2 rounded hover:bg-gray-800 transition">
              Add to Cart
            </button>

            <button className="mt-4 w-full bg-black cursor-pointer text-white px-4 py-2 rounded hover:bg-gray-800 transition">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  );
};

export default page;
