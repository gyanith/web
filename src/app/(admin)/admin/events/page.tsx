import { createAdminClient } from "@/lib/appwrite/appwrite.server";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { EventsView } from "@/components/admin/events-view";
import { Query } from "node-appwrite";

import { getCoordinators } from "@/lib/actions/events.actions";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  let events: any[] = [];
  let coordinatorsList: any[] = [];
  let error = null;

  try {
    const { getTablesDB } = await createAdminClient();
    const tablesDB = getTablesDB();

    // Fetch all events (limit 100 for now, pagination could be added later)
    const response = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.eventsCollectionId,
      queries: [Query.orderDesc("$createdAt"), Query.limit(100)],
    });

    const rawEvents = response.rows.map((doc: any) => ({
      id: doc.$id,
      name: doc.name,
      date: doc.date,
      type: doc.type,
      location: doc.location,
      status: doc.is_published ? "Published" : "Draft",
      is_published: doc.is_published,
      day: doc.day || 1,
      fee: doc.fee ?? 0,
      start_time: doc.start_time,
      end_time: doc.end_time,
    }));

    // Fetch registration counts in parallel
    const counts = await Promise.all(
      rawEvents.map((e) =>
        tablesDB
          .listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.registrationsCollectionId,
            queries: [Query.equal("event_id", e.id), Query.limit(1)],
          })
          .then((r) => r.total)
          .catch(() => 0),
      ),
    );

    events = rawEvents.map((e, i) => ({ ...e, registrationCount: counts[i] }));

    // Fetch coordinators
    coordinatorsList = await getCoordinators();

    console.log(events);
  } catch (err) {
    console.error("Failed to fetch events:", err);
    error = "Failed to load events.";
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return <EventsView events={events} coordinatorsList={coordinatorsList} />;
}
