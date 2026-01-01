"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import GlassSurface from "../GlassSurface";

import { AnimatePresence, motion } from "framer-motion";

import bagIcon from "@/assets/bag.svg";
import phoneIcon from "@/assets/phone.svg";
import userIcon from "@/assets/user.svg";
import menuIcon from "@/assets/menu.svg";
import gyLogo from "@/assets/gyanith-logo.svg";

import { useNavigate } from "@/hooks/useNavigate";

type NavItem =
  | "HOME"
  | "EVENTS"
  | "RESIDENCE"
  | "MERCH"
  | "PARTNERS"
  | "CORE"
  | "";

const Navbar: React.FC = () => {
  const router = useRouter();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<NavItem>("PARTNERS");
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  /* const [imageData, setImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    async function loadDefaultImage() {
      try {
        const response = await fetch(gyLogo);
        const blob = await response.blob();
        const file = new File([blob], "default.png", { type: blob.type });

        const parsedData = await parseLogoImage(file);
        setImageData(parsedData?.imageData ?? null);
      } catch (err) {
        console.error("Error loading default image:", err);
      }
    }

    loadDefaultImage();
  }, []); */

  const navItems: NavItem[] = [
    "EVENTS",
    "RESIDENCE",
    "MERCH",
    "PARTNERS",
    "CORE",
  ];

  function goToPage(item: NavItem) {
    navigate(`/${item.toLowerCase()}`);
  }

  useEffect(() => {
    setSelected("HOME");
    router.prefetch("/");
    navItems.forEach((item) => {
      router.prefetch(`/${item.toLowerCase()}`);
    });
  }, [router, navItems]);

  // Container animation variants
  const containerVariants = {
    initial: {
      y: "100%",
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        damping: 25,
        stiffness: 200,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: {
        type: "tween" as const,
        damping: 50,
        stiffness: 200,
      },
    },
  } as const;

  // Menu item animation variants
  const itemVariants = {
    initial: {
      y: 50,
      opacity: 0,
      scale: 0.9,
    },
    animate: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "tween" as const,
        damping: 20,
        stiffness: 200,
      },
    },
  } as const;

  return (
    <motion.nav
      className="fixed z-50 bottom-16 lg:top-26 transition-transform duration-300 items-center gap-2 sm:gap-2 h-fit"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      <div className="lg:flex hidden gap-2  items-center">
        {/* Logo Circle */}
        <div
          onClick={() => {
            router.push("/");
            setSelected("HOME");
          }}
          className=" rounded-full cursor-pointer group"
        >
          <GlassSurface
            width={60}
            height={60}
            borderRadius={30}
            brightness={65}
            blur={8}
            backgroundOpacity={10}
            mixBlendMode="darken"
            redOffset={50}
            className="shadow-2xl shadow-amber-100  cursor-pointer border border-amber-700/30  transition-all duration-300"
          >
            <Image
              src={gyLogo}
              alt="Gyanith Logo"
              className="scale-70  transition-colors duration-300"
            />
          </GlassSurface>
        </div>
        {/* Main Nav Container */}
        <GlassSurface
          borderRadius={50}
          brightness={65}
          blur={8}
          backgroundOpacity={0}
          mixBlendMode="hard-light"
          redOffset={1}
          className="w-full  rounded-full p-0 shadow-2xl shadow-amber-100 cursor-pointer border border-amber-700/30"
        >
          <div className="relative flex items-center gap-2 sm:gap-2">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setSelected(item);
                  goToPage(item);
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget;
                  btn.style.setProperty("--mouse-x", "50%");
                  btn.style.setProperty("--mouse-y", "50%");
                }}
                onMouseMove={(e) => {
                  const btn = e.currentTarget;
                  const rect = btn.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  btn.style.setProperty("--mouse-x", `${x}%`);
                  btn.style.setProperty("--mouse-y", `${y}%`);
                }}
                className={`group cursor-pointer relative px-3 sm:px-3 py-2 sm:py-2 rounded-full transition-all duration-300 ease-in-out overflow-hidden ${
                  selected === item ? "bg-[#D5812A]/20" : "bg-transparent"
                }`}
              >
                {/* Hover glare effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100  pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(251, 191, 36, 0.3) 0%, transparent 60%)",
                  }}
                />

                <span
                  className="relative text-white/75 font-bold  text-md sm:text-base tracking-wide whitespace-nowrap group-hover:text-amber-50 transition-colors duration-100"
                  style={{
                    fontFamily: "Montserrat",
                  }}
                >
                  {item}
                </span>
              </button>
            ))}
          </div>
        </GlassSurface>

        {/* Icon Buttons */}
        <div className="flex items-center gap-2 ">
          {["bag", "phone", "user"].map((icon) => (
            <GlassSurface key={icon} width={60} height={60} borderRadius={30}>
              <button
                onMouseEnter={() => setHoveredIcon(icon)}
                onMouseLeave={() => setHoveredIcon(null)}
                onClick={() => {
                  if (icon === "phone") {
                    navigate("/contacts");
                  } else if (icon === "user") {
                    navigate("/user/account");
                  } else {
                    navigate("/user/cart");
                  }
                }}
                className="group relative w-12 h-12 sm:w-14 cursor-pointer sm:h-14 rounded-full  backdrop-blur-xl border border-amber-700/30 shadow-2xl flex items-center justify-center transition-all duration-300  hover:shadow-amber-500/30 shrink-0 overflow-hidden"
              >
                {/* Icons */}
                <div className="relative w-6 h-6 sm:w-7 sm:h-7 bg-linear-to-br  rounded transition-transform duration-150">
                  {icon === "phone" && (
                    <Image src={phoneIcon} alt="Phone Icon" />
                  )}
                  {icon === "user" && <Image src={userIcon} alt="User Icon" />}
                  {icon === "bag" && <Image src={bagIcon} alt="Bag Icon" />}
                </div>

                {/* Glare effect */}
                {hoveredIcon === icon && (
                  <div
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.4) 0%, transparent 70%)",
                    }}
                  />
                )}
              </button>
            </GlassSurface>
          ))}
        </div>
      </div>

      <div className="flex lg:hidden gap-2">
        <div
          onClick={() => {
            router.push("/");
            setSelected("HOME");
          }}
          className=" rounded-full cursor-pointer group"
        >
          <GlassSurface
            width={60}
            height={60}
            borderRadius={30}
            brightness={65}
            blur={8}
            backgroundOpacity={0}
            mixBlendMode="hard-light"
            redOffset={50}
            className="shadow-2xl shadow-amber-100  cursor-pointer border border-amber-700/30 group-hover:border-amber-700/50 transition-all duration-300"
          >
            <Image
              src={gyLogo}
              alt="Gyanith Logo"
              className="scale-70 brightness-75 group-hover:brightness-100 transition-colors duration-300"
            />
          </GlassSurface>
        </div>
        <div onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <GlassSurface
            width={120}
            height={60}
            borderRadius={30}
            brightness={65}
            blur={8}
            backgroundOpacity={0}
            mixBlendMode="hard-light"
            redOffset={1}
            className="shadow-xl cursor-pointer border border-amber-700/30"
          >
            <span className="text-white font-bold flex gap-2">
              <Image src={menuIcon} alt="" />
              MENU
            </span>
          </GlassSurface>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <motion.div
            key="retro-menu"
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#1a0f00] overflow-hidden"
            style={{
              backgroundImage: `
                linear-gradient(rgba(217, 119, 6, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(217, 119, 6, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          >
            {/* Animated Close Button */}
            <motion.button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-8 right-8 text-amber-500 font-mono text-xl z-20 hover:text-amber-300 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <GlassSurface
                width={60}
                height={60}
                borderRadius={30}
                brightness={65}
                blur={8}
                backgroundOpacity={0}
                mixBlendMode="hard-light"
                redOffset={50}
                className="shadow-2xl shadow-amber-100  cursor-pointer border border-amber-700/30"
              >
                [X]
              </GlassSurface>
            </motion.button>

            {/* Menu Items Container */}
            <div className="flex flex-col items-center gap-6 z-10 w-full h-full max-w-md px-6">
              <motion.div
                variants={itemVariants}
                className="text-amber-700/50 font-mono font-bold text-xs mb-4 tracking-tighter"
              >
                SYSTEM NAVIGATION // V.1.0
              </motion.div>

              <div className="grid grid-cols-2 grid-rows-4 gap-2 w-screen h-full p-5">
                <motion.div
                  variants={itemVariants}
                  className="row-span-1 w-full h-full col-span-2"
                >
                  {/* Gyanith Footer here */}
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  className="row-span-1 w-full h-full col-span-2 p-1 md:p-2 bg-[#D5812A]/5 shadow-lg shadow-black backdrop-blur-[5px] rounded-2xl"
                  onClick={() => {
                    goToPage("EVENTS");
                    setMobileMenuOpen(false);
                  }}
                >
                  <div className="relative w-full overflow-hidden h-full rounded-xl flex items-end justify-left md:justify-center cursor-pointer">
                    <motion.span className="text-white/75 z-10 m-5 text-xl md:text-3xl transition-all duration-300 font-extrabold mix-blend-difference">
                      EVENTS
                    </motion.span>
                    <Image
                      className="object-cover"
                      objectPosition="center"
                      layout="fill"
                      objectFit="cover"
                      src="https://picsum.photos/300/400?random=3"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-transparent to-black" />
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="row-span-1 grid grid-cols-2 gap-2 w-full h-full col-span-2"
                >
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="col-span-1 w-full h-full p-1 md:p-2 bg-[#D5812A]/5 shadow-lg shadow-black backdrop-blur-[5px] rounded-2xl"
                    onClick={() => {
                      goToPage("RESIDENCE");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="relative w-full overflow-hidden h-full rounded-xl flex items-end justify-center cursor-pointer">
                      <motion.span className="text-white/75 z-10 m-3 text-xl md:text-3xl transition-all duration-300 font-extrabold mix-blend-exclusion">
                        RESIDENCE
                      </motion.span>
                      <Image
                        className="object-cover"
                        objectPosition="center"
                        layout="fill"
                        objectFit="cover"
                        src="https://picsum.photos/300/400?random=4"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black" />
                    </div>
                  </motion.div>

                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="col-span-1 w-full h-full p-1 md:p-2 bg-[#D5812A]/5 shadow-lg shadow-black backdrop-blur-[5px] rounded-2xl"
                    onClick={() => {
                      goToPage("MERCH");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="relative w-full overflow-hidden h-full rounded-xl flex items-end justify-center cursor-pointer">
                      <motion.span className="text-white/75 z-10 m-3 text-xl md:text-3xl transition-all duration-300 font-extrabold mix-blend-exclusion">
                        DROPS
                      </motion.span>
                      <Image
                        className="object-cover"
                        objectPosition="center"
                        layout="fill"
                        objectFit="cover"
                        src="https://picsum.photos/300/400?random=50"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black" />
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="row-span-1 grid grid-cols-2 gap-2 w-full h-full col-span-2"
                >
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="col-span-1 w-full h-full p-1 md:p-2 bg-[#D5812A]/5 shadow-lg shadow-black backdrop-blur-[5px] rounded-2xl"
                    onClick={() => {
                      goToPage("PARTNERS");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="relative w-full overflow-hidden h-full rounded-xl flex items-end justify-center cursor-pointer">
                      <motion.span className="text-white/75 z-10 m-3 text-xl md:text-3xl transition-all duration-300 font-extrabold mix-blend-exclusion">
                        PARTNERS
                      </motion.span>
                      <Image
                        className="object-cover"
                        objectPosition="center"
                        layout="fill"
                        objectFit="cover"
                        src="https://picsum.photos/300/400?random=10"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black" />
                    </div>
                  </motion.div>

                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="col-span-1 w-full h-full p-1 md:p-2 bg-[#D5812A]/5 shadow-lg shadow-black backdrop-blur-[5px] rounded-2xl"
                    onClick={() => {
                      goToPage("CORE");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div className="relative w-full overflow-hidden h-full rounded-xl flex items-end justify-center cursor-pointer">
                      <motion.span className="text-white/75 z-10 m-3 text-xl md:text-3xl transition-all duration-300 font-extrabold mix-blend-exclusion">
                        CORE
                      </motion.span>
                      <Image
                        className="object-cover"
                        objectPosition="center"
                        layout="fill"
                        objectFit="cover"
                        src="https://picsum.photos/300/400?random=40"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-linear-to-b from-transparent to-black" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
