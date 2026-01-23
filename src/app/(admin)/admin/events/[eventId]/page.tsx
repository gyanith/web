import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Banknote,
  Clock,
  Laptop,
} from "lucide-react";
import Link from "next/link";
import { EventDetailClient } from "@/components/admin/event-detail-client";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { getCoordinators, getEvent } from "@/lib/actions/events.actions";
import { Event } from "@/lib/types";
import { RefreshButton } from "@/components/admin/refresh-button";

export default async function EventManagePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  let event: (Event & { coordinators: any[] }) | null = null;
  let coordinatorsList: any[] = [];
  let error: string | null = null;

  try {
    event = await getEvent(eventId);

    if (!event) {
      throw new Error("Event not found");
    }

    // Fetch coordinators list for the form/lookup
    coordinatorsList = await getCoordinators();
  } catch (err) {
    console.error("Error fetching event:", err);
    error = "Failed to load event. It may not exist.";
  }

  if (error || !event) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <p className="text-destructive font-medium">
          {error || "Event not found"}
        </p>
        <Link href="/admin/events">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    );
  }

  // Prepare data for Client Component
  // Client component expects coordinator IDs in 'coordinator' or 'coordinators' field
  const clientEventData = {
    ...event,
    coordinator: event.coordinators.map((c) => c.$id),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header - Full Width */}
      <div className="flex items-center gap-2 sm:gap-4 sticky top-0 z-40 bg-black py-2 px-4 lg:px-6 -mx-4 lg:-mx-6 -mt-[4.5rem] md:-mt-4 lg:-mt-6 border-b mb-2">
        <Link href="/admin/events">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-foreground flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <h1 className="text-base sm:text-lg md:text-2xl text-foreground font-bold tracking-tight truncate">
              {event.name}
            </h1>
            <span
              className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${event.is_published ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"}`}
            >
              {event.is_published ? "Published" : "Draft"}
            </span>
          </div>
          <p className="text-muted-foreground text-xs truncate mb-1">
            {event.$id}
          </p>
        </div>

        {/* Edit Action - using Client Component */}
        <div className="flex-shrink-0">
          <EventDetailClient
            event={clientEventData}
            coordinatorsList={coordinatorsList}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details (Left Column - 2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          {/* Poster / Cover Image */}
          <div className="rounded-xl overflow-hidden border bg-muted/20 aspect-video relative flex items-center justify-center group">
            {event.image_id ? (
              <img
                src={`${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.eventsBucketId}/files/${event.image_id}/view?project=${appwriteConfig.projectId}`}
                alt={event.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center gap-2">
                <Laptop className="h-12 w-12 opacity-50" />
                <span>No Event Poster</span>
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-muted-foreground">
                {event.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Schedule & Location</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/10">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/10">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Day</p>
                  <p className="text-sm text-muted-foreground">
                    Day{" "}
                    {Array.isArray(event.day)
                      ? event.day.join(", ")
                      : event.day}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/10">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {event.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/10">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Coordinators</p>
                  <div className="flex flex-wrap gap-2">
                    {event.coordinators && event.coordinators.length > 0 ? (
                      event.coordinators.map(
                        (coordinator: any, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-muted/50 text-muted-foreground border"
                          >
                            {coordinator.name}
                          </span>
                        ),
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        No coordinators assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Data (Right Column - 1/3 width) */}
        <div className="space-y-6 ">
          <Card>
            <CardHeader>
              <CardTitle>Registration Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between flex-col lg:flex-row lg:items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Banknote className="h-4 w-4" /> Registration Fee
                </span>
                <span className="font-bold text-lg">₹{event.fee}</span>
              </div>
              <div className="flex justify-between flex-col lg:flex-row lg:items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Prize Pool
                </span>
                <span className="font-bold text-lg">
                  ₹{Number(event.prize_pool).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between flex-col lg:flex-row lg:items-center pb-2 border-b">
                <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" /> Seat Limit
                </span>
                <span className="font-bold">
                  {event.num_seats > 0 ? event.num_seats : "Unlimited"}
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between flex-col lg:flex-row lg:items-center p-2 rounded bg-muted/20">
                  <span className="text-sm font-medium">Event Type</span>
                  <span className="text-sm capitalize px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {event.type}
                  </span>
                </div>
                <div className="flex items-center justify-between flex-col lg:flex-row lg:items-center p-2 rounded bg-muted/20">
                  <span className="text-sm font-medium">Participation</span>
                  <span className="text-sm capitalize px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {event.is_team_event ? "Team" : "Individual"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-primary">Registrations</CardTitle>
              <RefreshButton />
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-4xl font-bold text-primary">124</div>
                <p className="text-sm text-muted-foreground">
                  Confirmed Participants
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full flex-wrap justify-center border-primary/20 hover:bg-primary/10 hover:text-primary"
              >
                View List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
