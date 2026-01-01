"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import CountUp from "./CountUp";
import TextType from "./TextType";

const ACCENT = "#DF9B55";

export default function TerminalLoader({
  visible,
  text,
  onDone,
}: {
  visible: boolean;
  text: string;
  onDone: () => void;
}) {
  const screenRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const [progress, setProgress] = useState(0);

  /* ───────── Fade IN ───────── */
  useEffect(() => {
    if (!visible || !screenRef.current) return;

    gsap.killTweensOf(screenRef.current);

    gsap.fromTo(
      screenRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.2,
        ease: "power2.out",
      }
    );
  }, [visible]);

  /* ───────── Cursor blink ───────── */
  useEffect(() => {
    if (!cursorRef.current) return;

    gsap.to(cursorRef.current, {
      opacity: 0,
      duration: 0.6,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, []);

  /* ───────── Progress + Fade OUT ───────── */
  useEffect(() => {
    if (!visible) return;

    let value = 0;
    setProgress(0);

    const interval = setInterval(() => {
      value += Math.floor(Math.random() * 6) + 3;

      if (value >= 100) {
        value = 100;
        setProgress(100);
        clearInterval(interval);

        gsap.to(screenRef.current, {
          keyframes: [
            { opacity: 1, y: 0 },
            { opacity: 0, y: -20 },
          ],
          duration: 2,
          delay: 0.2,
          ease: "expo.inOut",
          onComplete: () => {
            document.documentElement.classList.remove("loader-active");
            onDone();
          },
        });

        return;
      }

      setProgress(value);
    }, 75);

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 z-10000 flex w-screen h-screen bg-slate-950 font-mono text-sm"
      style={{ color: ACCENT }}
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background:
            "repeating-linear-gradient(to bottom, #000 0px, #000 1px, transparent 2px, transparent 4px)",
        }}
      />

      <div
        className="absolute left-8 top-1/4 select-none"
        style={{
          fontFamily: "monospace",
          fontSize: "0.7rem",
          color: "#d4a574",
          opacity: 0.7,
          textShadow: "0 0 5px rgba(212, 165, 116, 0.5)",
        }}
      >
        <div className="mb-2 px-2 py-1 border border-gray-200/5 text-gray-200/5">
          F1
        </div>
        <div className="mb-2 px-2 py-1 border border-gray-200/5 bg-black  text-gray-200/5">
          ON
        </div>
        <div className="mb-2 px-2 py-1 border border-gray-200/5 text-gray-200/5">
          F5
        </div>
        <div className="mb-2 px-2 py-1 border border-gray-200/5 text-gray-200/5">
          OFF
        </div>
      </div>

      <div
        className="absolute right-8 top-1/4 text-right select-none"
        style={{
          fontFamily: "monospace",
          fontSize: "0.65rem",
          color: "#d4a574",
          opacity: 0.8,
          textShadow: "0 0 5px rgba(212, 165, 116, 0.5)",
        }}
      >
        <div className="mb-1">
          <span className="opacity-60">BLM</span>{" "}
          <span className="ml-2">F-VAR</span>{" "}
          <span className="ml-2">K-VAR</span>
        </div>
        <div className="mb-1">
          <span className="opacity-60">L5</span>{" "}
          <span className="ml-2">F2</span> <span className="ml-2">L4</span>
        </div>
        <div className="mb-1">
          <span className="opacity-60">F22+</span>{" "}
          <span className="ml-2">V.09</span>{" "}
          <span
            className="ml-2 px-1"
            style={{ backgroundColor: "rgba(212, 165, 116, 0.3)" }}
          >
            L0
          </span>
        </div>
        <div className="mb-1">
          <span className="opacity-60">-</span>{" "}
          <span
            className="ml-2 px-1"
            style={{ backgroundColor: "rgba(212, 165, 116, 0.3)" }}
          >
            Nul
          </span>{" "}
          <span className="ml-2">L4</span>
        </div>

        <div className="mb-1">
          <span className="opacity-60">BLM</span>{" "}
          <span className="ml-2">F-VAR</span>{" "}
          <span className="ml-2">K-VAR</span>
        </div>
        <div className="mb-1">
          <span className="opacity-60">L5</span>{" "}
          <span className="ml-2">F2</span> <span className="ml-2">L4</span>
        </div>
        <div className="mb-1">
          <span className="opacity-60">F22+</span>{" "}
          <span className="ml-2">V.09</span>{" "}
          <span
            className="ml-2 px-1"
            style={{ backgroundColor: "rgba(212, 165, 116, 0.3)" }}
          >
            L0
          </span>
        </div>
        <div className="mb-1">
          <span className="opacity-60">-</span>{" "}
          <span
            className="ml-2 px-1"
            style={{ backgroundColor: "rgba(212, 165, 116, 0.3)" }}
          >
            Nul
          </span>{" "}
          <span className="ml-2">L4</span>
        </div>
        <div className="mb-1">
          <span className="opacity-60">BLM</span>{" "}
          <span className="ml-2">F-VAR</span>{" "}
          <span className="ml-2">K-VAR</span>
        </div>
        <div className="mb-1">
          <span className="opacity-60">L5</span>{" "}
          <span className="ml-2">F2</span> <span className="ml-2">L4</span>
        </div>
        <div className="mb-1">
          <span className="opacity-60">F22+</span>{" "}
          <span className="ml-2">V.09</span>{" "}
          <span
            className="ml-2 px-1"
            style={{ backgroundColor: "rgba(212, 165, 116, 0.3)" }}
          >
            L0
          </span>
        </div>
        <div className="mb-1">
          <span className="opacity-60">-</span>{" "}
          <span
            className="ml-2 px-1"
            style={{ backgroundColor: "rgba(212, 165, 116, 0.3)" }}
          >
            Nul
          </span>{" "}
          <span className="ml-2">L4</span>
        </div>
      </div>

      <div className="relative p-6 text-3xl text-gray-200/10">
        <div>
          <TextType
            text={text}
            typingSpeed={50}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="█"
            className="font-mono"
          />
        </div>

        <p className="mt-2 text-3xl font-mono text-gray-200/5">
          {`#`.repeat(Math.floor(progress / 4))}
          {" ".repeat(25 - Math.floor(progress / 4))}
        </p>
      </div>

      <div className="absolute flex right-[50%] bottom-[50%]   lg:right-0 lg:bottom-0 ">
        <CountUp
          from={0}
          to={100}
          separator=","
          direction="up"
          duration={5}
          className="count-up-text font-montserrat font-mono tracking-tighter text-[10rem] lg:text-[30rem] leading-none"
        />
        <span className="font-montserrat font-sans text-[5rem] lg:text-[15rem] leading-none">
          %
        </span>
      </div>
    </div>
  );
}
