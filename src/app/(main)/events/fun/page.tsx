"use client";

import Plasma from "@/components/Plasma";

import Image from "next/image";
import searchIcon from "@/assets/searchIcon.svg";

import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";

function page() {
  return (
    <div>
      <div className="text-white relative font-5xl w-screen h-[33vh] md:h-[50vh] lg:h-[66vh] overflow-clip flex items-end transition-all duration-300 ease-in-out">
        <div className="w-full h-full absolute overflow-clip">
          <Plasma
            color="#ff6b35"
            speed={0.6}
            direction="reverse"
            scale={2.5}
            opacity={1}
            mouseInteractive={true}
          />
          ;
        </div>
        <div className="m-7 z-10  w-full flex flex-col md:flex-row gap-5 items-start md:items-end justify-between">
          <span className="font-black text-white text-[clamp(3rem,10vw,8rem)] leading-none">
            FUN <br /> EVENTS
          </span>

          <span className="w-full md:w-[40vw] lg:w-lg px-3 justify-center items-center bg-black flex flex-row-reverse md:flex-row h-12 rounded-full border border-amber-100/25">
            <Image src={searchIcon} alt="search icon" />

            <input
              type="text"
              placeholder="Search Events"
              className="w-full focus:outline-none ml-3"
            ></input>
          </span>
        </div>
        <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/30 to-black " />
      </div>

      {/* Event Cards */}
      <div className="w-full h-fit flex items-center justify-center  p-7">
        <div
          className="
            w-full
            grid
            gap-3
            place-content-center

            grid-cols-[repeat(auto-fit,minmax(280px,1fr))]
            md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]
            lg:grid-cols-[repeat(auto-fit,minmax(500px,1fr))]
          "
        >
          <EventCard
            eventName="Dance Off"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
            day="DAY 1"
            location="ScB FF5"
            prizePool="5,000"
          />

          <EventCard
            eventName="Event Name"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
            day="DAY 1"
            location="ScB FF5"
            prizePool="5,000"
          />

          <EventCard
            eventName="Event Name"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
            day="DAY 1"
            location="ScB FF5"
            prizePool="5,000"
          />

          <EventCard
            eventName="Event Name"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
            day="DAY 1"
            location="ScB FF5"
            prizePool="5,000"
          />

          <EventCard
            eventName="Event Name"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
            day="DAY 2"
            location="LOC"
            prizePool="5,000"
          />

          <EventCard
            eventName="Event Name"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
            day="DAY 1"
            location="LOC"
            prizePool="5,000"
          />

          <EventCard
            eventName="Event Name"
            description="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
            day="DAY 1"
            location="LOC"
            prizePool="5,000"
          />
        </div>
      </div>

      {/* Footer */}

      <Footer />
    </div>
  );
}

export default page;
