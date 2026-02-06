import { getRecentEvents, getCoordinators } from "@/lib/actions/events.actions";
import { DashboardView } from "@/components/admin/dashboard-view";

import {
  getTotalRevenue,
  getTotalRegistrations,
  getRegistrationGraphData,
} from "@/lib/actions/stats.actions";

export const dynamic = "force-dynamic";

async function fetchStats() {
  return {
    totalEvents: 12,
    totalRegistrations: await getTotalRegistrations(),
    totalRevenue: await getTotalRevenue(),
  };
}

export default async function AdminDashboard() {
  // Fetch data in parallel
  const [stats, events, coordinators, graphData] = await Promise.all([
    fetchStats(),
    getRecentEvents(),
    getCoordinators(),
    getRegistrationGraphData(),
  ]);

  return (
    <DashboardView
      stats={stats}
      events={events}
      initialCoordinators={coordinators}
      graphData={graphData}
    />
  );
}
