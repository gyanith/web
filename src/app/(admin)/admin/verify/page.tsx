"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  ScanLine,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Loader2,
  Calendar,
  CreditCard,
  Package,
  Home,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  searchUser,
  verifyUserEntitlements,
} from "@/lib/actions/admin.actions";
import { getAllEventsSummary } from "@/lib/actions/events.actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EventSummary } from "@/types/db";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamically import QR Scanner to avoid SSR issues with window/navigator
const QRScanner = dynamic(() => import("@/components/admin/QRScanner"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-[#d4a574]" />
    </div>
  ),
});

export default function VerifyPaymentsPage() {
  const { addToast } = useToast();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);

  const [category, setCategory] = useState<
    "TICKET" | "ACCOMM" | "MERCH" | "EVENT"
  >("TICKET");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [open, setOpen] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      const allEvents = await getAllEventsSummary();
      setEvents(allEvents);
      if (allEvents.length > 0) {
        setSelectedEventId(allEvents[0].id);
      }
    }
    loadEvents();
  }, []);

  const handleSearch = async (forcedQuery?: string) => {
    const searchQuery = (forcedQuery || query).trim();
    if (!searchQuery) return;

    setIsSearching(true);
    setFoundUser(null);
    setVerificationResult(null);

    try {
      const res = await searchUser(searchQuery);
      if (res.success) {
        setFoundUser(res.user);
        addToast(`Found user: ${res?.user?.name || "Unknown"}`, "success");
      } else {
        addToast(res.message, "error");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      addToast(err.message || "Failed to search user", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleScan = (data: string) => {
    setIsScannerOpen(false);
    setQuery(data);
    handleSearch(data); // Auto-search after scan
  };

  const handleVerify = async () => {
    if (!foundUser) return;

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verifyUserEntitlements(
        foundUser.$id,
        category,
        category === "EVENT" ? selectedEventId : undefined,
      );

      setVerificationResult(res);

      if (res.success && res.verified) {
        addToast(res.message, "success");
      } else {
        addToast(res.message, "error");
      }
    } catch (err: any) {
      addToast(err.message || "Failed to verify entitlement", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {isScannerOpen && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setIsScannerOpen(false)}
        />
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold md:text-3xl text-white">
          Access Control & Verification
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_400px]">
        {/* Left Column: Search and User Info */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Lookup User</CardTitle>
              <CardDescription>
                Search by User ID, Phone Number, or Email.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter ID, Phone, or Email..."
                    className="pl-9 bg-zinc-950 border-zinc-800 text-white"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="bg-white text-black hover:bg-zinc-200"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>

              {foundUser && (
                <div className="mt-6 p-4 rounded-lg border border-zinc-800 bg-zinc-950 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      <User className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {foundUser.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        ID: {foundUser.$id}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="ml-auto border-zinc-700 text-zinc-400"
                    >
                      NITPY: {foundUser.is_nitpy ? "Yes" : "No"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs block">
                        Phone
                      </span>
                      <span className="text-zinc-200">
                        {foundUser.phone || "N/A"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground text-xs block">
                        College
                      </span>
                      <span className="text-zinc-200 truncate">
                        {foundUser.college_name || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {foundUser && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Verify Entitlement</CardTitle>
                <CardDescription>
                  Select what you want to verify for this user.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Button
                    variant={category === "TICKET" ? "default" : "outline"}
                    className={`flex flex-col gap-2 h-auto py-4 ${
                      category === "TICKET"
                        ? "bg-white text-black"
                        : "border-zinc-800 text-zinc-400"
                    }`}
                    onClick={() => {
                      setCategory("TICKET");
                      setVerificationResult(null);
                    }}
                  >
                    <CreditCard className="h-5 w-5" />
                    <span className="text-xs">Ticket</span>
                  </Button>
                  <Button
                    variant={category === "ACCOMM" ? "default" : "outline"}
                    className={`flex flex-col gap-2 h-auto py-4 ${
                      category === "ACCOMM"
                        ? "bg-white text-black"
                        : "border-zinc-800 text-zinc-400"
                    }`}
                    onClick={() => {
                      setCategory("ACCOMM");
                      setVerificationResult(null);
                    }}
                  >
                    <Home className="h-5 w-5" />
                    <span className="text-xs">Accomm</span>
                  </Button>
                  <Button
                    variant={category === "MERCH" ? "default" : "outline"}
                    className={`flex flex-col gap-2 h-auto py-4 ${
                      category === "MERCH"
                        ? "bg-white text-black"
                        : "border-zinc-800 text-zinc-400"
                    }`}
                    onClick={() => {
                      setCategory("MERCH");
                      setVerificationResult(null);
                    }}
                  >
                    <Package className="h-5 w-5" />
                    <span className="text-xs">Merch</span>
                  </Button>
                  <Button
                    variant={category === "EVENT" ? "default" : "outline"}
                    className={`flex flex-col gap-2 h-auto py-4 ${
                      category === "EVENT"
                        ? "bg-white text-black"
                        : "border-zinc-800 text-zinc-400"
                    }`}
                    onClick={() => {
                      setCategory("EVENT");
                      setVerificationResult(null);
                    }}
                  >
                    <Calendar className="h-5 w-5" />
                    <span className="text-xs">Event</span>
                  </Button>
                </div>

                {category === "EVENT" && (
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Select Event</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full h-auto min-h-10 py-2 justify-between bg-zinc-950 border-zinc-800 text-white hover:bg-zinc-900"
                        >
                          <span className="text-left whitespace-normal break-words">
                            {selectedEvent
                              ? selectedEvent.name
                              : "Choose an event..."}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 bg-zinc-950 border-zinc-800 w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-32px)]"
                        align="start"
                      >
                        <Command className="bg-zinc-950 text-white">
                          <CommandInput
                            placeholder="Search event..."
                            className="text-white"
                          />
                          <CommandList className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                            <CommandEmpty className="text-zinc-500 py-4 text-center text-sm">
                              No event found.
                            </CommandEmpty>
                            <CommandGroup>
                              {events.map((evt) => (
                                <CommandItem
                                  key={evt.id}
                                  value={evt.name}
                                  onSelect={() => {
                                    setSelectedEventId(evt.id);
                                    setOpen(false);
                                  }}
                                  className="text-white hover:bg-zinc-900 cursor-pointer flex items-start justify-between py-3"
                                >
                                  <span className="flex-1 mr-2 whitespace-normal break-words">
                                    {evt.name}
                                  </span>
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0 mt-0.5",
                                      selectedEventId === evt.id
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                  onClick={handleVerify}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Verify Access"
                  )}
                </Button>

                {verificationResult && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    {verificationResult.verified ? (
                      <Alert className="bg-green-900/20 border-green-800 text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Access Granted</AlertTitle>
                        <AlertDescription>
                          {verificationResult.message}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert
                        variant="destructive"
                        className="bg-red-900/20 border-red-800 text-red-500"
                      >
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Access Denied</AlertTitle>
                        <AlertDescription>
                          {verificationResult.message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Scan QR Code */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ScanLine className="h-5 w-5 text-zinc-400" />
                Scan QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 pb-6">
              <div className="relative flex aspect-square w-full items-center justify-center rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950/50 overflow-hidden">
                <AlertCircle className="h-12 w-16 text-zinc-700" />
                <span className="absolute bottom-4 text-[10px] text-zinc-600 uppercase tracking-widest">
                  {isScannerOpen ? "Camera Active" : "Ready for Input"}
                </span>
                {isScannerOpen && (
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
                  </div>
                )}
              </div>
              <Button
                className="w-full bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700"
                variant="outline"
                onClick={() => setIsScannerOpen(true)}
              >
                <ScanLine className="mr-2 h-4 w-4" /> Start Camera
              </Button>
              <p className="text-[10px] text-center text-zinc-500 leading-relaxed uppercase tracking-tighter">
                QR codes contain the attendee's unique identity hash for rapid
                on-field verification.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
