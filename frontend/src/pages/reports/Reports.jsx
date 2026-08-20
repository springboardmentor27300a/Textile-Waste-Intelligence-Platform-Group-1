import ReportToolbar from "../../components/reports/ReportToolbar";
import ReportStats from "../../components/reports/ReportStats";
import MaterialDistributionChart from "../../components/reports/MaterialDistributionChart";
import WasteCategoryChart from "../../components/reports/WasteCategoryChart";
import MonthlyTrendChart from "../../components/reports/MonthlyTrendChart";
import RecyclingChart from "../../components/reports/RecyclingChart";
import SustainabilityDashboard from "../../components/reports/SustainabilityDashboard";
import RecentAnalysisTable from "../../components/reports/RecentAnalysisTable";
import AIInsights from "../../components/reports/AIInsights";

function Reports() {
  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-heading">
          Reports & Analytics
        </h1>

        <p className="mt-3 max-w-3xl text-lg leading-8 text-muted">
          Monitor textile waste collection, AI analysis performance,
          sustainability metrics, environmental impact, recycling efficiency,
          ESG readiness and circular economy performance.
        </p>
      </div>

      {/* Toolbar */}
      <ReportToolbar />

      {/* KPI Statistics */}
      <ReportStats />

      {/* Charts */}
      <div className="grid gap-8 xl:grid-cols-2">
        <MaterialDistributionChart />
        <WasteCategoryChart />
        <MonthlyTrendChart />
        <RecyclingChart />
      </div>

      {/* Sustainability */}
      <SustainabilityDashboard />

      {/* Recent Analysis + AI Insights */}
      <div className="grid gap-8 xl:grid-cols-3">

        <div className="xl:col-span-2">
          <RecentAnalysisTable />
        </div>

        <AIInsights />

      </div>

    </div>
  );
}

export default Reports;