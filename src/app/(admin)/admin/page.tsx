import { getRecentEvents, getCoordinators } from "@/lib/actions/events.actions";
import { DashboardView } from "@/components/admin/dashboard-view";

import { getTotalRevenue } from "@/lib/actions/stats.actions";

async function fetchStats() {
  return {
    totalEvents: 12,
    totalRegistrations: 1540,
    totalRevenue: await getTotalRevenue(),
  };
}

export default async function AdminDashboard() {
  // Fetch data in parallel
  const [stats, events, coordinators] = await Promise.all([
    fetchStats(),
    getRecentEvents(),
    getCoordinators(),
  ]);

  return (
    <DashboardView
      stats={stats}
      events={events}
      initialCoordinators={coordinators}
    />
  );
}
