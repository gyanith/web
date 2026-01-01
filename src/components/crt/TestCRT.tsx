import React, { useState } from "react";
import "./TestCRT.css"; // Import the CSS file

const CRTMonitor: React.FC = () => {
  // Initial state for the main text display
  const [text, setText] = useState("GYANITH\n2026");

  return (
    <div className="h-screen w-screen bg-gray-900 flex items-center justify-center">
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
                fontFamily: "'Courier New', monospace",
                fontWeight: "bold",
              }}
            >
              <div
                className="text-lg mb-2"
                style={{
                  color: "#d4a574",
                  textShadow: "0 0 10px rgba(212, 165, 116, 0.8)",
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
              <div className="mb-2 px-2 py-1 border border-current opacity-25 md:opacity-100 ">
                F1
              </div>
              <div className="mb-2 px-2 py-1 border border-current bg-black bg-opacity-40 opacity-25 md:opacity-100">
                ON
              </div>
              <div className="mb-2 px-2 py-1 border border-current opacity-25 md:opacity-100">
                F5
              </div>
              <div className="mb-2 px-2 py-1 border border-current opacity-25 md:opacity-100">
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
                <span className="opacity-60">BLM</span>{" "}
                <span className="ml-2">F-VAR</span>{" "}
                <span className="ml-2">K-VAR</span>
              </div>
              <div className="mb-1 opacity-25 md:opacity-100">
                <span className="opacity-60">L5</span>{" "}
                <span className="ml-2">F2</span>{" "}
                <span className="ml-2">L4</span>
              </div>
              <div className="mb-1 opacity-25 md:opacity-100">
                <span className="opacity-60">F22+</span>{" "}
                <span className="ml-2">V.09</span>{" "}
                <span
                  className="ml-2 px-1 opacity-25 md:opacity-100"
                  style={{ backgroundColor: "rgba(212, 165, 116, 0.3)" }}
                >
                  L0
                </span>
              </div>
              <div className="mb-1 opacity-25 md:opacity-100">
                <span className="opacity-60">-</span>{" "}
                <span
                  className="ml-2 px-1 opacity-25 md:opacity-100"
                  style={{ backgroundColor: "rgba(212, 165, 116, 0.3)" }}
                >
                  Nul
                </span>{" "}
                <span className="ml-2">L4</span>
              </div>
            </div>

            {/* Main Text Display */}
            <div className="relative text-center">
              <div
                className="font-bold md:text-[7rem] text-[4rem]  leading-none mb-8 whitespace-pre-line font-montserrat select-none main-text-display" // Added 'main-text-display' class
                style={{
                  color: "#d4a574",
                  fontFamily: "Montserrat, 'Consolas', monospace",
                  fontWeight: 900,
                  filter: "contrast(1.3) brightness(1.2)",
                }}
              >
                {text}
              </div>

              <div
                className="w-64 h-1 mx-auto mb-6"
                style={{
                  backgroundColor: "#d4a574",
                  opacity: 0.7,
                  boxShadow: "0 0 10px rgba(212, 165, 116, 0.8)",
                }}
              ></div>

              <div className="flex justify-center gap-3 opacity-25 md:opacity-100">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3"
                    style={{
                      backgroundColor: "#d4a574",
                      opacity: 0.6,
                      boxShadow: "0 0 5px rgba(212, 165, 116, 0.8)",
                    }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Bottom section with data blocks */}
            <div
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2 select-none opacity-25 md:opacity-100"
              style={{
                fontFamily: "'Courier New', monospace",
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
                  <div className="mb-1">1122344778</div>
                  <div className="mb-1">1123446658</div>
                  <div className="mb-1">5566998774</div>
                  <div>1115566448</div>
                </div>
                <div
                  className="text-xs opacity-70"
                  style={{
                    color: "#d4a574",
                    fontWeight: "bold",
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
                  <div className="mb-1">1124677894</div>
                  <div className="mb-1">1123446658</div>
                  <div className="mb-1">1122344778</div>
                  <div>1166699878</div>
                </div>
                <div
                  className="text-xs opacity-70"
                  style={{
                    color: "#d4a574",
                    fontWeight: "bold",
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
                  <div className="mb-1">1155446688</div>
                  <div className="mb-1">1124677894</div>
                  <div className="mb-1">1354469785</div>
                  <div>1354469785</div>
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
              <div>P△</div>
              <div>V▽</div>
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
    </div>
  );
};

export default CRTMonitor;
