import { redirect } from "next/navigation";
import { getLoggedInUser } from "@/lib/actions/auth.actions";
import { getUserTeam } from "@/lib/actions/team.actions";
import TeamClient from "./TeamClient";

interface PageProps {
  params: Promise<{
    eventType: string;
    eventId: string;
  }>;
}

export default async function TeamPage({ params }: PageProps) {
  const { eventId, eventType } = await params;
  const user = await getLoggedInUser();

  if (!user) {
    redirect("/login");
  }

  const userTeam = await getUserTeam(eventId, user.$id);

  // Check registration status
  let isRegistered = false;
  if (user) {
    try {
      const { createAdminClient } =
        await import("@/lib/appwrite/appwrite.server");
      const { appwriteConfig } = await import("@/lib/appwrite/appwrite.config");
      const { Query } = await import("node-appwrite");

      const { getTablesDB } = await createAdminClient();
      const tablesDB = getTablesDB();

      const existingRegistration = await tablesDB.listRows(
        appwriteConfig.databaseId,
        appwriteConfig.registrationsCollectionId,
        [Query.equal("event_id", eventId), Query.equal("user_id", user.$id)],
      );
      if (existingRegistration.total > 0) {
        isRegistered = true;
      }
    } catch (e) {
      console.error("Failed to check registration status", e);
    }
  }

  return (
    <TeamClient
      initialTeam={userTeam}
      eventId={eventId}
      userId={user.$id}
      eventType={eventType}
      isRegistered={isRegistered}
    />
  );
}
