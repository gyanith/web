import { headers } from "next/headers";
import { EventProvider, EventSearchBar, EventGrid } from "./EventSearch";

import Plasma from "@/my_components/Plasma";
import FloatingLines from "@/my_components/FloatingLines";
import DarkVeil from "@/components/DarkVeil";

async function getEvents(eventType: string) {
  // Dynamically construct base URL from request headers to work on all devices
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/events/${eventType}`, {
    cache: "no-store", // Prevent caching issues that might cause reloads
  });
  let data = await res.json();

  if (
    (eventType === "workshop" || eventType === "workshops") &&
    Array.isArray(data)
  ) {
    data.sort((a, b) => {
      // If both have key
      if (a.key != null && b.key != null) {
        // Check if numeric
        if (typeof a.key === "number" && typeof b.key === "number") {
          return a.key - b.key;
        }
        // Fallback to string comparison
        return String(a.key).localeCompare(String(b.key));
      }
      // If only a has key, it comes first
      if (a.key != null) return -1;
      // If only b has key, it comes first
      if (b.key != null) return 1;
      // Neither has key
      return 0;
    });
  }

  return data;
}

async function page({ params }: { params: Promise<{ eventType: string }> }) {
  const { eventType } = await params;
  console.log("Event Type:", eventType);
  const allEvents = await getEvents(eventType);
  console.log("Events Data:", allEvents);
  return (
    <EventProvider initialEvents={allEvents}>
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
            ) : eventType === "fun" ? (
              <Plasma
                color="#ff6b35"
                speed={0.6}
                direction="reverse"
                scale={1.75}
                opacity={1}
                mouseInteractive={true}
              />
            ) : (
              <DarkVeil
                hueShift={0}
                noiseIntensity={0}
                scanlineIntensity={0}
                speed={2}
                scanlineFrequency={2}
                warpAmount={2}
              />
            )}
            ;
          </div>
          <div className="m-7 z-10  w-full flex flex-col md:flex-row gap-5 items-start md:items-end justify-between">
            <span className="font-black text-white text-[clamp(3rem,10vw,8rem)] leading-none">
              {eventType.toUpperCase()} <br /> EVENTS
            </span>

            <EventSearchBar />
          </div>
          <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/30 to-black " />
        </div>

        {/* Event Cards */}
        <div className="w-full h-fit flex items-center justify-center  p-7">
          <EventGrid />
        </div>

        {/* Footer */}
      </div>
    </EventProvider>
  );
}

export default page;
