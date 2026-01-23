import { notFound } from "next/navigation";
import EventDetailsClient from "./EventDetailsClient";
import BackButton from "./BackButton";
import Footer from "@/my_components/Footer";
import { getEvent } from "@/lib/actions/events.actions";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";

type PageProps = {
  params: Promise<{
    eventType: string;
    eventId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { eventType, eventId } = await params;

  if (!eventId) {
    notFound();
  }

  const eventData = await getEvent(eventId);

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <h1 className="text-2xl">Event not found</h1>
      </div>
    );
  }

  const imageUrl = eventData.image_id
    ? `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.eventsBucketId}/files/${eventData.image_id}/view?project=${appwriteConfig.projectId}`
    : "/api/placeholder/1920/1080";

  const eventWithImage = {
    ...eventData,
    imageUrl,
  };

  return (
    <div className="min-h-screen ">
      <div className="fixed top-8 lg:top-32 left-5 lg:left-16 z-50 w-fit ">
        <div className="p-2 text-white">
          <BackButton eventType={eventType} />
        </div>
      </div>

      <EventDetailsClient eventData={eventWithImage} eventType={eventType} />
      <Footer />
    </div>
  );
}
