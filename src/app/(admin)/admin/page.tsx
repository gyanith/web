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
import { Plus, CheckCircle, FileText, Users, IndianRupee, Calendar } from "lucide-react";
import { EventFormDialog } from "@/components/admin/event-form-dialog";

type EventSummary = {
  id: string;
  name: string;
  date: string;
  type: string;
  fee: number;
  status: "Published" | "Draft";
};

function fetchAllEvents(): EventSummary[] {
  // TODO: fetch from Appwrite
  return [
    { id: "1", name: "Hackathon 2024", date: "2024-03-15", type: "Technical", fee: 500, status: "Published" },
    { id: "2", name: "Music Fest", date: "2024-03-16", type: "Cultural", fee: 200, status: "Draft" },
    { id: "3", name: "Coding Contest", date: "2024-03-17", type: "Technical", fee: 0, status: "Published" },
  ];
}

function fetchStats() {
  return {
    totalEvents: 12,
    totalRegistrations: 1540,
    totalRevenue: 45000,
  };
}


// ... imports
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ... existing code ...

const registrationData = [
  { date: "Jan 01", count: 12 },
  { date: "Jan 05", count: 45 },
  { date: "Jan 10", count: 89 },
  { date: "Jan 15", count: 156 },
  { date: "Jan 20", count: 240 },
  { date: "Jan 25", count: 350 },
  { date: "Feb 01", count: 620 },
];

export default function AdminDashboard() {
  const events = fetchAllEvents();
  const stats = fetchStats();

  return (
    <div className="flex flex-col gap-4">
      {/* ... header ... */}
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* ... existing stats cards ... */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">+180 since last hour</p>
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
          <Card className="col-span-1">
              <CardHeader>
                  <CardTitle>Registration Trends</CardTitle>
                  <CardDescription>Daily registration count over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                  <div className="h-[300px] w-full min-w-0">
                      <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={registrationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis 
                                  dataKey="date" 
                                  stroke="#888888" 
                                  fontSize={12} 
                                  tickLine={false} 
                                  axisLine={false} 
                              />
                              <YAxis 
                                  stroke="#888888" 
                                  fontSize={12} 
                                  tickLine={false} 
                                  axisLine={false} 
                                  tickFormatter={(value) => `${value}`} 
                              />
                              <Tooltip 
                                  contentStyle={{ 
                                      backgroundColor: "rgba(0,0,0,0.8)", 
                                      border: "none", 
                                      borderRadius: "8px", 
                                      color: "#fff" 
                                  }} 
                              />
                              <Line 
                                  type="monotone" 
                                  dataKey="count" 
                                  stroke="#8884d8" 
                                  strokeWidth={2} 
                                  activeDot={{ r: 8 }} 
                              />
                          </LineChart>
                      </ResponsiveContainer>
                  </div>
              </CardContent>
          </Card>
      </div>

      {/* Quick Actions & Recent Events */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-2">
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                Recent events created in the system.
              </CardDescription>
            </div>
            
            <EventFormDialog mode="create" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="font-medium">{event.name}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                         {/* Optional subtitle */}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {event.type}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold hover:bg-opacity-75 ${event.status === 'Published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'}`}>
                        {event.status}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {event.date}
                    </TableCell>
                    <TableCell className="text-right">
                       <Link href={`/admin/event/${event.id}`}>
                        <Button size="sm" variant="ghost">Manage</Button>
                       </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid gap-4 auto-rows-max">
           <Card>
             <CardHeader>
               <CardTitle>Quick Actions</CardTitle>
             </CardHeader>
             <CardContent className="grid gap-2">
               <Link href="/admin/verify">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Verify Payments
                  </Button>
               </Link>
               <Link href="/admin/logs">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    View Logs
                  </Button>
               </Link>
               <Link href="/admin/users">
                  <Button variant="outline" className="w-full justify-start gap-2">
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
