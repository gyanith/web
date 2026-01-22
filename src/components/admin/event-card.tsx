"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Copy,
  Check,
  Trash,
  Calendar,
  MapPin,
  Laptop,
  Music,
  GraduationCap,
  Mic,
  Gamepad2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { togglePublishStatus, deleteEvent } from "@/lib/actions/events.actions";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { useToast } from "@/components/ui/toast-provider";

export type EventType =
  | "technical"
  | "cultural"
  | "workshop"
  | "pro-show"
  | "gaming";

export interface EventData {
  id: string;
  name: string;
  date: string;
  status: string;
  location: string;
  type: EventType | string;
  is_published?: boolean;
}

interface EventCardProps {
  event: EventData;
}

export function EventCard({ event }: EventCardProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const iconMap: Record<string, any> = {
    TECH: Laptop,
    FUN: Music,
    WORKSHOP: GraduationCap,
    "PRO-SHOW": Mic,
    GAMING: Gamepad2,
    // Fallbacks
    technical: Laptop,
    cultural: Music,
    workshop: GraduationCap,
  };

  const Icon = iconMap[event.type.toString().toUpperCase()] || Laptop;

  // Prevent card click when clicking dropdown actions
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleTogglePublish = async () => {
    setIsLoading(true);
    try {
      const result = await togglePublishStatus(
        event.id,
        event.is_published ?? event.status === "Published",
      );
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

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteEvent(event.id);
      if (result.success) {
        showToast(`"${event.name}" has been deleted successfully`, "success");
        setShowDeleteModal(false);
        // Redirect to events list to avoid staying on deleted event's page
        router.push("/admin/events");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete event", "error");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("Failed to delete event", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeVariant = (status: string) => {
    if (status === "Published") return "default";
    return "secondary";
  };

  const getTypeStyle = (type: string) => {
    switch (type.toString().toUpperCase()) {
      case "TECH":
      case "TECHNICAL":
        return "bg-blue-500/10 text-blue-500";
      case "FUN":
      case "CULTURAL":
      case "PRO-SHOW":
      case "GAMING":
        return "bg-purple-500/10 text-purple-500";
      case "WORKSHOP":
        return "bg-orange-500/10 text-orange-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <Card
      className="hover:border-primary/50 transition-colors cursor-pointer mb-4"
      onClick={() => router.push(`/admin/events/${event.id}`)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Badge variant={getBadgeVariant(event.status)} className="text-xs">
          {event.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            onClick={(e) => e.stopPropagation()}
            className="dark bg-zinc-950 text-white border-zinc-800"
          >
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={(e) =>
                handleAction(e, () => {
                  navigator.clipboard.writeText(event.id);
                  console.log("ID Copied", event.id);
                })
              }
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => handleAction(e, handleTogglePublish)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {event.status === "Published" ? "Unpublish" : "Publish"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={(e) => handleAction(e, () => setShowDeleteModal(true))}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash className="mr-2 h-4 w-4" />
              )}
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`p-2 rounded-lg ${getTypeStyle(event.type as string)}`}
          >
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-semibold truncate">{event.name}</h3>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>
              {new Date(event.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title={event.name}
        isLoading={isLoading}
      />
    </Card>
  );
}
