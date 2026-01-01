import Image from "next/image";
import searchIcon from "@/assets/searchIcon.svg";

import Plasma from "@/components/Plasma";

function page() {
  return (
    <div className="">
      <div className="text-white relative font-5xl w-screen h-[66vh] overflow-clip flex items-end">
        <div className="w-full h-full absolute overflow-clip bg-black">
          <Plasma
            color="#ff6b35"
            speed={0.6}
            direction="reverse"
            scale={2.5}
            opacity={1}
            mouseInteractive={true}
          />
        </div>
        <div className="m-7 z-10  w-full flex items-end justify-between">
          <span className=" font-black text-9xl text-white ">
            FUN <br /> EVENTS
          </span>

          <span className="w-lg px-3 gap-3 justify-center items-center bg-black flex flex-row-reverse md:flex-row h-12 rounded-full border border-amber-100/25">
            <Image src={searchIcon} alt="search icon" />

            <input
              type="text"
              placeholder="Search Events"
              className="w-full focus:outline-none"
            ></input>
          </span>
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/30 to-black " />
      </div>
    </div>
  );
}

export default page;
