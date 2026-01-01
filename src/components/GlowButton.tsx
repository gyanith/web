import React, { useState } from "react";

type GlowButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  glowColor?: string;
  style?: React.CSSProperties;
};

export default function GlowButton({
  children,
  onClick,
  className = "",
  glowColor = "#fcf9d9",
  style,
}: GlowButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle: React.CSSProperties = {
    ...style,
    ...(isHovered && {
      backgroundColor: glowColor,
      borderColor: glowColor,
      boxShadow: `0 0 5px ${glowColor}, 0 0 20px ${glowColor}, 0 0 50px ${glowColor}, 0 0 100px ${glowColor}`,
      textShadow: "0 0 5px #ffffff, 0 0 10px #ffffff, 0 0 20px #ffffff",
      color: "black",
    }),
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        
        uppercase
        rounded-lg
        text-[17px] font-medium
        text-white
        bg-transparent
        border border-white/50
        cursor-pointer
        select-none
        transition-all duration-500 ease-in-out
        px-4 py-3
        ${className}
      `}
      style={buttonStyle}
    >
      {children}
    </div>
  );
}
