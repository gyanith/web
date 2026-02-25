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
  Loader2,
  Calendar,
  CreditCard,
  Package,
  Home,
  Check,
  ChevronsUpDown,
  User,
  DoorOpen,
  Tag,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  searchUser,
  verifyUserEntitlements,
  getUserRegistrations,
  checkGatePass,
} from "@/lib/actions/admin.actions";
import { getAllEventsSummary } from "@/lib/actions/events.actions";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EventSummary } from "@/types/db";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

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

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Registered events list
  const [userRegistrations, setUserRegistrations] = useState<any[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);

  // Gate pass
  const [gatePassResult, setGatePassResult] = useState<any>(null);
  const [checkingGatePass, setCheckingGatePass] = useState(false);

  // When user is found and category is EVENT, load their registrations
  useEffect(() => {
    if (foundUser && category === "EVENT") {
      setLoadingRegs(true);
      getUserRegistrations(foundUser.$id)
        .then(setUserRegistrations)
        .finally(() => setLoadingRegs(false));
    }
  }, [foundUser, category]);

  const handleSearch = async (forcedQuery?: string) => {
    const searchQuery = (forcedQuery || query).trim();
    if (!searchQuery) return;

    setIsSearching(true);
    setFoundUser(null);
    setVerificationResult(null);
    setGatePassResult(null);
    setUserRegistrations([]);

    try {
      const res = await searchUser(searchQuery);
      if (res.success) {
        setFoundUser(res.user);
        addToast(`Found user: ${res?.user?.name || "Unknown"}`, "success");
      } else {
        addToast(res.message, "error");
      }
    } catch (err: any) {
      addToast(err.message || "Failed to search user", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleScan = (data: string) => {
    setIsScannerOpen(false);
    setQuery(data);
    handleSearch(data);
  };

  const handleVerify = async () => {
    if (!foundUser) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const res = await verifyUserEntitlements(
        foundUser.$id,
        category,
        undefined,
      );
      setVerificationResult(res);
      addToast(res.message, res.success && res.verified ? "success" : "error");
    } catch (err: any) {
      addToast(err.message || "Failed to verify entitlement", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleGatePass = async () => {
    if (!foundUser) return;
    setCheckingGatePass(true);
    setGatePassResult(null);
    try {
      const res = await checkGatePass(foundUser.$id);
      setGatePassResult(res);
      addToast(
        res.granted
          ? `Gate Pass GRANTED — ${res.reason}`
          : `Gate Pass DENIED — ${res.reason}`,
        res.granted ? "success" : "error",
      );
    } catch (err: any) {
      addToast(err.message || "Gate pass check failed", "error");
    } finally {
      setCheckingGatePass(false);
    }
  };

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

      <div className="grid gap-6">
        <div className="space-y-6">
          {/* ── Search card ───────────────────────────────────────────── */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-white">Lookup User</CardTitle>
                <CardDescription>
                  Search by User ID, Phone Number, or Email.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-700"
                onClick={() => setIsScannerOpen(true)}
                title="Scan QR Code"
              >
                <ScanLine className="h-5 w-5" />
              </Button>
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

          {/* ── Verify card (only when user found) ────────────────────── */}
          {foundUser && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Verify Entitlement</CardTitle>
                <CardDescription>
                  Select what you want to verify for this user.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(["TICKET", "ACCOMM", "MERCH", "EVENT"] as const).map(
                    (cat) => {
                      const Icon =
                        cat === "TICKET"
                          ? CreditCard
                          : cat === "ACCOMM"
                            ? Home
                            : cat === "MERCH"
                              ? Package
                              : Calendar;
                      return (
                        <Button
                          key={cat}
                          variant={category === cat ? "default" : "outline"}
                          className={`flex flex-col gap-2 h-auto py-4 ${
                            category === cat
                              ? "bg-white text-black"
                              : "border-zinc-800 text-zinc-400"
                          }`}
                          onClick={() => {
                            setCategory(cat);
                            setVerificationResult(null);
                          }}
                        >
                          <Icon className="h-5 w-5" />
                          <span className="text-xs capitalize">
                            {cat === "ACCOMM"
                              ? "Accomm"
                              : cat.charAt(0) + cat.slice(1).toLowerCase()}
                          </span>
                        </Button>
                      );
                    },
                  )}
                </div>

                {/* Registered events list — shown when EVENT selected */}
                {category === "EVENT" && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500">
                      Registered events / workshops for this user:
                    </p>
                    {loadingRegs ? (
                      <div className="flex items-center gap-2 text-zinc-400 text-sm py-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                      </div>
                    ) : userRegistrations.length === 0 ? (
                      <p className="text-zinc-600 text-sm italic">
                        No registrations found.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {userRegistrations.map((reg) => (
                          <div
                            key={reg.id}
                            className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm"
                          >
                            <Tag className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-zinc-200 truncate">
                                {reg.eventName}
                              </p>
                              <p className="text-zinc-600 text-xs">
                                {reg.eventType}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Verify Access button — hidden for EVENT (list is sufficient) */}
                {category !== "EVENT" && (
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
                )}

                {/* Verification result */}
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

                {/* ── Gate Pass ────────────────────────────────────────── */}
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-xs text-zinc-500 mb-3">
                    Gate pass is granted if the user has a paid ticket OR any
                    workshop registration.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      className="col-span-2 h-12 bg-amber-600/20 border border-amber-500/40 text-amber-400 hover:bg-amber-600/30"
                      variant="outline"
                      onClick={handleGatePass}
                      disabled={checkingGatePass}
                    >
                      {checkingGatePass ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <DoorOpen className="mr-2 h-5 w-5" />
                      )}
                      {checkingGatePass
                        ? "Checking Gate Pass…"
                        : "Check Gate Pass"}
                    </Button>
                  </div>

                  {gatePassResult && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {gatePassResult.granted ? (
                        <Alert className="bg-green-900/20 border-green-800 text-green-400">
                          <DoorOpen className="h-4 w-4" />
                          <AlertTitle>Gate Pass GRANTED</AlertTitle>
                          <AlertDescription className="space-y-1">
                            <span>{gatePassResult.reason}</span>
                            <div className="flex gap-2 mt-1">
                              {gatePassResult.hasTicket && (
                                <Badge className="bg-green-800/40 text-green-300 border-green-700">
                                  🎫 Ticket
                                </Badge>
                              )}
                              {gatePassResult.hasWorkshop && (
                                <Badge className="bg-blue-800/40 text-blue-300 border-blue-700">
                                  🔧 Workshop
                                </Badge>
                              )}
                            </div>
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert
                          variant="destructive"
                          className="bg-red-900/20 border-red-800 text-red-500"
                        >
                          <XCircle className="h-4 w-4" />
                          <AlertTitle>Gate Pass DENIED</AlertTitle>
                          <AlertDescription>
                            {gatePassResult.reason}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
