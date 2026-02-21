"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  CheckCircle,
  FileText,
  Users,
  IndianRupee,
  Calendar,
  Edit,
} from "lucide-react";
import { EventFormDialog } from "@/components/admin/event-form-dialog";
import { RegistrationChart } from "@/components/admin/registration-chart";
import { RefreshButton } from "@/components/admin/refresh-button";
import { useState, useEffect } from "react";
import { getCoordinators } from "@/lib/actions/events.actions";
import { motion, AnimatePresence } from "framer-motion";
import LoadingOverlay from "@/components/admin/LoadingOverlay";

type EventSummary = {
  id: string;
  name: string;
  date: string;
  type: string;
  fee: number;
  status: "Published" | "Draft";
  day: number;
};

interface Coordinator {
  id: string;
  name: string;
}

interface DashboardViewProps {
  stats: {
    totalEvents: number;
    totalRegistrations: {
      total: number;
      events: number;
      conference: number;
      accommodation: number;
      merch: number;
    };
    totalRevenue: {
      total: number;
      WORKSHOP?: number;
      MERCH?: number;
      ACCOMM?: number;
      TICKET?: number;
      ORION?: number;
      EVENT?: number;
      CONFERENCE?: number;
    };
  };
  events: EventSummary[];
  initialCoordinators: Coordinator[];
  graphData: { date: string; count: number }[];
}

export function DashboardView({
  stats,
  events,
  initialCoordinators,
  graphData,
}: DashboardViewProps) {
  const [coordinatorsList, setCoordinatorsList] =
    useState<Coordinator[]>(initialCoordinators);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleRefreshCoordinators = async () => {
    try {
      setIsRefreshing(true);
      const freshCoordinators = await getCoordinators();
      setCoordinatorsList(freshCoordinators);
    } catch (error) {
      console.error("Failed to refresh coordinators:", error);
      setError("Failed to refresh coordinators");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <LoadingOverlay />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative">
      <AnimatePresence>{isRefreshing && <LoadingOverlay />}</AnimatePresence>

      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl text-white">
          Dashboard
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Revenue - Spans 2 columns on desktop */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              ₹{stats.totalRevenue.total.toLocaleString()}
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] sm:text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground block">Events</span>
                <span className="text-white font-mono font-bold">
                  ₹{(stats.totalRevenue.EVENT || 0).toLocaleString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Workshops</span>
                <span className="text-white font-mono font-bold">
                  ₹{(stats.totalRevenue.WORKSHOP || 0).toLocaleString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Conference</span>
                <span className="text-white font-mono font-bold">
                  ₹{(stats.totalRevenue.CONFERENCE || 0).toLocaleString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">
                  Accommodation
                </span>
                <span className="text-white font-mono font-bold">
                  ₹{(stats.totalRevenue.ACCOMM || 0).toLocaleString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Merch</span>
                <span className="text-white font-mono font-bold">
                  ₹{(stats.totalRevenue.MERCH || 0).toLocaleString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Tickets</span>
                <span className="text-white font-mono font-bold">
                  ₹{(stats.totalRevenue.TICKET || 0).toLocaleString()}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block">Orion</span>
                <span className="text-white font-mono font-bold">
                  ₹{(stats.totalRevenue.ORION || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registrations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {stats.totalRegistrations.total}
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Events</span>
                <span className="text-white font-mono">
                  {stats.totalRegistrations.events}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Conference</span>
                <span className="text-white font-mono">
                  {stats.totalRegistrations.conference}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Accommodation</span>
                <span className="text-white font-mono">
                  {stats.totalRegistrations.accommodation}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Merch Orders</span>
                <span className="text-white font-mono">
                  {stats.totalRegistrations.merch}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Trend Chart */}
      <div className="grid gap-4">
        <RegistrationChart data={graphData} />
      </div>

      {/* Quick Actions & Recent Events */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <CardTitle>Recent Events</CardTitle>
                <RefreshButton />
              </div>
              <CardDescription>
                Recent events created in the system.
              </CardDescription>
            </div>

            <EventFormDialog
              mode="create"
              coordinatorsList={coordinatorsList}
              onRefreshCoordinators={handleRefreshCoordinators}
            />
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8 text-destructive">{error}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">Days</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No events found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    events.map((event) => (
                      <TableRow key={event?.id}>
                        <TableCell>
                          <div className="font-medium">{event?.name}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {event?.type}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold hover:bg-opacity-75 ${
                              event?.status === "Published"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}
                          >
                            {event?.status}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-medium">
                            {event?.day}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {event?.date}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/events/${event?.id}`}>
                            <Button size="sm" variant="ghost" className="gap-2">
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 auto-rows-max">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/admin/verify">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Verify Payments
                </Button>
              </Link>
              <Link href="/admin/logs">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Logs
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Users className="h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
