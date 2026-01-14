import { notFound } from "next/navigation";
import EventDetailsClient from "./EventDetailsClient";
import BackButton from "./BackButton";
import Footer from "@/my_components/Footer";

type PageProps = {
  params: Promise<{
    eventType: string;
    eventId: string;
  }>;
};

async function getEventDetails(eventType: string, eventId: string) {
  // Demo Data Fallback / Fetch Logic
  try {
      const res = await fetch(
        `http://localhost:3000/api/events/${eventType}/${eventId}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data[0] || data;
  } catch (error) {
      // Fallback Data
      return {
        eventName: "Hackathon 2024",
        description: "A 24-hour coding marathon where students can showcase their skills and build innovative solutions. Open to all departments.",
        imageUrl: "/api/placeholder/1920/1080",
        date: "2024-03-15",
        day: "1",
        location: "Main Auditorium",
        fee: "500",
        prize_pool: "50,000",
        coordinators: ["Alice Johnson", "Bob Smith"],
        is_team_event: true,
        type: eventType
     };
  }
}

export default async function Page({ params }: PageProps) {
  const { eventType, eventId } = await params;

  if (!eventId) {
    notFound();
  }

  const eventData = await getEventDetails(eventType, eventId);

  return (
    <div className="min-h-screen ">
      <div className="fixed top-8 lg:top-32 left-5 lg:left-16 z-50 w-fit ">
        <div className="p-2 text-white">
             <BackButton eventType={eventType}/>
        </div>
      </div>

      <EventDetailsClient eventData={eventData} eventType={eventType} />
      <Footer />
    </div>
  );
}
