import React from "react";
import QRCode from "react-qr-code";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 256,
  className,
  bgColor = "transparent",
  fgColor = "#000000",
}) => {
  return (
    <QRCode
      value={value}
      size={size}
      bgColor={bgColor}
      fgColor={fgColor}
      className={className}
    />
  );
};
