"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Laptop, Music, GraduationCap } from "lucide-react";
import { EventCard, EventData } from "@/components/admin/event-card";
import { EventFormDialog } from "@/components/admin/event-form-dialog";
import { getCoordinators } from "@/backup/lib/actions/events.actions";

interface Coordinator {
  id: string;
  name: string;
}

interface EventsViewProps {
  events: EventData[];
  coordinatorsList: Coordinator[];
}

function EventGroup({
  events,
  emptyMessage,
}: {
  events: EventData[];
  emptyMessage: string;
}) {
  const published = events.filter((e) => e.is_published);
  const unpublished = events.filter((e) => !e.is_published);

  if (events.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {published.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}

      {published.length > 0 && unpublished.length > 0 && (
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-dashed border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#09090b] px-2 text-muted-foreground">
              Drafts
            </span>
          </div>
        </div>
      )}

      {unpublished.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export function EventsView({
  events,
  coordinatorsList: initialCoordinators,
}: EventsViewProps) {
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

  // Filter events into categories (case-insensitive)
  // Filter events into categories (case-insensitive for safety, but target uppercase)
  const technicalEvents = events.filter(
    (e) => e.type?.toString().toUpperCase() === "TECH",
  );
  const culturalEvents = events.filter((e) =>
    ["FUN", "PRO-SHOW", "GAMING"].includes(
      e.type?.toString().toUpperCase() as string,
    ),
  );
  const workshopEvents = events.filter(
    (e) => e.type?.toString().toUpperCase() === "WORKSHOP",
  );

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex flex-none items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Events Library
          </h1>
          <p className="text-muted-foreground">
            Manage all your events from a single view.
          </p>
        </div>
        <EventFormDialog
          mode="create"
          coordinatorsList={coordinatorsList}
          onRefreshCoordinators={handleRefreshCoordinators}
        />
      </div>

      {/* Mobile View: Tabs */}
      <div className="lg:hidden flex-1 min-h-0 flex flex-col">
        <Tabs defaultValue="technical" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 flex-none">
            <TabsTrigger value="technical">Tech</TabsTrigger>
            <TabsTrigger value="cultural">Fun</TabsTrigger>
            <TabsTrigger value="workshops">Workshops</TabsTrigger>
          </TabsList>

          <TabsContent
            value="technical"
            className="mt-4 flex-1 overflow-y-auto min-h-0 pb-4"
          >
            <EventGroup
              events={technicalEvents}
              emptyMessage="No technical events yet."
            />
          </TabsContent>
          <TabsContent
            value="cultural"
            className="mt-4 flex-1 overflow-y-auto min-h-0 pb-4"
          >
            <EventGroup
              events={culturalEvents}
              emptyMessage="No cultural/fun events yet."
            />
          </TabsContent>
          <TabsContent
            value="workshops"
            className="mt-4 flex-1 overflow-y-auto min-h-0 pb-4"
          >
            <EventGroup
              events={workshopEvents}
              emptyMessage="No workshops yet."
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop View: 3 Columns Grid */}
      <div className="hidden lg:grid grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Technical Column */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          <div className="flex flex-none items-center gap-2 pb-2 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
            <Laptop className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-lg text-white">Technical</h2>
            <span className="text-xs text-muted-foreground ml-auto">
              {technicalEvents.length}
            </span>
          </div>
          <div className="flex-1 relative min-h-0">
            <div className="h-full overflow-y-auto pr-2 pb-4 pt-4">
              <EventGroup
                events={technicalEvents}
                emptyMessage="No technical events"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#070a10] to-transparent pointer-events-none z-10" />
          </div>
        </div>

        {/* Cultural Column */}
        <div className="flex flex-col gap-4 h-full border-l pl-6 min-h-0">
          <div className="flex flex-none items-center gap-2 pb-2 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
            <Music className="h-5 w-5 text-purple-500" />
            <h2 className="font-semibold text-lg text-white">Fun Events</h2>
            <span className="text-xs text-muted-foreground ml-auto">
              {culturalEvents.length}
            </span>
          </div>
          <div className="flex-1 relative min-h-0">
            <div className="h-full overflow-y-auto pr-2 pb-4 pt-4">
              <EventGroup
                events={culturalEvents}
                emptyMessage="No fun events"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#070a10] to-transparent pointer-events-none z-10" />
          </div>
        </div>

        {/* Workshops Column */}
        <div className="flex flex-col gap-4 h-full border-l pl-6 min-h-0">
          <div className="flex flex-none items-center gap-2 pb-2 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
            <GraduationCap className="h-5 w-5 text-orange-500" />
            <h2 className="font-semibold text-lg text-white">Workshops</h2>
            <span className="text-xs text-muted-foreground ml-auto">
              {workshopEvents.length}
            </span>
          </div>
          <div className="flex-1 relative min-h-0">
            <div className="h-full overflow-y-auto pr-2 pb-4 pt-4">
              <EventGroup events={workshopEvents} emptyMessage="No workshops" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
