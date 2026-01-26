"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  FileText,
  Check,
  ChevronsUpDown,
  Laptop,
  Music,
  GraduationCap,
  Mic,
  Gamepad2,
  Pencil,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { TimePicker } from "@/components/ui/time-picker";
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
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createEvent, updateEvent } from "@/lib/actions/events.actions";
import { useToast } from "@/components/ui/toast-provider";

// Initialize Appwrite services
// const databases = new Databases(client); // Removed
// const storage = new Storage(client); // Removed

interface Coordinator {
  id: string;
  name: string;
}

interface EventFormDialogProps {
  mode: "create" | "update";
  initialData?: any;
  trigger?: React.ReactNode;
  eventId?: string;
  onSuccess?: () => void;
  coordinatorsList: Coordinator[];
  onRefreshCoordinators?: () => Promise<void>;
}

const EVENT_TYPES = [
  { id: "TECH", label: "Technical", icon: Laptop },
  { id: "FUN", label: "Fun", icon: Music },
  { id: "WORKSHOP", label: "Workshop", icon: GraduationCap },
];

const DAYS = [
  { id: "1", label: "Day 1" },
  { id: "2", label: "Day 2" },
  { id: "3", label: "Day 3" },
];

const convertTo24Hour = (time12: string) => {
  if (!time12) return "";
  const [time, period] = time12.split(" ");
  let [hours, mins] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}${mins.toString().padStart(2, "0")}`;
};

const convertTo12Hour = (time24: string) => {
  if (!time24 || time24.length !== 4) return "";
  let hours = parseInt(time24.substring(0, 2));
  const mins = time24.substring(2, 4);
  const period = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours}:${mins} ${period}`;
};

export function EventFormDialog({
  mode,
  initialData,
  trigger,
  eventId,
  onSuccess,
  coordinatorsList,
  onRefreshCoordinators,
}: EventFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<
    "draft" | "publish" | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    type: "",
    location: "",
    fee: 0,
    prize_pool: 0,
    num_seats: 0,
    coordinators: [] as string[],
    is_solo: true,
    is_team_event: false,
    day: ["1"],
    start_time: "",
    end_time: "",
    g_form_link: "",
    image_id: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // UI State
  const [isCoordinatorOpen, setIsCoordinatorOpen] = useState(false);
  const [isDayOpen, setIsDayOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isRefreshingCoordinators, setIsRefreshingCoordinators] =
    useState(false);

  // Initialize form data when opening in update mode
  useEffect(() => {
    if (mode === "update" && initialData) {
      const initData = {
        name: initialData.name || "",
        date: initialData.date || "",
        description: initialData.description || "",
        type: initialData.type || "",
        location: initialData.location || "",
        fee: initialData.fee || 0,
        prize_pool: initialData.prize_pool || 0,
        num_seats: initialData.num_seats || 0,
        coordinators: ((): string[] => {
          const coords = initialData.coordinators || initialData.coordinator;
          if (!coords) return [];
          const arr = Array.isArray(coords) ? coords : [coords];
          return arr.map((c: any) =>
            typeof c === "object" ? c.$id || c.id : c,
          );
        })(),
        is_solo: initialData.is_solo ?? true,
        is_team_event: initialData.is_team_event ?? false,
        day: Array.isArray(initialData.day)
          ? initialData.day.map(String)
          : [String(initialData.day || "1")],
        start_time: initialData.start_time
          ? initialData.start_time.includes("M") // Check if already 12h (legacy/UI)
            ? initialData.start_time
            : convertTo12Hour(initialData.start_time)
          : "",
        end_time: initialData.end_time
          ? initialData.end_time.includes("M")
            ? initialData.end_time
            : convertTo12Hour(initialData.end_time)
          : "",
        g_form_link: initialData.g_form_link || "",
        image_id: initialData.image_id || "",
      };
      console.log(
        "[EventFormDialog] Init coordinators:",
        initData.coordinators,
      );
      console.log("[EventFormDialog] Coordinators list:", coordinatorsList);
      setFormData(initData);

      if (initialData.image_id) {
        // If we had a helper to get URL, we'd use it here.
        // For now, we assume preview isn't critical unless they upload a NEW file,
        // OR we can construct the URL if we want to show current image.
        // setPreviewImage(getImageUrl(initialData.image_id));
      }
    }
  }, [mode, initialData, open]);

  // Check for dirty state
  useEffect(() => {
    if (mode === "update" && initialData) {
      const current = JSON.stringify(formData);

      const initData = {
        name: initialData.name || "",
        date: initialData.date || "",
        description: initialData.description || "",
        type: initialData.type || "",
        location: initialData.location || "",
        fee: initialData.fee || 0,
        prize_pool: initialData.prize_pool || 0,
        num_seats: initialData.num_seats || 0,
        coordinators: ((): string[] => {
          const coords = initialData.coordinators || initialData.coordinator;
          if (!coords) return [];
          const arr = Array.isArray(coords) ? coords : [coords];
          return arr.map((c: any) =>
            typeof c === "object" ? c.$id || c.id : c,
          );
        })(),
        is_solo: initialData.is_solo ?? true,
        is_team_event: initialData.is_team_event ?? false,
        day: Array.isArray(initialData.day)
          ? initialData.day.map(String)
          : [String(initialData.day || "1")],
        start_time: initialData.start_time
          ? initialData.start_time.includes("M")
            ? initialData.start_time
            : convertTo12Hour(initialData.start_time)
          : "",
        end_time: initialData.end_time
          ? initialData.end_time.includes("M")
            ? initialData.end_time
            : convertTo12Hour(initialData.end_time)
          : "",
        g_form_link: initialData.g_form_link || "",
        image_id: initialData.image_id || "",
      };
      const initial = JSON.stringify(initData);

      // Also consider if a new file is selected
      setIsDirty(current !== initial || selectedFile !== null);
    }
  }, [formData, selectedFile, mode, initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const { showToast } = useToast();

  const validateForm = () => {
    if (!formData.name.trim()) return "Event Name is required";
    if (!formData.date) return "Date is required";
    if (!formData.type) return "Event Type is required";
    if (!formData.description) return "Description is required";
    if (!formData.location) return "Location is required";
    if (mode === "create" && !selectedFile) return "Event Poster is required";
    if (mode === "create" && !selectedFile) return "Event Poster is required";

    if (formData.start_time && formData.end_time) {
      const parseTime = (t: string) => {
        // It's already in 12h format from state, convert to comparable minutes
        const [time, period] = t.split(" ");
        let [hours, mins] = time.split(":").map(Number);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return hours * 60 + mins;
      };

      if (parseTime(formData.end_time) <= parseTime(formData.start_time)) {
        return "End time must be after start time";
      }
    }

    return null;
  };

  const handleSubmit = async (
    actionType: "draft" | "publish",
    isPublished: boolean = true,
  ) => {
    const error = validateForm();
    if (error) {
      showToast(error, "error");
      return;
    }

    setActionLoading(actionType);
    try {
      const payload = new FormData();

      // Append text fields
      payload.append("name", formData.name);
      payload.append("date", formData.date);
      payload.append("description", formData.description);
      payload.append("type", formData.type);
      payload.append("location", formData.location);
      payload.append("fee", formData.fee.toString());
      payload.append("prize_pool", formData.prize_pool.toString());
      payload.append("num_seats", formData.num_seats.toString());
      payload.append("is_solo", String(formData.is_solo));
      payload.append("is_team_event", String(formData.is_team_event));
      formData.day.sort().forEach((d) => payload.append("day", d));
      payload.append("start_time", convertTo24Hour(formData.start_time));
      payload.append("end_time", convertTo24Hour(formData.end_time));
      payload.append("g_form_link", formData.g_form_link);

      // Explicitly log this for debugging
      console.log(
        `[EventFormDialog] Submitting as: ${actionType}, is_published: ${isPublished}`,
      );
      payload.append("is_published", String(isPublished));

      if (formData.image_id) {
        payload.append("image_id", formData.image_id);
      }

      // Append coordinators
      console.log(
        "[EventFormDialog] Coordinators to submit:",
        formData.coordinators,
      );
      formData.coordinators.forEach((c) => payload.append("coordinators", c));

      // Append file if selected
      if (selectedFile) {
        payload.append("file", selectedFile);
      }

      let result;

      if (mode === "create") {
        result = await createEvent(payload);
      } else {
        if (!eventId) throw new Error("No Event ID for update");
        result = await updateEvent(eventId, payload);
      }

      if (result.success) {
        console.log("Event Saved!");
        showToast(
          `Event ${mode === "create" ? "created" : "updated"} successfully!`,
          "success",
        );
        setOpen(false);
        // router.refresh(); // Handled in server action via revalidatePath
        if (onSuccess) onSuccess();
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      console.error("Error submitting form:", err);
      showToast(err.message || "Failed to save event.", "error");
    } finally {
      setActionLoading(null);
    }
  };

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
      <DialogContent
        className={cn(
          "w-full h-[100dvh] sm:h-auto max-w-full sm:max-w-lg md:max-w-3xl lg:max-w-4xl p-0 sm:p-6 rounded-none sm:rounded-lg flex flex-col gap-0 sm:gap-4",
          isDark,
        )}
      >
        <DialogHeader className="px-4 py-4 sm:px-0 sm:py-0 border-b sm:border-0">
          <DialogTitle>
            {mode === "create" ? "Add New Event" : "Update Event"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Fill in the details below to create a new event."
              : "Update the event details below."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 sm:px-0 sm:pr-4 h-full sm:max-h-[70vh] scrollbar-visible">
          <div className="grid gap-6 py-4 px-1">
            {/* File Upload Section */}
            <div className="flex flex-col gap-2">
              <Label>Event Poster *</Label>
              <div
                className="flex flex-col gap-3 justify-center items-center border-2 border-dashed rounded-xl p-6 bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer relative group overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      fill
                      className="object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Pencil className="text-white h-8 w-8" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="p-3 bg-background rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      {mode === "create" ? (
                        <FileText className="h-6 w-6 text-primary" />
                      ) : (
                        <Pencil className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {mode === "create"
                          ? "Click to upload poster"
                          : "Update Poster"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        SVG, PNG, JPG (max. 5MB)
                      </p>
                    </div>
                  </div>
                )}
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            <div className="grid gap-4">
              {/* Event ID (Read-only for Update) */}
              {mode === "update" && (
                <div className="grid gap-2">
                  <Label>Event ID</Label>
                  <Input
                    value={eventId || ""}
                    disabled
                    className="bg-muted text-muted-foreground cursor-not-allowed opacity-70"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Hackathon 2024"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                  />
                </div>
              </div>

              {/* Event Type - Visual Icons */}
              <div className="grid gap-2">
                <Label>Event Type *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {EVENT_TYPES.map((type) => (
                    <div
                      key={type.id}
                      className={cn(
                        "cursor-pointer rounded-xl border-2 p-4 hover:bg-muted/50 transition-all flex flex-col items-center gap-2 text-center",
                        formData.type === type.id
                          ? "border-primary bg-primary/10"
                          : "border-muted-foreground/20",
                      )}
                      onClick={() => handleInputChange("type", type.id)}
                    >
                      <type.icon className="h-6 w-6" />
                      <span className="text-xs font-semibold">
                        {type.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <TimePicker
                    label="Start Time"
                    value={formData.start_time}
                    onChange={(val) => handleInputChange("start_time", val)}
                  />
                </div>
                <div className="grid gap-2">
                  <TimePicker
                    label="End Time"
                    value={formData.end_time}
                    onChange={(val) => handleInputChange("end_time", val)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Auditorium"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="g_form">Google Form Link (Optional)</Label>
                  <Input
                    id="g_form"
                    placeholder="https://forms.google.com/..."
                    value={formData.g_form_link}
                    onChange={(e) =>
                      handleInputChange("g_form_link", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fee">Fee (₹) *</Label>
                  <Input
                    id="fee"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.fee}
                    onChange={(e) => handleInputChange("fee", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prize">Prize Pool</Label>
                  <Input
                    id="prize"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.prize_pool}
                    onChange={(e) =>
                      handleInputChange("prize_pool", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="seats">Seats</Label>
                  <Input
                    id="seats"
                    type="number"
                    placeholder="0 (Unlimited)"
                    min="0"
                    value={formData.num_seats}
                    onChange={(e) =>
                      handleInputChange("num_seats", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Days</Label>
                <Popover open={isDayOpen} onOpenChange={setIsDayOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="justify-between w-full"
                    >
                      {formData.day.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.day.map((dayId) => {
                            const day = DAYS.find((d) => d.id === dayId);
                            return (
                              <span
                                key={dayId}
                                className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs flex items-center gap-1"
                              >
                                {day ? day.label : `Day ${dayId}`}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        "Select days..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="start">
                    <Command>
                      <CommandList>
                        <CommandGroup>
                          {DAYS.map((day) => (
                            <CommandItem
                              key={day.id}
                              value={day.label}
                              onSelect={() => {
                                const currentDays = formData.day;
                                const newVal = currentDays.includes(day.id)
                                  ? currentDays.filter((id) => id !== day.id)
                                  : [...currentDays, day.id];
                                handleInputChange("day", newVal);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.day.includes(day.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {day.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="A brief description of the event..."
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="coordinators">Coordinators</Label>
                  {onRefreshCoordinators && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={async () => {
                        setIsRefreshingCoordinators(true);
                        try {
                          await onRefreshCoordinators();
                        } catch (error) {
                          console.error(
                            "Failed to refresh coordinators:",
                            error,
                          );
                        } finally {
                          setIsRefreshingCoordinators(false);
                        }
                      }}
                      disabled={isRefreshingCoordinators}
                      title="Refresh coordinators list"
                    >
                      <RefreshCcw
                        className={cn(
                          "h-4 w-4",
                          isRefreshingCoordinators && "animate-spin",
                        )}
                      />
                    </Button>
                  )}
                </div>
                <Popover
                  open={isCoordinatorOpen}
                  onOpenChange={setIsCoordinatorOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="justify-between w-full h-auto min-h-10"
                    >
                      {formData.coordinators.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {formData.coordinators.map(
                            (coordinatorId: string) => {
                              const coordinator = coordinatorsList.find(
                                (c) => c.id === coordinatorId,
                              );
                              return (
                                <span
                                  key={coordinatorId}
                                  className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs flex items-center gap-1"
                                >
                                  {coordinator
                                    ? coordinator.name
                                    : coordinatorId}
                                </span>
                              );
                            },
                          )}
                        </div>
                      ) : (
                        "Select coordinators..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] p-0 dark bg-zinc-950 text-white border-zinc-800"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search coordinator..." />
                      <CommandList>
                        <CommandEmpty>No coordinator found.</CommandEmpty>
                        <CommandGroup>
                          {coordinatorsList.map((coordinator) => (
                            <CommandItem
                              key={coordinator.id}
                              value={coordinator.name}
                              onSelect={() => {
                                const currentIds = formData.coordinators;
                                const newVal = currentIds.includes(
                                  coordinator.id,
                                )
                                  ? currentIds.filter(
                                      (id) => id !== coordinator.id,
                                    )
                                  : [...currentIds, coordinator.id];
                                handleInputChange("coordinators", newVal);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.coordinators.includes(coordinator.id)
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {coordinator.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label>Options</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2 border rounded-full px-4 py-2 hover:bg-muted/50 cursor-pointer">
                    <Checkbox
                      id="is_solo"
                      checked={formData.is_solo}
                      onCheckedChange={(checked) =>
                        handleInputChange("is_solo", checked)
                      }
                    />
                    <label
                      htmlFor="is_solo"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Solo Event
                    </label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-full px-4 py-2 hover:bg-muted/50 cursor-pointer">
                    <Checkbox
                      id="is_team"
                      checked={formData.is_team_event}
                      onCheckedChange={(checked) =>
                        handleInputChange("is_team_event", checked)
                      }
                    />
                    <label
                      htmlFor="is_team"
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Team Event
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="p-4 sm:p-0 border-t sm:border-0 gap-2 sm:gap-0">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={actionLoading !== null}
          >
            Cancel
          </Button>
          {mode === "create" && (
            <Button
              variant="outline"
              onClick={() => handleSubmit("draft", false)}
              disabled={actionLoading !== null}
            >
              {actionLoading === "draft" && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Draft
            </Button>
          )}
          <Button
            onClick={() => handleSubmit("publish", true)}
            disabled={actionLoading !== null || (mode === "update" && !isDirty)}
          >
            {actionLoading === "publish" && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === "create" ? "Publish Event" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
