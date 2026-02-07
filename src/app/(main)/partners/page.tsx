"use client";

import { useSpring, motion } from "framer-motion";
import Image from "next/image";

import handshakeImage from "@/assets/handshake-partner.svg";

import DecayCard from "@/my_components/DecayCard";
import "@/my_components/crt/TestCRT.css";

import gyPic1 from "@/assets/gy24pics/pic1.jpg";
import gyPic2 from "@/assets/gy24pics/pic2.jpg";
import gyPic3 from "@/assets/gy24pics/pic3.jpg";
import gyPic4 from "@/assets/gy24pics/pic4.jpg";
import gyPic5 from "@/assets/gy24pics/pic5.jpg";
import gyPic6 from "@/assets/gy24pics/pic6.jpg";

const page = () => {
  // Spring animations for smooth magnetic effect
  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "circInOut" }}
    >
      <div className="relative h-screen w-screen bg-gray-900 flex items-center justify-center overflow-hidden">
        {/* Monitor Frame */}
        <div
          className="relative h-full w-full rounded-xl shadow-inner"
          style={{
            background: "linear-gradient(to bottom, #2d1810, #1a0f08, #0a0503)",
          }}
        >
          {/* CRT Screen Container */}
          <div className="relative w-full h-full overflow-hidden">
            {/* Background glow - Orange/Amber tint */}
            <div
              className="absolute inset-0 z-0"
              style={{
                background:
                  "radial-gradient(circle at center, rgba(212, 165, 116, 0.15) 0%, rgba(139, 69, 19, 0.3) 50%, rgba(0, 0, 0, 0.95) 100%)",
              }}
            ></div>

            {/* Scanlines overlay */}
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-40 scanline-effect" // Added 'scanline-effect' class
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0px, rgba(0, 0, 0, 0.6) 1px, transparent 1px, transparent 3px)",
              }}
            ></div>

            {/* Pixelation grid overlay */}
            <div
              className="absolute inset-0 z-20 pointer-events-none opacity-15"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(212, 165, 116, 0.1) 2px, rgba(212, 165, 116, 0.1) 3px), repeating-linear-gradient(90deg, transparent 0px, transparent 2px, rgba(212, 165, 116, 0.1) 2px, rgba(212, 165, 116, 0.1) 3px)",
              }}
            ></div>

            {/* Main Content Layer */}
            <div
              className="absolute inset-0 z-10 flex items-center justify-center p-12"
              style={{
                filter: "blur(0.3px)",
              }}
            >
              {/* Top border decoration */}
              <div
                className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center select-none"
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}
              >
                <div
                  className="text-lg mb-2"
                  style={{
                    color: "#d4a574",
                    textShadow: "0 0 10px rgba(212, 165, 116, 0.8)",
                    fontFamily: "monospace",
                  }}
                >
                  ✶ NIT Puducherry's ✶
                </div>
                <div
                  className="h-px mx-auto"
                  style={{
                    width: "500px",
                    background:
                      "linear-gradient(to right, transparent, #d4a574, transparent)",
                    boxShadow: "0 0 8px rgba(212, 165, 116, 0.6)",
                  }}
                ></div>
              </div>
              {/* Decorative corner elements */}
              <div
                className="absolute top-6 left-6 text-sm select-none opacity-15 md:opacity-100"
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "#d4a574",
                  textShadow: "0 0 8px rgba(212, 165, 116, 0.6)",
                }}
              >
                ▓▒░ B-15 ░▒▓
              </div>
              <div
                className="absolute top-6 right-6  text-sm select-none opacity-25 md:opacity-100"
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                  color: "#d4a574",
                  textShadow: "0 0 8px rgba(212, 165, 116, 0.6)",
                }}
              >
                NITPY-2026
              </div>
              {/* Side panel decorations */}
              <div
                className="absolute left-8 top-1/4 select-none "
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.7rem",
                  color: "#d4a574",
                  opacity: 0.7,
                  textShadow: "0 0 5px rgba(212, 165, 116, 0.5)",
                }}
              >
                <div
                  className="mb-2 px-2 py-1 border border-current opacity-25 md:opacity-100 "
                  style={{
                    fontFamily: "monospace",
                  }}
                >
                  F1
                </div>
                <div
                  className="mb-2 px-2 py-1 border border-current bg-black bg-opacity-40 opacity-25 md:opacity-100"
                  style={{
                    fontFamily: "monospace",
                  }}
                >
                  ON
                </div>
                <div
                  className="mb-2 px-2 py-1 border border-current opacity-25 md:opacity-100"
                  style={{
                    fontFamily: "monospace",
                  }}
                >
                  F5
                </div>
                <div
                  className="mb-2 px-2 py-1 border border-current opacity-25 md:opacity-100"
                  style={{
                    fontFamily: "monospace",
                  }}
                >
                  OFF
                </div>
              </div>
              <div
                className="absolute right-8 top-1/4 text-right select-none "
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.65rem",
                  color: "#d4a574",
                  opacity: 0.8,
                  textShadow: "0 0 5px rgba(212, 165, 116, 0.5)",
                }}
              >
                <div className="mb-1 opacity-25 md:opacity-100">
                  <span
                    className="opacity-60"
                    style={{
                      fontFamily: "monospace",
                    }}
                  >
                    BLM
                  </span>{" "}
                  <span
                    className="ml-2"
                    style={{
                      fontFamily: "monospace",
                    }}
                  >
                    F-VAR
                  </span>{" "}
                  <span
                    className="ml-2"
                    style={{
                      fontFamily: "monospace",
                    }}
                  >
                    K-VAR
                  </span>
                </div>
                <div className="mb-1 opacity-25 md:opacity-100">
                  <span
                    className="opacity-60 "
                    style={{
                      fontFamily: "monospace",
                    }}
                  >
                    L5
                  </span>{" "}
                  <span
                    className="ml-2"
                    style={{
                      fontFamily: "monospace",
                    }}
                  >
                    F2
                  </span>{" "}
                  <span
                    className="ml-2"
                    style={{
                      fontFamily: "monospace",
                    }}
                  >
                    L4
                  </span>
                </div>
                <div className="mb-1 opacity-25 md:opacity-100">
                  <span
                    className="opacity-60"
                    style={{
                      fontFamily: "monospace",
                    }}
                  >
                    F22+
                  </span>{" "}
                  <span
                    className="ml-2"
                    style={{
                      fontFamily: "monospace",
                    }}
                  >
                    V.09
                  </span>{" "}
                  <span
                    className="ml-2 px-1 opacity-25 md:opacity-100"
                    style={{
                      backgroundColor: "rgba(212, 165, 116, 0.3)",
                      fontFamily: "monospace",
                    }}
                  >
                    L0
                  </span>
                </div>
                <div className="mb-1 opacity-25 md:opacity-100">
                  <span className="opacity-60">-</span>{" "}
                  <span
                    className="ml-2 px-1 opacity-25 md:opacity-100"
                    style={{
                      backgroundColor: "rgba(212, 165, 116, 0.3)",
                      fontFamily: "monospace",
                    }}
                  >
                    Nul
                  </span>{" "}
                  <span
                    className="ml-2"
                    style={{
                      fontFamily: "monospace",
                    }}
                  >
                    L4
                  </span>
                </div>
              </div>
              {/* Main Text Display */}
              <div className="relative md:mx-26 flex flex-col w-full">
                <div
                  className="font-bold main-text-display leading-none md:mb-8 whitespace-pre-line select-none  text-left" // Added 'main-text-display' class
                  style={{
                    fontSize: "7rem",
                    color: "#d4a574",
                    letterSpacing: "0.15em",
                    fontFamily: "Montserrat, 'Consolas', monospace",
                    fontWeight: 900,
                    filter: "contrast(1.3) brightness(1.2)",
                  }}
                >
                  <span className="max-md:text-[3rem] flex tracking-tighter ">
                    POWER A <br /> FUTURE <br /> ONCE <br /> IMAGINED
                  </span>
                </div>

                {/* Handshake */}
                <div
                  className="relative lg:right-5 lg:-top-30 lg:absolute lg:flex hidden shrink-0"
                  style={{ width: "50vw", height: "80vh" }}
                >
                  <Image src={handshakeImage} alt="Handshake Image" />
                </div>
              </div>
              ;{/* Bottom section with data blocks */}
              <div
                className="absolute bottom-12 left-1/2 transform -translate-x-1/2 select-none opacity-25 md:opacity-100"
                style={{
                  fontFamily: "monospace",
                  fontWeight: "bold",
                }}
              >
                <div
                  className="h-px mx-auto mb-4"
                  style={{
                    width: "500px",
                    background:
                      "linear-gradient(to right, transparent, #d4a574, transparent)",
                    boxShadow: "0 0 8px rgba(212, 165, 116, 0.6)",
                  }}
                ></div>
                <div
                  className="text-center text-sm mb-3"
                  style={{
                    color: "#d4a574",
                    textShadow: "0 0 10px rgba(212, 165, 116, 0.8)",
                    fontFamily: "monospace",
                  }}
                >
                  ✶ Boot Balance ✶
                </div>
                <div className="flex justify-center gap-8 text-xs">
                  <div
                    className="border px-3 py-2"
                    style={{
                      borderColor: "#d4a574",
                      color: "#d4a574",
                      opacity: 0.8,
                    }}
                  >
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1122344778
                    </div>
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1123446658
                    </div>
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      5566998774
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1115566448
                    </div>
                  </div>
                  <div
                    className="text-xs opacity-70"
                    style={{
                      color: "#d4a574",
                      fontWeight: "bold",
                      fontFamily: "monospace",
                    }}
                  >
                    VB
                  </div>
                  <div
                    className="border px-3 py-2"
                    style={{
                      borderColor: "#d4a574",
                      color: "#d4a574",
                      opacity: 0.8,
                      fontFamily: "monospace",
                    }}
                  >
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1124677894
                    </div>
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1123446658
                    </div>
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1122344778
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1166699878
                    </div>
                  </div>
                  <div
                    className="text-xs opacity-70"
                    style={{
                      color: "#d4a574",
                      fontWeight: "bold",
                      fontFamily: "monospace",
                    }}
                  >
                    VB
                  </div>
                  <div
                    className="border px-3 py-2"
                    style={{
                      borderColor: "#d4a574",
                      color: "#d4a574",
                      opacity: 0.8,
                    }}
                  >
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1155446688
                    </div>
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1124677894
                    </div>
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1354469785
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                      }}
                    >
                      1354469785
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom right corner logo */}
              <div
                className="absolute bottom-8 right-12 text-2xl font-bold select-none opacity-45 md:opacity-100"
                style={{
                  color: "#d4a574",
                  textShadow: "0 0 15px rgba(212, 165, 116, 0.9)",
                  fontFamily: "serif",
                  letterSpacing: "0.1em",
                }}
              >
                <div
                  style={{
                    fontFamily: "monospace",
                  }}
                >
                  P△
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                  }}
                >
                  V▽
                </div>
              </div>
            </div>

            {/* Screen glare effect */}
            <div
              className="absolute inset-0 z-30 pointer-events-none opacity-15"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.1) 100%)",
              }}
            ></div>

            {/* Vignette effect */}
            <div
              className="absolute inset-0 z-30 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.55) 100%)",
              }}
            ></div>
          </div>
        </div>

        {/* Explore Gyanith 2K24 */}
        <div className="flex absolute bottom-0 items-center justify-center w-full h-1/3 ">
          {/* Image cards to the left */}
          <div className="absolute top-10 md:-bottom-96 md:left-0 flex gap-2">
            <DecayCard
              seed={0}
              width={300}
              seedAngle={-5}
              dampness={0.08}
              offsetY={-50}
              proximityRadius={400}
              image={gyPic1}
            />

            <DecayCard
              seed={0}
              width={300}
              seedAngle={10}
              dampness={0.08}
              proximityRadius={400}
              image={gyPic3}
            />

            <DecayCard
              seed={1}
              offsetY={100}
              seedAngle={-15}
              dampness={0.12}
              proximityRadius={500}
              image={gyPic5}
            />
          </div>

          {/* Image cards to the right */}
          <div className="absolute -bottom-50 right-0 flex gap-2">
            <DecayCard
              seed={0}
              offsetY={100}
              seedAngle={-5}
              dampness={0.08}
              proximityRadius={400}
              image={gyPic2}
            />

            <DecayCard
              seed={0}
              seedAngle={5}
              dampness={0.08}
              proximityRadius={400}
              image={gyPic4}
            />

            <DecayCard
              offsetY={-100}
              seed={1}
              seedAngle={15}
              dampness={0.12}
              proximityRadius={500}
              image={gyPic6}
            />
          </div>
        </div>
      </div>
      <div className="h-screen w-screen"></div>
    </motion.div>
  );
};

export default page;
