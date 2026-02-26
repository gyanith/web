"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEvents } from "./actions";
import {
  getRegistrationExportData,
  RegistrationExportRow,
} from "./registrations-export.actions";
import { useToast } from "@/my_components/Toast";

type CategoryType = "EVENT" | "WORKSHOP";

function rowsToCsv(rows: RegistrationExportRow[]): string {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "College",
    "Date Registered",
    "Check In Verified",
  ];
  const escape = (v: string | boolean) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [r.name, r.email, r.phone, r.college, r.registeredAt, r.checkedIn]
        .map(escape)
        .join(","),
    ),
  ];
  return lines.join("\n");
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RegistrationsExport() {
  const [category, setCategory] = useState<CategoryType>("EVENT");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [comboOpen, setComboOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<
    { id: string; name: string; type: string }[]
  >([]);
  const { error: errorToast } = useToast();

  useEffect(() => {
    getEvents().then(setEvents);
  }, []);

  // Reset event selection when category changes
  useEffect(() => {
    setSelectedEventId("");
  }, [category]);

  const filteredEvents = events.filter((e) => {
    if (category === "WORKSHOP") {
      return e.type === "WORKSHOP" || e.type === "HACKATHON";
    }
    // EVENT: everything that is not a workshop or hackathon
    return e.type !== "WORKSHOP" && e.type !== "HACKATHON";
  });

  const handleExport = async () => {
    if (!selectedEventId) {
      errorToast("Please select an event or workshop first", "No Selection");
      return;
    }

    setLoading(true);
    try {
      const rows = await getRegistrationExportData(selectedEventId);

      if (rows.length === 0) {
        errorToast(
          "No registrations found for the selected item",
          "Empty Export",
        );
        return;
      }

      const selectedEvent = events.find((e) => e.id === selectedEventId);
      const safeName = (selectedEvent?.name ?? selectedEventId)
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");

      const csv = rowsToCsv(rows);
      downloadCsv(csv, `registrations_${safeName}.csv`);
    } catch (err) {
      console.error(err);
      errorToast("Failed to export data", "Export Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-white">Export Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Category selector */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Category</span>
            <Select
              value={category}
              onValueChange={(val) => setCategory(val as CategoryType)}
            >
              <SelectTrigger className="w-full bg-black text-white border-white/20">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border-white/20">
                <SelectItem value="EVENT" className="text-white">
                  Event
                </SelectItem>
                <SelectItem value="WORKSHOP" className="text-white">
                  Workshop
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Event/Workshop name selector — searchable combobox */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">
              {category === "WORKSHOP" ? "Workshop" : "Event"} Name
            </span>
            <Popover open={comboOpen} onOpenChange={setComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboOpen}
                  className="w-full justify-between bg-black text-white border-white/20 hover:bg-zinc-900 hover:text-white font-normal"
                >
                  <span className="truncate">
                    {selectedEventId
                      ? filteredEvents.find((e) => e.id === selectedEventId)
                          ?.name
                      : `Select ${category === "WORKSHOP" ? "Workshop" : "Event"}`}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="p-0 bg-black border-white/20 w-[--radix-popover-trigger-width]"
                align="start"
              >
                <Command className="bg-black">
                  <CommandInput
                    placeholder={`Search ${category === "WORKSHOP" ? "workshop" : "event"}…`}
                    className="text-white placeholder:text-zinc-500 border-b border-white/10"
                  />
                  <CommandList className="max-h-56 overflow-y-auto">
                    <CommandEmpty className="text-zinc-500 text-sm py-4 text-center">
                      No {category === "WORKSHOP" ? "workshops" : "events"}{" "}
                      found.
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredEvents.map((e) => (
                        <CommandItem
                          key={e.id}
                          value={e.name}
                          onSelect={() => {
                            setSelectedEventId(e.id);
                            setComboOpen(false);
                          }}
                          className="text-white hover:bg-zinc-800 cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedEventId === e.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {e.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Export button */}
          <Button
            variant="outline"
            className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/20 w-full mt-2"
            onClick={handleExport}
            disabled={loading || !selectedEventId}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {loading ? "Exporting…" : "Export CSV"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
