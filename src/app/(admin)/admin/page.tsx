import { getRecentEvents, getCoordinators } from "@/lib/actions/events.actions";
import { DashboardView } from "@/components/admin/dashboard-view";

function fetchStats() {
  return {
    totalEvents: 12,
    totalRegistrations: 1540,
    totalRevenue: 45000,
  };
}

export default async function AdminDashboard() {
  const stats = fetchStats();

  // Fetch data in parallel
  const [events, coordinators] = await Promise.all([
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
