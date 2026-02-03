"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import GlassSurface from "../GlassSurface";

import { AnimatePresence, motion } from "framer-motion";

import proshowIcon from "@/assets/proshows.svg";
import userIcon from "@/assets/user.svg";
import menuIcon from "@/assets/menu.svg";
import dollarIcon from "@/assets/dollar.svg";
import gyLogo from "@/assets/gyanith-logo.svg";

import { useNavigate } from "@/hooks/useNavigate";
import MobileMenu from "../MobileMenu";

type NavItem =
  | "HOME"
  | "EVENTS"
  | "RESIDENCE"
  | "MERCH"
  | "TICKET"
  | "CORE"
  | "";

const Navbar: React.FC = () => {
  const router = useRouter();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<NavItem>("");
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
    "TICKET",
    "MERCH",
    "RESIDENCE",
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

  return (
    <>
      <motion.nav
        className="fixed z-50 left-[50%] -translate-x-[50%] bottom-7 lg:top-20 lg:bottom-auto transition-transform duration-300 items-center gap-2 sm:gap-2 h-fit"
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
            className="rounded-full cursor-pointer "
          >
            <GlassSurface
              width={60}
              height={60}
              borderRadius={30}
              brightness={65}
              blur={8}
              backgroundOpacity={0.4}
              redOffset={50}
              className="  cursor-pointer border border-amber-700/30  transition-all duration-300"
            >
              <Image
                src={gyLogo}
                alt="Gyanith Logo"
                className="scale-75  transition-colors duration-300"
              />
            </GlassSurface>
          </div>
          {/* Main Nav Container */}
          <GlassSurface
            borderRadius={50}
            brightness={65}
            blur={8}
            backgroundOpacity={0.4}
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
                    className="relative text-white font-bold  text-md sm:text-base tracking-wide whitespace-nowrap group-hover:text-amber-50 transition-colors duration-100"
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
            {["proshow", "partners", "user"].map((icon) => (
              <GlassSurface
                key={icon}
                width={60}
                height={60}
                borderRadius={30}
                backgroundOpacity={0.4}
              >
                <button
                  onMouseEnter={() => setHoveredIcon(icon)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  onClick={() => {
                    if (icon === "partners") {
                      navigate("/partners");
                    } else if (icon === "user") {
                      navigate("/user/account");
                    } else {
                      navigate("/proshows");
                    }
                  }}
                  className="group relative w-12 h-12 sm:w-14 cursor-pointer sm:h-14 rounded-full  backdrop-blur-xl border border-amber-700/30 shadow-2xl flex items-center justify-center transition-all duration-300  hover:shadow-amber-500/30 shrink-0 overflow-hidden"
                >
                  {/* Icons */}
                  <div className="relative flex w-6 h-6 sm:w-7 sm:h-7 bg-linear-to-br  rounded transition-transform duration-150 items-center justify-between">
                    {icon === "partners" && (
                      <Image
                        src={dollarIcon}
                        alt="Dollar Icon"
                        className="w-full h-full"
                      />
                    )}
                    {icon === "user" && (
                      <Image
                        src={userIcon}
                        alt="User Icon"
                        className="w-full h-full"
                      />
                    )}
                    {icon === "proshow" && (
                      <Image
                        src={proshowIcon}
                        alt="Bag Icon"
                        className="w-full h-full"
                      />
                    )}
                  </div>

                  {/* Glare effect */}
                  {hoveredIcon === icon && (
                    <div
                      className="absolute inset-0 -z-10 rounded-full animate-pulse"
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
              backgroundOpacity={0.4}
              mixBlendMode="hard-light"
              redOffset={50}
              className="shadow-2xl  cursor-pointer border border-amber-700/30 group-hover:border-amber-700/50 transition-all duration-300"
            >
              <Image
                src={gyLogo}
                alt="Gyanith Logo"
                className="scale-70 transition-colors duration-300"
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
              backgroundOpacity={0.4}
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
      </motion.nav>
      <AnimatePresence mode="wait">
        {mobileMenuOpen && (
          <div>
            <MobileMenu
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
