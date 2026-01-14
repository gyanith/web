"use client";

import { useState } from "react";
import { Plus, FileText, Check, ChevronsUpDown, Laptop, Music, GraduationCap, Mic, Gamepad2, Home, Building2, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EventFormDialogProps {
  mode: "create" | "update";
  initialData?: any; // Replace with proper type
  trigger?: React.ReactNode;
  eventId?: string;
}

export function EventFormDialog({ mode, initialData, trigger, eventId }: EventFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCoordinator, setSelectedCoordinator] = useState(initialData?.coordinator || "");
  const [eventType, setEventType] = useState(initialData?.type || "");

  const isDark = "dark bg-zinc-950 text-foreground border-zinc-800";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Add Event
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={cn("sm:max-w-lg md:max-w-3xl w-[95vw] lg:max-w-4xl", isDark)}>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New Event" : "Update Event"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details below to create a new event."
              : "Update the event details below."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] pr-4">
          <div className="grid gap-6 py-4 px-1">
            {/* File Upload Section */}
            <div className="flex flex-col gap-3 justify-center items-center border-2 border-dashed rounded-xl p-6 bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer relative group">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Click to upload poster</p>
                  <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                </div>
              </div>
              <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>

            <div className="grid gap-4">
                {/* Event ID (Read-only for Update) */}
                {mode === "update" && (
                    <div className="grid gap-2">
                        <Label>Event ID</Label>
                        <Input value={eventId || ""} disabled className="bg-muted text-muted-foreground cursor-not-allowed opacity-70" />
                    </div>
                )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Event Name</Label>
                  <Input id="name" placeholder="e.g. Hackathon 2024" defaultValue={initialData?.name} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" defaultValue={initialData?.date} />
                </div>
              </div>

              {/* Event Type - Visual Icons */}
              <div className="grid gap-2">
                <Label>Event Type</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                        { id: "technical", label: "Technical", icon: Laptop },
                        { id: "cultural", label: "Cultural", icon: Music },
                        { id: "workshop", label: "Workshop", icon: GraduationCap },
                        { id: "pro-show", label: "Pro Show", icon: Mic },
                        { id: "gaming", label: "Gaming", icon: Gamepad2 },
                    ].map((type) => (
                        <div
                            key={type.id}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-4 hover:bg-muted/50 transition-all flex flex-col items-center gap-2 text-center",
                                eventType === type.id ? "border-primary bg-primary/10" : "border-muted-foreground/20"
                            )}
                            onClick={() => setEventType(type.id)}
                        >
                            <type.icon className="h-6 w-6" />
                            <span className="text-xs font-semibold">{type.label}</span>
                        </div>
                    ))}
                </div>
              </div>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="hidden">
                    {/* Hidden Select just to keep form key compatibility if needed, or we just rely on state */}
                  </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g. Auditorium" defaultValue={initialData?.location}  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fee">Fee (₹)</Label>
                  <Input id="fee" type="number" placeholder="0" min="0" defaultValue={initialData?.fee} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prize">Prize Pool</Label>
                  <Input id="prize" type="number" placeholder="0" min="0" defaultValue={initialData?.prize_pool} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seats">Seats</Label>
                  <Input id="seats" type="number" placeholder="Auto" min="0" defaultValue={initialData?.num_seats} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Day</Label>
                <Select defaultValue={initialData?.day || "1"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Day 1</SelectItem>
                    <SelectItem value="2">Day 2</SelectItem>
                    <SelectItem value="3">Day 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="A brief description of the event..." className="min-h-[100px]" defaultValue={initialData?.description} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="coordinators">Coordinators</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="justify-between w-full"
                    >
                      {selectedCoordinator || "Select coordinators..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search coordinator..." />
                      <CommandList>
                        <CommandEmpty>No coordinator found.</CommandEmpty>
                        <CommandGroup>
                          {["Alice Johnson", "Bob Smith", "Charlie Brown", "David Lee", "Eve Wilson", "Frank White", "Grace Miller"].map((coordinator) => (
                            <CommandItem
                              key={coordinator}
                              value={coordinator}
                              onSelect={(currentValue) => {
                                setSelectedCoordinator(currentValue === selectedCoordinator ? "" : currentValue);
                                // setOpen(false); // Don't close popover to allow multi-select (logic to be improved later if needed)
                                // Actually, for single select:
                                // setOpen(false); // Can't close Parent Dialog here, this is Popover state. 
                                // The popover trigger manages its own open state usually, but let's keep it simple.
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCoordinator === coordinator ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {coordinator}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Modern "Amenities" Style Checkboxes */}
              <div className="grid gap-2">
                  <Label>Options</Label>
                  <div className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2 border rounded-full px-4 py-2 hover:bg-muted/50 cursor-pointer">
                        <Checkbox id="is_solo" defaultChecked={initialData?.is_solo ?? true} />
                        <label
                            htmlFor="is_solo"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Solo Event
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-full px-4 py-2 hover:bg-muted/50 cursor-pointer">
                        <Checkbox id="is_team" defaultChecked={initialData?.is_team_event ?? false} />
                        <label
                            htmlFor="is_team"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Team Event
                        </label>
                      </div>
                  </div>
              </div>

            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="secondary" onClick={() => console.log("Draft Saved")}>Save Draft</Button>
          <Button type="submit">{mode === "create" ? "Publish Event" : "Save Changes"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
