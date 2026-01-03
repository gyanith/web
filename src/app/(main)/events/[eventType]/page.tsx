import Image from "next/image";
import searchIcon from "@/assets/searchIcon.svg";

import EventCard from "@/components/EventCard";
import Footer from "@/components/Footer";

import Plasma from "@/components/Plasma";
import FloatingLines from "@/components/FloatingLines";

async function getEvents(eventType: string) {
  const res = await fetch(`http://localhost:3000/api/events/${eventType}`);
  const data = await res.json();
  return data;
}
async function page({ params }: { params: Promise<{ eventType: string }> }) {
  const { eventType } = await params;
  console.log("Event Type:", eventType);
  const funEvents = await getEvents(eventType);
  // console.log("Tech Events Data:", techEvents);
  return (
    <div>
      <div className="text-white relative font-5xl w-screen h-[33vh] md:h-[50vh] lg:h-[66vh] overflow-clip flex items-end transition-all duration-300 ease-in-out">
        <div className="w-full h-full absolute overflow-clip">
          {eventType === "tech" ? (
            <FloatingLines
              enabledWaves={["top", "middle"]}
              linesGradient={["#710058", "#FFFFFF"]}
              // Array - specify line count per wave; Number - same count for all waves
              lineCount={[50, 7]}
              // Array - specify line distance per wave; Number - same distance for all waves
              lineDistance={[75, 150]}
              bendRadius={5.0}
              bendStrength={-0.9}
              interactive={false}
              parallax={false}
              mixBlendMode="color-dodge"
            />
          ) : (
            <Plasma
              color="#ff6b35"
              speed={0.6}
              direction="reverse"
              scale={1.75}
              opacity={1}
              mouseInteractive={true}
            />
          )}
          ;
        </div>
        <div className="m-7 z-10  w-full flex flex-col md:flex-row gap-5 items-start md:items-end justify-between">
          <span className="font-black text-white text-[clamp(3rem,10vw,8rem)] leading-none">
            {eventType.toUpperCase()} <br /> EVENTS
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
          {funEvents &&
            funEvents.map((event: any) => (
              <EventCard
                key={event.eventId}
                eventId={event.eventId}
                eventType={event.eventType}
                eventName={event.eventName}
                description={event.description}
                day={event.day}
                location={event.location}
                prizePool={event.prizePool}
                imageUrl={event.imageUrl}
              />
            ))}
        </div>
      </div>

      {/* Footer */}

      <Footer />
    </div>
  );
}

export default page;
