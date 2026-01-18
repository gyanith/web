import React from "react";

const AnimatedStripes: React.FC = () => {
  return (
    <div className="w-full h-full flex justify-center items-center relative overflow-hidden">
      <style jsx>{`
        @keyframes move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 40px 40px;
          }
        }
        .animated-stripes {
          background: #070a10;
          background-image: linear-gradient(
            135deg,
            #070a10 25%,
            #d4a574 25%,
            #d4a574 50%,
            #070a10 50%,
            #070a10 75%,
            #d4a574 75%,
            #d4a574
          );
          background-size: 40px 40px;
          animation: move 4s linear infinite;
        }
      `}</style>
      <div className="animated-stripes absolute inset-0" />
    </div>
  );
};

export default AnimatedStripes;
