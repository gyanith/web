import React, { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  animate,
} from "framer-motion";

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  glowRadius?: number;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  glowRadius = 350,
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = useMotionValue(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current) return;

    const rect = divRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseEnter = () => {
    animate(radius, glowRadius, { duration: 0.3, ease: "easeOut" });
  };

  const handleMouseLeave = () => {
    animate(radius, 0, { duration: 0.3, ease: "easeOut" });
  };

  const maskImage = useMotionTemplate`radial-gradient(circle ${radius}px at ${mouseX}px ${mouseY}px, transparent 0%, black 100%)`;

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden ${className}`}
    >
      {children}

      {/* Grayscale Filter Layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
        style={{
          backdropFilter: "grayscale(100%)",
          WebkitBackdropFilter: "grayscale(100%)",
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      />
    </div>
  );
};

export default SpotlightCard;
