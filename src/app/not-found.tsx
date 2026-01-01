"use client";
import CurvedLoop from "@/components/CurvedLoop";
import FuzzyText from "@/components/FuzzyText";

const pageNotFound = () => {
  return (
    <div className="text-white w-screen h-screen  flex flex-col items-center justify-center">
      <div className=" absolute w-screen inset-0 top-10 left-[50%] -translate-x-[50%]">
        <FuzzyText
          baseIntensity={0.1}
          hoverIntensity={0.5}
          enableHover={true}
          fontSize={"clamp(2rem, 8vw, 8rem)"}
          color="#1e1e1e"
        >
          404::NOT FOUND
        </FuzzyText>
      </div>
      <div className="w-screen ">
        <CurvedLoop
          marqueeText="404 :: NULL ROUTE ✦ NODE UNRESPONSIVE ✦ "
          speed={2}
          curveAmount={0}
          className="absolute"
          interactive={false}
        />
      </div>
    </div>
  );
};

export default pageNotFound;
