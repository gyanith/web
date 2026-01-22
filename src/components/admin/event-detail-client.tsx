"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { EventFormDialog } from "@/components/admin/event-form-dialog";
import { getCoordinators } from "@/lib/actions/events.actions";

interface Coordinator {
  id: string;
  name: string;
}

interface EventDetailClientProps {
  event: any;
  coordinatorsList: Coordinator[];
}

export function EventDetailClient({
  event,
  coordinatorsList: initialCoordinators,
}: EventDetailClientProps) {
  const [coordinatorsList, setCoordinatorsList] =
    useState<Coordinator[]>(initialCoordinators);

  const handleRefreshCoordinators = async () => {
    try {
      const freshCoordinators = await getCoordinators();
      setCoordinatorsList(freshCoordinators);
    } catch (error) {
      console.error("Failed to refresh coordinators:", error);
      throw error;
    }
  };

  return (
    <EventFormDialog
      mode="update"
      initialData={{
        ...event,
        coordinator: event.coordinator,
      }}
      eventId={event.id}
      coordinatorsList={coordinatorsList}
      onRefreshCoordinators={handleRefreshCoordinators}
      trigger={
        <Button className="gap-2 text-black">
          <Edit className="h-4 w-4" />
          Edit Event
        </Button>
      }
    />
  );
}
