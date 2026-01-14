"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ArrowLeft, Calendar, MapPin, Users, Trophy, Banknote, Edit, Clock, Laptop } from "lucide-react";
import Link from "next/link";
import { EventFormDialog } from "@/components/admin/event-form-dialog";

// Mock Data Function
function getEventById(id: string) {
  return {
    id,
    name: "Hackathon 2024",
    description: "A 24-hour coding marathon where students can showcase their skills and build innovative solutions. Open to all departments.",
    date: "2024-03-15",
    type: "technical",
    location: "Main Auditorium",
    fee: 500,
    prize_pool: 50000,
    num_seats: 100,
    is_solo: false,
    is_team_event: true,
    coordinator: "Alice Johnson",
    day: "1",
    status: "Published",
    poster: "/api/placeholder/800/400" // Placeholder image
  };
}

export default function EventManagePage({ params }: { params: { eventId: string } }) {
  const event = getEventById(params.eventId);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
            <Button variant="outline" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
            </Button>
        </Link>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{event.name}</h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${event.status === 'Published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                    {event.status}
                </span>
            </div>
            <p className="text-muted-foreground text-sm">Event ID: {event.id}</p>
        </div>
        
        {/* Edit Action - using Reusable Dialog */}
        <EventFormDialog 
            mode="update" 
            initialData={event}
            eventId={event.id}
            trigger={
                <Button className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Event
                </Button>
            }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details (Left Column - 2/3 width) */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Poster / Cover Image */}
            <div className="rounded-xl overflow-hidden border bg-muted/20 aspect-video relative flex items-center justify-center">
                 {/* Replace with actual Next.js Image component if poster URL is real */}
                 <div className="text-muted-foreground flex flex-col items-center gap-2">
                    <Laptop className="h-12 w-12 opacity-50" />
                    <span>Event Poster</span>
                 </div>
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
                            <p className="text-sm text-muted-foreground">{event.date}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/10">
                        <Clock className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-sm font-medium">Day</p>
                            <p className="text-sm text-muted-foreground">Day {event.day}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/10">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-sm font-medium">Location</p>
                            <p className="text-sm text-muted-foreground">{event.location}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/10">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                            <p className="text-sm font-medium">Coordinator</p>
                            <p className="text-sm text-muted-foreground">{event.coordinator}</p>
                        </div>
                    </div>
                 </CardContent>
            </Card>
        </div>

        {/* Sidebar Data (Right Column - 1/3 width) */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Registration Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            <Banknote className="h-4 w-4" /> Registration Fee
                        </span>
                        <span className="font-bold text-lg">₹{event.fee}</span>
                     </div>
                     <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            <Trophy className="h-4 w-4" /> Prize Pool
                        </span>
                        <span className="font-bold text-lg">₹{event.prize_pool.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center pb-2 border-b">
                        <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            <Users className="h-4 w-4" /> Seat Limit
                        </span>
                        <span className="font-bold">{event.num_seats > 0 ? event.num_seats : "Unlimited"}</span>
                     </div>
                     
                     <div className="pt-2 flex flex-col gap-2">
                        <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                            <span className="text-sm font-medium">Event Type</span>
                            <span className="text-sm capitalize px-2 py-0.5 rounded bg-primary/10 text-primary">{event.type}</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-muted/20">
                            <span className="text-sm font-medium">Participation</span>
                            <span className="text-sm">{event.is_team_event ? "Team" : "Individual"}</span>
                        </div>
                     </div>
                </CardContent>
            </Card>

             <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-primary">Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <div className="text-4xl font-bold text-primary">124</div>
                        <p className="text-sm text-muted-foreground">Confirmed Participants</p>
                    </div>
                    <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary">
                        View Participant List
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
