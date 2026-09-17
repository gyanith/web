"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Eye, EyeOff, Loader2 } from "lucide-react";
import { EventFormDialog } from "@/components/admin/event-form-dialog";
import {
  getCoordinators,
  togglePublishStatus,
} from "@/backup/lib/actions/events.actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast-provider";

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
  const router = useRouter();
  const { showToast } = useToast();
  const [coordinatorsList, setCoordinatorsList] =
    useState<Coordinator[]>(initialCoordinators);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshCoordinators = async () => {
    try {
      const freshCoordinators = await getCoordinators();
      setCoordinatorsList(freshCoordinators);
    } catch (error) {
      console.error("Failed to refresh coordinators:", error);
      throw error;
    }
  };

  const handleTogglePublish = async () => {
    setIsLoading(true);
    try {
      const result = await togglePublishStatus(event.$id, event.is_published);
      if (result.success) {
        showToast(
          result.newStatus
            ? `"${event.name}" has been published`
            : `"${event.name}" has been unpublished`,
          "success",
        );
        router.refresh();
      } else {
        showToast(result.error || "Failed to toggle publish status", "error");
      }
    } catch (error) {
      console.error("Error toggling publish status:", error);
      showToast("Failed to toggle publish status", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <Button
        variant="secondary"
        className={`gap-2 ${
          event.is_published
            ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
            : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
        }`}
        onClick={handleTogglePublish}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : event.is_published ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        {event.is_published ? "Unpublish" : "Publish"}
      </Button>

      <EventFormDialog
        mode="update"
        initialData={{
          ...event,
          coordinator: event.coordinator,
        }}
        eventId={event.id || event.$id} // Handle both id formats if necessary, usually it's passed as event.id from page props but let's be safe or just use what was in props
        coordinatorsList={coordinatorsList}
        onRefreshCoordinators={handleRefreshCoordinators}
        trigger={
          <Button className="gap-2 text-black">
            <Edit className="h-4 w-4" />
            Edit Event
          </Button>
        }
      />
    </div>
  );
}
