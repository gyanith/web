"use client";

import React, { useEffect, useRef, ReactNode, useState } from "react";
import { gsap } from "gsap";

interface DecayCardProps {
  width?: number;
  height?: number;
  image?: string;
  children?: ReactNode;
  seed?: number;
  seedAngle?: number;
  dampness?: number;
  proximityRadius?: number;
  offsetY?: number;
}

const DecayCard: React.FC<DecayCardProps> = ({
  width = 300,
  height = 400,
  image = "https://picsum.photos/300/400?grayscale",
  children,
  seed = 0,
  seedAngle = 0,
  dampness = 0.1,
  proximityRadius = 0,
  offsetY = 0,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const cursor = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const winsize = useRef<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const [randomValues, setRandomValues] = useState({
    movementScale: 1,
    rotationScale: 1,
    rotationDirection: 1,
    lerpSpeed: 0.1,
    delay: seed * 0.05,
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setRandomValues({
      movementScale: 0.7 + Math.random() * 0.6,
      rotationScale: 0.5 + Math.random() * 1.0,
      rotationDirection: Math.random() > 0.5 ? 1 : -1,
      lerpSpeed: dampness,
      delay: seed * 0.05,
    });
    setIsMounted(true);
  }, [seed, dampness]);

  useEffect(() => {
    if (!isMounted || !containerRef.current) return;

    cursor.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    winsize.current = { width: window.innerWidth, height: window.innerHeight };

    const lerp = (a: number, b: number, n: number): number =>
      (1 - n) * a + n * b;
    const map = (
      x: number,
      a: number,
      b: number,
      c: number,
      d: number
    ): number => ((x - a) * (d - c)) / (b - a) + c;

    const distance = (x1: number, x2: number, y1: number, y2: number): number =>
      Math.hypot(x1 - x2, y1 - y2);

    const getProximityFactor = (): number => {
      if (proximityRadius === 0 || !containerRef.current) return 1;
      const rect = containerRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      const dist = distance(
        cursor.current.x,
        cardCenterX,
        cursor.current.y,
        cardCenterY
      );

      if (dist > proximityRadius) return 0;
      const normalizedDist = dist / proximityRadius;
      return 1 - normalizedDist * normalizedDist;
    };

    const handleResize = () => {
      winsize.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };

    const handleMouseMove = (ev: MouseEvent) => {
      cursor.current = { x: ev.clientX, y: ev.clientY };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const transformState = { x: 0, y: offsetY, rz: seedAngle };
    let startTime = Date.now() + randomValues.delay * 1000;
    let hasStarted = false;

    const render = () => {
      if (!hasStarted && Date.now() < startTime) {
        requestAnimationFrame(render);
        return;
      }
      hasStarted = true;

      const rv = randomValues;
      const proximityFactor = getProximityFactor();

      // Calculate Target Positions
      let targetX = lerp(
        transformState.x,
        map(
          cursor.current.x,
          0,
          winsize.current.width,
          -120 * rv.movementScale,
          120 * rv.movementScale
        ) * proximityFactor,
        rv.lerpSpeed
      );

      let targetY = lerp(
        transformState.y,
        offsetY +
          map(
            cursor.current.y,
            0,
            winsize.current.height,
            -120 * rv.movementScale,
            120 * rv.movementScale
          ) *
            proximityFactor,
        rv.lerpSpeed
      );

      let targetRz = lerp(
        transformState.rz,
        seedAngle +
          map(
            cursor.current.x,
            0,
            winsize.current.width,
            -10 * rv.rotationScale * rv.rotationDirection,
            10 * rv.rotationScale * rv.rotationDirection
          ) *
            proximityFactor,
        rv.lerpSpeed
      );

      // Apply Constraints/Soft Bounds
      const bound = 50 * rv.movementScale;
      if (targetX > bound) targetX = bound + (targetX - bound) * 0.2;
      if (targetX < -bound) targetX = -bound + (targetX + bound) * 0.2;

      const yBoundUpper = offsetY + bound;
      const yBoundLower = offsetY - bound;
      if (targetY > yBoundUpper)
        targetY = yBoundUpper + (targetY - yBoundUpper) * 0.2;
      if (targetY < yBoundLower)
        targetY = yBoundLower + (targetY - yBoundLower) * 0.2;

      transformState.x = targetX;
      transformState.y = targetY;
      transformState.rz = targetRz;

      if (cardRef.current) {
        gsap.set(cardRef.current, {
          x: transformState.x,
          y: transformState.y,
          rotateZ: transformState.rz,
        });
      }

      requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMounted, randomValues, seed, seedAngle, proximityRadius, offsetY]);

  return (
    <div
      ref={containerRef}
      className="relative z-10"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* The actual card content being animated */}
      <div
        ref={cardRef}
        className="relative w-full h-full will-change-transform overflow-hidden rounded-xl shadow-lg shadow-black"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />{" "}
        {/* Optional Overlay */}
        <div className="absolute bottom-[1.2em] left-[1em] tracking-[-0.5px] font-black text-[2.5rem] leading-[1.5em] text-white first-line:text-[6rem] z-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DecayCard;
