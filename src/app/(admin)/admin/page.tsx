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
  Plus,
  CheckCircle,
  FileText,
  Users,
  IndianRupee,
  Calendar,
  Edit,
} from "lucide-react";
import { EventFormDialog } from "@/components/admin/event-form-dialog";
import { appwriteConfig } from "@/lib/appwrite/appwrite.config";
import { createSessionClient } from "@/lib/appwrite/appwrite.server";
import { RegistrationChart } from "@/components/admin/registration-chart";
import { Query } from "node-appwrite";
import { RefreshButton } from "@/components/admin/refresh-button";

type EventSummary = {
  id: string;
  name: string;
  date: string;
  type: string;
  fee: number;
  status: "Published" | "Draft";
  day: string[];
};

function fetchStats() {
  return {
    totalEvents: 12,
    totalRegistrations: 1540,
    totalRevenue: 45000,
  };
}

export default async function AdminDashboard() {
  const stats = fetchStats();
  let events: EventSummary[] = [];
  let error = null;

  try {
    const { getTablesDB } = await createSessionClient();
    const tablesDB = getTablesDB();

    // Fetch top 5 most recent events based on updatedAt
    const response = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.eventsCollectionId,
      queries: [Query.orderDesc("$updatedAt"), Query.limit(5)],
    });

    events = response.rows.map((doc: any) => ({
      id: doc.$id,
      name: doc.name,
      date: new Date(doc.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      type: doc.type,
      fee: doc.fee,
      status: doc.is_published ? "Published" : "Draft",
      day: Array.isArray(doc.day) ? doc.day : [doc.day],
    }));
  } catch (err) {
    console.error("Failed to fetch events:", err);
    error = "Failed to load events. Please ensure you are logged in.";
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ... header ... */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{stats.totalRegistrations}
            </div>
            <p className="text-xs text-muted-foreground">
              +180 since last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">+2 new this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Trend Chart */}
      <div className="grid gap-4">
        <RegistrationChart />
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

            <EventFormDialog mode="create" coordinatorsList={[]} />
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
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="font-medium">{event.name}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {event.type}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold hover:bg-opacity-75 ${event.status === "Published" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"}`}
                          >
                            {event.status}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex gap-1">
                            {event.day.map((d, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-xs font-medium"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {event.date}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/events/${event.id}`}>
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
