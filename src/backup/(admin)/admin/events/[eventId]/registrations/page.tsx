import {
  getEventRegistrations,
  getEvent,
} from "@/backup/lib/actions/events.actions";
import RegistrationsTableClient from "./RegistrationsTableClient";

export default async function EventRegistrationsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = await getEvent(eventId);
  const registrations = await getEventRegistrations(eventId);

  return (
    <RegistrationsTableClient
      registrations={registrations}
      eventName={event?.name || "Event"}
      eventId={eventId}
    />
  );
}
