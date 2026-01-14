"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Laptop, 
  Music, 
  GraduationCap, 
  Plus, 
  Calendar,
  Users,
  MapPin,
  Edit,
  MoreVertical
} from "lucide-react";
import { EventFormDialog } from "@/components/admin/event-form-dialog";

// Mock Data
const eventCategories = {
  technical: [
    { id: "1", name: "Hackathon 2024", date: "2024-03-15", attendees: 120, status: "Published", location: "Auditorium" },
    { id: "2", name: "Code Wars", date: "2024-03-16", attendees: 45, status: "Draft", location: "Lab 2" },
    { id: "3", name: "AI Summit", date: "2024-03-17", attendees: 80, status: "Published", location: "Seminar Hall" },
  ],
  cultural: [
    { id: "4", name: "Battle of Bands", date: "2024-03-16", attendees: 300, status: "Published", location: "Open Air" },
    { id: "5", name: "Dance Off", date: "2024-03-17", attendees: 250, status: "Published", location: "Main Stage" },
  ],
  workshops: [
    { id: "6", name: "Cloud Computing", date: "2024-03-15", attendees: 60, status: "Published", location: "Classroom A" },
    { id: "7", name: "robotics 101", date: "2024-03-16", attendees: 40, status: "Draft", location: "Lab 1" },
  ]
};

type EventCardProps = {
  event: typeof eventCategories.technical[0];
  type: "technical" | "cultural" | "workshops";
};

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, Trash, Eye, Check } from "lucide-react";

function EventCard({ event, type }: EventCardProps) {
  const router = useRouter();
  const iconMap = {
    technical: Laptop,
    cultural: Music,
    workshops: GraduationCap
  };
  const Icon = iconMap[type];

  // Prevent card click when clicking dropdown actions
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <Card 
      className="hover:border-primary/50 transition-colors cursor-pointer mb-4"
      onClick={() => router.push(`/admin/event/${event.id}`)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Badge variant={event.status === 'Published' ? "default" : "secondary"} className="text-xs">
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
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="dark bg-zinc-950 text-white border-zinc-800">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={(e) => handleAction(e, () => {
                navigator.clipboard.writeText(event.id);
                // toast.success("ID Copied");
                console.log("ID Copied", event.id);
            })}>
              <Copy className="mr-2 h-4 w-4" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
             <DropdownMenuItem onClick={(e) => handleAction(e, () => {
                console.log("Toggle Status", event.id);
            })}>
              <Check className="mr-2 h-4 w-4" />
              {event.status === 'Published' ? 'Unpublish' : 'Publish'}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => handleAction(e, () => {
                console.log("Delete Event", event.id);
            })}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-lg ${
            type === 'technical' ? 'bg-blue-500/10 text-blue-500' : 
            type === 'cultural' ? 'bg-purple-500/10 text-purple-500' :
            'bg-orange-500/10 text-orange-500'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-semibold truncate">{event.name}</h3>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>{event.location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminEventsPage() {
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Events Library</h1>
          <p className="text-muted-foreground">Manage all your events from a single view.</p>
        </div>
        <EventFormDialog mode="create" />
      </div>

      {/* Mobile View: Tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="technical" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="technical">Tech</TabsTrigger>
            <TabsTrigger value="cultural">Fun</TabsTrigger>
            <TabsTrigger value="workshops">Workshops</TabsTrigger>
          </TabsList>
          
          <TabsContent value="technical" className="mt-4">
             {eventCategories.technical.map(event => (
               <EventCard key={event.id} event={event} type="technical" />
             ))}
          </TabsContent>
          <TabsContent value="cultural" className="mt-4">
            {eventCategories.cultural.map(event => (
               <EventCard key={event.id} event={event} type="cultural" />
             ))}
          </TabsContent>
          <TabsContent value="workshops" className="mt-4">
            {eventCategories.workshops.map(event => (
               <EventCard key={event.id} event={event} type="workshops" />
             ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop View: 3 Columns Grid */}
      <div className="hidden lg:grid grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Technical Column */}
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center gap-2 pb-2 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
             <Laptop className="h-5 w-5 text-blue-500" />
             <h2 className="font-semibold text-lg text-white">Technical</h2>
             <span className="text-xs text-muted-foreground ml-auto">{eventCategories.technical.length}</span>
          </div>
          <div className="overflow-y-auto pr-2 pb-20 scrollbar-hide">
            {eventCategories.technical.map(event => (
                <EventCard key={event.id} event={event} type="technical" />
            ))}
          </div>
        </div>

        {/* Cultural Column */}
        <div className="flex flex-col gap-4 h-full border-l pl-6">
          <div className="flex items-center gap-2 pb-2 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
             <Music className="h-5 w-5 text-purple-500" />
             <h2 className="font-semibold text-lg text-white">Fun Events</h2>
             <span className="text-xs text-muted-foreground ml-auto">{eventCategories.cultural.length}</span>
          </div>
           <div className="overflow-y-auto pr-2 pb-20 scrollbar-hide">
            {eventCategories.cultural.map(event => (
                <EventCard key={event.id} event={event} type="cultural" />
            ))}
          </div>
        </div>

        {/* Workshops Column */}
        <div className="flex flex-col gap-4 h-full border-l pl-6">
          <div className="flex items-center gap-2 pb-2 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
             <GraduationCap className="h-5 w-5 text-orange-500" />
             <h2 className="font-semibold text-lg text-white">Workshops</h2>
             <span className="text-xs text-muted-foreground ml-auto">{eventCategories.workshops.length}</span>
          </div>
           <div className="overflow-y-auto pr-2 pb-20 scrollbar-hide">
            {eventCategories.workshops.map(event => (
                <EventCard key={event.id} event={event} type="workshops" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
