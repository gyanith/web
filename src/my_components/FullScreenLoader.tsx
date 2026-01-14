"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const ACCENT = "#DF9B55";

export default function TerminalLoader({
  text,
  visible,
}: {
  text: string;
  visible: boolean;
}) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Animate screen IN / OUT
  useEffect(() => {
    if (!screenRef.current) return;

    if (visible) {
      gsap.fromTo(
        screenRef.current,
        { y: "100%" },
        { y: "0%", duration: 0.7, ease: "power4.out" }
      );
    } else {
      gsap.to(screenRef.current, {
        y: "-100%",
        duration: 0.6,
        ease: "power4.in",
      });
    }
  }, [visible]);

  // Fake terminal progress
  useEffect(() => {
    if (!visible) return;

    setProgress(0);
    let value = 0;

    const interval = setInterval(() => {
      value += Math.floor(Math.random() * 8) + 3;
      if (value >= 100) {
        value = 100;
        clearInterval(interval);
      }
      setProgress(value);
    }, 80);

    return () => clearInterval(interval);
  }, [visible]);

  return (
    <div
      ref={screenRef}
      className="fixed inset-0 z-10000 bg-black font-mono text-sm"
      style={{ color: ACCENT }}
    >
      <div className="p-6">
        <p>$ {text}</p>
        <p className="mt-2">
          [{`#`.repeat(progress / 4)}
          {" ".repeat(25 - progress / 4)}] {progress}%
        </p>
      </div>
    </div>
  );
}
