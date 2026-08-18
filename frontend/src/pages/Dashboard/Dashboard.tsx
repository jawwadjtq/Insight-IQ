import DashboardHeader from "../../components/dashboard/DashboardHeader";
import KPIGrid from "../../components/dashboard/KPIGrid";
import QuickActions from "../../components/dashboard/QuickActions";
import AIInsightsCard from "../../components/dashboard/AIInsightsCard";
import RecentDatasets from "../../components/dashboard/RecentDatasets";
import RecentReports from "../../components/dashboard/RecentReports";
import ActivityTimeline from "../../components/dashboard/ActivityTimeline";
import StorageCard from "../../components/dashboard/StorageCard";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      {/* Hero */}

      <DashboardHeader />

      {/* KPI Cards */}

      <KPIGrid />

      {/* Quick Actions */}

      <QuickActions />

      {/* Main Content */}

      <section className="grid gap-8 xl:grid-cols-3">

        {/* Left */}

        <div className="space-y-8 xl:col-span-2">

          <AIInsightsCard />

          <RecentDatasets />

          <RecentReports />

        </div>

        {/* Right */}

        <div className="space-y-8">

          <StorageCard />

          <ActivityTimeline />

        </div>

      </section>

    </div>
  );
}