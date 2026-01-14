"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Minus, Plus } from "lucide-react";

import merchPicHero from "@/assets/merchPicHero.jpg";
import merchPic1 from "@/assets/merchPic1.jpg";
import merchPic2 from "@/assets/merchPic2.jpg";
import merchPic3 from "@/assets/merchPic3.jpg";
import merchPic4 from "@/assets/merchPic4.jpg";
import Footer from "@/my_components/Footer";
import SparklesCore from "@/my_components/SparklesCore";

import { unispace, ledLight, creatoDisplay } from "@/fonts/fonts";
import { useState } from "react";

const merchPics = [merchPic1, merchPic2, merchPic3, merchPic4];
const sizes = ["S", "M", "L", "XL", "XXL"] as const;

const page = () => {
  const [sizeSelected, setSizeSelected] = useState<
    "S" | "M" | "L" | "XL" | "XXL"
  >("M");

  const [qty, setQty] = useState(1);

  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
      {/* Hero Product Image */}
      <div className="w-screen h-[50vh] relative md:h-screen overflow-hidden flex items-center justify-center bg-[#070a10]">
        <Image
          src={merchPicHero}
          alt="Merchandise"
          fill
          objectPosition="top"
          className=" object-cover object-center"
        />
      </div>

      {/* Product Description */}
      <div className="w-screen min-h-screen h-fit flex flex-col lg:flex-row overflow-hidden  items-center justify-center">
        {/* Image Container */}
        <div className="flex h-[60vh]  z-10 w-full lg:h-screen lg:w-2/3 ">
          {/* Showcase */}
          <div className="w-full h-full relative overflow-x-auto">
            <div className="flex h-full gap-2 md:gap-5 lg:gap-7 rounded-br-xl md:rounded-br-2xl lg:rounded-br-4xl overflow-x-auto">
              {merchPics.map((src, index) => (
                <div
                  key={index}
                  className=" min-w-5/6 relative h-full bg-gray-200 shrink-0  overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-black/5 via-black/10 to-black" />
                  <Image
                    src={src}
                    alt={`Product View ${src}`}
                    objectFit="cover"
                    layout="fill"
                    objectPosition="top"
                    className="h-full w-full "
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col relative justify-around lg:justify-center p-3 lg:p-7 h-2/5 w-full lg:h-full lg:w-1/3 ">
          <div className="absolute inset-0 z-0">
            <SparklesCore
              id="tsparticlesfullpageP"
              speed={5}
              background="transparent"
              minSize={0.6}
              maxSize={1.4}
              particleDensity={75}
              className="w-full h-full"
              particleColor="#d4a574"
            />
          </div>
          <div className="z-10 text-[#d4a574] gap-7">
            <div>
              <span
                className={`text-3xl text-justify lg:text-6xl ${ledLight.className}`}
              >
                PRODUCT <br />
                NAME
              </span>
              <p className={`${creatoDisplay.className} text-xl`}>
                This is a detailed description of the product, highlighting its
                features, materials used, and any other relevant information
                that would entice customers to make a purchase.
              </p>
            </div>
            <span
              className={`font-semibold md:font-bold text-[clamp(1.5rem,2vw,2rem)] mt-2 lg:mt-15 ${unispace.className}`}
            >
              &#08377;350
            </span>

            {/* Sizes */}
            <div className="mt-4">
              <span className={`font-semibold mr-4 ${unispace.className}`}>
                Sizes
              </span>

              {sizes.map((size) => {
                const isActive = sizeSelected === size;

                return (
                  <button
                    key={size}
                    onClick={() => setSizeSelected(size)}
                    className={`
          mr-2 px-3 py-1 border ease-out cursor-pointer
          ${
            isActive
              ? "bg-[#d4a574] text-black border-[#d4a574] scale-105 shadow-[0_0_10px_#d4a57480]"
              : "border-[#d4a574]/60 text-[#d4a574] hover:bg-[#d4a57450] "
          }
          ${unispace.className}
        `}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {/* Action Buttons */}

            <div className="my-4 flex items-center h-10">
              <span className={`font-semibold mr-4 ${unispace.className}`}>
                Quantity
              </span>
              <div className="flex items-center h-full backdrop-blur-xl border overflow-hidden text-[#d4a574] border-[#d4a574]">
                <button
                  className="px-3 h-full hover:bg-black hover:scale-110 group hover:text-white  flex items-center justify-center"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  <Minus size={14} className="group-active:scale-95" />
                </button>
                <span
                  className={`w-8 text-center text-xs ${unispace.className} `}
                >
                  {qty}
                </span>
                <button
                  className="px-3 h-full hover:bg-black hover:scale-110 group hover:text-white  flex items-center justify-center"
                  onClick={() => setQty(qty + 1)}
                >
                  <Plus size={14} className="group-active:scale-95" />
                </button>
              </div>
            </div>

            <div className="w-full flex  gap-5">
              <button
                className={`flex-1 border cursor-pointer hover:bg-[#d4a574] hover:text-black border-[#d4a574]/60 text-[#d4a574] text-sm py-2 text-center bg-[#d4a57450] ${unispace.className}`}
              >
                Add to Cart
              </button>

              <button
                className={`flex-1 border cursor-pointer hover:bg-[#d4a574] hover:text-black border-[#d4a574]/60 text-[#d4a574] text-sm py-2 text-center bg-[#d4a57450] ${unispace.className}`}
                onClick={() => {
                  // Construct the URL with query parameters
                  // Example: /merch/checkout?qty=2&price=350&size=L
                  router.push(
                    `/merch/checkout?qty=${qty}&size=${sizeSelected}`
                  );
                }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </motion.div>
  );
};

export default page;
