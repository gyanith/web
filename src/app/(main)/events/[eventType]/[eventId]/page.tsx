import { notFound } from "next/navigation";
import EventDetailsClient from "./EventDetailsClient";
import BackButton from "./BackButton";
import Footer from "@/my_components/Footer";
import { getEvent } from "@/lib/actions/events.actions";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { getLoggedInUser } from "@/lib/actions/auth.actions";
import { createAdminClient } from "@/lib/appwrite/appwrite.server";
import { Query } from "node-appwrite";

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

  const [eventData, user] = await Promise.all([
    getEvent(eventId),
    getLoggedInUser(),
  ]);

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

  // Check registration status
  let isRegistered = false;
  if (user) {
    try {
      const { getTablesDB } = await createAdminClient();
      const tablesDB = getTablesDB();
      const REGISTRATIONS_COLLECTION_ID = "69713eb50019d26b632d";

      const existingRegistration = await tablesDB.listRows(
        appwriteConfig.databaseId,
        REGISTRATIONS_COLLECTION_ID,
        [Query.equal("event_id", eventId), Query.equal("user_id", user.$id)],
      );
      if (existingRegistration.total > 0) {
        isRegistered = true;
      }
    } catch (e) {
      console.error("Failed to check registration status", e);
    }
  }

  // Check for team membership if team event
  let userTeam = null;
  if (user && eventData.is_team_event) {
    const { getUserTeam } = await import("@/lib/actions/team.actions");
    userTeam = await getUserTeam(eventId, user.$id);
  }

  return (
    <div className="min-h-screen ">
      <div className="fixed top-8 lg:top-32 left-5 lg:left-16 z-50 w-fit ">
        <div className="p-2 text-white">
          <BackButton eventType={eventType} />
        </div>
      </div>

      <EventDetailsClient
        eventData={eventWithImage}
        eventType={eventType}
        user={user}
        initialIsRegistered={isRegistered}
        initialUserTeam={userTeam}
      />
      <Footer />
    </div>
  );
}
