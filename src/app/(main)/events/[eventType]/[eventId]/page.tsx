import { notFound } from "next/navigation";
import Aurora from "@/components/Aurora";
import Image from "next/image";

import { superRetro } from "@/fonts/fonts";
import Footer from "@/components/Footer";
import BackButton from "./BackButton";

type PageProps = {
  params: Promise<{
    eventType: string;
    eventId: string;
  }>;
};

async function getEventDetails(eventType: string, eventId: string) {
  const res = await fetch(
    `http://localhost:3000/api/events/${eventType}/${eventId}`
  );
  const data = await res.json();
  return data[0];
}

export default async function Page({ params }: PageProps) {
  const { eventType, eventId } = await params;

  // ❌ eventId not found

  if (eventId === "event-1") {
    notFound();
  }

  const eventData = await getEventDetails(eventType, eventId);
  console.log("Event Data:", eventData);

  // ✅ conditional rendering
  return (
    <div className=" w-fit h-fit">
      <div className="absolute top-7 z-100 left-5 lg:top-44 sm:left-7 md:left-10 lg:left-16 flex text-white">
        <BackButton />
      </div>
      <div className="relative flex flex-col md:flex-row md:justify-center  z-0 w-screen h-screen ">
        <div className="flex absolute md:hidden h-full w-full rotate-180">
          <Aurora
            colorStops={["#967656", "#AAAAAA", "110A05"]}
            blend={0.7}
            amplitude={0.5}
            speed={1}
          />
        </div>

        <div className="inset-0 hidden md:flex h-full w-full absolute z-10 bg-radial from-black/10 via-black/65 to-black" />

        <Image
          src={eventData.imageUrl}
          alt="Event Image"
          fill
          objectFit="cover"
          objectPosition="top"
          className="z-0 hidden md:flex blur-xl lg:blur-2xl opacity-50 brightness-110 contrast-125"
        />

        <div className="w-full md:w-1/2  z-50 h-fit md:h-full "></div>

        <div className="w-full md:w-1/2  h-full md:h-full gap-5 flex lg:flex-col flex-col-reverse items-end justify-start sm:justify-end text-right  z-50 ">
          <div className="h-full w-full bg-[#d4a57475] lg:rounded-bl-4xl md:rounded-tl-4xl lg:rounded-tl-none p-5 sm:p-7 md:p-10 lg:p-16  flex justify-end lg:items-end">
            <p className="text-white w-full md:w-2/3 ">
              {eventData.description}
            </p>
          </div>

          <div
            className={` text-white flex flex-col leading-none m-5 sm:m-7 md:m-10 lg:m-16`}
          >
            {eventData.eventName
              .split(" ")
              .map((word: string, index: number) => (
                <span
                  key={index}
                  className={`${superRetro.className} font-black text-[clamp(2rem,9vw,6rem)]`}
                >
                  {word}
                </span>
              ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
