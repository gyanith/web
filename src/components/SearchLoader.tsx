import React from "react";

interface WifiLoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

const WifiLoader: React.FC<WifiLoaderProps> = ({
  text = "Searching",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <>
      <style>{`
        @keyframes circle-outer135 {
          0% { stroke-dashoffset: 25; }
          25% { stroke-dashoffset: 0; }
          65% { stroke-dashoffset: 301; }
          80% { stroke-dashoffset: 276; }
          100% { stroke-dashoffset: 276; }
        }
        @keyframes circle-middle6123 {
          0% { stroke-dashoffset: 17; }
          25% { stroke-dashoffset: 0; }
          65% { stroke-dashoffset: 204; }
          80% { stroke-dashoffset: 187; }
          100% { stroke-dashoffset: 187; }
        }
        @keyframes circle-inner162 {
          0% { stroke-dashoffset: 9; }
          25% { stroke-dashoffset: 0; }
          65% { stroke-dashoffset: 106; }
          80% { stroke-dashoffset: 97; }
          100% { stroke-dashoffset: 97; }
        }
        @keyframes text-animation76 {
          0% { clip-path: inset(0 100% 0 0); }
          50% { clip-path: inset(0); }
          100% { clip-path: inset(0 0 0 100%); }
        }
        .circle-outer-back {
          animation: circle-outer135 1.8s ease infinite 0.3s;
        }
        .circle-outer-front {
          animation: circle-outer135 1.8s ease infinite 0.15s;
        }
        .circle-middle-back {
          animation: circle-middle6123 1.8s ease infinite 0.25s;
        }
        .circle-middle-front {
          animation: circle-middle6123 1.8s ease infinite 0.1s;
        }
        .circle-inner-back {
          animation: circle-inner162 1.8s ease infinite 0.2s;
        }
        .circle-inner-front {
          animation: circle-inner162 1.8s ease infinite 0.05s;
        }
        .text-animated::after {
          content: attr(data-text);
          color: #4f29f0;
          animation: text-animation76 3.6s ease infinite;
          position: absolute;
          left: 0;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center">
        <div
          className={`${sizeClasses[size]} rounded-full relative flex items-center justify-center`}
        >
          {/* Outer Circle */}
          <svg
            className="absolute flex items-center justify-center"
            style={{ height: "86px", width: "86px" }}
            viewBox="0 0 86 86"
          >
            <circle
              className="circle-outer-back"
              cx="43"
              cy="43"
              r="40"
              fill="none"
              stroke="#c3c8de"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="62.75 188.25"
              style={{
                transform: "rotate(-100deg)",
                transformOrigin: "center",
              }}
            />
            <circle
              className="circle-outer-front"
              cx="43"
              cy="43"
              r="40"
              fill="none"
              stroke="#4f29f0"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="62.75 188.25"
              style={{
                transform: "rotate(-100deg)",
                transformOrigin: "center",
              }}
            />
          </svg>

          {/* Middle Circle */}
          <svg
            className="absolute flex items-center justify-center"
            style={{ height: "60px", width: "60px" }}
            viewBox="0 0 60 60"
          >
            <circle
              className="circle-middle-back"
              cx="30"
              cy="30"
              r="27"
              fill="none"
              stroke="#c3c8de"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="42.5 127.5"
              style={{
                transform: "rotate(-100deg)",
                transformOrigin: "center",
              }}
            />
            <circle
              className="circle-middle-front"
              cx="30"
              cy="30"
              r="27"
              fill="none"
              stroke="#4f29f0"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="42.5 127.5"
              style={{
                transform: "rotate(-100deg)",
                transformOrigin: "center",
              }}
            />
          </svg>

          {/* Inner Circle */}
          <svg
            className="absolute flex items-center justify-center"
            style={{ height: "34px", width: "34px" }}
            viewBox="0 0 34 34"
          >
            <circle
              className="circle-inner-back"
              cx="17"
              cy="17"
              r="14"
              fill="none"
              stroke="#c3c8de"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="22 66"
              style={{
                transform: "rotate(-100deg)",
                transformOrigin: "center",
              }}
            />
            <circle
              className="circle-inner-front"
              cx="17"
              cy="17"
              r="14"
              fill="none"
              stroke="#4f29f0"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="22 66"
              style={{
                transform: "rotate(-100deg)",
                transformOrigin: "center",
              }}
            />
          </svg>
        </div>

        {/* Text */}
        <div
          className="mt-6 flex items-center justify-center lowercase font-medium text-sm tracking-wide relative"
          data-text={text}
        >
          <span className="text-gray-700">{text}</span>
          <span
            className="text-animated absolute left-0"
            data-text={text}
          ></span>
        </div>
      </div>
    </>
  );
};
